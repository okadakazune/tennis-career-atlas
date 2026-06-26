import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchRankingsForDate,
  pickBestPlayerMatch,
  searchPlayer,
} from "./lib/balldontlie-client.mjs";
import { loadEnvFiles } from "./lib/load-env.mjs";
import { resolveFromRoot } from "./lib/paths.mjs";

loadEnvFiles();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIN_DATE = "2025-01-01";
const SOURCE = "balldontlie";
const IS_CI = process.env.CI === "true";

function exitWithStatus(message, { isError = false } = {}) {
  if (isError) {
    console.error(message);
  } else {
    console.warn(message);
  }
  process.exit(isError || IS_CI ? 1 : 0);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function mondayOnOrAfter(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const day = date.getUTCDay();
  const offset = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function listRankingMondays(fromDate, toDate) {
  const dates = [];
  let cursor = mondayOnOrAfter(fromDate);
  while (cursor <= toDate) {
    dates.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return dates;
}

async function loadJson(relativePath, fallback) {
  try {
    return JSON.parse(await readFile(resolveFromRoot(relativePath), "utf8"));
  } catch {
    return fallback;
  }
}

async function saveJson(relativePath, payload) {
  const filePath = resolveFromRoot(relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function resolveBalldontlieIds(apiKey, featuredConfig, playerRows) {
  const mapPayload = await loadJson("scripts/config/player-id-map.json", {
    sackmannToBalldontlie: {},
  });
  const mapping = { ...(mapPayload.sackmannToBalldontlie ?? {}) };
  const playersById = new Map(playerRows.map((row) => [row.player_id, row]));
  const reverse = new Map();

  for (const featured of featuredConfig) {
    const row = playersById.get(featured.atpPlayerId);
    if (!row) {
      console.warn(`[data:update-latest] Missing archive player row: ${featured.atpPlayerId}`);
      continue;
    }

    if (mapping[featured.atpPlayerId]) {
      reverse.set(Number(mapping[featured.atpPlayerId]), featured.atpPlayerId);
      continue;
    }

    const searchTerm = featured.wikidataSearch ?? row.name_last ?? featured.shortName;
    try {
      const candidates = await searchPlayer(apiKey, searchTerm);
      const match = pickBestPlayerMatch(candidates, row.name_first, row.name_last);
      if (!match) {
        console.warn(
          `[data:update-latest] Could not map BallDontLie id for ${row.name_first} ${row.name_last} (${featured.atpPlayerId})`,
        );
        continue;
      }
      mapping[featured.atpPlayerId] = match.id;
      reverse.set(match.id, featured.atpPlayerId);
      console.log(
        `[data:update-latest] Mapped ${row.name_first} ${row.name_last}: Sackmann ${featured.atpPlayerId} → BallDontLie ${match.id}`,
      );
    } catch (error) {
      console.warn(
        `[data:update-latest] Player search failed for ${featured.shortName}: ${error.message}`,
      );
    }
  }

  await saveJson("scripts/config/player-id-map.json", {
    sackmannToBalldontlie: mapping,
    resolvedAt: new Date().toISOString(),
    notes: "Sackmann atpPlayerId → BallDontLie numeric player id.",
  });

  return { mapping, reverse };
}

function mergeDeltaRecords(existing, incoming) {
  const byKey = new Map();
  for (const entry of existing) {
    byKey.set(`${entry.playerId}|${entry.date}`, entry);
  }
  for (const entry of incoming) {
    byKey.set(`${entry.playerId}|${entry.date}`, entry);
  }
  return Array.from(byKey.values()).sort((a, b) => a.date.localeCompare(b.date));
}

async function loadExistingWeek(filePath) {
  try {
    await access(filePath);
    const payload = JSON.parse(await readFile(filePath, "utf8"));
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

function weekHasAllPlayers(existing, expectedPlayerIds) {
  if (existing.length === 0 || expectedPlayerIds.length === 0) return false;
  const present = new Set(existing.map((entry) => entry.playerId));
  return expectedPlayerIds.every((playerId) => present.has(playerId));
}

async function main() {
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    exitWithStatus(
      "[data:update-latest] BALLDONTLIE_API_KEY is not set. Skipping live fetch; existing data/latest files are unchanged.",
      { isError: IS_CI },
    );
  }

  const config = JSON.parse(
    await readFile(path.join(__dirname, "config", "data-source.json"), "utf8"),
  );
  const featuredConfig = JSON.parse(
    await readFile(path.join(__dirname, "config", "featured-players.json"), "utf8"),
  );

  const playersPath = resolveFromRoot(path.join(config.archive.directory, config.files.players));
  const playerRows = parseCsv(await readFile(playersPath, "utf8"));

  let mapping;
  let reverse;
  try {
    ({ mapping, reverse } = await resolveBalldontlieIds(apiKey, featuredConfig, playerRows));
  } catch (error) {
    exitWithStatus(
      `[data:update-latest] Failed to resolve player ids: ${error.message}`,
      { isError: IS_CI },
    );
  }

  const balldontlieIds = Object.values(mapping).map(Number).filter(Number.isFinite);
  if (balldontlieIds.length === 0) {
    exitWithStatus(
      "[data:update-latest] No BallDontLie player mappings available. Skipping rankings fetch.",
      { isError: IS_CI },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const rankingDates = listRankingMondays(MIN_DATE, today);
  const rankingsDir = resolveFromRoot(
    path.join(config.latest.directory, config.latest.rankingsSubdir),
  );
  await mkdir(rankingsDir, { recursive: true });

  let weeksUpdated = 0;
  let weeksSkipped = 0;
  let deltaCount = 0;
  let latestWeek = null;
  const expectedPlayerIds = Object.keys(mapping);

  for (const date of rankingDates) {
    const filePath = path.join(rankingsDir, `${date}.json`);
    const existing = await loadExistingWeek(filePath);
    if (weekHasAllPlayers(existing, expectedPlayerIds)) {
      weeksSkipped += 1;
      latestWeek =
        existing.map((entry) => entry.date).sort().at(-1) ?? latestWeek;
      continue;
    }

    process.stdout.write(`[data:update-latest] Fetching ${date}...\n`);

    try {
      const rows = await fetchRankingsForDate(apiKey, date, balldontlieIds);
      if (rows.length === 0) continue;

      const incoming = [];
      for (const row of rows) {
        const sackmannId = reverse.get(row.player?.id);
        if (!sackmannId) continue;
        if (!row.ranking_date || row.ranking_date < MIN_DATE) continue;

        incoming.push({
          playerId: sackmannId,
          date: row.ranking_date,
          rank: row.rank,
          points: row.points ?? null,
          source: SOURCE,
        });
      }

      if (incoming.length === 0) continue;

      const merged = mergeDeltaRecords(existing, incoming);
      await writeFile(filePath, `${JSON.stringify(merged, null, 2)}\n`);

      weeksUpdated += 1;
      deltaCount += incoming.length;
      latestWeek = merged.map((entry) => entry.date).sort().at(-1) ?? latestWeek;
    } catch (error) {
      console.warn(`[data:update-latest] Rankings fetch failed for ${date}: ${error.message}`);
    }
  }

  await saveJson(path.join(config.latest.directory, "latest-meta.json"), {
    updatedAt: new Date().toISOString(),
    provider: "BallDontLie ATP API",
    minDate: MIN_DATE,
    latestWeek,
    weeksOnDisk: rankingDates.length,
    weeksUpdatedThisRun: weeksUpdated,
    deltaCountThisRun: deltaCount,
    mappedPlayers: Object.keys(mapping).length,
  });

  console.log(
    `[data:update-latest] Done. weeksUpdated=${weeksUpdated}, weeksSkipped=${weeksSkipped}, latestWeek=${latestWeek ?? "n/a"}`,
  );
}

main().catch((error) => {
  exitWithStatus(`[data:update-latest] Unexpected error: ${error.message}`, {
    isError: IS_CI,
  });
});

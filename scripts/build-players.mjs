import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "raw");
const OUT_DIR = path.join(ROOT, "src", "data");

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseDobToDate(dob) {
  if (!dob || dob.length !== 8) return null;
  const year = Number(dob.slice(0, 4));
  const month = Number(dob.slice(4, 6));
  const day = Number(dob.slice(6, 8));
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseRankingDate(value) {
  const text = String(value);
  if (text.length !== 8) return null;
  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(4, 6));
  const day = Number(text.slice(6, 8));
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function calculateAgeDecimal(birthDate, rankingDate) {
  return (rankingDate.getTime() - birthDate.getTime()) / MS_PER_YEAR;
}

function roundAge(age) {
  return Math.round(age * 10000) / 10000;
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  await pipeline(response.body, createWriteStream(destination));
}

async function resolveDataSource(config) {
  for (const source of config.sources) {
    const probeUrl = `${source.baseUrl}/${config.files.players}`;
    try {
      const response = await fetch(probeUrl, { method: "HEAD" });
      if (response.ok) {
        console.log(`Using data source: ${source.label}`);
        return source;
      }
    } catch {
      // try next source
    }
  }

  throw new Error("No accessible Sackmann-format data source found.");
}

async function ensureRawData(source, config) {
  await mkdir(RAW_DIR, { recursive: true });

  const filesToDownload = [config.files.players, ...config.files.rankings];
  for (const filename of filesToDownload) {
    const destination = path.join(RAW_DIR, filename);
    const url = `${source.baseUrl}/${filename}`;
    console.log(`Downloading ${filename}...`);
    await downloadFile(url, destination);
  }

  return {
    playersPath: path.join(RAW_DIR, config.files.players),
    rankingPaths: config.files.rankings.map((filename) => path.join(RAW_DIR, filename)),
  };
}

function buildPlayerIndex(rows, featuredByAtpId) {
  return rows
    .map((row) => {
      const birthDate = parseDobToDate(row.dob);
      const featured = featuredByAtpId.get(row.player_id);

      return {
        atpPlayerId: row.player_id,
        name: `${row.name_first} ${row.name_last}`.trim(),
        nameFirst: row.name_first,
        nameLast: row.name_last,
        birthDate: birthDate ? formatIsoDate(birthDate) : null,
        countryCode: row.ioc || "",
        hand: row.hand || "",
        hasRankingData: Boolean(featured),
        slug: featured?.id,
        shortName: featured?.shortName,
        color: featured?.color,
        imageUrl: featured?.imageUrl,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function loadRankingsForPlayer(rankingPaths, atpPlayerId) {
  const trajectory = [];

  for (const rankingPath of rankingPaths) {
    const text = await readFile(rankingPath, "utf8");
    const rows = parseCsv(text);

    for (const row of rows) {
      if (row.player !== atpPlayerId) continue;

      const rankingDate = parseRankingDate(row.ranking_date);
      const ranking = Number(row.rank);
      if (!rankingDate || !Number.isFinite(ranking)) continue;

      const points = row.points ? Number(row.points) : null;

      trajectory.push({
        rankingDate: formatIsoDate(rankingDate),
        rankingDateRaw: Number(row.ranking_date),
        ranking,
        points: Number.isFinite(points) ? points : null,
        rankingDateObj: rankingDate,
      });
    }
  }

  trajectory.sort((a, b) => a.rankingDateRaw - b.rankingDateRaw);
  return trajectory;
}

function finalizeTrajectory(rawTrajectory, birthDate) {
  return rawTrajectory.map((point) => {
    const finalized = {
      rankingDate: point.rankingDate,
      age: roundAge(calculateAgeDecimal(birthDate, point.rankingDateObj)),
      ranking: point.ranking,
      points: point.points,
    };

    if (point.consecutiveWeeksAtNo1 != null) {
      finalized.consecutiveWeeksAtNo1 = point.consecutiveWeeksAtNo1;
    }

    return finalized;
  });
}

function annotateConsecutiveWeeksAtNo1(rawTrajectory) {
  let streakStart = null;

  const closeStreak = (endExclusive) => {
    if (streakStart === null) return;

    const length = endExclusive - streakStart;
    for (let index = streakStart; index < endExclusive; index++) {
      rawTrajectory[index].consecutiveWeeksAtNo1 = length;
    }
    streakStart = null;
  };

  for (let index = 0; index < rawTrajectory.length; index++) {
    if (rawTrajectory[index].ranking === 1) {
      if (streakStart === null) streakStart = index;
      continue;
    }

    closeStreak(index);
  }

  closeStreak(rawTrajectory.length);
}

function monthKey(rankingDateRaw) {
  const year = Math.floor(rankingDateRaw / 10000);
  const month = Math.floor((rankingDateRaw % 10000) / 100);
  return year * 100 + month;
}

function yearKey(rankingDateRaw) {
  return Math.floor(rankingDateRaw / 10000);
}

function aggregateByPeriod(rawTrajectory, keyFn) {
  const groups = new Map();

  for (const point of rawTrajectory) {
    const key = keyFn(point.rankingDateRaw);
    const existing = groups.get(key);

    if (!existing || point.rankingDateRaw > existing.rankingDateRaw) {
      groups.set(key, point);
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.rankingDateRaw - b.rankingDateRaw);
}

function buildTrajectories(rawTrajectory, birthDate) {
  annotateConsecutiveWeeksAtNo1(rawTrajectory);

  const trajectoryWeekly = finalizeTrajectory(rawTrajectory, birthDate);
  const trajectoryMonthly = finalizeTrajectory(
    aggregateByPeriod(rawTrajectory, monthKey),
    birthDate,
  );
  const yearlyAggregated = finalizeTrajectory(
    aggregateByPeriod(rawTrajectory, yearKey),
    birthDate,
  );
  const trajectoryYearly = applyLatestWeekYearlyPoint(
    rawTrajectory,
    yearlyAggregated,
    birthDate,
  );

  return { trajectoryWeekly, trajectoryMonthly, trajectoryYearly };
}

function yearFromRankingDate(dateStr) {
  return Number(dateStr.slice(0, 4));
}

function applyLatestWeekYearlyPoint(rawTrajectory, yearlyPoints, birthDate) {
  if (rawTrajectory.length === 0) return yearlyPoints;

  const latestRaw = rawTrajectory[rawTrajectory.length - 1];
  const latestYear = yearKey(latestRaw.rankingDateRaw);
  const [latestPoint] = finalizeTrajectory([latestRaw], birthDate);
  latestPoint.isLatestWeek = true;

  const nextYearly = yearlyPoints.map((point) => ({ ...point }));
  const existingIndex = nextYearly.findIndex(
    (point) => yearFromRankingDate(point.rankingDate) === latestYear,
  );

  if (existingIndex >= 0) {
    nextYearly[existingIndex] = latestPoint;
  } else {
    nextYearly.push(latestPoint);
  }

  return nextYearly.sort((a, b) => a.rankingDate.localeCompare(b.rankingDate));
}

async function loadPlayerImages() {
  try {
    const text = await readFile(path.join(OUT_DIR, "player-images.generated.json"), "utf8");
    const payload = JSON.parse(text);
    return payload.players ?? {};
  } catch {
    return {};
  }
}

async function buildFeaturedPlayers(featuredConfig, playerRows, rankingPaths, playerImages) {
  const playersById = new Map(playerRows.map((row) => [row.player_id, row]));
  const players = [];

  for (const featured of featuredConfig) {
    const row = playersById.get(featured.atpPlayerId);
    if (!row) {
      throw new Error(`Featured player not found in atp_players.csv: ${featured.atpPlayerId}`);
    }

    const birthDate = parseDobToDate(row.dob);
    if (!birthDate) {
      throw new Error(`Missing birth date for featured player: ${featured.atpPlayerId}`);
    }

    console.log(`Building trajectories for ${row.name_first} ${row.name_last}...`);
    const rawTrajectory = await loadRankingsForPlayer(rankingPaths, featured.atpPlayerId);

    if (rawTrajectory.length === 0) {
      throw new Error(`No ranking history found for featured player: ${featured.atpPlayerId}`);
    }

    const trajectories = buildTrajectories(rawTrajectory, birthDate);
    const imageRecord = playerImages[featured.id];

    players.push({
      id: featured.id,
      atpPlayerId: featured.atpPlayerId,
      name: `${row.name_first} ${row.name_last}`.trim(),
      shortName: featured.shortName,
      birthDate: formatIsoDate(birthDate),
      countryCode: row.ioc || "",
      color: featured.color,
      ...(featured.imageUrl ? { imageUrl: featured.imageUrl } : {}),
      ...(imageRecord?.imageUrl ? { imageUrl: imageRecord.imageUrl } : {}),
      ...(imageRecord?.imageAttribution
        ? { imageAttribution: imageRecord.imageAttribution }
        : {}),
      ...trajectories,
    });
  }

  return players;
}

async function main() {
  const config = JSON.parse(
    await readFile(path.join(__dirname, "config", "data-source.json"), "utf8"),
  );
  const featuredConfig = JSON.parse(
    await readFile(path.join(__dirname, "config", "featured-players.json"), "utf8"),
  );

  const source = await resolveDataSource(config);
  const { playersPath, rankingPaths } = await ensureRawData(source, config);

  const playerRows = parseCsv(await readFile(playersPath, "utf8"));
  const featuredByAtpId = new Map(featuredConfig.map((player) => [player.atpPlayerId, player]));

  const playerIndex = buildPlayerIndex(playerRows, featuredByAtpId);
  const playerImages = await loadPlayerImages();
  const players = await buildFeaturedPlayers(
    featuredConfig,
    playerRows,
    rankingPaths,
    playerImages,
  );

  await mkdir(OUT_DIR, { recursive: true });

  const indexPath = path.join(OUT_DIR, "player-index.json");
  const playersPathOut = path.join(OUT_DIR, "players.generated.json");
  const metaPath = path.join(OUT_DIR, "data-source-meta.json");

  await writeFile(indexPath, `${JSON.stringify(playerIndex)}\n`);
  await writeFile(playersPathOut, `${JSON.stringify(players)}\n`);
  await writeFile(
    metaPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: source.label,
        sourceUrl: source.baseUrl,
        attribution: config.attribution,
        licenseUrl: config.licenseUrl,
        playerIndexCount: playerIndex.length,
        featuredPlayerCount: players.length,
        rankingGranularity: ["weekly", "monthly", "yearly"],
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${playerIndex.length} players to ${indexPath}`);
  console.log(`Wrote ${players.length} featured players to ${playersPathOut}`);
  for (const player of players) {
    console.log(
      `  ${player.shortName}: weekly=${player.trajectoryWeekly.length}, monthly=${player.trajectoryMonthly.length}, yearly=${player.trajectoryYearly.length}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

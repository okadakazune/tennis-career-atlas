import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./lib/paths.mjs";
import { loadChartedPlayersConfig } from "./lib/charted-players.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

function isoDateToRaw(isoDate) {
  return Number(isoDate.replace(/-/g, ""));
}

function calculateAgeDecimal(birthDate, rankingDate) {
  return (rankingDate.getTime() - birthDate.getTime()) / MS_PER_YEAR;
}

function roundAge(age) {
  return Math.round(age * 10000) / 10000;
}

function daysBetween(startIso, endIso) {
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);
  return Math.floor((end - start) / 86_400_000);
}

async function loadArchiveMeta(archiveDir, metaFileName) {
  const metaPath = path.join(archiveDir, metaFileName);
  try {
    return JSON.parse(await readFile(metaPath, "utf8"));
  } catch {
    return null;
  }
}

function resolveArchivePaths(config) {
  const archiveDir = path.join(ROOT, config.archive.directory);

  return {
    archiveDir,
    playersPath: path.join(archiveDir, config.files.players),
    rankingPaths: config.files.rankings.map((filename) => path.join(archiveDir, filename)),
  };
}

async function loadLatestRankingDeltas(config) {
  if (!config.latest?.enabled) {
    return [];
  }

  const latestDir = path.join(ROOT, config.latest.directory, config.latest.rankingsSubdir);
  const minDateRaw = isoDateToRaw(config.latest.minDate);
  let filenames = [];

  try {
    filenames = (await readdir(latestDir)).filter((name) => name.endsWith(".json"));
  } catch {
    return [];
  }

  const deltas = [];

  for (const filename of filenames.sort()) {
    const filePath = path.join(latestDir, filename);
    const payload = JSON.parse(await readFile(filePath, "utf8"));
    if (!Array.isArray(payload)) {
      throw new Error(`Latest ranking file must be a JSON array: ${filePath}`);
    }

    for (const entry of payload) {
      if (!entry?.playerId || !entry?.date || entry.rank == null) {
        throw new Error(`Invalid ranking delta in ${filePath}`);
      }
      if (isoDateToRaw(entry.date) < minDateRaw) continue;

      deltas.push({
        playerId: String(entry.playerId),
        date: entry.date,
        rank: Number(entry.rank),
        points: entry.points == null ? null : Number(entry.points),
        source: entry.source ?? "balldontlie",
      });
    }
  }

  return deltas;
}

function mergeLatestIntoTrajectory(
  rawTrajectory,
  latestDeltas,
  atpPlayerId,
  archiveCutoffRaw,
  minDateRaw,
) {
  const relevant = latestDeltas.filter(
    (delta) => delta.playerId === atpPlayerId && isoDateToRaw(delta.date) >= minDateRaw,
  );

  const byDate = new Map();

  for (const point of rawTrajectory) {
    if (point.rankingDateRaw <= archiveCutoffRaw) {
      byDate.set(point.rankingDateRaw, point);
    }
  }

  for (const delta of relevant) {
    const rankingDateRaw = isoDateToRaw(delta.date);
    if (rankingDateRaw <= archiveCutoffRaw) continue;

    const rankingDate = parseRankingDate(rankingDateRaw);
    if (!rankingDate || !Number.isFinite(delta.rank)) continue;

    byDate.set(rankingDateRaw, {
      rankingDate: delta.date,
      rankingDateRaw,
      ranking: delta.rank,
      points: Number.isFinite(delta.points) ? delta.points : null,
      rankingDateObj: rankingDate,
      source: delta.source,
    });
  }

  return Array.from(byDate.values()).sort((a, b) => a.rankingDateRaw - b.rankingDateRaw);
}

function buildPlayerIndex(rows, chartedByAtpId) {
  return rows
    .map((row) => {
      const birthDate = parseDobToDate(row.dob);
      const charted = chartedByAtpId.get(row.player_id);

      return {
        atpPlayerId: row.player_id,
        name: `${row.name_first} ${row.name_last}`.trim(),
        nameFirst: row.name_first,
        nameLast: row.name_last,
        birthDate: birthDate ? formatIsoDate(birthDate) : null,
        countryCode: row.ioc || "",
        hand: row.hand || "",
        hasRankingData: Boolean(charted),
        slug: charted?.id,
        shortName: charted?.shortName,
        color: charted?.color,
        imageUrl: charted?.imageUrl,
        careerStatus: charted?.careerStatus,
        playerTier: charted?.playerTier,
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
        source: "sackmann",
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

    if (point.calendarYear != null) {
      finalized.calendarYear = point.calendarYear;
    }

    if (point.yearEndRank != null) {
      finalized.yearEndRank = point.yearEndRank;
    }

    if (point.yearEndDate) {
      finalized.yearEndDate = point.yearEndDate;
    }

    if (point.highestRankDateReached) {
      finalized.highestRankDateReached = point.highestRankDateReached;
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
  const trajectoryYearly = markLatestYearPoint(
    rawTrajectory,
    finalizeTrajectory(aggregateYearlyBestRank(rawTrajectory), birthDate),
  );

  markLatestWeekPoint(trajectoryWeekly);
  markLatestWeekPoint(trajectoryMonthly);

  return { trajectoryWeekly, trajectoryMonthly, trajectoryYearly };
}

function markLatestWeekPoint(trajectory) {
  if (trajectory.length === 0) return;
  trajectory[trajectory.length - 1].isLatestWeek = true;
}

function aggregateYearlyBestRank(rawTrajectory) {
  const groups = new Map();

  for (const point of rawTrajectory) {
    const calendarYear = yearKey(point.rankingDateRaw);
    const existing = groups.get(calendarYear);

    if (!existing) {
      groups.set(calendarYear, {
        bestPoint: point,
        yearEndPoint: point,
        firstBestDateRaw: point.rankingDateRaw,
      });
      continue;
    }

    if (point.rankingDateRaw > existing.yearEndPoint.rankingDateRaw) {
      existing.yearEndPoint = point;
    }

    if (point.ranking < existing.bestPoint.ranking) {
      existing.bestPoint = point;
      existing.firstBestDateRaw = point.rankingDateRaw;
    } else if (
      point.ranking === existing.bestPoint.ranking &&
      point.rankingDateRaw < existing.firstBestDateRaw
    ) {
      existing.firstBestDateRaw = point.rankingDateRaw;
    }
  }

  return Array.from(groups.entries())
    .sort(([yearA], [yearB]) => yearA - yearB)
    .map(([calendarYear, group]) => ({
      rankingDate: formatIsoDate(
        parseRankingDate(group.firstBestDateRaw) ?? group.bestPoint.rankingDateObj,
      ),
      rankingDateRaw: group.firstBestDateRaw,
      ranking: group.bestPoint.ranking,
      points: group.bestPoint.points,
      rankingDateObj: parseRankingDate(group.firstBestDateRaw) ?? group.bestPoint.rankingDateObj,
      source: group.bestPoint.source,
      calendarYear,
      yearEndRank: group.yearEndPoint.ranking,
      yearEndDate: group.yearEndPoint.rankingDate,
      highestRankDateReached: formatIsoDate(
        parseRankingDate(group.firstBestDateRaw) ?? group.bestPoint.rankingDateObj,
      ),
    }));
}

function markLatestYearPoint(rawTrajectory, yearlyPoints) {
  if (rawTrajectory.length === 0) {
    return yearlyPoints;
  }

  const latestYear = yearKey(rawTrajectory[rawTrajectory.length - 1].rankingDateRaw);

  return yearlyPoints.map((point) => ({
    ...point,
    isLatestWeek: point.calendarYear === latestYear,
  }));
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

async function buildChartedPlayers(
  chartedConfig,
  playerRows,
  rankingPaths,
  playerImages,
  latestDeltas,
  archiveCutoffRaw,
  minDateRaw,
) {
  const playersById = new Map(playerRows.map((row) => [row.player_id, row]));
  const players = [];

  for (const charted of chartedConfig) {
    const row = playersById.get(charted.atpPlayerId);
    const label = charted.shortName ?? charted.id;
    const isLegend = charted.playerTier === "legend";

    if (!row) {
      const message = `Charted player not found in atp_players.csv: ${charted.atpPlayerId} (${label})`;
      if (isLegend) {
        console.warn(`Skipping legend player: ${message}`);
        continue;
      }
      throw new Error(message);
    }

    const birthDate = parseDobToDate(row.dob);
    if (!birthDate) {
      const message = `Missing birth date for charted player: ${charted.atpPlayerId} (${label})`;
      if (isLegend) {
        console.warn(`Skipping legend player: ${message}`);
        continue;
      }
      throw new Error(message);
    }

    console.log(`Building trajectories for ${row.name_first} ${row.name_last}...`);
    let rawTrajectory = await loadRankingsForPlayer(rankingPaths, charted.atpPlayerId);
    rawTrajectory = mergeLatestIntoTrajectory(
      rawTrajectory,
      latestDeltas,
      charted.atpPlayerId,
      archiveCutoffRaw,
      minDateRaw,
    );

    if (rawTrajectory.length === 0) {
      const message = `No ranking history found for charted player: ${charted.atpPlayerId} (${label})`;
      if (isLegend) {
        console.warn(`Skipping legend player: ${message}`);
        continue;
      }
      throw new Error(message);
    }

    const trajectories = buildTrajectories(rawTrajectory, birthDate);
    const imageRecord = playerImages[charted.id];

    players.push({
      id: charted.id,
      atpPlayerId: charted.atpPlayerId,
      name: `${row.name_first} ${row.name_last}`.trim(),
      shortName: charted.shortName,
      birthDate: formatIsoDate(birthDate),
      countryCode: row.ioc || "",
      color: charted.color,
      careerStatus: charted.careerStatus ?? "active",
      playerTier: charted.playerTier ?? "featured",
      ...(charted.imageUrl ? { imageUrl: charted.imageUrl } : {}),
      ...(charted.imagePosition ? { imagePosition: charted.imagePosition } : {}),
      ...(imageRecord?.imageUrl ? { imageUrl: imageRecord.imageUrl } : {}),
      ...(imageRecord?.imagePosition
        ? { imagePosition: imageRecord.imagePosition }
        : {}),
      ...(imageRecord?.imageAttribution
        ? { imageAttribution: imageRecord.imageAttribution }
        : {}),
      ...trajectories,
    });
  }

  return players;
}

function computeLatestWeekMeta(players, archiveMeta, config) {
  const today = new Date().toISOString().slice(0, 10);
  const latestDates = players
    .map((player) => player.trajectoryWeekly.at(-1)?.rankingDate)
    .filter(Boolean)
    .sort();

  const latestWeek = latestDates.at(-1) ?? archiveMeta?.rankingsCoverage?.to ?? null;
  const latestWeekAgeDays = latestWeek ? daysBetween(latestWeek, today) : null;
  const staleThresholdDays = config.quality?.staleThresholdDays ?? 14;

  return {
    latestWeek,
    latestWeekAgeDays,
    isLatestWeekStale: latestWeekAgeDays != null && latestWeekAgeDays >= staleThresholdDays,
    staleThresholdDays,
    staleWarning:
      latestWeekAgeDays != null && latestWeekAgeDays >= staleThresholdDays
        ? `Recent ranking updates may be stale. Latest week: ${latestWeek}`
        : null,
  };
}

async function main() {
  const config = JSON.parse(
    await readFile(path.join(__dirname, "config", "data-source.json"), "utf8"),
  );
  const chartedConfig = await loadChartedPlayersConfig(path.join(__dirname, "config"));

  const { archiveDir, playersPath, rankingPaths } = resolveArchivePaths(config);
  const archiveMeta = await loadArchiveMeta(archiveDir, config.archive.metaFile);
  const archiveCutoffRaw = isoDateToRaw(config.latest.archiveCutoffDate);
  const minDateRaw = isoDateToRaw(config.latest.minDate);

  console.log(`Using frozen archive: ${config.archive.directory}`);
  if (archiveMeta?.rankingsCoverage) {
    console.log(
      `Archive rankings coverage: ${archiveMeta.rankingsCoverage.from} .. ${archiveMeta.rankingsCoverage.to}`,
    );
  }

  const latestDeltas = await loadLatestRankingDeltas(config);
  if (latestDeltas.length > 0) {
    console.log(`Loaded ${latestDeltas.length} latest ranking deltas from ${config.latest.directory}`);
  }

  const playerRows = parseCsv(await readFile(playersPath, "utf8"));
  const chartedByAtpId = new Map(chartedConfig.map((player) => [player.atpPlayerId, player]));

  const playerIndex = buildPlayerIndex(playerRows, chartedByAtpId);
  const playerImages = await loadPlayerImages();
  const players = await buildChartedPlayers(
    chartedConfig,
    playerRows,
    rankingPaths,
    playerImages,
    latestDeltas,
    archiveCutoffRaw,
    minDateRaw,
  );

  const latestWeekMeta = computeLatestWeekMeta(players, archiveMeta, config);
  const latestDates = latestDeltas.map((delta) => delta.date).sort();

  await mkdir(OUT_DIR, { recursive: true });

  const indexPath = path.join(OUT_DIR, "player-index.json");
  const publicDataDir = path.join(ROOT, "public", "data");
  const publicIndexPath = path.join(publicDataDir, "player-index.json");
  const publicPlayersPath = path.join(publicDataDir, "players.generated.json");
  const playersPathOut = path.join(OUT_DIR, "players.generated.json");
  const playersMetaPath = path.join(OUT_DIR, "players-meta.json");
  const metaPath = path.join(OUT_DIR, "data-source-meta.json");

  const playersMeta = players.map(
    ({ trajectoryWeekly, trajectoryMonthly, trajectoryYearly, ...meta }) => meta,
  );

  await writeFile(indexPath, `${JSON.stringify(playerIndex)}\n`);
  await mkdir(publicDataDir, { recursive: true });
  await writeFile(publicIndexPath, `${JSON.stringify(playerIndex)}\n`);
  await writeFile(playersPathOut, `${JSON.stringify(players)}\n`);
  await writeFile(publicPlayersPath, `${JSON.stringify(players)}\n`);
  await writeFile(playersMetaPath, `${JSON.stringify(playersMeta, null, 2)}\n`);
  await writeFile(
    metaPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sources: {
          archive: {
            label: archiveMeta?.label ?? "Frozen Sackmann archive",
            directory: config.archive.directory,
            coverage: archiveMeta?.rankingsCoverage ?? null,
            attribution: config.attribution,
            licenseUrl: config.licenseUrl,
          },
          latest: {
            enabled: Boolean(config.latest.enabled),
            provider: config.latest.provider,
            directory: config.latest.directory,
            from: config.latest.minDate,
            to: latestDates.at(-1) ?? null,
            attribution: config.latest.providerAttribution,
            deltaCount: latestDeltas.length,
          },
        },
        ...latestWeekMeta,
        playerIndexCount: playerIndex.length,
        featuredPlayerCount: players.length,
        chartedPlayerCount: players.length,
        legendPlayerCount: players.filter((player) => player.playerTier === "legend").length,
        rankingGranularity: ["weekly", "monthly", "yearly"],
        disclaimer:
          "Unofficial site. Not affiliated with ATP. Historical rankings from Jeff Sackmann archives; recent updates from BallDontLie API when available.",
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${playerIndex.length} players to ${indexPath}`);
  console.log(`Wrote ${playerIndex.length} players to ${publicIndexPath}`);
  console.log(`Wrote ${players.length} charted players to ${playersPathOut}`);
  if (latestWeekMeta.staleWarning) {
    console.warn(latestWeekMeta.staleWarning);
  }
  for (const player of players) {
    const latestWeek = player.trajectoryWeekly.at(-1)?.rankingDate ?? "n/a";
    console.log(
      `  ${player.shortName}: weekly=${player.trajectoryWeekly.length}, monthly=${player.trajectoryMonthly.length}, yearly=${player.trajectoryYearly.length}, latest=${latestWeek}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./lib/paths.mjs";
import { loadChartedPlayersConfig } from "./lib/charted-players.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "src", "data");

const ROUND_DEPTH = {
  R128: 1,
  R64: 2,
  R32: 3,
  R16: 4,
  QF: 5,
  SF: 6,
  F: 7,
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function normalizeSlamKey(tourneyName) {
  const normalized = tourneyName.trim().toLowerCase();

  if (
    normalized.includes("australian") ||
    normalized === "australian chps." ||
    normalized === "australian championships"
  ) {
    return "ao";
  }
  if (normalized.includes("roland garros") || normalized === "french open") {
    return "rg";
  }
  if (normalized === "wimbledon") {
    return "wimbledon";
  }
  if (normalized === "us open" || normalized === "u.s. open") {
    return "usOpen";
  }

  return null;
}

function deriveSlamResult(matches, playerId) {
  let bestDepth = 0;
  let bestRound = null;
  let wonFinal = false;

  for (const match of matches) {
    const isWinner = match.winner_id === playerId;
    const isLoser = match.loser_id === playerId;
    if (!isWinner && !isLoser) continue;

    const depth = ROUND_DEPTH[match.round] ?? 0;
    if (depth < bestDepth) continue;

    bestDepth = depth;
    bestRound = match.round;
    wonFinal = isWinner && match.round === "F";
  }

  if (bestDepth === 0 || !bestRound) return null;

  if (bestRound === "F" && wonFinal) return "Winner";
  if (bestRound === "F") return "Runner-up";
  if (bestRound === "SF") return "Semifinal";
  if (bestRound === "QF") return "Quarterfinal";
  if (bestRound === "R16") return "R16";
  if (bestRound === "R32") return "R32";
  if (bestRound === "R64") return "R64";
  if (bestRound === "R128") return "R128";

  return null;
}

async function resolveLocalMatchPaths(config) {
  const matchDir = path.join(ROOT, config.matches.directory ?? "data/raw");
  const { firstYear, lastYear, filePattern } = config.matches;
  const paths = [];

  for (let year = firstYear; year <= lastYear; year += 1) {
    const filePath = path.join(matchDir, filePattern.replace("{year}", String(year)));
    try {
      await access(filePath);
      paths.push(filePath);
    } catch {
      console.warn(`Skipping missing local match file: ${filePath}`);
    }
  }

  return paths;
}

async function buildResultsForFeatured(featuredConfig, matchPaths) {
  const featuredIds = new Set(featuredConfig.map((player) => player.atpPlayerId));
  const matchesByPlayerYearSlam = new Map();

  const registerMatch = (playerId, year, slamKey, match) => {
    const mapKey = `${playerId}|${year}|${slamKey}`;
    if (!matchesByPlayerYearSlam.has(mapKey)) {
      matchesByPlayerYearSlam.set(mapKey, []);
    }
    matchesByPlayerYearSlam.get(mapKey).push(match);
  };

  for (const matchPath of matchPaths) {
    const rows = parseCsv(await readFile(matchPath, "utf8"));

    for (const row of rows) {
      if (row.tourney_level !== "G") continue;

      const slamKey = normalizeSlamKey(row.tourney_name);
      if (!slamKey) continue;

      const year = String(row.tourney_date).slice(0, 4);
      if (!year || year.length !== 4) continue;

      if (featuredIds.has(row.winner_id)) {
        registerMatch(row.winner_id, year, slamKey, {
          round: row.round,
          winner_id: row.winner_id,
          loser_id: row.loser_id,
        });
      }

      if (featuredIds.has(row.loser_id)) {
        registerMatch(row.loser_id, year, slamKey, {
          round: row.round,
          winner_id: row.winner_id,
          loser_id: row.loser_id,
        });
      }
    }
  }

  const players = {};

  for (const featured of featuredConfig) {
    const byYear = {};

    for (const mapKey of matchesByPlayerYearSlam.keys()) {
      const [playerId, year, slamKey] = mapKey.split("|");
      if (playerId !== featured.atpPlayerId) continue;

      const matches = matchesByPlayerYearSlam.get(mapKey);
      const result = deriveSlamResult(matches, playerId);
      if (!result) continue;

      if (!byYear[year]) {
        byYear[year] = {};
      }
      byYear[year][slamKey] = result;
    }

    players[featured.id] = byYear;
  }

  return players;
}

async function main() {
  const config = JSON.parse(
    await readFile(path.join(__dirname, "config", "data-source.json"), "utf8"),
  );
  const chartedConfig = await loadChartedPlayersConfig(path.join(__dirname, "config"));

  console.log(`Using local match files from ${config.matches.directory ?? "data/raw"}`);
  const matchPaths = await resolveLocalMatchPaths(config);

  if (matchPaths.length === 0) {
    console.warn("No local match CSV files found. Grand Slam results will be empty.");
  }

  const players = await buildResultsForFeatured(chartedConfig, matchPaths);
  await mkdir(OUT_DIR, { recursive: true });

  const outputPath = path.join(OUT_DIR, "grand-slam-results.generated.json");
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "Local Sackmann-format match archive (data/raw)",
      sourceUrl: config.matches.directory ?? "data/raw",
      attribution: config.attribution,
      licenseUrl: config.licenseUrl,
    },
    players,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Wrote Grand Slam results to ${outputPath}`);
  for (const charted of chartedConfig) {
    const yearCount = Object.keys(players[charted.id] ?? {}).length;
    console.log(`  ${charted.shortName}: ${yearCount} seasons with GS data`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

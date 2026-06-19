import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "raw");
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

  return null;
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  await pipeline(response.body, createWriteStream(destination));
  return true;
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

async function ensureMatchFiles(source, config) {
  await mkdir(RAW_DIR, { recursive: true });

  const { firstYear, lastYear, filePattern } = config.files.matches;
  const paths = [];

  for (let year = firstYear; year <= lastYear; year++) {
    const filename = filePattern.replace("{year}", String(year));
    const destination = path.join(RAW_DIR, filename);
    const url = `${source.baseUrl}/${filename}`;

    console.log(`Downloading ${filename}...`);
    const downloaded = await downloadFile(url, destination);
    if (downloaded) {
      paths.push(destination);
    } else {
      console.warn(`Skipping missing file: ${filename}`);
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
  const featuredConfig = JSON.parse(
    await readFile(path.join(__dirname, "config", "featured-players.json"), "utf8"),
  );

  const source = await resolveDataSource(config);
  const matchPaths = await ensureMatchFiles(source, config);
  const players = await buildResultsForFeatured(featuredConfig, matchPaths);

  await mkdir(OUT_DIR, { recursive: true });

  const outputPath = path.join(OUT_DIR, "grand-slam-results.generated.json");
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: source.label,
      sourceUrl: source.baseUrl,
      attribution: config.attribution,
      licenseUrl: config.licenseUrl,
    },
    players,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Wrote Grand Slam results to ${outputPath}`);
  for (const featured of featuredConfig) {
    const yearCount = Object.keys(players[featured.id] ?? {}).length;
    console.log(`  ${featured.shortName}: ${yearCount} seasons with GS data`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

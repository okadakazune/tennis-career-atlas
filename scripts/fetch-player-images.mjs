import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "data");
const CONFIG_PATH = path.join(__dirname, "config", "featured-players.json");

const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const COMMONS_FILE_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath";
const IMAGE_WIDTH = 384;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCommonsImageUrl(fileName) {
  const encoded = encodeURIComponent(fileName.replace(/ /g, "_"));
  return `${COMMONS_FILE_PATH}/${encoded}?width=${IMAGE_WIDTH}`;
}

async function wikidataRequest(params) {
  const url = new URL(WIKIDATA_API);
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikidata request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function searchWikidataEntity(searchTerm) {
  const data = await wikidataRequest({
    action: "wbsearchentities",
    language: "en",
    type: "item",
    search: searchTerm,
    limit: "5",
  });

  const match = data.search?.find((entry) => entry.label && entry.id);
  return match?.id ?? null;
}

async function getImageClaimFromEntity(entityId) {
  const data = await wikidataRequest({
    action: "wbgetentities",
    ids: entityId,
    props: "claims",
  });

  const entity = data.entities?.[entityId];
  const imageClaims = entity?.claims?.P18;
  if (!imageClaims?.length) return null;

  const fileName = imageClaims[0]?.mainsnak?.datavalue?.value;
  return typeof fileName === "string" ? fileName : null;
}

async function resolvePlayerImage(player) {
  const entityId =
    player.wikidataId ?? (await searchWikidataEntity(player.wikidataSearch ?? player.name));

  if (!entityId) {
    return {
      playerId: player.id,
      wikidataId: null,
      imageFile: null,
      imageUrl: null,
      imageAttribution: null,
      status: "entity_not_found",
    };
  }

  const imageFile = await getImageClaimFromEntity(entityId);

  if (!imageFile) {
    return {
      playerId: player.id,
      wikidataId: entityId,
      imageFile: null,
      imageUrl: null,
      imageAttribution: null,
      status: "image_not_found",
    };
  }

  return {
    playerId: player.id,
    wikidataId: entityId,
    imageFile,
    imageUrl: buildCommonsImageUrl(imageFile),
    imageAttribution: `Wikimedia Commons (${imageFile})`,
    imageLicenseNote:
      "Verify license on Wikimedia Commons before commercial use. Attribution may be required.",
    status: "ok",
  };
}

async function main() {
  const featuredConfig = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
  const pilotOnly = process.argv.includes("--pilot");
  const targets = pilotOnly
    ? featuredConfig.filter((player) =>
        ["federer", "nadal", "djokovic", "alcaraz", "sinner"].includes(player.id),
      )
    : featuredConfig;

  const images = {};

  for (const player of targets) {
    console.log(`Fetching Wikidata image for ${player.shortName ?? player.id}...`);
    images[player.id] = await resolvePlayerImage(player);
    console.log(`  ${images[player.id].status}${images[player.id].imageUrl ? `: ${images[player.id].imageUrl}` : ""}`);
    await sleep(300);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const outputPath = path.join(OUT_DIR, "player-images.generated.json");
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "Wikidata P18 + Wikimedia Commons Special:FilePath",
      pilotOnly,
      licenseNote:
        "Images come from Wikimedia Commons. Each file has its own license; verify and attribute as required.",
    },
    players: images,
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(images).length} player image records to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

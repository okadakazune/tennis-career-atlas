import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Loads featured (current tour) and legend (historical) whitelist configs.
 * Legend entries are merged after featured; duplicate atpPlayerId in legend is skipped.
 */
export async function loadChartedPlayersConfig(configDir) {
  const featuredPath = path.join(configDir, "featured-players.json");
  const legendPath = path.join(configDir, "legend-players.json");

  const featured = JSON.parse(await readFile(featuredPath, "utf8"));
  const legend = JSON.parse(await readFile(legendPath, "utf8"));

  const charted = featured.map((player) => ({
    ...player,
    playerTier: "featured",
    careerStatus: player.careerStatus ?? "active",
  }));

  const featuredAtpIds = new Set(charted.map((player) => player.atpPlayerId));

  for (const player of legend) {
    if (featuredAtpIds.has(player.atpPlayerId)) {
      console.warn(
        `Skipping legend player already in featured list: ${player.shortName ?? player.id} (${player.atpPlayerId})`,
      );
      continue;
    }

    charted.push({
      ...player,
      playerTier: "legend",
      careerStatus: "retired",
    });
  }

  return charted;
}

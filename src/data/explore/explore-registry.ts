import { TENNIS_EXPLORE_MODES } from "@/data/explore/registries/tennis-explore-modes";
import type { ExploreModeDef, ExploreModeGroup } from "@/data/explore/explore-types";
import type { SportId } from "@/data/sports/types";

/**
 * Sport-specific explore mode registries.
 * Add football, basketball, etc. registries here as new sports go live.
 */
const SPORT_REGISTRIES: Partial<Record<SportId, ExploreModeDef[]>> = {
  tennis: TENNIS_EXPLORE_MODES,
};

export function getExploreModesForSport(sport: SportId): ExploreModeDef[] {
  return SPORT_REGISTRIES[sport] ?? TENNIS_EXPLORE_MODES;
}

export function getAllRegisteredExploreModes(): ExploreModeDef[] {
  const seen = new Set<string>();
  const modes: ExploreModeDef[] = [];

  for (const sportModes of Object.values(SPORT_REGISTRIES)) {
    if (!sportModes) continue;
    for (const modeDef of sportModes) {
      if (seen.has(modeDef.id)) continue;
      seen.add(modeDef.id);
      modes.push(modeDef);
    }
  }

  return modes;
}

export function getFeaturedExploreModes(sport: SportId = "tennis"): ExploreModeDef[] {
  return getExploreModesForSport(sport)
    .filter(
      (modeDef) =>
        modeDef.featured &&
        (modeDef.sports == null || modeDef.sports.includes(sport)),
    )
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
}

export function getExploreModesByGroup(
  sport: SportId = "tennis",
): Map<ExploreModeGroup, ExploreModeDef[]> {
  const grouped = new Map<ExploreModeGroup, ExploreModeDef[]>();

  for (const modeDef of getExploreModesForSport(sport)) {
    if (modeDef.sports != null && !modeDef.sports.includes(sport)) continue;
    const list = grouped.get(modeDef.group) ?? [];
    list.push(modeDef);
    grouped.set(modeDef.group, list);
  }

  return grouped;
}

export const EXPLORE_MODE_GROUP_LABELS: Record<ExploreModeGroup, string> = {
  overview: "Overview",
  titles: "Titles & Majors",
  ranking: "Ranking & No.1",
  performance: "Performance",
  longevity: "Longevity & Breakthrough",
  surface: "Surface",
  advanced: "Advanced Stats",
};

export function getSuggestableExploreModes(sport: SportId = "tennis"): ExploreModeDef[] {
  return getExploreModesForSport(sport)
    .filter((modeDef) => modeDef.suggestAfterResult !== false)
    .sort((a, b) => (a.suggestPriority ?? 99) - (b.suggestPriority ?? 99));
}

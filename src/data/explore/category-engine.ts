import { getCareerBattleAge, getCareerBattleLabel } from "@/data/battle-age";
import {
  getExploreMode,
  type ExploreModeId,
} from "@/data/explore/explore-modes";
import type { ExploreModeDef } from "@/data/explore/explore-types";
import type { Player } from "@/data/players";
import { getUniversalBattleCategory } from "@/data/sports/battle-categories";
import type {
  SportId,
  UniversalBattleCategoryDef,
  UniversalBattleCategoryId,
} from "@/data/sports/types";

export type ExploreEvidenceTab =
  | "career"
  | "grand-slam"
  | "goat"
  | "stats"
  | "no1"
  | "age";

export function resolveExploreCategoryIds(mode: ExploreModeDef): UniversalBattleCategoryId[] {
  if (mode.status === "comingSoon" || mode.kind === "comingSoon") {
    return [];
  }

  if (mode.kind === "single" && mode.primaryCategoryId) {
    return [mode.primaryCategoryId];
  }

  return mode.categoryIds ?? [];
}

export function resolveExploreCategories(
  modeId: ExploreModeId,
): UniversalBattleCategoryDef[] {
  const mode = getExploreMode(modeId);
  return resolveExploreCategoryIds(mode)
    .map((id) => getUniversalBattleCategory(id))
    .filter((category): category is UniversalBattleCategoryDef => category != null);
}

export function resolveExploreDisplayAge(
  modeId: ExploreModeId,
  playerA: Player,
  playerB: Player,
  selectedAge: number,
): number {
  const mode = getExploreMode(modeId);
  if (mode.ageStrategy === "selected") {
    return selectedAge;
  }
  return getCareerBattleAge(playerA, playerB);
}

export function resolveExploreComparisonLabel(
  modeId: ExploreModeId,
  playerA: Player,
  playerB: Player,
  displayAge: number,
): string {
  const mode = getExploreMode(modeId);

  if (mode.ageStrategy === "selected") {
    return `Same-age comparison at ${displayAge} — switch age to explore further`;
  }

  return getCareerBattleLabel(playerA, playerB, displayAge);
}

/** Maps explore lens to the most relevant dashboard evidence tab. */
export function resolveExploreDashboardTab(modeId: ExploreModeId): ExploreEvidenceTab {
  switch (modeId) {
    case "age":
      return "age";
    case "grand-slam":
    case "finals":
    case "big-titles":
    case "australian-open":
    case "roland-garros":
    case "wimbledon":
    case "us-open":
    case "grand-slam-finals":
      return "grand-slam";
    case "no1":
    case "longest-no1-streak":
    case "world-no1-finishes":
      return "no1";
    case "ranking":
    case "peak":
    case "prime":
      return "career";
    case "longevity":
    case "consistency":
    case "top10-seasons":
    case "first-breakthrough":
    case "first-dominance":
      return "stats";
    default:
      return "career";
  }
}

export function isExploreModeLive(modeId: ExploreModeId, sport: SportId = "tennis"): boolean {
  const mode = getExploreMode(modeId);
  if (mode.status !== "live") return false;
  if (mode.sports != null && !mode.sports.includes(sport)) return false;
  return resolveExploreCategoryIds(mode).length > 0;
}

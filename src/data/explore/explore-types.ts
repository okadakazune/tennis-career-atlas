import type { SportId, UniversalBattleCategoryId } from "@/data/sports/types";

export type ExploreModeId = string;

export type ExploreModeKind = "composite" | "single" | "comingSoon";

export type ExploreModeGroup =
  | "overview"
  | "titles"
  | "ranking"
  | "performance"
  | "longevity"
  | "advanced";

/** How displayAge is chosen for this explore lens. */
export type ExploreAgeStrategy = "career" | "selected";

export interface ExploreModeDef {
  id: ExploreModeId;
  label: string;
  description: string;
  kind: ExploreModeKind;
  /** Show in the primary Explore chip bar. */
  featured: boolean;
  group: ExploreModeGroup;
  /** Composite modes: category IDs to score. */
  categoryIds?: UniversalBattleCategoryId[];
  /** Single-metric modes: one decisive category. */
  primaryCategoryId?: UniversalBattleCategoryId;
  ageStrategy: ExploreAgeStrategy;
  /** Undefined = all live sports. */
  sports?: SportId[];
  status: "live" | "comingSoon";
  /** Sort order within featured bar (lower = earlier). */
  featuredOrder?: number;
}

export const DEFAULT_EXPLORE_MODE_ID: ExploreModeId = "career";

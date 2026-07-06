import type { SportId, UniversalBattleCategoryId } from "@/data/sports/types";

export type ExploreModeId = string;

export type ExploreModeKind = "composite" | "single" | "comingSoon";

export type ExploreModeGroup =
  | "overview"
  | "titles"
  | "ranking"
  | "performance"
  | "longevity"
  | "surface"
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
  /** Show in the post-result suggestion cards. */
  suggestAfterResult?: boolean;
  /** Lower = shown earlier in suggestion cards. */
  suggestPriority?: number;
  emoji?: string;
}

export interface ExploreSuggestionPreview {
  modeId: ExploreModeId;
  label: string;
  description: string;
  whatIfQuestion: string;
  emoji?: string;
  status: "live" | "comingSoon";
  winnerShortName: string | null;
  isTie: boolean;
  isDifferentWinner: boolean;
  isCurrentMode: boolean;
}

export const DEFAULT_EXPLORE_MODE_ID: ExploreModeId = "career";

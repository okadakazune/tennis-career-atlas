export type SportId =
  | "tennis"
  | "football"
  | "basketball"
  | "baseball"
  | "formula1"
  | "golf"
  | "boxing"
  | "athletics"
  | "swimming";

export type SportStatus = "live" | "comingSoon";

export interface SportDefinition {
  id: SportId | "all";
  label: string;
  emoji: string;
  status: SportStatus;
  tagline: string;
  battleLabel: string;
}

export interface SportLegend {
  id: string;
  name: string;
  shortName: string;
  sport: SportId;
}

export type CompareDirection = "higher" | "lower";

export type UniversalBattleCategoryId =
  | "greatestAtAge"
  | "peak"
  | "longevity"
  | "majorTitles"
  | "majorFinals"
  | "dominance"
  | "peakStreak"
  | "firstBreakthrough"
  | "firstDominance"
  | "titlesAtAge"
  | "rankingAtAge"
  | "eraBattle"
  | "goat"
  | "clutch"
  | "popularity";

export type UniversalBattleCategoryStatus = "live" | "comingSoon";

export interface UniversalBattleCategoryDef {
  id: UniversalBattleCategoryId;
  label: string | ((age: number) => string);
  description: string;
  status: UniversalBattleCategoryStatus;
  group: "age" | "peak" | "longevity" | "legacy" | "future";
}

export interface ResolvedBattleMetric {
  value: number | null;
  display: string;
  direction: CompareDirection;
}

export interface SportBattleContext {
  sport: SportId;
  displayAge: number;
}

export interface SportBattleAthlete {
  id: string;
  name: string;
  shortName: string;
  sport: SportId;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
}

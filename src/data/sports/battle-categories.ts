import type {
  UniversalBattleCategoryDef,
  UniversalBattleCategoryId,
} from "@/data/sports/types";

export const UNIVERSAL_BATTLE_CATEGORIES: UniversalBattleCategoryDef[] = [
  {
    id: "greatestAtAge",
    label: (age) => `Greatest at Age ${age}`,
    description: "Who was ahead at the same age?",
    status: "live",
    group: "age",
  },
  {
    id: "titlesAtAge",
    label: (age) => `Major Titles at Age ${age}`,
    description: "Major titles accumulated by a given age.",
    status: "live",
    group: "age",
  },
  {
    id: "rankingAtAge",
    label: (age) => `Ranking at Age ${age}`,
    description: "Season-end standing at a given age.",
    status: "live",
    group: "age",
  },
  {
    id: "peak",
    label: "Peak",
    description: "Best peak performance reached in a career.",
    status: "live",
    group: "peak",
  },
  {
    id: "majorTitles",
    label: "Major Titles",
    description: "Total major championships won.",
    status: "live",
    group: "peak",
  },
  {
    id: "majorFinals",
    label: "Major Finals",
    description: "Total major final appearances.",
    status: "live",
    group: "peak",
  },
  {
    id: "longevity",
    label: "Longevity",
    description: "Sustained excellence over many years.",
    status: "live",
    group: "longevity",
  },
  {
    id: "dominance",
    label: "Dominance",
    description: "Time spent at the top of the sport.",
    status: "live",
    group: "longevity",
  },
  {
    id: "peakStreak",
    label: "Peak Streak",
    description: "Longest sustained run at the top.",
    status: "live",
    group: "longevity",
  },
  {
    id: "firstBreakthrough",
    label: "First Breakthrough",
    description: "How early elite status was reached.",
    status: "live",
    group: "legacy",
  },
  {
    id: "firstDominance",
    label: "First Dominance",
    description: "How early number-one status was reached.",
    status: "live",
    group: "legacy",
  },
  {
    id: "eraBattle",
    label: "Era Battle",
    description: "Compare legends across different generations.",
    status: "comingSoon",
    group: "future",
  },
  {
    id: "goat",
    label: "GOAT",
    description: "Composite greatest-of-all-time score.",
    status: "comingSoon",
    group: "future",
  },
  {
    id: "clutch",
    label: "Clutch",
    description: "Big-moment performance under pressure.",
    status: "comingSoon",
    group: "future",
  },
  {
    id: "popularity",
    label: "Popularity",
    description: "Global impact and fan reach.",
    status: "comingSoon",
    group: "future",
  },
];

export function getUniversalBattleCategory(
  id: UniversalBattleCategoryId,
): UniversalBattleCategoryDef | undefined {
  return UNIVERSAL_BATTLE_CATEGORIES.find((category) => category.id === id);
}

export function getLiveUniversalBattleCategories(): UniversalBattleCategoryDef[] {
  return UNIVERSAL_BATTLE_CATEGORIES.filter((category) => category.status === "live");
}

export function getComingSoonUniversalBattleCategories(): UniversalBattleCategoryDef[] {
  return UNIVERSAL_BATTLE_CATEGORIES.filter(
    (category) => category.status === "comingSoon",
  );
}

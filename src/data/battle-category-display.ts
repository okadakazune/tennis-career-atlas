import type { BattleCategoryResult } from "@/data/battle-score";

/** Visual priority for "why" copy and quick-scan ordering. */
export const CATEGORY_DISPLAY_PRIORITY: string[] = [
  "majorTitles",
  "dominance",
  "longevity",
  "peakStreak",
  "majorFinals",
  "peak",
  "firstBreakthrough",
  "firstDominance",
  "titlesAtAge",
  "rankingAtAge",
  "greatestAtAge",
];

const CATEGORY_EMOJI: Record<string, string> = {
  majorTitles: "🏆",
  dominance: "👑",
  longevity: "⭐",
  peakStreak: "🔥",
  majorFinals: "🏆",
  peak: "📈",
  firstBreakthrough: "🚀",
  firstDominance: "👑",
  titlesAtAge: "🏆",
  rankingAtAge: "📈",
  greatestAtAge: "⭐",
};

export function getCategoryEmoji(categoryId: string): string {
  return CATEGORY_EMOJI[categoryId] ?? "📊";
}

export function sortCategoriesByPriority(
  categories: BattleCategoryResult[],
): BattleCategoryResult[] {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_DISPLAY_PRIORITY.indexOf(a.id);
    const indexB = CATEGORY_DISPLAY_PRIORITY.indexOf(b.id);
    const rankA = indexA === -1 ? CATEGORY_DISPLAY_PRIORITY.length : indexA;
    const rankB = indexB === -1 ? CATEGORY_DISPLAY_PRIORITY.length : indexB;
    return rankA - rankB;
  });
}

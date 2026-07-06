import type { BattleCategoryResult, BattleScoreResult, BattleSide } from "@/data/battle-score";
import { sortCategoriesByPriority } from "@/data/battle-category-display";

const AGE_CATEGORY_IDS = new Set([
  "greatestAtAge",
  "titlesAtAge",
  "rankingAtAge",
]);

const LONGEVITY_CATEGORY_IDS = new Set([
  "longevity",
  "dominance",
  "peakStreak",
]);

const PEAK_CATEGORY_IDS = new Set([
  "peak",
  "majorTitles",
  "majorFinals",
]);

function getWinnerCategories(
  categories: BattleCategoryResult[],
  side: BattleSide,
): BattleCategoryResult[] {
  return categories.filter((category) => category.outcome === side);
}

function summarizeCategoryLabels(categories: BattleCategoryResult[], limit = 2): string {
  return categories
    .slice(0, limit)
    .map((category) => category.label.toLowerCase())
    .join(" and ");
}

function friendlyCategoryLabel(category: BattleCategoryResult): string {
  const labels: Record<string, string> = {
    majorTitles: "Grand Slam record",
    dominance: "Weeks at World No.1",
    longevity: "exceptional longevity",
    firstBreakthrough: "early career progression",
    peakStreak: "No.1 streak",
    majorFinals: "Grand Slam finals",
  };
  return labels[category.id] ?? category.label;
}

function formatStrengthLines(categories: BattleCategoryResult[], limit = 3): string[] {
  return sortCategoriesByPriority(categories)
    .slice(0, limit)
    .map((category) => friendlyCategoryLabel(category));
}

export interface CareerBattleWhyInsight {
  winnerName: string;
  winnerIntro: string;
  winnerStrengths: string[];
  loserName: string | null;
  loserStrengths: string[] | null;
}

/**
 * Versus-style "why did they win?" copy for the Career Battle hero.
 * Rule-based wording layer — facts come from structured category outcomes.
 */
export function generateCareerBattleWhyInsight(
  result: BattleScoreResult,
): CareerBattleWhyInsight | null {
  if (result.countedCategories === 0) {
    return null;
  }

  if (result.overallWinner === "tie") {
    return {
      winnerName: result.playerA.shortName,
      winnerIntro: `${result.playerA.shortName} and ${result.playerB.shortName} are even under this lens across ${result.countedCategories} categories.`,
      winnerStrengths: [],
      loserName: null,
      loserStrengths: null,
    };
  }

  if (!result.overallWinner) {
    return null;
  }

  const winner =
    result.overallWinner === "a" ? result.playerA : result.playerB;
  const loser =
    result.overallWinner === "a" ? result.playerB : result.playerA;
  const loserSide: BattleSide = result.overallWinner === "a" ? "b" : "a";

  const winnerCategories = getWinnerCategories(result.categories, result.overallWinner);
  const loserCategories = getWinnerCategories(result.categories, loserSide);
  const winnerStrengths = formatStrengthLines(winnerCategories);
  const loserStrengths =
    loserCategories.length > 0 ? formatStrengthLines(loserCategories, 2) : null;

  return {
    winnerName: winner.shortName,
    winnerIntro: winnerStrengths.length
      ? `${winner.shortName} leads here thanks to`
      : `${winner.shortName} leads under this lens across the compared categories.`,
    winnerStrengths,
    loserName: loserStrengths ? loser.shortName : null,
    loserStrengths,
  };
}

function describeCategoryGroup(categories: BattleCategoryResult[]): string | null {
  if (categories.length === 0) return null;

  const ids = new Set(categories.map((category) => category.id));
  const hasAge = [...ids].some((id) => AGE_CATEGORY_IDS.has(id));
  const hasLongevity = [...ids].some((id) => LONGEVITY_CATEGORY_IDS.has(id));
  const hasPeak = [...ids].some((id) => PEAK_CATEGORY_IDS.has(id));

  if (hasAge && !hasLongevity && !hasPeak) return "age-based categories";
  if (hasLongevity && !hasAge && !hasPeak) return "longevity and No.1 metrics";
  if (hasPeak && !hasAge && !hasLongevity) return "peak and major-title metrics";

  return summarizeCategoryLabels(categories, 3);
}

export function generateBattleInsight(result: BattleScoreResult): string | null {
  if (result.countedCategories === 0) {
    return null;
  }

  if (result.overallWinner === "tie") {
    return `${result.playerA.shortName} and ${result.playerB.shortName} are deadlocked across ${result.countedCategories} categories at age ${result.displayAge}.`;
  }

  if (!result.overallWinner) {
    return null;
  }

  const winner =
    result.overallWinner === "a" ? result.playerA : result.playerB;
  const loser =
    result.overallWinner === "a" ? result.playerB : result.playerA;
  const loserSide: BattleSide = result.overallWinner === "a" ? "b" : "a";

  const winnerCategories = getWinnerCategories(result.categories, result.overallWinner);
  const loserCategories = getWinnerCategories(result.categories, loserSide);

  const winnerStrength = describeCategoryGroup(winnerCategories);
  const loserStrength = describeCategoryGroup(loserCategories);

  if (winnerStrength && loserStrength) {
    return `${winner.shortName} wins this snapshot battle because he leads more ${winnerStrength} at age ${result.displayAge}, while ${loser.shortName} dominates ${loserStrength}.`;
  }

  if (winnerStrength) {
    return `${winner.shortName} wins this snapshot battle because he leads more ${winnerStrength} at age ${result.displayAge}.`;
  }

  const winnerLabels = summarizeCategoryLabels(winnerCategories);
  const loserLabels =
    loserCategories.length > 0 ? summarizeCategoryLabels(loserCategories) : null;

  if (winnerLabels && loserLabels) {
    return `${winner.shortName} wins this battle through ${winnerLabels}, while ${loser.shortName} stays closer in ${loserLabels}.`;
  }

  if (winnerLabels) {
    return `${winner.shortName} wins this battle through ${winnerLabels}.`;
  }

  return `${winner.shortName} edges ${loser.shortName} ${result.overallWinner === "a" ? result.scoreA : result.scoreB} to ${result.overallWinner === "a" ? result.scoreB : result.scoreA} across the compared categories.`;
}

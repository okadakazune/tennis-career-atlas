import type { BattleCategoryResult, BattleScoreResult, BattleSide } from "@/data/battle-score";

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
  const winnerCategories = getWinnerCategories(result.categories, result.overallWinner);
  const loserCategories = getWinnerCategories(
    result.categories,
    result.overallWinner === "a" ? "b" : "a",
  );

  const winnerStrength = summarizeCategoryLabels(winnerCategories);
  const loserStrength =
    loserCategories.length > 0 ? summarizeCategoryLabels(loserCategories) : null;

  if (winnerStrength && loserStrength) {
    return `${winner.shortName} wins this battle through ${winnerStrength}, while ${loser.shortName} stays closer in ${loserStrength}.`;
  }

  if (winnerStrength) {
    return `${winner.shortName} wins this battle through ${winnerStrength}.`;
  }

  return `${winner.shortName} edges ${loser.shortName} ${result.overallWinner === "a" ? result.scoreA : result.scoreB} to ${result.overallWinner === "a" ? result.scoreB : result.scoreA} across the compared categories.`;
}

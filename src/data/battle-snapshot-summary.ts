import type { BattleCategoryResult, BattleScoreResult, BattleSide } from "@/data/battle-score";

function getWinnerCategories(
  categories: BattleCategoryResult[],
  side: BattleSide,
): BattleCategoryResult[] {
  return categories.filter((category) => category.outcome === side);
}

function formatCategoryList(categories: BattleCategoryResult[], limit = 2): string {
  return categories
    .slice(0, limit)
    .map((category) => category.label.toLowerCase())
    .join(" and ");
}

/**
 * One-line objective summary for the selected age snapshot.
 * Rule-based today; intended to be swapped for an AI API later.
 */
export function generateBattleSnapshotSummary(
  result: BattleScoreResult,
): string | null {
  if (result.countedCategories === 0) {
    return null;
  }

  const aWins = result.categories.filter((category) => category.outcome === "a").length;
  const bWins = result.categories.filter((category) => category.outcome === "b").length;
  const ties = result.categories.filter((category) => category.outcome === "tie").length;
  const age = result.displayAge;

  if (result.overallWinner === "tie") {
    if (ties > 0 && aWins === bWins) {
      return `At age ${age}, ${result.playerA.shortName} and ${result.playerB.shortName} are level — ${aWins} categories each with ${ties} tied.`;
    }
    return `At age ${age}, ${result.playerA.shortName} and ${result.playerB.shortName} are deadlocked across the compared categories.`;
  }

  if (!result.overallWinner) {
    return null;
  }

  const winner =
    result.overallWinner === "a" ? result.playerA : result.playerB;
  const loser =
    result.overallWinner === "a" ? result.playerB : result.playerA;
  const loserSide: BattleSide = result.overallWinner === "a" ? "b" : "a";
  const winnerCount = result.overallWinner === "a" ? aWins : bWins;
  const loserCount = result.overallWinner === "a" ? bWins : aWins;

  const winnerCategories = getWinnerCategories(result.categories, result.overallWinner);
  const loserCategories = getWinnerCategories(result.categories, loserSide);
  const winnerHighlights = formatCategoryList(winnerCategories);
  const loserHighlights =
    loserCategories.length > 0 ? formatCategoryList(loserCategories) : null;

  const margin = Math.abs(winnerCount - loserCount);

  if (margin >= 4 && winnerHighlights) {
    return `At age ${age}, ${winner.shortName} holds a clear edge (${winnerCount}–${loserCount} categories), led by ${winnerHighlights}.`;
  }

  if (winnerHighlights && loserHighlights) {
    return `At age ${age}, ${winner.shortName} edges ${loser.shortName} ${winnerCount}–${loserCount} on categories, winning ${winnerHighlights} while ${loser.shortName} stays closer in ${loserHighlights}.`;
  }

  if (winnerHighlights) {
    return `At age ${age}, ${winner.shortName} leads ${winnerCount} categories to ${loser.shortName}'s ${loserCount}, ahead on ${winnerHighlights}.`;
  }

  return `At age ${age}, ${winner.shortName} leads ${winnerCount} categories to ${loser.shortName}'s ${loserCount}.`;
}

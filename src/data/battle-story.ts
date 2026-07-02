import type { BattleCategoryResult, BattleScoreResult, BattleSide } from "@/data/battle-score";
import type { BattleTimelineData } from "@/data/battle-timeline";

export interface BattleStoryInput {
  timeline: BattleTimelineData;
  displayAge: number;
  overallWinner: BattleSide | "tie" | null;
}

function isDecisiveLeader(
  leader: BattleSide | "tie" | null | undefined,
): leader is BattleSide {
  return leader === "a" || leader === "b";
}

function shortNameForSide(
  timeline: BattleTimelineData,
  side: BattleSide,
): string {
  return side === "a" ? timeline.playerA.shortName : timeline.playerB.shortName;
}

function countAgesLed(
  timeline: BattleTimelineData,
  side: BattleSide,
): number {
  return timeline.points.filter((point) => point.leader === side).length;
}

export function generateBattleStory(data: BattleStoryInput): string | null {
  const { timeline, overallWinner } = data;
  const { points, playerA, playerB } = timeline;

  if (points.length === 0) {
    return null;
  }

  const decisivePoints = points.filter(
    (point) => point.leader === "a" || point.leader === "b",
  );
  const leadChanges = points.filter((point) => point.isLeadChange);

  if (decisivePoints.length === 0) {
    return `${playerA.shortName} and ${playerB.shortName} stay evenly matched across their careers with no clear leader at any age.`;
  }

  const firstLeader = decisivePoints[0].leader as BattleSide;
  const lastLeader = decisivePoints[decisivePoints.length - 1].leader as BattleSide;
  const aLed = countAgesLed(timeline, "a");
  const bLed = countAgesLed(timeline, "b");

  if (leadChanges.length === 0) {
    const dominant =
      aLed >= bLed ? playerA.shortName : playerB.shortName;
    return `${dominant} held the lead at every age checkpoint in this battle.`;
  }

  const firstChange = leadChanges[0];
  const previousPoint = points.find((point) => point.age === firstChange.age - 1);
  const previousLeader = previousPoint?.leader;

  if (
    isDecisiveLeader(previousLeader) &&
    isDecisiveLeader(firstChange.leader) &&
    firstLeader === previousLeader &&
    lastLeader === firstChange.leader &&
    leadChanges.length === 1
  ) {
    const fromName = shortNameForSide(timeline, previousLeader);
    const toName = shortNameForSide(timeline, firstChange.leader);
    return `${fromName} dominated the early years before ${toName} overtook him around age ${firstChange.age} and never looked back.`;
  }

  if (leadChanges.length === 1 && isDecisiveLeader(previousLeader)) {
    const fromName = shortNameForSide(timeline, previousLeader);
    const toName = shortNameForSide(timeline, firstChange.leader as BattleSide);
    return `${fromName} led for much of the early career before ${toName} seized control around age ${firstChange.age}.`;
  }

  const closingName =
    overallWinner && overallWinner !== "tie"
      ? shortNameForSide(timeline, overallWinner)
      : shortNameForSide(timeline, lastLeader);

  if (leadChanges.length >= 2) {
    return `This rivalry shifted hands ${leadChanges.length} times, with ${closingName} holding the edge in the latest chapter.`;
  }

  if (aLed > bLed * 1.5) {
    return `${playerA.shortName} controlled most age checkpoints, though ${playerB.shortName} kept the battle competitive in key phases.`;
  }

  if (bLed > aLed * 1.5) {
    return `${playerB.shortName} controlled most age checkpoints, though ${playerA.shortName} kept the battle competitive in key phases.`;
  }

  return `${playerA.shortName} and ${playerB.shortName} traded momentum across their careers, with ${closingName} ahead in the most recent snapshot.`;
}

function formatCategoryStrengths(
  categories: BattleCategoryResult[],
  limit = 3,
): string {
  return categories
    .slice(0, limit)
    .map((category) => category.label.toLowerCase())
    .join(", ");
}

/**
 * Fixed career-wide narrative for the Career Battle card.
 * Rule-based today; intended to be swapped for an AI API later.
 */
export function generateCareerBattleStory(
  careerResult: BattleScoreResult,
  timeline: BattleTimelineData | null,
): string | null {
  if (careerResult.countedCategories === 0) {
    return null;
  }

  if (careerResult.overallWinner === "tie") {
    return `${careerResult.playerA.shortName} and ${careerResult.playerB.shortName} finish this career battle evenly matched across the full comparison.`;
  }

  if (!careerResult.overallWinner) {
    return null;
  }

  const winner =
    careerResult.overallWinner === "a"
      ? careerResult.playerA
      : careerResult.playerB;
  const winnerCategories = careerResult.categories.filter(
    (category) => category.outcome === careerResult.overallWinner,
  );
  const strengths = formatCategoryStrengths(winnerCategories);

  if (strengths) {
    return `${winner.shortName} ultimately wins this career battle by excelling in ${strengths}.`;
  }

  if (timeline) {
    return generateBattleStory({
      timeline,
      displayAge: careerResult.displayAge,
      overallWinner: careerResult.overallWinner,
    });
  }

  return `${winner.shortName} ultimately wins this career battle across the full comparison.`;
}

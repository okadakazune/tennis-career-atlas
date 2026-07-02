import { Player } from "@/data/players";
import {
  getAvailableAgesForPlayers,
  SNAPSHOT_AGE_MAX,
  SNAPSHOT_AGE_MIN,
} from "@/data/career-stats";
import {
  computeBattleScore,
  type BattleCategoryResult,
  type BattlePlayerSummary,
  type BattleSide,
} from "@/data/sports/battle-engine";
import type { SportId } from "@/data/sports/types";

export interface BattleTimelinePoint {
  age: number;
  leader: BattleSide | "tie" | null;
  scoreA: number;
  scoreB: number;
  isLeadChange: boolean;
  categories: BattleCategoryResult[];
}

export interface BattleTimelineData {
  sport: SportId;
  playerA: BattlePlayerSummary;
  playerB: BattlePlayerSummary;
  points: BattleTimelinePoint[];
}

export interface ComputeBattleTimelineInput {
  sport: SportId;
  playerA: Player;
  playerB: Player;
}

function isDecisiveLeader(
  leader: BattleSide | "tie" | null,
): leader is BattleSide {
  return leader === "a" || leader === "b";
}

export function computeBattleTimeline({
  sport,
  playerA,
  playerB,
}: ComputeBattleTimelineInput): BattleTimelineData {
  const availableAges = getAvailableAgesForPlayers([playerA, playerB]);
  const ages = availableAges.filter(
    (age) => age >= SNAPSHOT_AGE_MIN && age <= SNAPSHOT_AGE_MAX,
  );

  const points: BattleTimelinePoint[] = ages.map((age) => {
    const score = computeBattleScore({
      sport,
      playerA,
      playerB,
      displayAge: age,
    });

    return {
      age,
      leader: score.overallWinner,
      scoreA: score.scoreA,
      scoreB: score.scoreB,
      isLeadChange: false,
      categories: score.categories,
    };
  });

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1].leader;
    const current = points[index].leader;
    if (
      isDecisiveLeader(previous) &&
      isDecisiveLeader(current) &&
      previous !== current
    ) {
      points[index].isLeadChange = true;
    }
  }

  const referenceScore = computeBattleScore({
    sport,
    playerA,
    playerB,
    displayAge: ages[0] ?? SNAPSHOT_AGE_MIN,
  });

  return {
    sport,
    playerA: referenceScore.playerA,
    playerB: referenceScore.playerB,
    points,
  };
}

export function getCareerBattleAge(timeline: BattleTimelineData): number | null {
  if (timeline.points.length === 0) return null;
  return timeline.points[timeline.points.length - 1].age;
}

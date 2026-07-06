import { Player } from "@/data/players";
import { getBattleTimelineAges } from "@/data/battle-age";
import type { ExploreModeId } from "@/data/explore/explore-modes";
import { SNAPSHOT_AGE_MIN } from "@/data/career-stats";
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
  exploreModeId: ExploreModeId;
  points: BattleTimelinePoint[];
}

export interface ComputeBattleTimelineInput {
  sport: SportId;
  playerA: Player;
  playerB: Player;
  exploreModeId?: ExploreModeId;
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
  exploreModeId = "career",
}: ComputeBattleTimelineInput): BattleTimelineData {
  const ages = getBattleTimelineAges(playerA, playerB);

  const points: BattleTimelinePoint[] = ages.map((age) => {
    const score = computeBattleScore({
      sport,
      playerA,
      playerB,
      displayAge: age,
      exploreModeId,
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
    exploreModeId,
  });

  return {
    sport,
    playerA: referenceScore.playerA,
    playerB: referenceScore.playerB,
    exploreModeId,
    points,
  };
}


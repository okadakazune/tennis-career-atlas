import { Player } from "@/data/players";
import {
  getComingSoonUniversalBattleCategories,
  getLiveUniversalBattleCategories,
} from "@/data/sports/battle-categories";
import { resolveTennisBattleMetric } from "@/data/sports/engines/tennis-battle-engine";
import { DEFAULT_SPORT } from "@/data/sports/registry";
import type {
  CompareDirection,
  SportBattleContext,
  SportId,
  UniversalBattleCategoryDef,
} from "@/data/sports/types";

export type BattleSide = "a" | "b";
export type BattleCategoryOutcome = BattleSide | "tie" | "excluded" | "comingSoon";

export interface BattlePlayerSummary {
  id: string;
  name: string;
  shortName: string;
  sport: SportId;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
}

export interface BattleCategoryResult {
  id: string;
  label: string;
  outcome: BattleCategoryOutcome;
  winnerShortName?: string;
  valueA: string;
  valueB: string;
  status: "live" | "comingSoon";
}

export interface BattleScoreResult {
  sport: SportId;
  playerA: BattlePlayerSummary;
  playerB: BattlePlayerSummary;
  displayAge: number;
  categories: BattleCategoryResult[];
  comingSoonCategories: BattleCategoryResult[];
  scoreA: number;
  scoreB: number;
  overallWinner: BattleSide | "tie" | null;
  countedCategories: number;
}

export interface ComputeBattleScoreInput {
  sport?: SportId;
  playerA: Player;
  playerB: Player;
  displayAge: number;
}

function compareValues(
  valueA: number | null,
  valueB: number | null,
  direction: CompareDirection,
): BattleCategoryOutcome {
  if (valueA == null && valueB == null) return "excluded";
  if (valueA == null) return "b";
  if (valueB == null) return "a";
  if (valueA === valueB) return "tie";

  if (direction === "higher") {
    return valueA > valueB ? "a" : "b";
  }

  return valueA < valueB ? "a" : "b";
}

function resolveCategoryLabel(
  category: UniversalBattleCategoryDef,
  displayAge: number,
): string {
  return typeof category.label === "function"
    ? category.label(displayAge)
    : category.label;
}

function resolveSportMetric(
  sport: SportId,
  categoryId: UniversalBattleCategoryDef["id"],
  player: Player,
  context: SportBattleContext,
) {
  switch (sport) {
    case "tennis":
      return resolveTennisBattleMetric(categoryId, player, context);
    default:
      return null;
  }
}

function toPlayerSummary(player: Player): BattlePlayerSummary {
  return {
    id: player.id,
    name: player.name,
    shortName: player.shortName,
    sport: player.sport,
    color: player.color,
    imageUrl: player.imageUrl,
    imagePosition: player.imagePosition,
  };
}

function buildComingSoonCategoryResults(
  displayAge: number,
): BattleCategoryResult[] {
  return getComingSoonUniversalBattleCategories().map((category) => ({
    id: category.id,
    label: resolveCategoryLabel(category, displayAge),
    outcome: "comingSoon",
    valueA: "—",
    valueB: "—",
    status: "comingSoon" as const,
  }));
}

export function computeBattleScore({
  sport = DEFAULT_SPORT,
  playerA,
  playerB,
  displayAge,
}: ComputeBattleScoreInput): BattleScoreResult {
  const context: SportBattleContext = { sport, displayAge };
  let scoreA = 0;
  let scoreB = 0;
  let countedCategories = 0;

  const categories: BattleCategoryResult[] = getLiveUniversalBattleCategories().map(
    (category) => {
      const metricA = resolveSportMetric(sport, category.id, playerA, context);
      const metricB = resolveSportMetric(sport, category.id, playerB, context);
      const outcome = compareValues(
        metricA?.value ?? null,
        metricB?.value ?? null,
        metricA?.direction ?? metricB?.direction ?? "higher",
      );
      const label = resolveCategoryLabel(category, displayAge);

      if (outcome === "a") {
        scoreA += 1;
        countedCategories += 1;
      } else if (outcome === "b") {
        scoreB += 1;
        countedCategories += 1;
      } else if (outcome === "tie") {
        scoreA += 0.5;
        scoreB += 0.5;
        countedCategories += 1;
      }

      const winnerShortName =
        outcome === "a"
          ? playerA.shortName
          : outcome === "b"
            ? playerB.shortName
            : outcome === "tie"
              ? "Tie"
              : undefined;

      return {
        id: category.id,
        label,
        outcome,
        winnerShortName,
        valueA: metricA?.display ?? "—",
        valueB: metricB?.display ?? "—",
        status: "live" as const,
      };
    },
  );

  let overallWinner: BattleSide | "tie" | null = null;
  if (countedCategories > 0) {
    if (scoreA > scoreB) overallWinner = "a";
    else if (scoreB > scoreA) overallWinner = "b";
    else overallWinner = "tie";
  }

  return {
    sport,
    playerA: toPlayerSummary(playerA),
    playerB: toPlayerSummary(playerB),
    displayAge,
    categories,
    comingSoonCategories: buildComingSoonCategoryResults(displayAge),
    scoreA,
    scoreB,
    overallWinner,
    countedCategories,
  };
}

export function getBattlePlayersFromIds(
  players: Player[],
  playerAId: string,
  playerBId: string,
): [Player, Player] | null {
  const playerA = players.find((player) => player.id === playerAId);
  const playerB = players.find((player) => player.id === playerBId);
  if (!playerA || !playerB || playerA.id === playerB.id) return null;
  return [playerA, playerB];
}

export const DEFAULT_BATTLE_PLAYER_A = "federer";
export const DEFAULT_BATTLE_PLAYER_B = "djokovic";

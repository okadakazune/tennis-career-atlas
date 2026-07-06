import { Player, isRetiredPlayer } from "@/data/players";
import {
  getAvailableAgesForPlayers,
  SNAPSHOT_AGE_MAX,
  SNAPSHOT_AGE_MIN,
} from "@/data/career-stats";

export type BattleComparisonMode = "full-career" | "current-age-snapshot";

/** Latest completed age year from ranking trajectory (never rounds up). */
export function getPlayerCurrentAge(player: Player): number {
  const latest = player.trajectoryWeekly.at(-1);
  if (!latest) return SNAPSHOT_AGE_MIN;
  return Math.floor(latest.age);
}

export function getPlayerCareerEndAge(player: Player): number {
  return getPlayerCurrentAge(player);
}

/**
 * Retired vs retired → full careers (longevity counts).
 * Any active player → snapshot through the younger player's current age.
 */
export function getBattleComparisonMode(
  playerA: Player,
  playerB: Player,
): BattleComparisonMode {
  if (isRetiredPlayer(playerA) && isRetiredPlayer(playerB)) {
    return "full-career";
  }
  return "current-age-snapshot";
}

export function getComparableBattleAge(
  playerA: Player,
  playerB: Player,
): number {
  const mode = getBattleComparisonMode(playerA, playerB);

  if (mode === "full-career") {
    return Math.max(getPlayerCareerEndAge(playerA), getPlayerCareerEndAge(playerB));
  }

  return Math.min(getPlayerCurrentAge(playerA), getPlayerCurrentAge(playerB));
}

export function getBattleTimelineAges(
  playerA: Player,
  playerB: Player,
): number[] {
  const availableAges = getAvailableAgesForPlayers([playerA, playerB]);
  const capAge = getComparableBattleAge(playerA, playerB);

  return availableAges.filter(
    (age) => age >= SNAPSHOT_AGE_MIN && age <= Math.min(capAge, SNAPSHOT_AGE_MAX),
  );
}

export function getCareerBattleAge(
  playerA: Player,
  playerB: Player,
): number {
  return getComparableBattleAge(playerA, playerB);
}

export function getCareerBattleLabel(
  playerA: Player,
  playerB: Player,
  age: number,
): string {
  if (getBattleComparisonMode(playerA, playerB) === "full-career") {
    return "Full-career comparison — both players retired";
  }

  return `Compared through age ${age} — active players use current age only`;
}

import { Player } from "@/data/players";
import {
  computeGrandSlamCareerTotals,
  countGrandSlamTitlesInSeason,
  getGrandSlamResultsAtAge,
} from "@/data/grand-slam";

export interface CareerStats {
  bestRank: number | null;
  totalWeeksAtNo1: number;
  longestConsecutiveWeeksAtNo1: number;
  firstAgeTop100: number | null;
  firstAgeTop10: number | null;
  firstAgeNo1: number | null;
  grandSlamTitles: number;
  grandSlamFinals: number;
  yearsInTop10: number;
  yearsInTop5: number;
}

export interface No1Streak {
  startDate: string;
  endDate: string;
  weeks: number;
}

export const MIN_NO1_STREAK_WEEKS = 4;

export const SNAPSHOT_AGES = [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40] as const;

export type SnapshotAge = (typeof SNAPSHOT_AGES)[number];

function formatAge(value: number | null): string {
  if (value == null) return "N/A";
  return value.toFixed(1);
}

export function formatCareerStatAge(value: number | null): string {
  return formatAge(value);
}

export function countYearsAtOrAboveRank(player: Player, maxRank: number): number {
  const years = new Set<string>();

  for (const point of player.trajectoryYearly) {
    if (point.ranking <= maxRank) {
      years.add(point.rankingDate.slice(0, 4));
    }
  }

  return years.size;
}

export function computeCareerStats(player: Player): CareerStats {
  const weekly = player.trajectoryWeekly;
  const gsTotals = computeGrandSlamCareerTotals(player.id);

  let bestRank: number | null = null;
  let totalWeeksAtNo1 = 0;
  let longestConsecutiveWeeksAtNo1 = 0;
  let firstAgeTop100: number | null = null;
  let firstAgeTop10: number | null = null;
  let firstAgeNo1: number | null = null;

  for (const point of weekly) {
    if (bestRank === null || point.ranking < bestRank) {
      bestRank = point.ranking;
    }

    if (point.ranking === 1) {
      totalWeeksAtNo1 += 1;
      if (point.consecutiveWeeksAtNo1 != null) {
        longestConsecutiveWeeksAtNo1 = Math.max(
          longestConsecutiveWeeksAtNo1,
          point.consecutiveWeeksAtNo1,
        );
      }
      if (firstAgeNo1 === null) {
        firstAgeNo1 = point.age;
      }
    }

    if (point.ranking <= 100 && firstAgeTop100 === null) {
      firstAgeTop100 = point.age;
    }

    if (point.ranking <= 10 && firstAgeTop10 === null) {
      firstAgeTop10 = point.age;
    }
  }

  return {
    bestRank,
    totalWeeksAtNo1,
    longestConsecutiveWeeksAtNo1,
    firstAgeTop100,
    firstAgeTop10,
    firstAgeNo1,
    grandSlamTitles: gsTotals.titles,
    grandSlamFinals: gsTotals.finals,
    yearsInTop10: countYearsAtOrAboveRank(player, 10),
    yearsInTop5: countYearsAtOrAboveRank(player, 5),
  };
}

export function extractNo1Streaks(player: Player): No1Streak[] {
  const weekly = player.trajectoryWeekly;
  const streaks: No1Streak[] = [];
  let streakStartIndex: number | null = null;

  const closeStreak = (endExclusive: number) => {
    if (streakStartIndex === null) return;

    const startPoint = weekly[streakStartIndex];
    const endPoint = weekly[endExclusive - 1];
    const weeks = endExclusive - streakStartIndex;

    streaks.push({
      startDate: startPoint.rankingDate,
      endDate: endPoint.rankingDate,
      weeks: startPoint.consecutiveWeeksAtNo1 ?? weeks,
    });
    streakStartIndex = null;
  };

  for (let index = 0; index < weekly.length; index++) {
    if (weekly[index].ranking === 1) {
      if (streakStartIndex === null) streakStartIndex = index;
      continue;
    }

    closeStreak(index);
  }

  closeStreak(weekly.length);
  return streaks;
}

export function extractSignificantNo1Streaks(player: Player): No1Streak[] {
  return extractNo1Streaks(player).filter(
    (streak) => streak.weeks >= MIN_NO1_STREAK_WEEKS,
  );
}

export function formatNo1StreakEra(streak: No1Streak): string {
  const startYear = streak.startDate.slice(0, 4);
  const endYear = streak.endDate.slice(0, 4);
  return startYear === endYear ? startYear : `${startYear}–${endYear}`;
}

export function getYearlyRankingAtAge(player: Player, age: number): number | null {
  const point = player.trajectoryYearly.find(
    (entry) => Math.round(entry.age) === age,
  );
  return point?.ranking ?? null;
}

export interface AgeSnapshotRow {
  playerId: string;
  name: string;
  shortName: string;
  color: string;
  ranking: number | null;
  gsTitlesThisSeason: number;
}

export function buildAgeSnapshot(
  players: Player[],
  age: number,
): AgeSnapshotRow[] {
  return players
    .map((player) => {
      const gsResults = getGrandSlamResultsAtAge(player, age);
      return {
        playerId: player.id,
        name: player.name,
        shortName: player.shortName,
        color: player.color,
        ranking: getYearlyRankingAtAge(player, age),
        gsTitlesThisSeason: countGrandSlamTitlesInSeason(gsResults),
      };
    })
    .sort((a, b) => {
      if (a.ranking == null && b.ranking == null) return 0;
      if (a.ranking == null) return 1;
      if (b.ranking == null) return -1;
      return a.ranking - b.ranking;
    });
}

export function getCareerTimelineBounds(players: Player[]): {
  minDate: string;
  maxDate: string;
} | null {
  let minMs = Infinity;
  let maxMs = -Infinity;

  for (const player of players) {
    for (const streak of extractNo1Streaks(player)) {
      const startMs = Date.parse(`${streak.startDate}T00:00:00Z`);
      const endMs = Date.parse(`${streak.endDate}T00:00:00Z`);
      minMs = Math.min(minMs, startMs);
      maxMs = Math.max(maxMs, endMs);
    }
  }

  if (!Number.isFinite(minMs) || !Number.isFinite(maxMs)) return null;

  return {
    minDate: new Date(minMs).toISOString().slice(0, 10),
    maxDate: new Date(maxMs).toISOString().slice(0, 10),
  };
}

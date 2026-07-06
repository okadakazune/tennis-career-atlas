import { Player } from "@/data/players";
import {
  buildCompareOverview,
  countWeeksAtNo1ThroughAge,
  countYearsInTop10ThroughAge,
  getBestRankThroughAge,
  getLongestNo1StreakThroughAge,
} from "@/data/compare-stats";
import { getYearlyRankingAtAge } from "@/data/career-stats";
import {
  countGrandSlamFinalsThroughAge,
  countGrandSlamTitlesThroughAge,
} from "@/data/grand-slam";
import type {
  CompareDirection,
  ResolvedBattleMetric,
  SportBattleContext,
  UniversalBattleCategoryId,
} from "@/data/sports/types";

function formatRank(value: number | null): string {
  return value == null ? "—" : `#${value}`;
}

function formatCount(value: number | null): string {
  return value == null ? "—" : String(value);
}

function formatAge(value: number | null): string {
  return value == null ? "—" : value.toFixed(1);
}

function getYearEndRankAtAge(player: Player, age: number): number | null {
  const matches = player.trajectoryYearly.filter(
    (entry) => Math.round(entry.age) === age,
  );
  if (matches.length === 0) return null;

  const latest = [...matches].sort((a, b) => b.age - a.age)[0];
  return latest.yearEndRank ?? latest.ranking ?? null;
}

function metric(
  value: number | null,
  display: string,
  direction: CompareDirection,
): ResolvedBattleMetric {
  return { value, display, direction };
}

function getFirstAgeAtOrBelowRank(
  player: Player,
  maxRank: number,
  throughAge: number,
): number | null {
  let firstAge: number | null = null;

  for (const point of player.trajectoryWeekly) {
    if (Math.floor(point.age) > throughAge) continue;
    if (point.ranking <= maxRank) {
      firstAge = point.age;
      break;
    }
  }

  return firstAge;
}

export function resolveTennisBattleMetric(
  categoryId: UniversalBattleCategoryId,
  player: Player,
  context: SportBattleContext,
): ResolvedBattleMetric | null {
  const overview = buildCompareOverview([player])[0];
  const { displayAge, comparisonMode } = context;
  const useFullCareer = comparisonMode === "full-career";

  switch (categoryId) {
    case "greatestAtAge":
      return metric(
        getYearlyRankingAtAge(player, displayAge),
        formatRank(getYearlyRankingAtAge(player, displayAge)),
        "lower",
      );
    case "titlesAtAge":
      return metric(
        countGrandSlamTitlesThroughAge(player, displayAge),
        formatCount(countGrandSlamTitlesThroughAge(player, displayAge)),
        "higher",
      );
    case "rankingAtAge":
      return metric(
        getYearEndRankAtAge(player, displayAge),
        formatRank(getYearEndRankAtAge(player, displayAge)),
        "lower",
      );
    case "peak": {
      const value = useFullCareer
        ? overview?.bestRank ?? null
        : getBestRankThroughAge(player, displayAge);
      return metric(value, formatRank(value), "lower");
    }
    case "majorTitles": {
      const value = useFullCareer
        ? overview?.grandSlamTitles ?? null
        : countGrandSlamTitlesThroughAge(player, displayAge);
      return metric(value, formatCount(value), "higher");
    }
    case "majorFinals": {
      const value = useFullCareer
        ? overview?.grandSlamFinals ?? null
        : countGrandSlamFinalsThroughAge(player, displayAge);
      return metric(value, formatCount(value), "higher");
    }
    case "longevity": {
      const value = useFullCareer
        ? overview?.yearsInTop10 ?? null
        : countYearsInTop10ThroughAge(player, displayAge);
      return metric(value, formatCount(value), "higher");
    }
    case "dominance": {
      const value = useFullCareer
        ? overview?.totalWeeksAtNo1 ?? null
        : countWeeksAtNo1ThroughAge(player, displayAge);
      return metric(value, formatCount(value), "higher");
    }
    case "peakStreak": {
      const value = useFullCareer
        ? overview?.longestNo1Streak ?? null
        : getLongestNo1StreakThroughAge(player, displayAge);
      return metric(value, formatCount(value), "higher");
    }
    case "firstBreakthrough": {
      const value = useFullCareer
        ? overview?.firstAgeTop10 ?? null
        : getFirstAgeAtOrBelowRank(player, 10, displayAge);
      return metric(value, formatAge(value), "lower");
    }
    case "firstDominance": {
      const value = useFullCareer
        ? overview?.firstAgeNo1 ?? null
        : getFirstAgeAtOrBelowRank(player, 1, displayAge);
      return metric(value, formatAge(value), "lower");
    }
    case "eraBattle":
    case "goat":
    case "clutch":
    case "popularity":
      return null;
    default:
      return null;
  }
}

export function isTennisPlayer(player: Player): boolean {
  return player.sport === "tennis";
}

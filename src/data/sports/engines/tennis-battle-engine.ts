import { Player } from "@/data/players";
import { buildCompareOverview } from "@/data/compare-stats";
import { getYearlyRankingAtAge } from "@/data/career-stats";
import { countGrandSlamTitlesThroughAge } from "@/data/grand-slam";
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

export function resolveTennisBattleMetric(
  categoryId: UniversalBattleCategoryId,
  player: Player,
  context: SportBattleContext,
): ResolvedBattleMetric | null {
  const overview = buildCompareOverview([player])[0];
  const { displayAge } = context;

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
    case "peak":
      return metric(overview?.bestRank ?? null, formatRank(overview?.bestRank ?? null), "lower");
    case "majorTitles":
      return metric(
        overview?.grandSlamTitles ?? null,
        formatCount(overview?.grandSlamTitles ?? null),
        "higher",
      );
    case "majorFinals":
      return metric(
        overview?.grandSlamFinals ?? null,
        formatCount(overview?.grandSlamFinals ?? null),
        "higher",
      );
    case "longevity":
      return metric(
        overview?.yearsInTop10 ?? null,
        formatCount(overview?.yearsInTop10 ?? null),
        "higher",
      );
    case "dominance":
      return metric(
        overview?.totalWeeksAtNo1 ?? null,
        formatCount(overview?.totalWeeksAtNo1 ?? null),
        "higher",
      );
    case "peakStreak":
      return metric(
        overview?.longestNo1Streak ?? null,
        formatCount(overview?.longestNo1Streak ?? null),
        "higher",
      );
    case "firstBreakthrough":
      return metric(
        overview?.firstAgeTop10 ?? null,
        formatAge(overview?.firstAgeTop10 ?? null),
        "lower",
      );
    case "firstDominance":
      return metric(
        overview?.firstAgeNo1 ?? null,
        formatAge(overview?.firstAgeNo1 ?? null),
        "lower",
      );
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

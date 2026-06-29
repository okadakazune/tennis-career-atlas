import { Player } from "@/data/players";
import {
  buildCompareOverview,
  buildEnhancedAgeSnapshot,
} from "@/data/compare-stats";
import { getYearlyRankingAtAge } from "@/data/career-stats";
import { countGrandSlamTitlesThroughAge } from "@/data/grand-slam";

export const DEFAULT_BATTLE_PLAYER_A = "federer";
export const DEFAULT_BATTLE_PLAYER_B = "djokovic";

export type BattleSide = "a" | "b";
export type BattleCategoryOutcome = BattleSide | "tie" | "excluded";

export interface BattlePlayerSummary {
  id: string;
  name: string;
  shortName: string;
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
}

export interface BattleScoreResult {
  playerA: BattlePlayerSummary;
  playerB: BattlePlayerSummary;
  displayAge: number;
  categories: BattleCategoryResult[];
  scoreA: number;
  scoreB: number;
  overallWinner: BattleSide | "tie" | null;
  countedCategories: number;
}

type CompareDirection = "higher" | "lower";

interface BattleMetricDefinition {
  id: string;
  label: string | ((age: number) => string);
  direction: CompareDirection;
  getValue: (player: Player, age: number) => number | null;
  format: (value: number | null) => string;
}

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

function getBattleMetrics(): BattleMetricDefinition[] {
  return [
    {
      id: "grandSlamTitles",
      label: "Grand Slam Titles",
      direction: "higher",
      getValue: (player) => buildCompareOverview([player])[0]?.grandSlamTitles ?? null,
      format: formatCount,
    },
    {
      id: "grandSlamFinals",
      label: "Grand Slam Finals",
      direction: "higher",
      getValue: (player) => buildCompareOverview([player])[0]?.grandSlamFinals ?? null,
      format: formatCount,
    },
    {
      id: "weeksAtNo1",
      label: "Weeks at No.1",
      direction: "higher",
      getValue: (player) => buildCompareOverview([player])[0]?.totalWeeksAtNo1 ?? null,
      format: formatCount,
    },
    {
      id: "longestNo1Streak",
      label: "Longest No.1 Streak",
      direction: "higher",
      getValue: (player) => buildCompareOverview([player])[0]?.longestNo1Streak ?? null,
      format: formatCount,
    },
    {
      id: "bestAtpRank",
      label: "Best ATP Rank",
      direction: "lower",
      getValue: (player) => buildCompareOverview([player])[0]?.bestRank ?? null,
      format: formatRank,
    },
    {
      id: "yearsInTop10",
      label: "Years in Top 10",
      direction: "higher",
      getValue: (player) => buildCompareOverview([player])[0]?.yearsInTop10 ?? null,
      format: formatCount,
    },
    {
      id: "firstAgeTop10",
      label: "First Age Top 10",
      direction: "lower",
      getValue: (player) => buildCompareOverview([player])[0]?.firstAgeTop10 ?? null,
      format: formatAge,
    },
    {
      id: "firstAgeNo1",
      label: "First Age No.1",
      direction: "lower",
      getValue: (player) => buildCompareOverview([player])[0]?.firstAgeNo1 ?? null,
      format: formatAge,
    },
    {
      id: "peakRankAtAge",
      label: (snapshotAge) => `Peak Rank at Age ${snapshotAge}`,
      direction: "lower",
      getValue: (player, snapshotAge) => getYearlyRankingAtAge(player, snapshotAge),
      format: formatRank,
    },
    {
      id: "gsTitlesAtAge",
      label: (snapshotAge) => `GS Titles at Age ${snapshotAge}`,
      direction: "higher",
      getValue: (player, snapshotAge) => countGrandSlamTitlesThroughAge(player, snapshotAge),
      format: formatCount,
    },
    {
      id: "rankingAtAge",
      label: (snapshotAge) => `Ranking at Age ${snapshotAge}`,
      direction: "lower",
      getValue: (player, snapshotAge) => getYearEndRankAtAge(player, snapshotAge),
      format: formatRank,
    },
  ];
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

function toPlayerSummary(player: Player): BattlePlayerSummary {
  return {
    id: player.id,
    name: player.name,
    shortName: player.shortName,
    color: player.color,
    imageUrl: player.imageUrl,
    imagePosition: player.imagePosition,
  };
}

export function computeBattleScore(
  playerA: Player,
  playerB: Player,
  displayAge: number,
): BattleScoreResult {
  const overviewA = buildCompareOverview([playerA])[0];
  const overviewB = buildCompareOverview([playerB])[0];
  const metrics = getBattleMetrics();
  let scoreA = 0;
  let scoreB = 0;
  let countedCategories = 0;

  const getCareerValue = (
    overview: typeof overviewA,
    key: keyof typeof overviewA,
  ): number | null => {
    const value = overview?.[key];
    return typeof value === "number" ? value : null;
  };

  const categories: BattleCategoryResult[] = metrics.map((metric) => {
    let valueA: number | null;
    let valueB: number | null;

    switch (metric.id) {
      case "grandSlamTitles":
        valueA = getCareerValue(overviewA, "grandSlamTitles");
        valueB = getCareerValue(overviewB, "grandSlamTitles");
        break;
      case "grandSlamFinals":
        valueA = getCareerValue(overviewA, "grandSlamFinals");
        valueB = getCareerValue(overviewB, "grandSlamFinals");
        break;
      case "weeksAtNo1":
        valueA = getCareerValue(overviewA, "totalWeeksAtNo1");
        valueB = getCareerValue(overviewB, "totalWeeksAtNo1");
        break;
      case "longestNo1Streak":
        valueA = getCareerValue(overviewA, "longestNo1Streak");
        valueB = getCareerValue(overviewB, "longestNo1Streak");
        break;
      case "bestAtpRank":
        valueA = overviewA?.bestRank ?? null;
        valueB = overviewB?.bestRank ?? null;
        break;
      case "yearsInTop10":
        valueA = getCareerValue(overviewA, "yearsInTop10");
        valueB = getCareerValue(overviewB, "yearsInTop10");
        break;
      case "firstAgeTop10":
        valueA = overviewA?.firstAgeTop10 ?? null;
        valueB = overviewB?.firstAgeTop10 ?? null;
        break;
      case "firstAgeNo1":
        valueA = overviewA?.firstAgeNo1 ?? null;
        valueB = overviewB?.firstAgeNo1 ?? null;
        break;
      case "peakRankAtAge":
        valueA = getYearlyRankingAtAge(playerA, displayAge);
        valueB = getYearlyRankingAtAge(playerB, displayAge);
        break;
      case "gsTitlesAtAge":
        valueA = countGrandSlamTitlesThroughAge(playerA, displayAge);
        valueB = countGrandSlamTitlesThroughAge(playerB, displayAge);
        break;
      case "rankingAtAge":
        valueA = getYearEndRankAtAge(playerA, displayAge);
        valueB = getYearEndRankAtAge(playerB, displayAge);
        break;
      default:
        valueA = metric.getValue(playerA, displayAge);
        valueB = metric.getValue(playerB, displayAge);
    }

    const outcome = compareValues(valueA, valueB, metric.direction);
    const label =
      typeof metric.label === "function" ? metric.label(displayAge) : metric.label;

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
      id: metric.id,
      label,
      outcome,
      winnerShortName,
      valueA: metric.format(valueA),
      valueB: metric.format(valueB),
    };
  });

  let overallWinner: BattleSide | "tie" | null = null;
  if (countedCategories > 0) {
    if (scoreA > scoreB) overallWinner = "a";
    else if (scoreB > scoreA) overallWinner = "b";
    else overallWinner = "tie";
  }

  return {
    playerA: toPlayerSummary(playerA),
    playerB: toPlayerSummary(playerB),
    displayAge,
    categories,
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

/** Prefetch overview rows once for insight helpers. */
export function getBattleAgeSnapshot(playerA: Player, playerB: Player, age: number) {
  return buildEnhancedAgeSnapshot([playerA, playerB], age);
}

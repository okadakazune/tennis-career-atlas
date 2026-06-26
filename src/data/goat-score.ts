import { Player } from "@/data/players";
import { buildCompareOverview, CompareOverviewRow } from "@/data/compare-stats";

export type GoatScoreMetricKey =
  | "grandSlamTitles"
  | "grandSlamFinals"
  | "bestRank"
  | "totalWeeksAtNo1"
  | "longestNo1Streak"
  | "yearsInTop10"
  | "firstAgeTop10"
  | "firstAgeNo1";

export interface GoatScoreMetricDefinition {
  key: GoatScoreMetricKey;
  label: string;
  weight: number;
  direction: "higher" | "lower";
}

export const GOAT_SCORE_METRICS: GoatScoreMetricDefinition[] = [
  { key: "grandSlamTitles", label: "Grand Slam Titles", weight: 25, direction: "higher" },
  { key: "grandSlamFinals", label: "Grand Slam Finals", weight: 10, direction: "higher" },
  { key: "bestRank", label: "Best ATP Rank", weight: 15, direction: "lower" },
  { key: "totalWeeksAtNo1", label: "Total Weeks at #1", weight: 20, direction: "higher" },
  { key: "longestNo1Streak", label: "Longest #1 Streak", weight: 10, direction: "higher" },
  { key: "yearsInTop10", label: "Years in Top 10", weight: 10, direction: "higher" },
  { key: "firstAgeTop10", label: "First Age Top 10", weight: 5, direction: "lower" },
  { key: "firstAgeNo1", label: "First Age #1", weight: 5, direction: "lower" },
];

export const GOAT_SCORE_TOTAL_WEIGHT = GOAT_SCORE_METRICS.reduce(
  (sum, metric) => sum + metric.weight,
  0,
);

export interface GoatScoreBreakdownItem {
  key: GoatScoreMetricKey;
  label: string;
  weight: number;
  rawFormatted: string;
  normalizedScore: number | null;
  weightedPoints: number | null;
  included: boolean;
}

export interface GoatScoreRow {
  playerId: string;
  name: string;
  shortName: string;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
  totalScore: number;
  availableWeight: number;
  breakdown: GoatScoreBreakdownItem[];
}

function formatRank(value: number | null): string {
  return value == null ? "—" : `#${value}`;
}

function formatAge(value: number | null): string {
  return value == null ? "—" : value.toFixed(1);
}

function getMetricValue(row: CompareOverviewRow, key: GoatScoreMetricKey): number | null {
  switch (key) {
    case "grandSlamTitles":
      return row.grandSlamTitles;
    case "grandSlamFinals":
      return row.grandSlamFinals;
    case "bestRank":
      return row.bestRank;
    case "totalWeeksAtNo1":
      return row.totalWeeksAtNo1;
    case "longestNo1Streak":
      return row.longestNo1Streak;
    case "yearsInTop10":
      return row.yearsInTop10;
    case "firstAgeTop10":
      return row.firstAgeTop10;
    case "firstAgeNo1":
      return row.firstAgeNo1;
  }
}

function formatMetricValue(row: CompareOverviewRow, key: GoatScoreMetricKey): string {
  switch (key) {
    case "grandSlamTitles":
      return String(row.grandSlamTitles);
    case "grandSlamFinals":
      return String(row.grandSlamFinals);
    case "bestRank":
      return formatRank(row.bestRank);
    case "totalWeeksAtNo1":
      return String(row.totalWeeksAtNo1);
    case "longestNo1Streak":
      return row.longestNo1Streak > 0 ? String(row.longestNo1Streak) : "0";
    case "yearsInTop10":
      return String(row.yearsInTop10);
    case "firstAgeTop10":
      return formatAge(row.firstAgeTop10);
    case "firstAgeNo1":
      return formatAge(row.firstAgeNo1);
  }
}

function hasMetricValue(row: CompareOverviewRow, key: GoatScoreMetricKey): boolean {
  return getMetricValue(row, key) != null;
}

function normalizeWithinGroup(
  entries: { playerId: string; value: number }[],
  direction: "higher" | "lower",
): Map<string, number> {
  const result = new Map<string, number>();
  if (entries.length === 0) return result;

  const values = entries.map((entry) => entry.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  for (const entry of entries) {
    if (max === min) {
      result.set(entry.playerId, 100);
      continue;
    }

    const normalized =
      direction === "higher"
        ? ((entry.value - min) / (max - min)) * 100
        : ((max - entry.value) / (max - min)) * 100;

    result.set(entry.playerId, normalized);
  }

  return result;
}

export function buildGoatScores(players: Player[]): GoatScoreRow[] {
  if (players.length === 0) return [];

  const overview = buildCompareOverview(players);
  const normalizedByMetric = new Map<GoatScoreMetricKey, Map<string, number>>();

  for (const metric of GOAT_SCORE_METRICS) {
    const entries = overview
      .filter((row) => hasMetricValue(row, metric.key))
      .map((row) => ({
        playerId: row.playerId,
        value: getMetricValue(row, metric.key)!,
      }));

    if (entries.length === 0) continue;

    normalizedByMetric.set(
      metric.key,
      normalizeWithinGroup(entries, metric.direction),
    );
  }

  const rows: GoatScoreRow[] = overview.map((row) => {
    let weightedSum = 0;
    let availableWeight = 0;

    const breakdown: GoatScoreBreakdownItem[] = GOAT_SCORE_METRICS.map((metric) => {
      const normalizedMap = normalizedByMetric.get(metric.key);
      const hasValue = hasMetricValue(row, metric.key);
      const included = hasValue && normalizedMap?.has(row.playerId) === true;
      const normalizedScore = included ? normalizedMap!.get(row.playerId)! : null;
      const weightedPoints =
        included && normalizedScore != null
          ? (normalizedScore * metric.weight) / 100
          : null;

      if (included && weightedPoints != null) {
        weightedSum += weightedPoints;
        availableWeight += metric.weight;
      }

      return {
        key: metric.key,
        label: metric.label,
        weight: metric.weight,
        rawFormatted: formatMetricValue(row, metric.key),
        normalizedScore,
        weightedPoints,
        included,
      };
    });

    const totalScore =
      availableWeight > 0 ? (weightedSum / availableWeight) * 100 : 0;

    return {
      playerId: row.playerId,
      name: row.name,
      shortName: row.shortName,
      color: row.color,
      imageUrl: row.imageUrl,
      imagePosition: row.imagePosition,
      totalScore,
      availableWeight,
      breakdown,
    };
  });

  return rows.sort((a, b) => b.totalScore - a.totalScore);
}

export function findTopGoatScorePlayerId(rows: GoatScoreRow[]): string | null {
  if (rows.length === 0) return null;

  const topScore = rows[0].totalScore;
  const leaders = rows.filter(
    (row) => Math.abs(row.totalScore - topScore) < 0.05,
  );

  return leaders.length === 1 ? leaders[0].playerId : null;
}

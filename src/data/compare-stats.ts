import { Player } from "@/data/players";
import {
  CareerStats,
  computeCareerStats,
  getYearlyRankingAtAge,
} from "@/data/career-stats";
import {
  countGrandSlamFinalsThroughAge,
  countGrandSlamTitlesThroughAge,
} from "@/data/grand-slam";

export type MetricDirection = "lower" | "higher";

export interface CompareOverviewRow {
  playerId: string;
  name: string;
  shortName: string;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
  bestRank: number | null;
  latestRank: number | null;
  latestWeek: string | null;
  grandSlamTitles: number;
  grandSlamFinals: number;
  totalWeeksAtNo1: number;
  longestNo1Streak: number;
  firstAgeTop100: number | null;
  firstAgeTop10: number | null;
  firstAgeNo1: number | null;
  yearsInTop10: number;
}

export interface CompareMetric {
  key: keyof CompareOverviewRow;
  label: string;
  direction: MetricDirection;
  format: (row: CompareOverviewRow) => string;
}

export interface EnhancedAgeSnapshotRow {
  playerId: string;
  name: string;
  shortName: string;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
  rankingAtAge: number | null;
  gsTitlesByAge: number;
  gsFinalsByAge: number;
  weeksAtNo1ByAge: number;
  inTop10AtAge: boolean;
}

export type AgeSnapshotMetricKey =
  | "rankingAtAge"
  | "gsTitlesByAge"
  | "gsFinalsByAge"
  | "weeksAtNo1ByAge"
  | "inTop10AtAge";

export interface AgeSnapshotMetric {
  key: AgeSnapshotMetricKey;
  direction: MetricDirection | "boolean";
  label: (age: number) => string;
  format: (row: EnhancedAgeSnapshotRow) => string;
}

export function getAgeSnapshotMetrics(age: number): AgeSnapshotMetric[] {
  return [
    {
      key: "rankingAtAge",
      direction: "lower",
      label: () => `ATP Ranking at age ${age}`,
      format: (row) => formatRank(row.rankingAtAge),
    },
    {
      key: "gsTitlesByAge",
      direction: "higher",
      label: () => `Grand Slam Titles by age ${age}`,
      format: (row) => dash(row.gsTitlesByAge),
    },
    {
      key: "gsFinalsByAge",
      direction: "higher",
      label: () => `Grand Slam Finals by age ${age}`,
      format: (row) => dash(row.gsFinalsByAge),
    },
    {
      key: "weeksAtNo1ByAge",
      direction: "higher",
      label: () => `Total weeks at #1 by age ${age}`,
      format: (row) =>
        row.weeksAtNo1ByAge > 0 ? String(row.weeksAtNo1ByAge) : "—",
    },
    {
      key: "inTop10AtAge",
      direction: "boolean",
      label: () => `Top 10 status at age ${age}`,
      format: (row) => {
        if (row.rankingAtAge == null) return "—";
        return row.inTop10AtAge ? "Yes" : "No";
      },
    },
  ];
}

function dash(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function formatRank(value: number | null): string {
  return value == null ? "—" : `#${value}`;
}

function formatAge(value: number | null): string {
  return value == null ? "—" : value.toFixed(1);
}

function formatWeek(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getLatestWeeklyPoint(player: Player) {
  return player.trajectoryWeekly.at(-1) ?? null;
}

export function buildCompareOverview(players: Player[]): CompareOverviewRow[] {
  return players.map((player) => {
    const stats: CareerStats = computeCareerStats(player);
    const latest = getLatestWeeklyPoint(player);

    return {
      playerId: player.id,
      name: player.name,
      shortName: player.shortName,
      color: player.color,
      imageUrl: player.imageUrl,
      imagePosition: player.imagePosition,
      bestRank: stats.bestRank,
      latestRank: latest?.ranking ?? null,
      latestWeek: latest?.rankingDate ?? null,
      grandSlamTitles: stats.grandSlamTitles,
      grandSlamFinals: stats.grandSlamFinals,
      totalWeeksAtNo1: stats.totalWeeksAtNo1,
      longestNo1Streak: stats.longestConsecutiveWeeksAtNo1,
      firstAgeTop100: stats.firstAgeTop100,
      firstAgeTop10: stats.firstAgeTop10,
      firstAgeNo1: stats.firstAgeNo1,
      yearsInTop10: stats.yearsInTop10,
    };
  });
}

export const COMPARE_OVERVIEW_METRICS: CompareMetric[] = [
  {
    key: "bestRank",
    label: "Best ATP Rank",
    direction: "lower",
    format: (row) => formatRank(row.bestRank),
  },
  {
    key: "latestRank",
    label: "Latest Rank",
    direction: "lower",
    format: (row) => formatRank(row.latestRank),
  },
  {
    key: "latestWeek",
    label: "Latest Week",
    direction: "higher",
    format: (row) => formatWeek(row.latestWeek),
  },
  {
    key: "grandSlamTitles",
    label: "Grand Slam Titles",
    direction: "higher",
    format: (row) => dash(row.grandSlamTitles),
  },
  {
    key: "grandSlamFinals",
    label: "Grand Slam Finals",
    direction: "higher",
    format: (row) => dash(row.grandSlamFinals),
  },
  {
    key: "totalWeeksAtNo1",
    label: "Total Weeks at #1",
    direction: "higher",
    format: (row) => String(row.totalWeeksAtNo1),
  },
  {
    key: "longestNo1Streak",
    label: "Longest #1 Streak",
    direction: "higher",
    format: (row) =>
      row.longestNo1Streak > 0 ? String(row.longestNo1Streak) : "—",
  },
  {
    key: "firstAgeTop100",
    label: "First Age Top 100",
    direction: "lower",
    format: (row) => formatAge(row.firstAgeTop100),
  },
  {
    key: "firstAgeTop10",
    label: "First Age Top 10",
    direction: "lower",
    format: (row) => formatAge(row.firstAgeTop10),
  },
  {
    key: "firstAgeNo1",
    label: "First Age #1",
    direction: "lower",
    format: (row) => formatAge(row.firstAgeNo1),
  },
  {
    key: "yearsInTop10",
    label: "Years in Top 10",
    direction: "higher",
    format: (row) => dash(row.yearsInTop10),
  },
];

function numericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length >= 10) {
    const ms = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
}

export function findBestPlayerIdsForMetric(
  rows: CompareOverviewRow[],
  metric: CompareMetric,
): string[] {
  const values = rows
    .map((row) => ({
      playerId: row.playerId,
      value: numericValue(row[metric.key]),
    }))
    .filter((entry) => entry.value != null) as { playerId: string; value: number }[];

  if (values.length === 0) return [];

  const best =
    metric.direction === "lower"
      ? Math.min(...values.map((entry) => entry.value))
      : Math.max(...values.map((entry) => entry.value));

  if (
    metric.direction === "higher" &&
    best <= 0 &&
    metric.key !== "latestWeek"
  ) {
    return [];
  }

  return values.filter((entry) => entry.value === best).map((entry) => entry.playerId);
}

export function countWeeksAtNo1ThroughAge(player: Player, age: number): number {
  let count = 0;
  for (const point of player.trajectoryWeekly) {
    if (Math.round(point.age) > age) continue;
    if (point.ranking === 1) count += 1;
  }
  return count;
}

export function buildEnhancedAgeSnapshot(
  players: Player[],
  age: number,
): EnhancedAgeSnapshotRow[] {
  return players
    .map((player) => {
      const rankingAtAge = getYearlyRankingAtAge(player, age);
      return {
        playerId: player.id,
        name: player.name,
        shortName: player.shortName,
        color: player.color,
        imageUrl: player.imageUrl,
        imagePosition: player.imagePosition,
        rankingAtAge,
        gsTitlesByAge: countGrandSlamTitlesThroughAge(player, age),
        gsFinalsByAge: countGrandSlamFinalsThroughAge(player, age),
        weeksAtNo1ByAge: countWeeksAtNo1ThroughAge(player, age),
        inTop10AtAge: rankingAtAge != null && rankingAtAge <= 10,
      };
    })
    .sort((a, b) => {
      if (a.rankingAtAge == null && b.rankingAtAge == null) return 0;
      if (a.rankingAtAge == null) return 1;
      if (b.rankingAtAge == null) return -1;
      return a.rankingAtAge - b.rankingAtAge;
    });
}

function findBestAgeMetricIds(
  rows: EnhancedAgeSnapshotRow[],
  key: keyof EnhancedAgeSnapshotRow,
  direction: MetricDirection,
): string[] {
  const values = rows
    .map((row) => ({
      playerId: row.playerId,
      value: typeof row[key] === "number" ? (row[key] as number) : null,
    }))
    .filter((entry) => entry.value != null) as { playerId: string; value: number }[];

  if (values.length === 0) return [];

  const best =
    direction === "lower"
      ? Math.min(...values.map((entry) => entry.value))
      : Math.max(...values.map((entry) => entry.value));

  if (direction === "higher" && best <= 0) {
    return [];
  }

  return values.filter((entry) => entry.value === best).map((entry) => entry.playerId);
}

export function findBestPlayerIdsForAgeSnapshotMetric(
  rows: EnhancedAgeSnapshotRow[],
  metric: AgeSnapshotMetric,
): string[] {
  if (metric.direction === "boolean") {
    const eligible = rows.filter((row) => row.rankingAtAge != null);
    const inTop10 = eligible.filter((row) => row.inTop10AtAge);
    return inTop10.length === 1 ? [inTop10[0].playerId] : [];
  }

  return findBestAgeMetricIds(rows, metric.key, metric.direction);
}

export function generateHeadlineInsight(
  overview: CompareOverviewRow[],
  ageRows: EnhancedAgeSnapshotRow[],
  age: number,
): string | null {
  if (overview.length < 2) return null;

  const weeksLeaders = findBestPlayerIdsForMetric(overview, {
    key: "totalWeeksAtNo1",
    label: "",
    direction: "higher",
    format: () => "",
  });
  if (weeksLeaders.length === 1) {
    const leader = overview.find((row) => row.playerId === weeksLeaders[0]);
    const value = leader?.totalWeeksAtNo1 ?? 0;
    if (value > 0 && leader) {
      return `${leader.shortName} leads this comparison in total weeks at #1.`;
    }
  }

  const gsLeaders = findBestAgeMetricIds(ageRows, "gsTitlesByAge", "higher");
  if (gsLeaders.length === 1) {
    const leader = ageRows.find((row) => row.playerId === gsLeaders[0]);
    if (leader && leader.gsTitlesByAge > 0) {
      const suffix = leader.gsTitlesByAge === 1 ? "title" : "titles";
      return `At age ${age}, ${leader.shortName} had the strongest Grand Slam record among selected players (${leader.gsTitlesByAge} ${suffix}).`;
    }
  }

  const rankLeaders = findBestAgeMetricIds(ageRows, "rankingAtAge", "lower");
  if (rankLeaders.length === 1) {
    const leader = ageRows.find((row) => row.playerId === rankLeaders[0]);
    if (leader?.rankingAtAge != null) {
      return `At age ${age}, ${leader.shortName} held the highest ATP ranking (#${leader.rankingAtAge}) in this group.`;
    }
  }

  const earliestTop100 = findBestPlayerIdsForMetric(overview, {
    key: "firstAgeTop100",
    label: "",
    direction: "lower",
    format: () => "",
  });
  if (earliestTop100.length === 1) {
    const leader = overview.find((row) => row.playerId === earliestTop100[0]);
    if (leader?.firstAgeTop100 != null) {
      return `${leader.shortName} reached the Top 100 earliest among this group.`;
    }
  }

  const earliestTop10 = findBestPlayerIdsForMetric(overview, {
    key: "firstAgeTop10",
    label: "",
    direction: "lower",
    format: () => "",
  });
  if (earliestTop10.length === 1) {
    const leader = overview.find((row) => row.playerId === earliestTop10[0]);
    if (leader?.firstAgeTop10 != null) {
      return `${leader.shortName} reached the Top 10 earliest among this group.`;
    }
  }

  return null;
}

export function generateAgeSnapshotSummary(
  ageRows: EnhancedAgeSnapshotRow[],
  age: number,
): string | null {
  if (ageRows.length === 0) return null;

  const gsLeader = [...ageRows].sort(
    (a, b) => b.gsTitlesByAge - a.gsTitlesByAge,
  )[0];
  if (gsLeader && gsLeader.gsTitlesByAge > 0) {
    const others = ageRows.filter((row) => row.playerId !== gsLeader.playerId);
    const nextBest = others.reduce(
      (max, row) => Math.max(max, row.gsTitlesByAge),
      0,
    );
    if (gsLeader.gsTitlesByAge > nextBest) {
      const suffix = gsLeader.gsTitlesByAge === 1 ? "Grand Slam" : "Grand Slams";
      return `At age ${age}, ${gsLeader.shortName} had already won ${gsLeader.gsTitlesByAge} ${suffix} — the most in this comparison.`;
    }
  }

  const rankLeader = ageRows.find((row) => row.rankingAtAge === 1);
  if (rankLeader) {
    return `At age ${age}, ${rankLeader.shortName} was ranked #1 among the selected players.`;
  }

  const topRanked = ageRows.find((row) => row.rankingAtAge != null);
  if (topRanked?.rankingAtAge != null) {
    return `At age ${age}, ${topRanked.shortName} led this group at ATP #${topRanked.rankingAtAge}.`;
  }

  return null;
}

import type { CompareDashboardTab } from "@/components/CompareTabNav";
import {
  buildCompareOverview,
  buildEnhancedAgeSnapshot,
  findBestPlayerIdsForMetric,
  generateAgeSnapshotSummary,
  generateHeadlineInsight,
} from "@/data/compare-stats";
import { getYearlyRankingAtAge } from "@/data/career-stats";
import {
  buildGoatScores,
  findTopGoatScorePlayerId,
} from "@/data/goat-score";
import {
  Player,
  TrajectoryGranularity,
  YearlyMetric,
} from "@/data/players";

export const COMPARISON_TAB_LABELS: Record<CompareDashboardTab, string> = {
  career: "Ranking",
  stats: "Stats",
  age: "Age",
  "grand-slam": "Grand Slam",
  goat: "GOAT",
  no1: "No.1",
};

export interface ComparisonFactsPlayer {
  name: string;
  rank: number | null;
  gsTitles: number;
  gsFinals: number;
  weeksAtNo1: number;
  bestRank?: number | null;
  totalWeeksAtNo1?: number;
  longestNo1Streak?: number;
  goatScore?: number | null;
  inTop10?: boolean;
}

export interface ComparisonFacts {
  age: number;
  tab: string;
  metric?: string;
  granularity?: TrajectoryGranularity;
  players: ComparisonFactsPlayer[];
}

function getRankingAtAgeForMetric(
  player: Player,
  age: number,
  metric?: YearlyMetric,
): number | null {
  const matches = player.trajectoryYearly.filter(
    (entry) => Math.round(entry.age) === age,
  );
  if (matches.length === 0) return null;

  if (metric === "yearEnd") {
    const latest = [...matches].sort((a, b) => b.age - a.age)[0];
    return latest.yearEndRank ?? latest.ranking ?? null;
  }

  return getYearlyRankingAtAge(player, age);
}

export function buildComparisonFacts(
  players: Player[],
  age: number,
  tab: CompareDashboardTab,
  options?: {
    yearlyMetric?: YearlyMetric;
    granularity?: TrajectoryGranularity;
  },
): ComparisonFacts {
  const ageRows = buildEnhancedAgeSnapshot(players, age);
  const overview = buildCompareOverview(players);
  const metric = options?.yearlyMetric;

  const factPlayers: ComparisonFactsPlayer[] = players.map((player) => {
    const ageRow = ageRows.find((row) => row.playerId === player.id);
    const overviewRow = overview.find((row) => row.playerId === player.id);
    const rank =
      tab === "career"
        ? getRankingAtAgeForMetric(player, age, metric)
        : (ageRow?.rankingAtAge ?? null);

    return {
      name: player.name,
      rank,
      gsTitles: ageRow?.gsTitlesByAge ?? 0,
      gsFinals: ageRow?.gsFinalsByAge ?? 0,
      weeksAtNo1: ageRow?.weeksAtNo1ByAge ?? 0,
      inTop10: ageRow?.inTop10AtAge ?? false,
      bestRank: overviewRow?.bestRank ?? null,
      totalWeeksAtNo1: overviewRow?.totalWeeksAtNo1 ?? 0,
      longestNo1Streak: overviewRow?.longestNo1Streak ?? 0,
    };
  });

  if (tab === "goat") {
    const goatRows = buildGoatScores(players);
    for (const playerFacts of factPlayers) {
      const goatRow = goatRows.find((row) => row.name === playerFacts.name);
      playerFacts.goatScore =
        goatRow && goatRow.availableWeight > 0 ? goatRow.totalScore : null;
    }
  }

  const facts: ComparisonFacts = {
    age,
    tab: COMPARISON_TAB_LABELS[tab],
    players: [...factPlayers].sort((a, b) => a.name.localeCompare(b.name)),
  };

  if (tab === "career") {
    if (metric) facts.metric = metric;
    if (options?.granularity) facts.granularity = options.granularity;
  }

  return facts;
}

export function hasEnoughComparisonData(facts: ComparisonFacts): boolean {
  if (facts.players.length < 2) return false;

  const hasRank = facts.players.some((player) => player.rank != null);
  const hasGs = facts.players.some(
    (player) => player.gsTitles > 0 || player.gsFinals > 0,
  );
  const hasWeeks = facts.players.some((player) => player.weeksAtNo1 > 0);
  const hasCareerWeeks = facts.players.some(
    (player) => (player.totalWeeksAtNo1 ?? 0) > 0,
  );
  const hasGoat =
    facts.tab === "GOAT" &&
    facts.players.some(
      (player) => player.goatScore != null && player.goatScore > 0,
    );

  return hasRank || hasGs || hasWeeks || hasCareerWeeks || hasGoat;
}

export function generateRuleBasedInsightForFacts(
  facts: ComparisonFacts,
  players: Player[],
): string | null {
  if (players.length < 2) return null;

  const age = facts.age;
  const overview = buildCompareOverview(players);
  const ageRows = buildEnhancedAgeSnapshot(players, age);

  switch (facts.tab) {
    case "Stats":
      return generateHeadlineInsight(overview, ageRows, age);
    case "Age":
    case "Grand Slam":
      return generateAgeSnapshotSummary(ageRows, age);
    case "Ranking":
      return (
        generateAgeSnapshotSummary(ageRows, age) ??
        generateHeadlineInsight(overview, ageRows, age)
      );
    case "GOAT": {
      const goatRows = buildGoatScores(players);
      const topId = findTopGoatScorePlayerId(goatRows);
      if (!topId) return null;
      const leader = goatRows.find((row) => row.playerId === topId);
      if (!leader) return null;
      return `${leader.shortName} leads this GOAT comparison with a score of ${Math.round(leader.totalScore)}.`;
    }
    case "No.1": {
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

      const ageWeeksLeaders = ageRows
        .filter((row) => row.weeksAtNo1ByAge > 0)
        .sort((a, b) => b.weeksAtNo1ByAge - a.weeksAtNo1ByAge);
      if (
        ageWeeksLeaders.length > 0 &&
        ageWeeksLeaders[0].weeksAtNo1ByAge >
          (ageWeeksLeaders[1]?.weeksAtNo1ByAge ?? 0)
      ) {
        const leader = ageWeeksLeaders[0];
        return `At age ${age}, ${leader.shortName} had spent the most weeks at #1 (${leader.weeksAtNo1ByAge}) in this group.`;
      }

      return generateHeadlineInsight(overview, ageRows, age);
    }
    default:
      return generateHeadlineInsight(overview, ageRows, age);
  }
}

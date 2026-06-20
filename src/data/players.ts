import playerIndexData from "@/data/player-index.json";
import playersGenerated from "@/data/players.generated.json";

export interface RankingPoint {
  rankingDate: string;
  age: number;
  ranking: number;
  points: number | null;
  consecutiveWeeksAtNo1?: number;
  isLatestWeek?: boolean;
}

export type TrajectoryGranularity = "weekly" | "monthly" | "yearly";

export interface Player {
  id: string;
  atpPlayerId: string;
  name: string;
  shortName: string;
  birthDate: string;
  countryCode: string;
  color: string;
  imageUrl?: string;
  trajectoryWeekly: RankingPoint[];
  trajectoryMonthly: RankingPoint[];
  trajectoryYearly: RankingPoint[];
}

export interface PlayerIndexEntry {
  atpPlayerId: string;
  name: string;
  nameFirst: string;
  nameLast: string;
  birthDate: string | null;
  countryCode: string;
  hand: string;
  hasRankingData: boolean;
  slug?: string;
  shortName?: string;
  color?: string;
  imageUrl?: string;
}

export const PLAYER_INDEX: PlayerIndexEntry[] = playerIndexData as PlayerIndexEntry[];
export const PLAYERS: Player[] = playersGenerated as Player[];

export const PLAYER_IDS = PLAYERS.map((player) => player.id);

export const MAX_COMPARISON_PLAYERS = 5;

export const MAX_WEEKLY_COMPARISON_PLAYERS = 2;

export function getMaxComparisonPlayers(
  granularity: TrajectoryGranularity,
): number {
  return granularity === "weekly"
    ? MAX_WEEKLY_COMPARISON_PLAYERS
    : MAX_COMPARISON_PLAYERS;
}

export const WEEKLY_LIMIT_WARNING =
  "Weekly view supports up to 2 players.\nRemove a player before adding another.";

export const RANKING_AXIS_TICKS = [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000] as const;

export const CAREER_VIEW_MAX_RANK = 100;

export const CAREER_VIEW_TICKS = [1, 2, 5, 10, 20, 50, 100] as const;

export const AGE_AXIS_TICKS = [18, 20, 25, 30, 35, 40] as const;

const AUTO_ZOOM_PADDING: Record<TrajectoryGranularity, number> = {
  yearly: 1,
  monthly: 0.5,
  weekly: 1,
};

const AUTO_ZOOM_MIN_SPAN: Record<TrajectoryGranularity, number> = {
  yearly: 5,
  monthly: 3,
  weekly: 2,
};

const playersById = new Map(PLAYERS.map((player) => [player.id, player]));
const playersByAtpId = new Map(PLAYERS.map((player) => [player.atpPlayerId, player]));
const indexByAtpId = new Map(PLAYER_INDEX.map((entry) => [entry.atpPlayerId, entry]));

export function getPlayerById(id: string): Player | undefined {
  return playersById.get(id);
}

export function getPlayerByAtpId(atpPlayerId: string): Player | undefined {
  return playersByAtpId.get(atpPlayerId);
}

export function getIndexEntryByAtpId(atpPlayerId: string): PlayerIndexEntry | undefined {
  return indexByAtpId.get(atpPlayerId);
}

export function getPlayerTrajectory(
  player: Player,
  granularity: TrajectoryGranularity,
): RankingPoint[] {
  switch (granularity) {
    case "weekly":
      return player.trajectoryWeekly;
    case "monthly":
      return player.trajectoryMonthly;
    case "yearly":
      return player.trajectoryYearly;
  }
}

export function searchPlayers(query: string, limit = 20): PlayerIndexEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: PlayerIndexEntry[] = [];
  for (const entry of PLAYER_INDEX) {
    const haystack = `${entry.name} ${entry.nameFirst} ${entry.nameLast} ${entry.countryCode}`.toLowerCase();
    if (haystack.includes(normalized)) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function formatBirthDate(birthDate: string | null): string {
  if (!birthDate) return "Unknown";
  const date = new Date(`${birthDate}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export interface ChartRow {
  age: number;
  [key: string]: number | string | boolean | null | undefined;
}

export function chartDateKey(playerId: string): string {
  return `${playerId}__date`;
}

export function chartStreakKey(playerId: string): string {
  return `${playerId}__streak`;
}

export function chartLatestWeekKey(playerId: string): string {
  return `${playerId}__latestWeek`;
}

export function buildChartData(
  selectedPlayerIds: string[],
  granularity: TrajectoryGranularity = "yearly",
): ChartRow[] {
  const selectedPlayers = PLAYERS.filter((player) => selectedPlayerIds.includes(player.id));
  const rows = new Map<number, ChartRow>();

  selectedPlayers.forEach((player) => {
    getPlayerTrajectory(player, granularity).forEach((point) => {
      const displayAge =
        granularity === "yearly" ? Math.round(point.age) : point.age;

      if (!rows.has(displayAge)) {
        rows.set(displayAge, { age: displayAge });
      }
      const row = rows.get(displayAge)!;
      row[player.id] = point.ranking;
      row[chartDateKey(player.id)] = point.rankingDate;
      if (point.isLatestWeek) {
        row[chartLatestWeekKey(player.id)] = true;
      }
      if (point.consecutiveWeeksAtNo1 != null) {
        row[chartStreakKey(player.id)] = point.consecutiveWeeksAtNo1;
      }
    });
  });

  return Array.from(rows.values()).sort((a, b) => a.age - b.age);
}

export function getYAxisDomain(
  chartData: ChartRow[],
  selectedPlayerIds: string[],
): [number, number] {
  let maxRank = 1;

  chartData.forEach((row) => {
    selectedPlayerIds.forEach((playerId) => {
      const value = row[playerId];
      if (typeof value === "number" && value > maxRank) {
        maxRank = value;
      }
    });
  });

  return [1, Math.max(RANKING_AXIS_TICKS[RANKING_AXIS_TICKS.length - 1], maxRank)];
}

export function getVisibleRankingTicks(maxRank: number): number[] {
  return RANKING_AXIS_TICKS.filter((tick) => tick <= maxRank);
}

export function getYAxisConfig(
  chartData: ChartRow[],
  selectedPlayerIds: string[],
  scale: "log" | "linear",
): { domain: [number, number]; ticks: number[] } {
  if (scale === "log") {
    return {
      domain: [1, CAREER_VIEW_MAX_RANK],
      ticks: [...CAREER_VIEW_TICKS],
    };
  }

  const [, yMax] = getYAxisDomain(chartData, selectedPlayerIds);
  return {
    domain: [1, yMax],
    ticks: getVisibleRankingTicks(yMax),
  };
}

export function getVisibleAgeTicks(minAge: number, maxAge: number): number[] {
  return AGE_AXIS_TICKS.filter((tick) => tick >= minAge && tick <= maxAge);
}

export function getYearlyAgeTicks(minAge: number, maxAge: number): number[] {
  const min = Math.round(minAge);
  const max = Math.round(maxAge);
  const ticks: number[] = [];

  for (let age = min; age <= max; age++) {
    ticks.push(age);
  }

  return ticks;
}

export function getAutoZoomAgeDomain(
  selectedPlayerIds: string[],
  granularity: TrajectoryGranularity = "yearly",
): [number, number] | null {
  const [minAge, maxAge] = getAgeRange(selectedPlayerIds, granularity);
  if (!Number.isFinite(minAge) || !Number.isFinite(maxAge)) return null;

  const padding = AUTO_ZOOM_PADDING[granularity];
  const minSpan = AUTO_ZOOM_MIN_SPAN[granularity];

  let min =
    granularity === "yearly" ? Math.round(minAge) - padding : minAge - padding;
  let max =
    granularity === "yearly" ? Math.round(maxAge) + padding : maxAge + padding;

  if (max - min < minSpan) {
    const center = (min + max) / 2;
    min = center - minSpan / 2;
    max = center + minSpan / 2;
  }

  if (granularity === "yearly") {
    return [Math.round(min), Math.round(max)];
  }

  return [min, max];
}

export function getAgeTicksForDomain(
  minAge: number,
  maxAge: number,
  granularity: TrajectoryGranularity,
): number[] {
  if (granularity === "yearly") {
    return getYearlyAgeTicks(Math.round(minAge), Math.round(maxAge));
  }

  return getVisibleAgeTicks(minAge, maxAge);
}

export function getAgeExtent(
  chartData: ChartRow[],
): [number, number] | null {
  if (chartData.length === 0) return null;

  const ages = chartData.map((row) => row.age);
  return [Math.min(...ages), Math.max(...ages)];
}

export function getAgeRange(
  selectedPlayerIds: string[],
  granularity: TrajectoryGranularity = "yearly",
): [number, number] {
  const selectedPlayers = PLAYERS.filter((player) => selectedPlayerIds.includes(player.id));

  let minAge = Infinity;
  let maxAge = -Infinity;

  selectedPlayers.forEach((player) => {
    getPlayerTrajectory(player, granularity).forEach((point) => {
      minAge = Math.min(minAge, point.age);
      maxAge = Math.max(maxAge, point.age);
    });
  });

  return [minAge === Infinity ? 15 : minAge, maxAge === -Infinity ? 25 : maxAge];
}

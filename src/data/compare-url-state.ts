import { PLAYER_IDS, TrajectoryGranularity, YearlyMetric, DEFAULT_YEARLY_METRIC } from "@/data/players";
import { SNAPSHOT_AGE_MAX, SNAPSHOT_AGE_MIN } from "@/data/career-stats";
import {
  DEFAULT_BATTLE_PLAYER_A,
  DEFAULT_BATTLE_PLAYER_B,
} from "@/data/battle-score";
import { DEFAULT_SPORT } from "@/data/sports/registry";
import type { SportId } from "@/data/sports/types";

export type SelectedSport = SportId | "all";

export type ChartViewMode = "career" | "detail";

export type { YearlyMetric } from "@/data/players";
export { DEFAULT_YEARLY_METRIC } from "@/data/players";

export const DEFAULT_SHARE_PLAYER_IDS = ["federer", "nadal", "djokovic"] as const;
export const DEFAULT_BATTLE_PAIR = [
  DEFAULT_BATTLE_PLAYER_A,
  DEFAULT_BATTLE_PLAYER_B,
] as const;

export interface CompareUrlState {
  playerIds: string[];
  age: number;
  granularity: TrajectoryGranularity;
  view: ChartViewMode;
  yearlyMetric?: YearlyMetric;
  battle?: [string, string];
  sport?: SelectedSport;
}

const VALID_SPORTS = new Set<SportId | "all">([
  "tennis",
  "football",
  "basketball",
  "baseball",
  "formula1",
  "golf",
  "boxing",
  "athletics",
  "swimming",
  "all",
]);
const VALID_GRANULARITIES = new Set<TrajectoryGranularity>([
  "yearly",
  "monthly",
  "weekly",
]);
const VALID_VIEWS = new Set<ChartViewMode>(["career", "detail"]);
const VALID_YEARLY_METRICS = new Set<YearlyMetric>(["peak", "yearEnd"]);
const VALID_PLAYER_IDS = new Set(PLAYER_IDS);

export function clampSnapshotAge(age: number): number {
  return Math.min(SNAPSHOT_AGE_MAX, Math.max(SNAPSHOT_AGE_MIN, Math.round(age)));
}

export function filterValidPlayerIds(playerIds: string[]): string[] {
  return playerIds.filter((id) => VALID_PLAYER_IDS.has(id));
}

export function resolveSharePlayerIds(playerIds: string[] | undefined): string[] {
  const valid = filterValidPlayerIds(playerIds ?? []);
  return valid.length > 0 ? valid : [...DEFAULT_SHARE_PLAYER_IDS];
}

function parseGranularity(
  searchParams: URLSearchParams,
): TrajectoryGranularity | undefined {
  const granularityParam = searchParams.get("granularity");
  if (
    granularityParam &&
    VALID_GRANULARITIES.has(granularityParam as TrajectoryGranularity)
  ) {
    return granularityParam as TrajectoryGranularity;
  }

  const legacyModeParam = searchParams.get("mode");
  if (legacyModeParam && VALID_GRANULARITIES.has(legacyModeParam as TrajectoryGranularity)) {
    return legacyModeParam as TrajectoryGranularity;
  }

  return undefined;
}

function parseView(searchParams: URLSearchParams): ChartViewMode | undefined {
  const viewParam = searchParams.get("view");
  if (viewParam && VALID_VIEWS.has(viewParam as ChartViewMode)) {
    return viewParam as ChartViewMode;
  }

  const legacyScaleParam = searchParams.get("scale");
  if (legacyScaleParam && VALID_VIEWS.has(legacyScaleParam as ChartViewMode)) {
    return legacyScaleParam as ChartViewMode;
  }

  return undefined;
}

function parseYearlyMetric(searchParams: URLSearchParams): YearlyMetric | undefined {
  const metricParam = searchParams.get("yearlyMetric");
  if (metricParam && VALID_YEARLY_METRICS.has(metricParam as YearlyMetric)) {
    return metricParam as YearlyMetric;
  }
  return undefined;
}

function parseSport(searchParams: URLSearchParams): SelectedSport | undefined {
  const sportParam = searchParams.get("sport");
  if (sportParam && VALID_SPORTS.has(sportParam as SelectedSport)) {
    return sportParam as SelectedSport;
  }
  return undefined;
}

export function resolveYearlyMetric(metric: YearlyMetric | undefined): YearlyMetric {
  return metric ?? DEFAULT_YEARLY_METRIC;
}

export function resolveSelectedSport(sport: SelectedSport | undefined): SelectedSport {
  return sport ?? DEFAULT_SPORT;
}

export function parseBattlePair(
  searchParams: URLSearchParams,
): [string, string] | undefined {
  const battleParam = searchParams.get("battle");
  if (!battleParam) return undefined;

  const playerIds = filterValidPlayerIds(
    battleParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

  if (playerIds.length < 2 || playerIds[0] === playerIds[1]) {
    return undefined;
  }

  return [playerIds[0], playerIds[1]];
}

export function hasCompareUrlParams(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has("players") ||
    searchParams.has("battle") ||
    searchParams.has("age") ||
    searchParams.has("granularity") ||
    searchParams.has("view") ||
    searchParams.has("yearlyMetric") ||
    searchParams.has("sport") ||
    searchParams.has("mode") ||
    searchParams.has("scale")
  );
}

export function parseCompareUrlState(
  searchParams: URLSearchParams,
): Partial<CompareUrlState> | null {
  const hasAny =
    hasCompareUrlParams(searchParams);

  if (!hasAny) return null;

  const partial: Partial<CompareUrlState> = {};

  const battlePair = parseBattlePair(searchParams);
  if (battlePair) {
    partial.battle = battlePair;
    partial.playerIds = [...battlePair];
  } else if (searchParams.has("players")) {
    const playersParam = searchParams.get("players") ?? "";
    const playerIds = filterValidPlayerIds(
      playersParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    );
    partial.playerIds = playerIds;
  }

  const ageParam = searchParams.get("age");
  if (ageParam) {
    const age = Number(ageParam);
    if (Number.isFinite(age)) {
      partial.age = clampSnapshotAge(age);
    }
  }

  const granularity = parseGranularity(searchParams);
  if (granularity) {
    partial.granularity = granularity;
  }

  const view = parseView(searchParams);
  if (view) {
    partial.view = view;
  }

  const yearlyMetric = parseYearlyMetric(searchParams);
  if (yearlyMetric) {
    partial.yearlyMetric = yearlyMetric;
  }

  const sport = parseSport(searchParams);
  if (sport) {
    partial.sport = sport;
  }

  return partial;
}

export function serializeCompareUrlState(state: CompareUrlState): URLSearchParams {
  const params = new URLSearchParams();
  const playerIds = resolveSharePlayerIds(state.playerIds);

  params.set("players", playerIds.join(","));
  params.set("age", String(clampSnapshotAge(state.age)));
  params.set("granularity", state.granularity);
  params.set("view", state.view);

  if (state.battle && state.battle.length === 2) {
    params.set("battle", state.battle.join(","));
  }

  if (state.granularity === "yearly") {
    params.set("yearlyMetric", resolveYearlyMetric(state.yearlyMetric));
  }

  const sport = resolveSelectedSport(state.sport);
  if (sport !== DEFAULT_SPORT) {
    params.set("sport", sport);
  }

  return params;
}

export function buildCompareSharePath(state: CompareUrlState): string {
  const query = serializeCompareUrlState(state).toString();
  return query ? `/?${query}` : "/";
}

export function buildCompareShareUrl(
  state: CompareUrlState,
  origin: string,
): string {
  return `${origin}${buildCompareSharePath(state)}`;
}

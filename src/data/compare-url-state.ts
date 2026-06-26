import { PLAYER_IDS, TrajectoryGranularity } from "@/data/players";
import { SNAPSHOT_AGE_MAX, SNAPSHOT_AGE_MIN } from "@/data/career-stats";

export type ChartViewMode = "career" | "detail";

export const DEFAULT_SHARE_PLAYER_IDS = ["federer", "nadal", "djokovic"] as const;

export interface CompareUrlState {
  playerIds: string[];
  age: number;
  granularity: TrajectoryGranularity;
  view: ChartViewMode;
}

const VALID_GRANULARITIES = new Set<TrajectoryGranularity>([
  "yearly",
  "monthly",
  "weekly",
]);
const VALID_VIEWS = new Set<ChartViewMode>(["career", "detail"]);
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

export function parseCompareUrlState(
  searchParams: URLSearchParams,
): Partial<CompareUrlState> | null {
  const hasAny =
    searchParams.has("players") ||
    searchParams.has("age") ||
    searchParams.has("granularity") ||
    searchParams.has("view") ||
    searchParams.has("mode") ||
    searchParams.has("scale");

  if (!hasAny) return null;

  const partial: Partial<CompareUrlState> = {};

  if (searchParams.has("players")) {
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

  return partial;
}

export function serializeCompareUrlState(state: CompareUrlState): URLSearchParams {
  const params = new URLSearchParams();
  const playerIds = resolveSharePlayerIds(state.playerIds);

  params.set("players", playerIds.join(","));
  params.set("age", String(clampSnapshotAge(state.age)));
  params.set("granularity", state.granularity);
  params.set("view", state.view);

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

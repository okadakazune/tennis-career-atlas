import { PLAYER_IDS, TrajectoryGranularity } from "@/data/players";
import { SNAPSHOT_AGE_MAX, SNAPSHOT_AGE_MIN } from "@/data/career-stats";

export type RankingScaleMode = "career" | "detail";

export interface CompareUrlState {
  playerIds: string[];
  age: number;
  mode: TrajectoryGranularity;
  scale: RankingScaleMode;
}

const VALID_MODES = new Set<TrajectoryGranularity>(["yearly", "monthly", "weekly"]);
const VALID_SCALES = new Set<RankingScaleMode>(["career", "detail"]);
const VALID_PLAYER_IDS = new Set(PLAYER_IDS);

export function clampSnapshotAge(age: number): number {
  return Math.min(SNAPSHOT_AGE_MAX, Math.max(SNAPSHOT_AGE_MIN, Math.round(age)));
}

export function parseCompareUrlState(
  searchParams: URLSearchParams,
): Partial<CompareUrlState> | null {
  const hasAny =
    searchParams.has("players") ||
    searchParams.has("age") ||
    searchParams.has("mode") ||
    searchParams.has("scale");

  if (!hasAny) return null;

  const partial: Partial<CompareUrlState> = {};

  const playersParam = searchParams.get("players");
  if (playersParam) {
    const playerIds = playersParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => VALID_PLAYER_IDS.has(id));
    if (playerIds.length > 0) {
      partial.playerIds = playerIds;
    }
  }

  const ageParam = searchParams.get("age");
  if (ageParam) {
    const age = Number(ageParam);
    if (Number.isFinite(age)) {
      partial.age = clampSnapshotAge(age);
    }
  }

  const modeParam = searchParams.get("mode");
  if (modeParam && VALID_MODES.has(modeParam as TrajectoryGranularity)) {
    partial.mode = modeParam as TrajectoryGranularity;
  }

  const scaleParam = searchParams.get("scale");
  if (scaleParam && VALID_SCALES.has(scaleParam as RankingScaleMode)) {
    partial.scale = scaleParam as RankingScaleMode;
  }

  return partial;
}

export function serializeCompareUrlState(state: CompareUrlState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("players", state.playerIds.join(","));
  params.set("age", String(state.age));
  params.set("mode", state.mode);
  params.set("scale", state.scale);
  return params;
}

export function buildCompareSharePath(state: CompareUrlState): string {
  const query = serializeCompareUrlState(state).toString();
  return query ? `/?${query}` : "/";
}

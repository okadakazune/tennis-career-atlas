import {
  DEFAULT_EXPLORE_MODE_ID,
  type ExploreModeDef,
  type ExploreModeId,
} from "@/data/explore/explore-types";
import {
  EXPLORE_MODE_GROUP_LABELS,
  getAllRegisteredExploreModes,
  getExploreModesByGroup,
  getFeaturedExploreModes,
  getSuggestableExploreModes,
} from "@/data/explore/explore-registry";

export const EXPLORE_MODES: ExploreModeDef[] = getAllRegisteredExploreModes();

const exploreModeById = new Map<ExploreModeId, ExploreModeDef>(
  EXPLORE_MODES.map((modeDef) => [modeDef.id, modeDef]),
);

const VALID_EXPLORE_MODE_IDS = new Set(EXPLORE_MODES.map((modeDef) => modeDef.id));

export function isValidExploreModeId(id: string): id is ExploreModeId {
  return VALID_EXPLORE_MODE_IDS.has(id);
}

export function getExploreMode(id: ExploreModeId): ExploreModeDef {
  return exploreModeById.get(id) ?? exploreModeById.get(DEFAULT_EXPLORE_MODE_ID)!;
}

export function resolveExploreModeId(id: string | undefined): ExploreModeId {
  if (id && isValidExploreModeId(id)) {
    const modeDef = getExploreMode(id);
    if (modeDef.status === "live") return id;
  }
  return DEFAULT_EXPLORE_MODE_ID;
}

export {
  DEFAULT_EXPLORE_MODE_ID,
  EXPLORE_MODE_GROUP_LABELS,
  getExploreModesByGroup,
  getFeaturedExploreModes,
  getSuggestableExploreModes,
};
export type { ExploreModeId, ExploreModeDef, ExploreModeGroup } from "@/data/explore/explore-types";

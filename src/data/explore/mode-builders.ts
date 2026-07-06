import type { ExploreModeDef } from "@/data/explore/explore-types";

export function buildLiveExploreMode(
  def: Omit<ExploreModeDef, "status"> & { status?: ExploreModeDef["status"] },
): ExploreModeDef {
  return {
    suggestAfterResult: true,
    status: "live",
    ...def,
  };
}

export function buildComingSoonExploreMode(
  def: Omit<ExploreModeDef, "kind" | "status" | "ageStrategy"> & {
    ageStrategy?: ExploreModeDef["ageStrategy"];
  },
): ExploreModeDef {
  return {
    kind: "comingSoon",
    status: "comingSoon",
    ageStrategy: "career",
    suggestAfterResult: true,
    ...def,
  };
}

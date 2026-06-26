export interface ComparisonPreset {
  id: string;
  label: string;
  playerIds: string[];
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: "big-3",
    label: "Big 3",
    playerIds: ["federer", "nadal", "djokovic"],
  },
  {
    id: "big-4",
    label: "Big 4",
    playerIds: ["federer", "nadal", "djokovic", "murray"],
  },
  {
    id: "new-gen",
    label: "New Gen",
    playerIds: ["alcaraz", "sinner", "rune"],
  },
  {
    id: "2010s-rivals",
    label: "2010s Rivals",
    playerIds: ["djokovic", "nadal", "federer", "murray", "wawrinka"],
  },
  {
    id: "japan-context",
    label: "Japan Context",
    playerIds: ["nishikori", "murray", "wawrinka", "del-potro"],
  },
];

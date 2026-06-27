export interface ComparisonPreset {
  id: string;
  label: string;
  playerIds: string[];
  /** Shown in chip tooltip on hover / long-press */
  description: string;
}

export interface ComparisonPresetCategory {
  id: string;
  label: string;
  presets: ComparisonPreset[];
}

export const COMPARISON_PRESET_CATEGORIES: ComparisonPresetCategory[] = [
  {
    id: "legendary-rivalries",
    label: "Legendary Rivalries",
    presets: [
      {
        id: "federer-vs-nadal",
        label: "Federer vs Nadal",
        playerIds: ["federer", "nadal"],
        description: "Roger Federer vs Rafael Nadal",
      },
      {
        id: "nadal-vs-djokovic",
        label: "Nadal vs Djokovic",
        playerIds: ["nadal", "djokovic"],
        description: "Rafael Nadal vs Novak Djokovic",
      },
      {
        id: "federer-vs-djokovic",
        label: "Federer vs Djokovic",
        playerIds: ["federer", "djokovic"],
        description: "Roger Federer vs Novak Djokovic",
      },
      {
        id: "big-3",
        label: "Big 3",
        playerIds: ["federer", "nadal", "djokovic"],
        description: "Federer, Nadal, Djokovic",
      },
    ],
  },
  {
    id: "era-groups",
    label: "Era Groups",
    presets: [
      {
        id: "big-4",
        label: "Big 4",
        playerIds: ["federer", "nadal", "djokovic", "murray"],
        description: "Federer, Nadal, Djokovic, Murray",
      },
      {
        id: "2010s-rivals",
        label: "2010s Rivals",
        playerIds: ["djokovic", "nadal", "federer", "murray", "wawrinka"],
        description: "Djokovic, Nadal, Federer, Murray, Wawrinka",
      },
      {
        id: "2000s-legends",
        label: "2000s Legends",
        playerIds: ["federer", "nadal", "djokovic", "murray", "del-potro"],
        description: "Federer, Nadal, Djokovic, Murray, Del Potro",
      },
    ],
  },
  {
    id: "current-tour",
    label: "Current Tour",
    presets: [
      {
        id: "alcaraz-vs-sinner",
        label: "Alcaraz vs Sinner",
        playerIds: ["alcaraz", "sinner"],
        description: "Current-generation rivalry",
      },
      {
        id: "new-gen",
        label: "New Gen",
        playerIds: ["alcaraz", "sinner", "rune"],
        description: "Alcaraz, Sinner, Rune",
      },
      {
        id: "current-top-contenders",
        label: "Current Top Contenders",
        playerIds: ["alcaraz", "sinner", "zverev", "medvedev"],
        description: "Alcaraz, Sinner, Zverev, Medvedev",
      },
    ],
  },
  {
    id: "legend-collections",
    label: "Legend Collections",
    presets: [
      {
        id: "90s-legends",
        label: "90s Legends",
        playerIds: ["sampras", "agassi", "courier", "becker", "edberg"],
        description: "Sampras, Agassi, Courier, Becker, Edberg",
      },
      {
        id: "80s-legends",
        label: "80s Legends",
        playerIds: ["borg", "mcenroe", "connors", "lendl", "wilander"],
        description: "Borg, McEnroe, Connors, Lendl, Wilander",
      },
      {
        id: "former-no1s",
        label: "Former No.1s",
        playerIds: ["sampras", "agassi", "hewitt", "roddick", "safin"],
        description: "Sampras, Agassi, Hewitt, Roddick, Safin",
      },
      {
        id: "clay-kings",
        label: "Clay Kings",
        playerIds: ["nadal", "borg", "kuerten", "alcaraz"],
        description: "Nadal, Borg, Kuerten, Alcaraz",
      },
      {
        id: "young-goat-watch",
        label: "Young GOAT Watch",
        playerIds: ["alcaraz", "sinner", "nadal", "djokovic", "federer"],
        description: "Alcaraz, Sinner, Nadal, Djokovic, Federer",
      },
    ],
  },
  {
    id: "japan-context",
    label: "Japan Context",
    presets: [
      {
        id: "nishikori-vs-murray",
        label: "Nishikori vs Murray",
        playerIds: ["nishikori", "murray"],
        description: "Kei Nishikori vs Andy Murray",
      },
      {
        id: "nishikori-vs-wawrinka",
        label: "Nishikori vs Wawrinka",
        playerIds: ["nishikori", "wawrinka"],
        description: "Kei Nishikori vs Stan Wawrinka",
      },
      {
        id: "nishikori-vs-del-potro",
        label: "Nishikori vs Del Potro",
        playerIds: ["nishikori", "del-potro"],
        description: "Kei Nishikori vs Juan Martín del Potro",
      },
      {
        id: "nishikori-era-rivals",
        label: "Nishikori Era Rivals",
        playerIds: ["nishikori", "murray", "wawrinka", "del-potro"],
        description: "Nishikori, Murray, Wawrinka, Del Potro",
      },
    ],
  },
];

/** Flat list for lookups (e.g. active preset detection). */
export const ALL_COMPARISON_PRESETS: ComparisonPreset[] =
  COMPARISON_PRESET_CATEGORIES.flatMap((category) => category.presets);

export function presetMatchesSelection(
  presetPlayerIds: string[],
  selectedIds: string[],
): boolean {
  if (presetPlayerIds.length !== selectedIds.length) {
    return false;
  }

  const selectedSet = new Set(selectedIds);
  return (
    presetPlayerIds.every((id) => selectedSet.has(id)) &&
    selectedIds.every((id) => presetPlayerIds.includes(id))
  );
}

export function findActivePresetId(selectedIds: string[]): string | null {
  const match = ALL_COMPARISON_PRESETS.find((preset) =>
    presetMatchesSelection(preset.playerIds, selectedIds),
  );
  return match?.id ?? null;
}

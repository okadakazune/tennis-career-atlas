import type { SportDefinition, SportId } from "@/data/sports/types";

export const DEFAULT_SPORT: SportId = "tennis";

export const DEFAULT_TENNIS_BATTLE_PAIR = ["federer", "djokovic"] as const;

export const SPORTS: SportDefinition[] = [
  {
    id: "tennis",
    label: "Tennis",
    emoji: "🎾",
    status: "live",
    tagline: "Compare ATP careers at the same age.",
    battleLabel: "Tennis Battle",
  },
  {
    id: "all",
    label: "All Sports",
    emoji: "🌍",
    status: "comingSoon",
    tagline: "Cross-sport GOAT debates are on the way.",
    battleLabel: "All Sports Battle",
  },
];

export const COMING_SOON_SPORTS: SportDefinition[] = [
  {
    id: "football",
    label: "Football",
    emoji: "⚽",
    status: "comingSoon",
    tagline: "Messi vs Ronaldo and more.",
    battleLabel: "Football Battle",
  },
  {
    id: "basketball",
    label: "Basketball",
    emoji: "🏀",
    status: "comingSoon",
    tagline: "Jordan vs LeBron and more.",
    battleLabel: "Basketball Battle",
  },
  {
    id: "baseball",
    label: "Baseball",
    emoji: "⚾",
    status: "comingSoon",
    tagline: "Legends from Ruth to Ohtani.",
    battleLabel: "Baseball Battle",
  },
  {
    id: "formula1",
    label: "Formula 1",
    emoji: "🏎",
    status: "comingSoon",
    tagline: "Senna vs Hamilton and more.",
    battleLabel: "F1 Battle",
  },
  {
    id: "golf",
    label: "Golf",
    emoji: "⛳",
    status: "comingSoon",
    tagline: "Tiger vs Nicklaus and more.",
    battleLabel: "Golf Battle",
  },
  {
    id: "boxing",
    label: "Boxing",
    emoji: "🥊",
    status: "comingSoon",
    tagline: "Ali vs Tyson and more.",
    battleLabel: "Boxing Battle",
  },
  {
    id: "athletics",
    label: "Athletics",
    emoji: "🏃",
    status: "comingSoon",
    tagline: "Track and field legends.",
    battleLabel: "Athletics Battle",
  },
  {
    id: "swimming",
    label: "Swimming",
    emoji: "🏊",
    status: "comingSoon",
    tagline: "Pool dominance across eras.",
    battleLabel: "Swimming Battle",
  },
];

export function getSportDefinition(sportId: SportId | "all"): SportDefinition | undefined {
  return SPORTS.find((sport) => sport.id === sportId)
    ?? COMING_SOON_SPORTS.find((sport) => sport.id === sportId);
}

export function isLiveSport(sportId: SportId | "all"): sportId is SportId {
  return sportId !== "all" && getSportDefinition(sportId)?.status === "live";
}

export function getDefaultBattlePairForSport(sportId: SportId): readonly [string, string] {
  if (sportId === "tennis") {
    return DEFAULT_TENNIS_BATTLE_PAIR;
  }
  return ["player-a", "player-b"];
}

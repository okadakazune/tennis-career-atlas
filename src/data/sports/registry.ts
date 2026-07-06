import type { SportDefinition, SportId } from "@/data/sports/types";

export const DEFAULT_SPORT: SportId = "tennis";

export const DEFAULT_TENNIS_BATTLE_PAIR = ["federer", "djokovic"] as const;

export const SPORTS: SportDefinition[] = [
  {
    id: "tennis",
    label: "Tennis",
    emoji: "🎾",
    status: "live",
    tagline: "What if you compare ATP careers at the same age?",
    battleLabel: "What If · Tennis",
  },
  {
    id: "all",
    label: "All Sports",
    emoji: "🌍",
    status: "comingSoon",
    tagline: "Cross-sport What If comparisons are on the way.",
    battleLabel: "What If · All Sports",
  },
];

export const COMING_SOON_SPORTS: SportDefinition[] = [
  {
    id: "football",
    label: "Football",
    emoji: "⚽",
    status: "comingSoon",
    tagline: "Messi vs Ronaldo and more.",
    battleLabel: "What If · Football",
  },
  {
    id: "basketball",
    label: "Basketball",
    emoji: "🏀",
    status: "comingSoon",
    tagline: "Jordan vs LeBron and more.",
    battleLabel: "What If · Basketball",
  },
  {
    id: "baseball",
    label: "Baseball",
    emoji: "⚾",
    status: "comingSoon",
    tagline: "Legends from Ruth to Ohtani.",
    battleLabel: "What If · Baseball",
  },
  {
    id: "formula1",
    label: "Formula 1",
    emoji: "🏎",
    status: "comingSoon",
    tagline: "Senna vs Hamilton and more.",
    battleLabel: "What If · F1",
  },
  {
    id: "golf",
    label: "Golf",
    emoji: "⛳",
    status: "comingSoon",
    tagline: "Tiger vs Nicklaus and more.",
    battleLabel: "What If · Golf",
  },
  {
    id: "boxing",
    label: "Boxing",
    emoji: "🥊",
    status: "comingSoon",
    tagline: "Ali vs Tyson and more.",
    battleLabel: "What If · Boxing",
  },
  {
    id: "athletics",
    label: "Athletics",
    emoji: "🏃",
    status: "comingSoon",
    tagline: "Track and field legends.",
    battleLabel: "What If · Athletics",
  },
  {
    id: "swimming",
    label: "Swimming",
    emoji: "🏊",
    status: "comingSoon",
    tagline: "Pool dominance across eras.",
    battleLabel: "What If · Swimming",
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

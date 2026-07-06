/**
 * What If Engine — brand layer for Tennis Career Atlas.
 * Site name stays "Tennis Career Atlas"; comparisons run on What If Engine.
 */
export const SITE_NAME = "Tennis Career Atlas";

export const WHAT_IF_ENGINE = {
  name: "What If Engine",
  poweredBy: "Powered by WHAT IF ENGINE",
  tagline: "Change one condition. Discover a different answer.",

  heroSiteName: "TENNIS CAREER ATLAS",
  heroLead1: "One comparison is an answer.",
  heroLead2: "Changing the question is where the fun begins.",
  heroLead3:
    "Discover how greatness changes when the comparison changes.",
  whatIfSectionLabel: "What if…",

  heroSteps: [
    "Choose two players.",
    "Change one condition.",
    "Discover a different answer.",
  ] as const,
  heroCta: "Start exploring",
  heroPickerPrompt: "Choose two players",

  exploreEyebrow: "What if…",
  explorePrompt: "Ask a different question — the answer may change.",
  moreCategories: "More what-ifs",

  resultEyebrow: "What If Engine",
  resultPrompt:
    "One answer under this condition — not the only one. Try another what-if below.",
  copyLink: "Copy what-if link",
  copyLinkCopied: "Copied!",

  tryAnotherEyebrow: "Keep exploring",
  tryAnotherTitle: "Try another What If",
  tryAnotherSubtitle:
    "Each question reveals a different leader. No page reload — just switch the condition.",
  differentAnswer: "Different answer",

  whyLeadTitle: (name: string) => `Under this condition, why does ${name} lead?`,
  whyEvenTitle: "Even under this condition — why?",

  timelinePrompt: "What if you compared them at every age?",
  modalTitle: "More what-ifs",
  modalSubtitle: "Pick a question — result, timeline, and charts follow.",

  leadsUnderLens: (name: string) => `${name} leads here`,
  tapToTry: "Tap to try this what-if",
} as const;

/** Clickable what-if cards on the homepage hero. */
export interface HeroWhatIfCard {
  modeId: string;
  emoji: string;
  question: string;
  /** When set, switches to age mode at this snapshot age (e.g. "Before Age 25"). */
  ageOverride?: number;
}

export const HERO_WHAT_IF_CARDS: HeroWhatIfCard[] = [
  { modeId: "grand-slam", emoji: "🏆", question: "Only Grand Slams?" },
  { modeId: "masters", emoji: "🎾", question: "Only Masters?" },
  { modeId: "age", emoji: "🌱", question: "Before Age 25?", ageOverride: 25 },
  { modeId: "prime", emoji: "🔥", question: "Prime vs Prime?" },
  { modeId: "no1", emoji: "👑", question: "World No.1 only?" },
  { modeId: "grass-only", emoji: "🌿", question: "Only Grass?" },
  { modeId: "clay-only", emoji: "🟧", question: "Only Clay?" },
  { modeId: "hard-only", emoji: "🟦", question: "Only Hard?" },
  { modeId: "peak", emoji: "⚡", question: "Peak Season?" },
  { modeId: "olympics", emoji: "🏅", question: "Olympics only?" },
];

/** @deprecated Use HERO_WHAT_IF_CARDS */
export const HERO_WHAT_IF_TEASERS = HERO_WHAT_IF_CARDS.map(({ emoji, question }) => ({
  emoji,
  question,
}));

/** User-facing question copy keyed by explore mode id. */
const WHAT_IF_QUESTIONS: Record<string, { question: string; chip: string }> = {
  career: {
    question: "What if the full career decided everything?",
    chip: "Full career",
  },
  peak: {
    question: "What if peak season decided?",
    chip: "Peak season",
  },
  prime: {
    question: "What if prime years decided?",
    chip: "Prime years",
  },
  age: {
    question: "What if we compare at the same age?",
    chip: "Same age",
  },
  ranking: {
    question: "What if best ranking was all that mattered?",
    chip: "Ranking only",
  },
  "grand-slam": {
    question: "What if only Grand Slams mattered?",
    chip: "Grand Slams only",
  },
  no1: {
    question: "What if only World No.1 weeks counted?",
    chip: "World No.1 only",
  },
  masters: {
    question: "What if only Masters mattered?",
    chip: "Masters only",
  },
  "masters-1000": {
    question: "What if only Masters 1000 titles counted?",
    chip: "Masters 1000",
  },
  finals: {
    question: "What if only Grand Slam finals mattered?",
    chip: "Finals only",
  },
  longevity: {
    question: "What if longevity was the tiebreaker?",
    chip: "Longevity",
  },
  consistency: {
    question: "What if consistency decided?",
    chip: "Consistency",
  },
  "first-breakthrough": {
    question: "What if early breakthrough mattered most?",
    chip: "First breakthrough",
  },
  "big-titles": {
    question: "What if only big titles counted?",
    chip: "Big titles",
  },
  "atp-titles": {
    question: "What if total ATP titles decided?",
    chip: "ATP titles",
  },
  "win-percent": {
    question: "What if win percentage was everything?",
    chip: "Win %",
  },
  "grass-only": {
    question: "What if only grass courts counted?",
    chip: "Grass only",
  },
  "clay-only": {
    question: "What if only clay courts counted?",
    chip: "Clay only",
  },
  "hard-only": {
    question: "What if only hard courts counted?",
    chip: "Hard only",
  },
  serve: {
    question: "What if serve dominance decided?",
    chip: "Serve",
  },
  return: {
    question: "What if return game decided?",
    chip: "Return",
  },
  "atp250": {
    question: "What if only ATP 250 titles counted?",
    chip: "ATP 250 only",
  },
  "atp500": {
    question: "What if only ATP 500 titles counted?",
    chip: "ATP 500 only",
  },
  "longest-no1-streak": {
    question: "What if longest No.1 streak decided?",
    chip: "No.1 streak",
  },
  "top10-seasons": {
    question: "What if Top 10 seasons decided?",
    chip: "Top 10 seasons",
  },
  olympics: {
    question: "What if only Olympic medals counted?",
    chip: "Olympics only",
  },
};

export function getWhatIfQuestion(
  modeId: string,
  fallbackLabel: string,
): string {
  return (
    WHAT_IF_QUESTIONS[modeId]?.question ??
    `What if only ${fallbackLabel.toLowerCase()} mattered?`
  );
}

export function getWhatIfChip(
  modeId: string,
  fallbackLabel: string,
  emoji?: string,
): string {
  const chip = WHAT_IF_QUESTIONS[modeId]?.chip ?? fallbackLabel;
  return emoji ? `${emoji} ${chip}` : chip;
}

/** @deprecated Use getWhatIfQuestion */
export function whatIfConditionLabel(label: string): string {
  return `What if — ${label}?`;
}

export function formatWhatIfCard(
  modeId: string,
  label: string,
  emoji?: string,
): string {
  const question = getWhatIfQuestion(modeId, label);
  return emoji ? `${emoji} ${question}` : question;
}

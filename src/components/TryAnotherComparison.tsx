"use client";

import type { ExploreModeId, ExploreSuggestionPreview } from "@/data/explore/explore-types";
import {
  formatWhatIfCard,
  WHAT_IF_ENGINE,
} from "@/data/what-if-brand";

interface TryAnotherComparisonProps {
  suggestions: ExploreSuggestionPreview[];
  onSelect: (modeId: ExploreModeId) => void;
  onOpenMoreCategories: () => void;
}

function SuggestionCard({
  suggestion,
  onSelect,
}: {
  suggestion: ExploreSuggestionPreview;
  onSelect: (modeId: ExploreModeId) => void;
}) {
  const isComingSoon = suggestion.status === "comingSoon";
  const question =
    suggestion.whatIfQuestion ??
    formatWhatIfCard(suggestion.modeId, suggestion.label, suggestion.emoji);

  return (
    <button
      type="button"
      disabled={isComingSoon}
      onClick={() => {
        if (!isComingSoon) onSelect(suggestion.modeId);
      }}
      className={`ui-transition group flex flex-col rounded-2xl border px-4 py-4 text-left ${
        suggestion.isDifferentWinner
          ? "border-amber-300/80 bg-amber-50/60 hover:border-amber-400 hover:shadow-md"
          : isComingSoon
            ? "cursor-not-allowed border-black/[0.04] bg-[#fafafa] opacity-70"
            : "border-black/[0.06] bg-white hover:border-[#0071e3]/35 hover:bg-[#f8fbff] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-[#1d1d1f] group-hover:text-[#0071e3] sm:text-base">
          {question}
        </p>
        {suggestion.isDifferentWinner ? (
          <span className="shrink-0 rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
            {WHAT_IF_ENGINE.differentAnswer}
          </span>
        ) : null}
      </div>

      <div className="mt-4 border-t border-black/[0.05] pt-3">
        {isComingSoon ? (
          <p className="text-sm font-medium text-[#aeaeb2]">Coming soon</p>
        ) : suggestion.isTie ? (
          <p className="text-sm font-semibold text-[#86868b]">Even here</p>
        ) : suggestion.winnerShortName ? (
          <p className="text-sm text-[#1d1d1f]">
            <span className="font-semibold text-[#0071e3]">
              {suggestion.winnerShortName}
            </span>{" "}
            leads
          </p>
        ) : (
          <p className="text-sm text-[#86868b]">{WHAT_IF_ENGINE.tapToTry}</p>
        )}
      </div>
    </button>
  );
}

export function TryAnotherComparison({
  suggestions,
  onSelect,
  onOpenMoreCategories,
}: TryAnotherComparisonProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#0071e3]/15 bg-gradient-to-b from-[#f0f7ff] to-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0071e3]">
            {WHAT_IF_ENGINE.tryAnotherEyebrow}
          </p>
          <h3 className="mt-1.5 text-lg font-bold text-[#1d1d1f] sm:text-xl">
            {WHAT_IF_ENGINE.tryAnotherTitle}
          </h3>
          <p className="mt-1 text-sm text-[#86868b]">
            {WHAT_IF_ENGINE.tryAnotherSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenMoreCategories}
          className="ui-transition shrink-0 self-start text-sm font-medium text-[#0071e3] hover:underline"
        >
          {WHAT_IF_ENGINE.moreCategories} →
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.modeId}
            suggestion={suggestion}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

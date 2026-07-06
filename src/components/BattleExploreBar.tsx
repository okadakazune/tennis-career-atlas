"use client";

import {
  getWhatIfChip,
  getWhatIfQuestion,
  WHAT_IF_ENGINE,
} from "@/data/what-if-brand";
import type { ExploreModeId } from "@/data/explore/explore-types";
import {
  getFeaturedExploreModes,
  getExploreMode,
} from "@/data/explore/explore-modes";
import type { SportId } from "@/data/sports/types";

interface BattleExploreBarProps {
  activeModeId: ExploreModeId;
  sport: SportId;
  onModeChange: (modeId: ExploreModeId) => void;
  onOpenMoreCategories: () => void;
}

export function BattleExploreBar({
  activeModeId,
  sport,
  onModeChange,
  onOpenMoreCategories,
}: BattleExploreBarProps) {
  const featuredModes = getFeaturedExploreModes(sport);
  const activeMode = getExploreMode(activeModeId);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0071e3]">
            {WHAT_IF_ENGINE.exploreEyebrow}
          </p>
          <p className="mt-1 text-sm text-[#86868b]">
            {WHAT_IF_ENGINE.explorePrompt}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenMoreCategories}
          className="ui-transition shrink-0 self-start rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium text-[#1d1d1f] hover:border-[#0071e3]/30 hover:text-[#0071e3]"
        >
          {WHAT_IF_ENGINE.moreCategories}
        </button>
      </div>

      <div
        className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="What-if questions"
      >
        {featuredModes.map((mode) => {
          const isActive = mode.id === activeModeId;
          const isComingSoon = mode.status === "comingSoon";

          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={isComingSoon}
              onClick={() => {
                if (!isComingSoon) onModeChange(mode.id);
              }}
              className={`ui-transition shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-[#0071e3] text-white shadow-[0_2px_12px_rgba(0,113,227,0.35)]"
                  : isComingSoon
                    ? "cursor-not-allowed bg-white text-[#aeaeb2] opacity-60"
                    : "bg-white text-[#1d1d1f] shadow-sm hover:bg-[#f0f7ff] hover:text-[#0071e3]"
              }`}
            >
              {getWhatIfChip(mode.id, mode.label, mode.emoji)}
              {isComingSoon ? (
                <span className="ml-1.5 text-[10px] font-normal opacity-80">Soon</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-[#1d1d1f]">
        <span className="font-semibold text-[#0071e3]">Current question:</span>{" "}
        {getWhatIfQuestion(activeMode.id, activeMode.label)}
      </p>
    </div>
  );
}

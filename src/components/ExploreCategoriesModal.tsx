"use client";

import { useEffect, useRef } from "react";
import type { ExploreModeGroup, ExploreModeId } from "@/data/explore/explore-types";
import {
  EXPLORE_MODE_GROUP_LABELS,
  getExploreModesByGroup,
} from "@/data/explore/explore-modes";
import type { SportId } from "@/data/sports/types";

interface ExploreCategoriesModalProps {
  open: boolean;
  activeModeId: ExploreModeId;
  sport: SportId;
  onClose: () => void;
  onSelect: (modeId: ExploreModeId) => void;
}

const GROUP_ORDER: ExploreModeGroup[] = [
  "overview",
  "titles",
  "ranking",
  "performance",
  "longevity",
  "advanced",
];

export function ExploreCategoriesModal({
  open,
  activeModeId,
  sport,
  onClose,
  onSelect,
}: ExploreCategoriesModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const grouped = getExploreModesByGroup(sport);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="explore-categories-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
          <div>
            <h2
              id="explore-categories-title"
              className="text-xl font-bold tracking-tight text-[#1d1d1f]"
            >
              Compare Categories
            </h2>
            <p className="mt-1 text-sm text-[#86868b]">
              Pick a lens — Battle, Timeline, and Charts all follow.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ui-transition rounded-full p-2 text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-6">
            {GROUP_ORDER.map((group) => {
              const modes = grouped.get(group);
              if (!modes || modes.length === 0) return null;

              return (
                <section key={group}>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#86868b]">
                    {EXPLORE_MODE_GROUP_LABELS[group]}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {modes.map((mode) => {
                      const isActive = mode.id === activeModeId;
                      const isComingSoon = mode.status === "comingSoon";

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          disabled={isComingSoon}
                          onClick={() => {
                            if (isComingSoon) return;
                            onSelect(mode.id);
                            onClose();
                          }}
                          className={`ui-transition rounded-xl border px-3 py-3 text-left ${
                            isActive
                              ? "border-[#0071e3] bg-[#f0f7ff] ring-1 ring-[#0071e3]/20"
                              : isComingSoon
                                ? "cursor-not-allowed border-black/[0.04] bg-[#fafafa] opacity-60"
                                : "border-black/[0.06] bg-white hover:border-[#0071e3]/30 hover:bg-[#f8fbff]"
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#1d1d1f]">
                            {mode.label}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#86868b]">
                            {isComingSoon ? "Coming soon" : mode.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

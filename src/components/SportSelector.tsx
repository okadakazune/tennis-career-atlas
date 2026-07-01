"use client";

import { SPORTS } from "@/data/sports/registry";
import type { SportId } from "@/data/sports/types";

export type SelectedSport = SportId | "all";

interface SportSelectorProps {
  selectedSport: SelectedSport;
  onSportChange: (sport: SelectedSport) => void;
}

export function SportSelector({
  selectedSport,
  onSportChange,
}: SportSelectorProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#86868b]">
        Sport
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SPORTS.map((sport) => {
          const isActive = selectedSport === sport.id;
          const isComingSoon = sport.status === "comingSoon";

          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => onSportChange(sport.id)}
              aria-pressed={isActive}
              className={`ui-transition inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-[#1d1d1f] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  : "bg-white/90 text-[#1d1d1f] ring-1 ring-black/[0.08] hover:bg-white"
              }`}
            >
              <span aria-hidden="true">{sport.emoji}</span>
              <span>{sport.label}</span>
              {isComingSoon ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isActive
                      ? "bg-white/15 text-white/90"
                      : "bg-[#f5f5f7] text-[#86868b]"
                  }`}
                >
                  Coming Soon
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Player } from "@/data/players";
import {
  extractSignificantNo1Streaks,
  formatNo1StreakEra,
} from "@/data/career-stats";

interface No1StreakTimelineProps {
  players: Player[];
}

export function No1StreakTimeline({ players }: No1StreakTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (players.length === 0) return null;

  const playerEras = players.map((player) => ({
    player,
    streaks: extractSignificantNo1Streaks(player),
  }));

  const hasAnyStreaks = playerEras.some((entry) => entry.streaks.length > 0);
  if (!hasAnyStreaks) return null;

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
        aria-expanded={isExpanded}
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            {isExpanded ? "▾" : "▸"} World No. 1 Eras
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Major reigns at ATP #1 (4+ consecutive weeks).
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-[#86868b]">
          {isExpanded ? "Collapse" : "Expand"}
        </span>
      </button>

      {isExpanded ? (
        <div className="space-y-5 border-t border-black/[0.06] px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
          {playerEras.map(({ player, streaks }) => (
            <div key={player.id}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: player.color }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-[#1d1d1f]">
                  {player.name}
                </span>
              </div>

              {streaks.length === 0 ? (
                <p className="text-sm text-[#86868b]">No major #1 eras recorded.</p>
              ) : (
                <ul className="space-y-3">
                  {streaks.map((streak) => (
                    <li
                      key={`${streak.startDate}-${streak.endDate}`}
                      className="rounded-xl border border-black/[0.06] bg-[#fafafa] px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[#1d1d1f]">
                        {formatNo1StreakEra(streak)}
                      </p>
                      <p className="mt-0.5 text-sm text-[#86868b]">
                        {streak.weeks} consecutive week
                        {streak.weeks === 1 ? "" : "s"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

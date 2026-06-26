"use client";

import { useState } from "react";
import { Player } from "@/data/players";
import {
  extractSignificantNo1Streaks,
  formatNo1StreakEra,
} from "@/data/career-stats";
import { No1WeeksByAgeChart } from "@/components/No1WeeksByAgeChart";
import { ChartTooltipCard, TooltipStatRow } from "@/components/ChartTooltipCard";
import { countWeeksAtNo1ThroughAge } from "@/data/compare-stats";

interface No1StreakTimelineProps {
  players: Player[];
  displayAge: number;
}

export function No1StreakTimeline({
  players,
  displayAge,
}: No1StreakTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredStreakKey, setHoveredStreakKey] = useState<string | null>(null);

  if (players.length === 0) return null;

  const playerEras = players.map((player) => ({
    player,
    streaks: extractSignificantNo1Streaks(player),
    cumulativeWeeks: countWeeksAtNo1ThroughAge(player, displayAge),
  }));

  const hasAnyStreaks = playerEras.some((entry) => entry.streaks.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <No1WeeksByAgeChart players={players} displayAge={displayAge} />

      {hasAnyStreaks ? (
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
              {playerEras.map(({ player, streaks, cumulativeWeeks }) => (
                <div key={player.id}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: player.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-[#1d1d1f]">
                        {player.name}
                      </span>
                    </div>
                    <span className="text-xs text-[#86868b]">
                      {cumulativeWeeks} total weeks at #1 by age {displayAge}
                    </span>
                  </div>

                  {streaks.length === 0 ? (
                    <p className="text-sm text-[#86868b]">
                      No major #1 eras recorded.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {streaks.map((streak) => {
                        const streakKey = `${player.id}-${streak.startDate}-${streak.endDate}`;
                        const isHovered = hoveredStreakKey === streakKey;

                        return (
                          <li
                            key={streakKey}
                            className={`relative rounded-xl border px-4 py-3 transition-all duration-200 ${
                              isHovered
                                ? "border-[#0071e3]/30 bg-[#f0f7ff] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                                : "border-black/[0.06] bg-[#fafafa]"
                            }`}
                            onMouseEnter={() => setHoveredStreakKey(streakKey)}
                            onMouseLeave={() => setHoveredStreakKey(null)}
                          >
                            <p className="text-sm font-semibold text-[#1d1d1f]">
                              {formatNo1StreakEra(streak)}
                            </p>
                            <p className="mt-0.5 text-sm text-[#86868b]">
                              {streak.weeks} consecutive week
                              {streak.weeks === 1 ? "" : "s"}
                            </p>

                            {isHovered ? (
                              <div className="pointer-events-none absolute -top-2 left-4 z-20 w-[min(260px,calc(100vw-2rem))] -translate-y-full">
                                <ChartTooltipCard active>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#86868b]">
                                    {player.shortName}
                                  </p>
                                  <div className="space-y-1">
                                    <TooltipStatRow
                                      label="Streak length"
                                      value={`${streak.weeks} weeks`}
                                      highlight
                                    />
                                    <TooltipStatRow
                                      label="Cumulative at age"
                                      value={`${cumulativeWeeks} weeks at #1`}
                                    />
                                  </div>
                                </ChartTooltipCard>
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

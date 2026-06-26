"use client";

import { Player } from "@/data/players";
import {
  GRAND_SLAM_TOURNAMENTS,
  buildGrandSlamCareerTimeline,
} from "@/data/grand-slam";
import { GrandSlamResultBadge } from "@/components/GrandSlamResultBadge";

interface GrandSlamCareerTimelineProps {
  players: Player[];
  displayAge: number;
}

export function GrandSlamCareerTimeline({
  players,
  displayAge,
}: GrandSlamCareerTimelineProps) {
  if (players.length === 0) return null;

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Grand Slam Career Timeline
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Every Grand Slam season by age. Age {displayAge} is highlighted.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-[11px] text-[#86868b]">
        <span className="inline-flex items-center gap-1">
          <span className="rounded-full bg-[#e8f8ec] px-1.5 py-0.5">🏆</span>
          Winner
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded-full bg-[#e8f1ff] px-1.5 py-0.5 text-[#0a58ca]">
            F
          </span>
          Finalist
        </span>
        <span>SF · QF · early rounds shown smaller</span>
      </div>

      <div className="flex flex-col gap-5">
        {players.map((player) => {
          const rows = buildGrandSlamCareerTimeline(player);

          return (
            <article
              key={player.id}
              className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: player.color }}
                  aria-hidden="true"
                />
                <h3 className="text-base font-semibold text-[#1d1d1f]">
                  {player.name}
                </h3>
              </div>

              {rows.length === 0 ? (
                <p className="text-sm text-[#86868b]">
                  No Grand Slam match data available.
                </p>
              ) : (
                <div className="space-y-2">
                  {rows.map((row) => {
                    const isHighlighted = row.age === displayAge;

                    return (
                      <div
                        key={`${player.id}-${row.year}`}
                        className={`rounded-lg px-3 py-2.5 ${
                          isHighlighted
                            ? "bg-[#f0f7ff] ring-2 ring-[#0071e3]/25"
                            : "bg-white ring-1 ring-black/[0.04]"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#1d1d1f]">
                            Age {row.age}
                            {isHighlighted ? (
                              <span className="ml-2 rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0071e3]">
                                Selected
                              </span>
                            ) : null}
                          </p>
                          <span className="text-xs text-[#86868b]">
                            {row.year}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                          {GRAND_SLAM_TOURNAMENTS.map((tournament) => {
                            const result = row.results[tournament.key];

                            return (
                              <div
                                key={tournament.key}
                                className="flex min-w-0 flex-col items-center gap-1"
                              >
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
                                  {tournament.timelineLabel}
                                </span>
                                <GrandSlamResultBadge
                                  result={result}
                                  compact
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { Player } from "@/data/players";
import {
  GRAND_SLAM_TOURNAMENTS,
  buildGrandSlamCareerTimeline,
  formatTimelineResultLabel,
  getGrandSlamResultDisplay,
} from "@/data/grand-slam";

interface GrandSlamCareerTimelineProps {
  players: Player[];
}

export function GrandSlamCareerTimeline({ players }: GrandSlamCareerTimelineProps) {
  if (players.length === 0) return null;

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Grand Slam Career Timeline
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Every Grand Slam season mapped to the player&apos;s age that year.
        </p>
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
                <div className="space-y-3">
                  {rows.map((row) => (
                    <div
                      key={`${player.id}-${row.year}`}
                      className="rounded-lg bg-white px-3 py-3 ring-1 ring-black/[0.04]"
                    >
                      <p className="mb-2 text-sm font-semibold text-[#1d1d1f]">
                        Age {row.age}
                        <span className="ml-2 text-xs font-normal text-[#86868b]">
                          {row.year}
                        </span>
                      </p>

                      <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:overflow-visible sm:pb-0">
                        <div className="flex min-w-max flex-col gap-2 sm:min-w-0 sm:flex-row sm:flex-wrap">
                          {GRAND_SLAM_TOURNAMENTS.map((tournament) => {
                            const result = row.results[tournament.key];
                            const display = getGrandSlamResultDisplay(result);

                            return (
                              <div
                                key={tournament.key}
                                className="flex items-center gap-2 sm:min-w-[140px]"
                              >
                                <span className="w-10 shrink-0 text-xs font-semibold text-[#86868b]">
                                  {tournament.timelineLabel}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${display.className}`}
                                >
                                  {formatTimelineResultLabel(result)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

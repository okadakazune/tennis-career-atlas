"use client";

import { Player } from "@/data/players";
import {
  extractNo1Streaks,
  getCareerTimelineBounds,
} from "@/data/career-stats";

interface No1StreakTimelineProps {
  players: Player[];
}

function parseDateMs(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function formatTimelineDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function No1StreakTimeline({ players }: No1StreakTimelineProps) {
  if (players.length === 0) return null;

  const bounds = getCareerTimelineBounds(players);
  if (!bounds) return null;

  const minMs = parseDateMs(bounds.minDate);
  const maxMs = parseDateMs(bounds.maxDate);
  const spanMs = Math.max(maxMs - minMs, 1);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          World No. 1 Streaks
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Consecutive weeks at ATP #1 from weekly ranking data.
        </p>
      </div>

      <div className="space-y-5">
        {players.map((player) => {
          const streaks = extractNo1Streaks(player);
          if (streaks.length === 0) {
            return (
              <div key={player.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-sm font-medium text-[#1d1d1f]">
                    {player.name}
                  </span>
                </div>
                <p className="text-sm text-[#86868b]">No #1 streaks recorded.</p>
              </div>
            );
          }

          return (
            <div key={player.id}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="text-sm font-medium text-[#1d1d1f]">
                  {player.name}
                </span>
              </div>

              <div className="relative h-8 rounded-lg bg-[#f5f5f7]">
                {streaks.map((streak) => {
                  const startMs = parseDateMs(streak.startDate);
                  const endMs = parseDateMs(streak.endDate);
                  const left = ((startMs - minMs) / spanMs) * 100;
                  const width = Math.max(((endMs - startMs) / spanMs) * 100, 0.8);

                  return (
                    <div
                      key={`${streak.startDate}-${streak.endDate}`}
                      className="absolute top-1 h-6 rounded-md opacity-85"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: player.color,
                      }}
                      title={`${formatTimelineDate(streak.startDate)} – ${formatTimelineDate(streak.endDate)} · ${streak.weeks} weeks`}
                    />
                  );
                })}
              </div>

              <ul className="mt-2 space-y-1">
                {streaks.map((streak) => (
                  <li
                    key={`${streak.startDate}-${streak.endDate}-label`}
                    className="text-xs text-[#86868b]"
                  >
                    {formatTimelineDate(streak.startDate)} –{" "}
                    {formatTimelineDate(streak.endDate)} · {streak.weeks} weeks
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

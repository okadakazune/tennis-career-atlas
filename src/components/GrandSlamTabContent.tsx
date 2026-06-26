"use client";

import { Player } from "@/data/players";
import { countGrandSlamTitlesThroughAge } from "@/data/grand-slam";
import { GrandSlamTitlesByAgeChart } from "@/components/GrandSlamTitlesByAgeChart";
import { GrandSlamResultsByAge } from "@/components/GrandSlamResultsByAge";
import { GrandSlamCareerTimeline } from "@/components/GrandSlamCareerTimeline";

interface GrandSlamTabContentProps {
  players: Player[];
  displayAge: number;
}

export function GrandSlamTabContent({
  players,
  displayAge,
}: GrandSlamTabContentProps) {
  if (players.length === 0) return null;

  const titleCounts = players
    .map((player) => ({
      player,
      titles: countGrandSlamTitlesThroughAge(player, displayAge),
    }))
    .sort((a, b) => b.titles - a.titles);

  const leaderTitles = titleCounts[0]?.titles ?? 0;
  const leaders = titleCounts.filter((entry) => entry.titles === leaderTitles);

  return (
    <div className="flex flex-col gap-6">
      <section className="w-full rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
        <header className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Grand Slam Comparison
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Cumulative titles and major results at age {displayAge}.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {titleCounts.map(({ player, titles }) => {
            const isLeader = titles === leaderTitles && leaders.length === 1;

            return (
              <div
                key={player.id}
                className={`rounded-xl border px-4 py-3 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] ${
                  isLeader
                    ? "border-[#34c759]/30 bg-[#f3fbf5]"
                    : "border-black/[0.06] bg-[#fafafa]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: player.color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-[#1d1d1f]">
                    {player.shortName}
                  </span>
                  {isLeader ? (
                    <span className="rounded-full bg-[#e8f8ec] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1b7f3a]">
                      Most
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[#1d1d1f]">
                  {titles}
                </p>
                <p className="text-xs text-[#86868b]">
                  GS titles by age {displayAge}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <GrandSlamTitlesByAgeChart players={players} displayAge={displayAge} />

      <GrandSlamResultsByAge players={players} displayAge={displayAge} />

      <GrandSlamCareerTimeline players={players} displayAge={displayAge} />
    </div>
  );
}

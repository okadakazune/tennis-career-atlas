"use client";

import { useEffect, useState } from "react";
import { Player } from "@/data/players";
import {
  DEFAULT_SNAPSHOT_AGE,
  GRAND_SLAM_TOURNAMENTS,
  SnapshotAge,
  SNAPSHOT_AGES,
  buildGrandSlamPlayerCards,
} from "@/data/grand-slam";

interface GrandSlamResultsByAgeProps {
  players: Player[];
  chartHoverAge: number | null;
}

export function GrandSlamResultsByAge({
  players,
  chartHoverAge,
}: GrandSlamResultsByAgeProps) {
  const [selectedAge, setSelectedAge] = useState<SnapshotAge>(DEFAULT_SNAPSHOT_AGE);
  const displayAge = chartHoverAge ?? selectedAge;

  useEffect(() => {
    if (chartHoverAge != null && SNAPSHOT_AGES.includes(chartHoverAge as SnapshotAge)) {
      setSelectedAge(chartHoverAge as SnapshotAge);
    }
  }, [chartHoverAge]);

  if (players.length === 0) return null;

  const cards = buildGrandSlamPlayerCards(players, displayAge);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Grand Slam Results by Age
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            See how each player&apos;s ranking translated into Grand Slam results at
            the same age.
          </p>
        </div>

        <div
          className="flex flex-wrap gap-1 rounded-full bg-[#f5f5f7] p-1"
          role="group"
          aria-label="Select age for Grand Slam results"
        >
          {SNAPSHOT_AGES.map((age) => {
            const isActive = displayAge === age;
            return (
              <button
                key={age}
                type="button"
                onClick={() => setSelectedAge(age)}
                aria-pressed={isActive}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#1d1d1f] shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
              >
                {age}
              </button>
            );
          })}
        </div>

        <p className="text-sm font-medium text-[#1d1d1f]">Age {displayAge}</p>
      </div>

      <div className="flex flex-col gap-4">
        {cards.map((card) => (
          <article
            key={card.playerId}
            className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: card.color }}
                aria-hidden="true"
              />
              <div>
                <h3 className="text-base font-semibold text-[#1d1d1f]">{card.name}</h3>
                {card.year ? (
                  <p className="text-xs text-[#86868b]">Season {card.year}</p>
                ) : null}
              </div>
            </div>

            {card.results ? (
              <dl className="space-y-2.5">
                {GRAND_SLAM_TOURNAMENTS.map((tournament) => (
                  <div
                    key={tournament.key}
                    className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <dt className="text-sm text-[#86868b]">{tournament.label}</dt>
                    <dd className="text-sm font-medium text-[#1d1d1f]">
                      {card.results![tournament.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-[#86868b]">No Grand Slam data for this age.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

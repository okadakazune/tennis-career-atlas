"use client";

import { Player } from "@/data/players";
import {
  GRAND_SLAM_TOURNAMENTS,
  buildGrandSlamPlayerCards,
  getGrandSlamResultDisplay,
} from "@/data/grand-slam";
import { AgeSelector } from "@/components/AgeSelector";

interface GrandSlamResultsByAgeProps {
  players: Player[];
  ages: number[];
  displayAge: number;
  onAgeChange: (age: number) => void;
  isSyncedFromChart?: boolean;
}

export function GrandSlamResultsByAge({
  players,
  ages,
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
}: GrandSlamResultsByAgeProps) {
  if (players.length === 0) return null;

  const cards = buildGrandSlamPlayerCards(players, displayAge);

  return (
    <section className="w-full rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <header className="mb-5 flex w-full flex-col gap-4">
        <div className="w-full min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Grand Slam Results by Age
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            What each player achieved at the majors during the season they turned
            this age.
          </p>
        </div>

        <AgeSelector
          ages={ages}
          displayAge={displayAge}
          onAgeChange={onAgeChange}
          isSyncedFromChart={isSyncedFromChart}
          ariaLabel="Select age for Grand Slam results"
        />
      </header>

      <div className="flex w-full flex-col gap-4">
        {cards.map((card) => (
          <article
            key={card.playerId}
            className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: card.color }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">
                    {card.name}
                  </h3>
                  {card.year ? (
                    <p className="text-xs text-[#86868b]">{card.year} season</p>
                  ) : null}
                </div>
              </div>
              {card.results ? (
                <p className="text-xs font-medium text-[#86868b]">
                  {card.gsTitlesThisSeason} GS title
                  {card.gsTitlesThisSeason === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>

            {card.results ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {GRAND_SLAM_TOURNAMENTS.map((tournament) => {
                  const result = card.results![tournament.key];
                  const display = getGrandSlamResultDisplay(result);

                  return (
                    <div
                      key={tournament.key}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 ring-1 ring-black/[0.04]"
                    >
                      <span className="text-sm font-medium text-[#1d1d1f]">
                        {tournament.shortLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${display.className}`}
                      >
                        {display.showTrophy ? (
                          <span aria-hidden="true">🏆</span>
                        ) : null}
                        {display.shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#86868b]">
                No Grand Slam data for this age.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

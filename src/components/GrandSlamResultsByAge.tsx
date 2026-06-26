"use client";

import { Player } from "@/data/players";
import {
  GRAND_SLAM_TOURNAMENTS,
  buildGrandSlamPlayerCards,
} from "@/data/grand-slam";
import { GrandSlamResultBadge } from "@/components/GrandSlamResultBadge";

interface GrandSlamResultsByAgeProps {
  players: Player[];
  displayAge: number;
}

export function GrandSlamResultsByAge({
  players,
  displayAge,
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
            Major results during the season each player turned age {displayAge}.
          </p>
        </div>
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GRAND_SLAM_TOURNAMENTS.map((tournament) => {
                  const result = card.results![tournament.key];

                  return (
                    <div
                      key={tournament.key}
                      className="flex min-w-0 flex-col items-center gap-1.5 rounded-lg bg-white px-2 py-2.5 ring-1 ring-black/[0.04] sm:px-3"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">
                        {tournament.timelineLabel}
                      </span>
                      <GrandSlamResultBadge result={result} />
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

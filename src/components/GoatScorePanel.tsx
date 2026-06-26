"use client";

import { useMemo, useState } from "react";
import { Player } from "@/data/players";
import {
  GOAT_SCORE_METRICS,
  GOAT_SCORE_TOTAL_WEIGHT,
  buildGoatScores,
  findTopGoatScorePlayerId,
} from "@/data/goat-score";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface GoatScorePanelProps {
  players: Player[];
}

function formatScore(value: number): string {
  return value.toFixed(1);
}

export function GoatScorePanel({ players }: GoatScorePanelProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  const rows = useMemo(() => buildGoatScores(players), [players]);
  const topPlayerId = useMemo(() => findTopGoatScorePlayerId(rows), [rows]);

  if (players.length === 0 || rows.length === 0) return null;

  return (
    <section className="w-full rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <header className="mb-5 flex w-full flex-col gap-3">
        <div className="w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
              GOAT Score
            </h2>
            <span className="rounded-full bg-[#fff3e0] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#e65100]">
              Beta
            </span>
          </div>
          <p className="mt-1 text-sm text-[#86868b]">
            A simple weighted score for comparing selected players. Not an official
            ranking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMethodology((open) => !open)}
          className="w-fit text-sm font-medium text-[#0071e3] hover:underline"
          aria-expanded={showMethodology}
        >
          {showMethodology ? "Hide scoring details" : "How is this calculated?"}
        </button>

        {showMethodology ? (
          <div className="rounded-xl border border-black/[0.06] bg-[#fafafa] px-4 py-3 text-sm leading-relaxed text-[#1d1d1f]">
            <p className="mb-2">
              Each metric is normalized to 0–100 within the selected players only.
              Missing metrics are excluded from a player&apos;s total, and the
              remaining weights are re-scaled so scores stay on a 100-point scale.
            </p>
            <ul className="space-y-1 text-xs text-[#86868b]">
              {GOAT_SCORE_METRICS.map((metric) => (
                <li key={metric.key}>
                  {metric.label}: weight {metric.weight} (
                  {metric.direction === "higher" ? "higher is better" : "lower is better"})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <div className="flex w-full flex-col gap-4 md:flex-row md:flex-wrap">
        {rows.map((row) => {
          const isTop = topPlayerId === row.playerId;

          return (
            <article
              key={row.playerId}
              className="flex w-full min-w-0 flex-col rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5 md:min-w-[240px] md:flex-1"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PlayerAvatar
                    name={row.name}
                    color={row.color}
                    imageUrl={row.imageUrl}
                    imagePosition={row.imagePosition}
                    size="summary"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#1d1d1f]">
                      {row.shortName}
                    </h3>
                    <p className="truncate text-xs text-[#86868b]">{row.name}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                    Score
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-[#1d1d1f]">
                    {formatScore(row.totalScore)}
                  </p>
                  {isTop ? (
                    <span className="mt-1 inline-flex rounded-full bg-[#e8f5e9] px-2 py-0.5 text-[10px] font-medium text-[#1b5e20]">
                      Top Score
                    </span>
                  ) : null}
                </div>
              </div>

              <details className="group rounded-xl border border-black/[0.06] bg-white">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-[#1d1d1f] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    Score breakdown
                    <span className="text-xs font-normal text-[#86868b] group-open:hidden">
                      Show details
                    </span>
                    <span className="hidden text-xs font-normal text-[#86868b] group-open:inline">
                      Hide details
                    </span>
                  </span>
                </summary>

                <div className="space-y-3 border-t border-black/[0.06] px-4 py-3">
                  {row.breakdown.map((item) => (
                    <div key={item.key} className="text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[#1d1d1f]">{item.label}</p>
                          <p className="text-xs text-[#86868b]">
                            Weight {item.weight} / {GOAT_SCORE_TOTAL_WEIGHT}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-medium tabular-nums text-[#1d1d1f]">
                            {item.rawFormatted}
                          </p>
                          {item.included ? (
                            <p className="text-xs tabular-nums text-[#86868b]">
                              {formatScore(item.normalizedScore ?? 0)} pts →{" "}
                              {formatScore(item.weightedPoints ?? 0)}
                            </p>
                          ) : (
                            <p className="text-xs text-[#86868b]">Excluded (no data)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <p className="border-t border-black/[0.06] pt-3 text-xs text-[#86868b]">
                    Included weight: {row.availableWeight} / {GOAT_SCORE_TOTAL_WEIGHT}
                  </p>
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}

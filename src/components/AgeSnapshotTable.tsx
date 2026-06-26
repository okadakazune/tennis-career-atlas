"use client";

import { Player } from "@/data/players";
import {
  buildEnhancedAgeSnapshot,
  findBestPlayerIdsForAgeSnapshotMetric,
  generateAgeSnapshotSummary,
  getAgeSnapshotMetrics,
} from "@/data/compare-stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { AgeSelector } from "@/components/AgeSelector";

interface AgeSnapshotTableProps {
  players: Player[];
  ages: number[];
  displayAge: number;
  onAgeChange: (age: number) => void;
  isSyncedFromChart?: boolean;
  showAgeSelector?: boolean;
}

export function AgeSnapshotTable({
  players,
  ages,
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
  showAgeSelector = true,
}: AgeSnapshotTableProps) {
  if (players.length === 0) return null;

  const rows = buildEnhancedAgeSnapshot(players, displayAge);
  const summary = generateAgeSnapshotSummary(rows, displayAge);
  const metrics = getAgeSnapshotMetrics(displayAge);

  return (
    <section className="w-full rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <header className="mb-5 flex w-full flex-col gap-4">
        <div className="w-full min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Age Snapshot Comparison
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Who was ahead at the same age? Rankings, Grand Slams, and #1 weeks
            compared at one age.
          </p>
        </div>

        {showAgeSelector ? (
          <AgeSelector
            ages={ages}
            displayAge={displayAge}
            onAgeChange={onAgeChange}
            isSyncedFromChart={isSyncedFromChart}
            ariaLabel="Select age for comparison"
          />
        ) : null}
      </header>

      {summary ? (
        <div className="mb-5 w-full rounded-xl border border-[#0071e3]/15 bg-[#f0f7ff] px-4 py-3 text-sm leading-relaxed text-[#1d1d1f]">
          {summary}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-4 md:flex-row md:flex-wrap">
        {rows.map((row) => (
          <article
            key={row.playerId}
            className="flex w-full min-w-0 flex-col rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5 md:min-w-[220px] md:max-w-full md:flex-1"
          >
            <div className="mb-4 flex items-center gap-3">
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

            <dl className="space-y-3">
              {metrics.map((metric) => {
                const bestIds = findBestPlayerIdsForAgeSnapshotMetric(rows, metric);
                const isBest =
                  bestIds.length === 1 && bestIds[0] === row.playerId;
                const formatted = metric.format(row);

                return (
                  <div key={metric.key}>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                      {metric.label(displayAge)}
                    </dt>
                    <dd className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`text-sm ${isBest ? "font-semibold text-[#1d1d1f]" : "font-medium text-[#1d1d1f]"}`}
                      >
                        {formatted}
                      </span>
                      {isBest ? (
                        <span className="rounded-full bg-[#e8f5e9] px-1.5 py-0.5 text-[10px] font-medium text-[#1b5e20]">
                          Best
                        </span>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

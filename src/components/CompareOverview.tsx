"use client";

import { Player } from "@/data/players";
import {
  COMPARE_OVERVIEW_METRICS,
  buildCompareOverview,
  buildEnhancedAgeSnapshot,
  findBestPlayerIdsForMetric,
  generateHeadlineInsight,
} from "@/data/compare-stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface CompareOverviewProps {
  players: Player[];
  displayAge: number;
}

export function CompareOverview({ players, displayAge }: CompareOverviewProps) {
  if (players.length === 0) return null;

  const overview = buildCompareOverview(players);
  const ageRows = buildEnhancedAgeSnapshot(players, displayAge);
  const headline = generateHeadlineInsight(overview, ageRows, displayAge);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Compare Overview
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Side-by-side career milestones for the selected players.
        </p>
      </div>

      {headline ? (
        <div className="rounded-xl border border-[#0071e3]/15 bg-[#f0f7ff] px-4 py-3 text-sm leading-relaxed text-[#1d1d1f]">
          {headline}
        </div>
      ) : null}

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-3">
          {overview.map((row) => (
            <article
              key={row.playerId}
              className="w-[220px] shrink-0 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:w-[240px]"
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
                  <h3 className="truncate text-sm font-semibold text-[#1d1d1f]">
                    {row.shortName}
                  </h3>
                  <p className="truncate text-xs text-[#86868b]">{row.name}</p>
                </div>
              </div>

              <dl className="space-y-2.5">
                {COMPARE_OVERVIEW_METRICS.map((metric) => {
                  const bestIds = findBestPlayerIdsForMetric(overview, metric);
                  const isBest =
                    bestIds.length === 1 && bestIds[0] === row.playerId;
                  const formatted = metric.format(row);

                  return (
                    <div key={metric.key}>
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                        {metric.label}
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
      </div>
    </section>
  );
}

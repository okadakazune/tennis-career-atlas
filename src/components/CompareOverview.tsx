"use client";

import { useMemo, useState } from "react";
import { Player } from "@/data/players";
import {
  COMPARE_OVERVIEW_METRICS,
  buildCompareOverview,
  findBestPlayerIdsForMetric,
  getCompareMetricLabel,
} from "@/data/compare-stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { ChartTooltipCard, TooltipStatRow } from "@/components/ChartTooltipCard";

interface CompareOverviewProps {
  players: Player[];
  displayAge: number;
}

function getMetricRank(
  overview: ReturnType<typeof buildCompareOverview>,
  metricKey: (typeof COMPARE_OVERVIEW_METRICS)[number]["key"],
  playerId: string,
  direction: "higher" | "lower",
): number | null {
  const values = overview
    .map((row) => ({
      playerId: row.playerId,
      value: row[metricKey] as number | null,
    }))
    .filter((entry) => entry.value != null);

  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) =>
    direction === "higher"
      ? (b.value as number) - (a.value as number)
      : (a.value as number) - (b.value as number),
  );

  const index = sorted.findIndex((entry) => entry.playerId === playerId);
  return index >= 0 ? index + 1 : null;
}

export function CompareOverview({ players, displayAge }: CompareOverviewProps) {
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  const overview = useMemo(() => buildCompareOverview(players), [players]);

  if (players.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Compare Overview
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Side-by-side career milestones for the selected players at age{" "}
          {displayAge}.
        </p>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-3">
          {overview.map((row) => {
            const isHovered = hoveredPlayerId === row.playerId;
            const isDimmed =
              hoveredPlayerId != null && hoveredPlayerId !== row.playerId;

            return (
              <article
                key={row.playerId}
                className={`relative w-[220px] shrink-0 rounded-2xl border bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] transition-all duration-200 sm:w-[240px] ${
                  isHovered
                    ? "border-[#0071e3]/30 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
                    : "border-black/[0.06]"
                } ${isDimmed ? "opacity-40" : "opacity-100"}`}
                onMouseEnter={() => setHoveredPlayerId(row.playerId)}
                onMouseLeave={() => setHoveredPlayerId(null)}
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
                    const rank = getMetricRank(
                      overview,
                      metric.key,
                      row.playerId,
                      metric.direction,
                    );

                    return (
                      <div key={metric.key}>
                        <dt className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                          {getCompareMetricLabel(metric.key, row)}
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
                          ) : rank != null ? (
                            <span className="text-[10px] text-[#86868b]">
                              #{rank}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                {isHovered ? (
                  <div className="pointer-events-none absolute -top-2 left-1/2 z-20 w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-full">
                    <ChartTooltipCard active>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#86868b]">
                        Age {displayAge} snapshot
                      </p>
                      <div className="space-y-1">
                        {COMPARE_OVERVIEW_METRICS.slice(0, 4).map((metric) => {
                          const rank = getMetricRank(
                            overview,
                            metric.key,
                            row.playerId,
                            metric.direction,
                          );
                          return (
                            <TooltipStatRow
                              key={metric.key}
                              label={getCompareMetricLabel(metric.key, row)}
                              value={
                                rank != null
                                  ? `${metric.format(row)} · #${rank}`
                                  : metric.format(row)
                              }
                            />
                          );
                        })}
                      </div>
                    </ChartTooltipCard>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

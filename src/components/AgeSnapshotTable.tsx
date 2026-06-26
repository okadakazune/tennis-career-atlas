"use client";

import { Player } from "@/data/players";
import {
  buildEnhancedAgeSnapshot,
  generateAgeSnapshotSummary,
} from "@/data/compare-stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { AgeSelector } from "@/components/AgeSelector";

interface AgeSnapshotTableProps {
  players: Player[];
  ages: number[];
  displayAge: number;
  onAgeChange: (age: number) => void;
  isSyncedFromChart?: boolean;
}

function formatRank(value: number | null): string {
  return value == null ? "—" : `#${value}`;
}

export function AgeSnapshotTable({
  players,
  ages,
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
}: AgeSnapshotTableProps) {
  if (players.length === 0) return null;

  const rows = buildEnhancedAgeSnapshot(players, displayAge);
  const summary = generateAgeSnapshotSummary(rows, displayAge);

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

        <AgeSelector
          ages={ages}
          displayAge={displayAge}
          onAgeChange={onAgeChange}
          isSyncedFromChart={isSyncedFromChart}
          ariaLabel="Select age for comparison"
        />
      </header>

      {summary ? (
        <p className="mb-5 w-full rounded-xl bg-[#fafafa] px-4 py-3 text-sm leading-relaxed text-[#1d1d1f]">
          {summary}
        </p>
      ) : null}

      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-[#86868b]">
              <th className="pb-3 pr-4 font-medium">Player</th>
              <th className="pb-3 pr-4 font-medium">ATP rank at age</th>
              <th className="pb-3 pr-4 font-medium">GS titles by age</th>
              <th className="pb-3 pr-4 font-medium">GS finals by age</th>
              <th className="pb-3 pr-4 font-medium">Weeks at #1 by age</th>
              <th className="pb-3 font-medium">Top 10 at age</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.playerId}
                className="border-b border-black/[0.04] last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar
                      name={row.name}
                      color={row.color}
                      imageUrl={row.imageUrl}
                      imagePosition={row.imagePosition}
                      size="chip"
                    />
                    <span className="font-medium text-[#1d1d1f]">{row.shortName}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-semibold text-[#1d1d1f]">
                  {formatRank(row.rankingAtAge)}
                </td>
                <td className="py-3 pr-4 font-medium text-[#1d1d1f]">
                  {row.gsTitlesByAge}
                </td>
                <td className="py-3 pr-4 font-medium text-[#1d1d1f]">
                  {row.gsFinalsByAge}
                </td>
                <td className="py-3 pr-4 font-medium text-[#1d1d1f]">
                  {row.weeksAtNo1ByAge}
                </td>
                <td className="py-3 font-medium text-[#1d1d1f]">
                  {row.inTop10AtAge ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex w-full flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.playerId}
            className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <PlayerAvatar
                name={row.name}
                color={row.color}
                imageUrl={row.imageUrl}
                imagePosition={row.imagePosition}
                size="chip"
              />
              <h3 className="text-base font-semibold text-[#1d1d1f]">
                {row.shortName}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  ATP rank
                </p>
                <p className="mt-0.5 text-lg font-semibold text-[#1d1d1f]">
                  {formatRank(row.rankingAtAge)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  GS titles
                </p>
                <p className="mt-0.5 text-lg font-semibold text-[#1d1d1f]">
                  {row.gsTitlesByAge}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  GS finals
                </p>
                <p className="mt-0.5 font-semibold text-[#1d1d1f]">
                  {row.gsFinalsByAge}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  Weeks at #1
                </p>
                <p className="mt-0.5 font-semibold text-[#1d1d1f]">
                  {row.weeksAtNo1ByAge}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  Top 10 at age {displayAge}
                </p>
                <p className="mt-0.5 font-semibold text-[#1d1d1f]">
                  {row.inTop10AtAge ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

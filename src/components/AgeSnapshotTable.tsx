"use client";

import { Player } from "@/data/players";
import { buildAgeSnapshot } from "@/data/career-stats";
import { AgeSelector } from "@/components/AgeSelector";

interface AgeSnapshotTableProps {
  players: Player[];
  ages: number[];
  displayAge: number;
  onAgeChange: (age: number) => void;
  isSyncedFromChart?: boolean;
}

export function AgeSnapshotTable({
  players,
  ages,
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
}: AgeSnapshotTableProps) {
  if (players.length === 0) return null;

  const rows = buildAgeSnapshot(players, displayAge);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Age Snapshot
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Year-end ranking and Grand Slam titles at the selected age.
          </p>
        </div>

        <AgeSelector
          ages={ages}
          displayAge={displayAge}
          onAgeChange={onAgeChange}
          isSyncedFromChart={isSyncedFromChart}
          ariaLabel="Select age for snapshot"
        />
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-[#86868b]">
              <th className="pb-3 pr-4 font-medium">Player</th>
              <th className="pb-3 pr-4 font-medium">Ranking</th>
              <th className="pb-3 font-medium">GS titles this season</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.playerId}
                className="border-b border-black/[0.04] last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-[#1d1d1f]">{row.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium text-[#1d1d1f]">
                  {row.ranking != null ? `#${row.ranking}` : "N/A"}
                </td>
                <td className="py-3 font-medium text-[#1d1d1f]">
                  {row.gsTitlesThisSeason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.playerId}
            className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              <h3 className="text-base font-semibold text-[#1d1d1f]">
                {row.shortName}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  Ranking
                </p>
                <p className="mt-0.5 font-semibold text-[#1d1d1f]">
                  {row.ranking != null ? `#${row.ranking}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
                  GS titles
                </p>
                <p className="mt-0.5 font-semibold text-[#1d1d1f]">
                  {row.gsTitlesThisSeason}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

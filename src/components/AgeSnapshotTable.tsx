"use client";

import { useState } from "react";
import { Player } from "@/data/players";
import {
  SNAPSHOT_AGES,
  SnapshotAge,
  buildAgeSnapshot,
} from "@/data/career-stats";

interface AgeSnapshotTableProps {
  players: Player[];
}

export function AgeSnapshotTable({ players }: AgeSnapshotTableProps) {
  const [selectedAge, setSelectedAge] = useState<SnapshotAge>(24);

  if (players.length === 0) return null;

  const rows = buildAgeSnapshot(players, selectedAge);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Age Snapshot
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Year-end rankings at a selected age, sorted best to worst.
          </p>
        </div>

        <div
          className="inline-flex flex-wrap gap-1 rounded-full bg-[#f5f5f7] p-1"
          role="group"
          aria-label="Select age"
        >
          {SNAPSHOT_AGES.map((age) => {
            const isActive = selectedAge === age;
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-[#86868b]">
              <th className="pb-3 pr-4 font-medium">Player</th>
              <th className="pb-3 font-medium">Ranking at age {selectedAge}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.playerId} className="border-b border-black/[0.04] last:border-0">
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
                <td className="py-3 font-medium text-[#1d1d1f]">
                  {row.ranking != null ? `#${row.ranking}` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

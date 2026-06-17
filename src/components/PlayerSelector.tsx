"use client";

import { Player, PlayerIndexEntry } from "@/data/players";
import { PlayerSearch } from "@/components/PlayerSearch";

interface PlayerSelectorProps {
  players: Player[];
  selectedIds: string[];
  inspectedPlayer: PlayerIndexEntry | null;
  onToggle: (id: string) => void;
  onSelectFeatured: (slug: string) => void;
  onInspectPlayer: (entry: PlayerIndexEntry | null) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function PlayerSelector({
  players,
  selectedIds,
  inspectedPlayer,
  onToggle,
  onSelectFeatured,
  onInspectPlayer,
  onSelectAll,
  onClearAll,
}: PlayerSelectorProps) {
  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Players
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Search the full ATP player index or compare featured players
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
          >
            Select all featured
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-5">
        <PlayerSearch
          selectedIds={selectedIds}
          onSelectFeatured={onSelectFeatured}
          onInspectPlayer={onInspectPlayer}
        />
      </div>

      {inspectedPlayer && (
        <div className="mb-5 rounded-xl border border-black/[0.06] bg-[#fafafa] px-4 py-3">
          <p className="text-sm font-medium text-[#1d1d1f]">{inspectedPlayer.name}</p>
          <p className="mt-1 text-sm text-[#86868b]">
            Born{" "}
            {inspectedPlayer.birthDate
              ? new Date(`${inspectedPlayer.birthDate}T00:00:00Z`).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })
              : "Unknown"}
            {inspectedPlayer.countryCode ? ` · ${inspectedPlayer.countryCode}` : ""}
          </p>
          {!inspectedPlayer.hasRankingData && (
            <p className="mt-2 text-xs text-[#86868b]">
              Weekly ranking history is not generated for this player yet. Add them to{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[11px]">
                scripts/config/featured-players.json
              </code>{" "}
              and run <code className="rounded bg-white px-1 py-0.5 text-[11px]">npm run data:build</code>.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {players.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onToggle(player.id)}
              aria-pressed={isSelected}
              className={`group flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "border-transparent bg-[#1d1d1f] text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                  : "border-black/[0.08] bg-[#fafafa] text-[#1d1d1f] hover:border-black/[0.12] hover:bg-white"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: player.color }}
              />
              {player.shortName}
            </button>
          );
        })}
      </div>
    </section>
  );
}

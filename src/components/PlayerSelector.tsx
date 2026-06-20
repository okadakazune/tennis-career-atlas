"use client";

import { Player, PlayerIndexEntry, TrajectoryGranularity, getMaxComparisonPlayers } from "@/data/players";
import { PlayerSearch } from "@/components/PlayerSearch";
import { ComparisonPresets } from "@/components/ComparisonPresets";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface PlayerSelectorProps {
  players: Player[];
  selectedIds: string[];
  comparisonTargets: PlayerIndexEntry[];
  granularity: TrajectoryGranularity;
  limitWarning: string | null;
  onToggle: (id: string) => void;
  onAddToComparison: (entry: PlayerIndexEntry) => void;
  onRemoveComparisonTarget: (atpPlayerId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onApplyPreset: (playerIds: string[]) => void;
}

export function PlayerSelector({
  players,
  selectedIds,
  comparisonTargets,
  granularity,
  limitWarning,
  onToggle,
  onAddToComparison,
  onRemoveComparisonTarget,
  onSelectAll,
  onClearAll,
  onApplyPreset,
}: PlayerSelectorProps) {
  const maxPlayers = getMaxComparisonPlayers(granularity);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Players
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Compare up to {maxPlayers} players
            {granularity === "weekly" ? " in weekly view" : ""} ·{" "}
            {comparisonTargets.length}/{maxPlayers} selected
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
          >
            Select all charted
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

      {limitWarning && (
        <div className="mb-5 rounded-xl border border-[#FFCCBC] bg-[#FFF3E0] px-4 py-3">
          <p className="text-sm font-medium text-[#E65100] whitespace-pre-line">
            {limitWarning}
          </p>
        </div>
      )}

      <ComparisonPresets
        onApplyPreset={onApplyPreset}
        onClear={onClearAll}
      />

      <div className="mb-5">
        <PlayerSearch
          selectedIds={selectedIds}
          onAddToComparison={onAddToComparison}
        />
      </div>

      {comparisonTargets.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
            Comparison targets
          </p>
          <div className="flex flex-wrap gap-2">
            {comparisonTargets.map((entry) => {
              const chartPlayer = entry.slug
                ? players.find((player) => player.id === entry.slug)
                : undefined;

              return (
                <div
                  key={entry.atpPlayerId}
                  className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-[#fafafa] py-1.5 pl-3 pr-1.5"
                >
                  {chartPlayer ? (
                    <PlayerAvatar
                      name={chartPlayer.name}
                      color={chartPlayer.color}
                      imageUrl={chartPlayer.imageUrl}
                      size="sm"
                    />
                  ) : null}
                  <span className="text-sm font-medium text-[#1d1d1f]">
                    {entry.shortName ?? entry.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      entry.hasRankingData
                        ? "bg-[#E8F5E9] text-[#1B5E20]"
                        : "bg-[#f5f5f7] text-[#86868b]"
                    }`}
                  >
                    {entry.hasRankingData ? "Chart available" : "Index only"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveComparisonTarget(entry.atpPlayerId)}
                    className="rounded-full px-2 py-0.5 text-xs text-[#86868b] transition-colors hover:bg-white hover:text-[#1d1d1f]"
                    aria-label={`Remove ${entry.name} from comparison`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {comparisonTargets.some((entry) => !entry.hasRankingData) && (
        <div className="mb-5 rounded-xl border border-[#FFE0B2] bg-[#FFF8E1] px-4 py-3">
          <p className="text-sm font-medium text-[#E65100]">
            Ranking history not generated yet
          </p>
          <p className="mt-1 text-xs text-[#F57C00]">
            Some selected players only exist in the search index. Add them to{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[11px]">
              scripts/config/featured-players.json
            </code>{" "}
            and run <code className="rounded bg-white px-1 py-0.5 text-[11px]">npm run data:build</code>{" "}
            to include their weekly ranking history.
          </p>
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
              <PlayerAvatar
                name={player.name}
                color={player.color}
                imageUrl={player.imageUrl}
                size="sm"
                className={isSelected ? "ring-2 ring-white/30" : undefined}
              />
              {player.shortName}
            </button>
          );
        })}
      </div>
    </section>
  );
}

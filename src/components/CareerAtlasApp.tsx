"use client";

import { useState, useCallback } from "react";
import {
  PLAYERS,
  PLAYER_IDS,
  PlayerIndexEntry,
  getIndexEntryByAtpId,
} from "@/data/players";
import dataSourceMeta from "@/data/data-source-meta.json";
import { PlayerSelector } from "@/components/PlayerSelector";
import { RankingChart } from "@/components/RankingChart";

function buildInitialComparisonTargets(): PlayerIndexEntry[] {
  return ["104925", "103819", "104745"]
    .map((atpPlayerId) => getIndexEntryByAtpId(atpPlayerId))
    .filter((entry): entry is PlayerIndexEntry => Boolean(entry));
}

export function CareerAtlasApp() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "djokovic",
    "federer",
    "nadal",
  ]);
  const [comparisonTargets, setComparisonTargets] = useState<PlayerIndexEntry[]>(
    buildInitialComparisonTargets,
  );

  const togglePlayer = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((playerId) => playerId !== id) : [...prev, id],
    );

    const player = PLAYERS.find((entry) => entry.id === id);
    if (!player) return;

    const indexEntry = getIndexEntryByAtpId(player.atpPlayerId);
    if (!indexEntry) return;

    setComparisonTargets((prev) => {
      if (prev.some((entry) => entry.atpPlayerId === indexEntry.atpPlayerId)) {
        return prev;
      }
      return [...prev, indexEntry];
    });
  }, []);

  const addToComparison = useCallback((entry: PlayerIndexEntry) => {
    setComparisonTargets((prev) => {
      if (prev.some((target) => target.atpPlayerId === entry.atpPlayerId)) {
        return prev;
      }
      return [...prev, entry];
    });

    if (entry.hasRankingData && entry.slug) {
      setSelectedIds((prev) =>
        prev.includes(entry.slug!) ? prev : [...prev, entry.slug!],
      );
    }
  }, []);

  const removeComparisonTarget = useCallback((atpPlayerId: string) => {
    const entry = getIndexEntryByAtpId(atpPlayerId);
    setComparisonTargets((prev) =>
      prev.filter((target) => target.atpPlayerId !== atpPlayerId),
    );

    if (entry?.slug) {
      setSelectedIds((prev) => prev.filter((id) => id !== entry.slug));
    }
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds([...PLAYER_IDS]);
    setComparisonTargets((prev) => {
      const merged = new Map(prev.map((entry) => [entry.atpPlayerId, entry]));
      for (const player of PLAYERS) {
        const indexEntry = getIndexEntryByAtpId(player.atpPlayerId);
        if (indexEntry) {
          merged.set(indexEntry.atpPlayerId, indexEntry);
        }
      }
      return Array.from(merged.values());
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds([]);
    setComparisonTargets([]);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="text-center sm:text-left">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#86868b]">
          Tennis Career Atlas
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] sm:text-4xl sm:leading-tight">
          Compare ATP ranking trajectories
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#86868b]">
          Search any ATP player and add them to the comparison. Players with
          generated weekly ranking history appear on the chart.
        </p>
      </header>

      <PlayerSelector
        players={PLAYERS}
        selectedIds={selectedIds}
        comparisonTargets={comparisonTargets}
        onToggle={togglePlayer}
        onAddToComparison={addToComparison}
        onRemoveComparisonTarget={removeComparisonTarget}
        onSelectAll={selectAll}
        onClearAll={clearAll}
      />

      <RankingChart players={PLAYERS} selectedIds={selectedIds} />

      <footer className="pb-4 text-center text-xs leading-relaxed text-[#86868b] sm:text-left">
        Weekly ATP rankings from {dataSourceMeta.attribution}. Generated{" "}
        {new Date(dataSourceMeta.generatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
        . Source: {dataSourceMeta.source}.
      </footer>
    </div>
  );
}

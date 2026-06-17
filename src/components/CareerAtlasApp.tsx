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

export function CareerAtlasApp() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "djokovic",
    "federer",
    "nadal",
  ]);
  const [inspectedPlayer, setInspectedPlayer] = useState<PlayerIndexEntry | null>(
    getIndexEntryByAtpId("104925") ?? null,
  );

  const togglePlayer = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((playerId) => playerId !== id) : [...prev, id],
    );
  }, []);

  const selectFeaturedPlayer = useCallback((slug: string) => {
    const player = PLAYERS.find((entry) => entry.id === slug);
    if (!player) return;

    setSelectedIds((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setInspectedPlayer(getIndexEntryByAtpId(player.atpPlayerId) ?? null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds([...PLAYER_IDS]);
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds([]);
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
          Explore weekly ATP ranking history aligned by age. Search any player in
          the ATP index, then compare featured careers on the chart.
        </p>
      </header>

      <PlayerSelector
        players={PLAYERS}
        selectedIds={selectedIds}
        inspectedPlayer={inspectedPlayer}
        onToggle={togglePlayer}
        onSelectFeatured={selectFeaturedPlayer}
        onInspectPlayer={setInspectedPlayer}
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

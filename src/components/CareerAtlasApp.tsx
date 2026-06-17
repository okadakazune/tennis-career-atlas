"use client";

import { useState, useCallback } from "react";
import { PLAYERS, PLAYER_IDS } from "@/data/players";
import { PlayerSelector } from "@/components/PlayerSelector";
import { RankingChart } from "@/components/RankingChart";

export function CareerAtlasApp() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "djokovic",
    "federer",
    "nadal",
  ]);

  const togglePlayer = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
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
          Explore how the world&apos;s greatest players climbed — and held — the
          ATP rankings across their careers, aligned by age.
        </p>
      </header>

      <PlayerSelector
        players={PLAYERS}
        selectedIds={selectedIds}
        onToggle={togglePlayer}
        onSelectAll={selectAll}
        onClearAll={clearAll}
      />

      <RankingChart players={PLAYERS} selectedIds={selectedIds} />

      <footer className="pb-4 text-center text-xs text-[#86868b] sm:text-left">
        Rankings are approximate year-end values for illustrative comparison.
      </footer>
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PLAYERS,
  PLAYER_IDS,
  PlayerIndexEntry,
  MAX_COMPARISON_PLAYERS,
  getIndexEntryByAtpId,
} from "@/data/players";
import dataSourceMeta from "@/data/data-source-meta.json";
import { PlayerSelector } from "@/components/PlayerSelector";
import { RankingChart } from "@/components/RankingChart";

function buildInitialComparisonTargets(): PlayerIndexEntry[] {
  return ["103819", "104745", "104925"]
    .map((atpPlayerId) => getIndexEntryByAtpId(atpPlayerId))
    .filter((entry): entry is PlayerIndexEntry => Boolean(entry));
}

function isAlreadyInComparison(
  targets: PlayerIndexEntry[],
  entry: PlayerIndexEntry,
): boolean {
  return targets.some((target) => target.atpPlayerId === entry.atpPlayerId);
}

export function CareerAtlasApp() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "federer",
    "nadal",
    "djokovic",
  ]);
  const [comparisonTargets, setComparisonTargets] = useState<PlayerIndexEntry[]>(
    buildInitialComparisonTargets,
  );
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comparisonTargetsRef = useRef(comparisonTargets);

  useEffect(() => {
    comparisonTargetsRef.current = comparisonTargets;
  }, [comparisonTargets]);

  const showLimitWarning = useCallback(() => {
    setLimitWarning(
      `You can compare up to ${MAX_COMPARISON_PLAYERS} players at a time. Remove one to add another.`,
    );

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    warningTimeoutRef.current = setTimeout(() => {
      setLimitWarning(null);
    }, 4000);
  }, []);

  const tryAddComparisonTarget = useCallback(
    (entry: PlayerIndexEntry): boolean => {
      const current = comparisonTargetsRef.current;

      if (isAlreadyInComparison(current, entry)) {
        return true;
      }

      if (current.length >= MAX_COMPARISON_PLAYERS) {
        showLimitWarning();
        return false;
      }

      setComparisonTargets((prev) => [...prev, entry]);
      return true;
    },
    [showLimitWarning],
  );

  const togglePlayer = useCallback(
    (id: string) => {
      const player = PLAYERS.find((entry) => entry.id === id);
      if (!player) return;

      const indexEntry = getIndexEntryByAtpId(player.atpPlayerId);
      if (!indexEntry) return;

      if (selectedIds.includes(id)) {
        setSelectedIds((prev) => prev.filter((playerId) => playerId !== id));
        setComparisonTargets((prev) =>
          prev.filter((target) => target.atpPlayerId !== indexEntry.atpPlayerId),
        );
        return;
      }

      if (!tryAddComparisonTarget(indexEntry)) {
        return;
      }

      setSelectedIds((prev) => [...prev, id]);
    },
    [selectedIds, tryAddComparisonTarget],
  );

  const addToComparison = useCallback(
    (entry: PlayerIndexEntry) => {
      const added = tryAddComparisonTarget(entry);
      if (!added) return;

      if (entry.hasRankingData && entry.slug) {
        setSelectedIds((prev) =>
          prev.includes(entry.slug!) ? prev : [...prev, entry.slug!],
        );
      }
    },
    [tryAddComparisonTarget],
  );

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
    const limitedIds = PLAYER_IDS.slice(0, MAX_COMPARISON_PLAYERS);
    setSelectedIds(limitedIds);
    setComparisonTargets(
      limitedIds
        .map((id) => {
          const player = PLAYERS.find((entry) => entry.id === id);
          return player ? getIndexEntryByAtpId(player.atpPlayerId) : undefined;
        })
        .filter((entry): entry is PlayerIndexEntry => Boolean(entry)),
    );
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds([]);
    setComparisonTargets([]);
    setLimitWarning(null);
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
          Compare up to 5 players by age. Start with the yearly view for a
          career overview, then drill into monthly or weekly detail.
        </p>
      </header>

      <PlayerSelector
        players={PLAYERS}
        selectedIds={selectedIds}
        comparisonTargets={comparisonTargets}
        limitWarning={limitWarning}
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

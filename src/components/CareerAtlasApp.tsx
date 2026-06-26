"use client";

import { Suspense, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PLAYER_IDS,
  PlayerIndexEntry,
  TrajectoryGranularity,
  MAX_COMPARISON_PLAYERS,
  MAX_WEEKLY_COMPARISON_PLAYERS,
  getMaxComparisonPlayers,
  WEEKLY_LIMIT_WARNING,
  getIndexEntryByAtpId,
  getPlayerById,
  getPlayers,
  loadPlayers,
} from "@/data/players";
import dataSourceMeta from "@/data/data-source-meta.json";
import { PlayerSelector } from "@/components/PlayerSelector";
import { RankingChart, RankingScale } from "@/components/RankingChart";
import { CompareOverview } from "@/components/CompareOverview";
import { GoatScorePanel } from "@/components/GoatScorePanel";
import { CareerSummaryCards } from "@/components/CareerSummaryCards";
import { AgeSnapshotTable } from "@/components/AgeSnapshotTable";
import { No1StreakTimeline } from "@/components/No1StreakTimeline";
import { GrandSlamResultsByAge } from "@/components/GrandSlamResultsByAge";
import { GrandSlamCareerTimeline } from "@/components/GrandSlamCareerTimeline";
import { GrandSlamTitlesByAgeChart } from "@/components/GrandSlamTitlesByAgeChart";
import { Top10LongevityCards } from "@/components/Top10LongevityCards";
import { resolveDisplayAge } from "@/data/grand-slam";
import {
  DEFAULT_SNAPSHOT_AGE,
  getSnapshotAgeOptions,
} from "@/data/career-stats";
import {
  buildCompareSharePath,
  buildCompareShareUrl,
  clampSnapshotAge,
  DEFAULT_SHARE_PLAYER_IDS,
  parseCompareUrlState,
  resolveSharePlayerIds,
  ChartViewMode,
} from "@/data/compare-url-state";
import { ShareLinkButton } from "@/components/ShareLinkButton";

function normalizePlayerIdsForMode(
  playerIds: string[],
  mode: TrajectoryGranularity,
): string[] {
  const max =
    mode === "weekly" ? MAX_WEEKLY_COMPARISON_PLAYERS : MAX_COMPARISON_PLAYERS;
  return playerIds.slice(0, max);
}

function buildComparisonTargetsFromIds(playerIds: string[]): PlayerIndexEntry[] {
  return playerIds
    .map((id) => {
      const player = getPlayerById(id);
      return player ? getIndexEntryByAtpId(player.atpPlayerId) : undefined;
    })
    .filter((entry): entry is PlayerIndexEntry => Boolean(entry));
}

function isAlreadyInComparison(
  targets: PlayerIndexEntry[],
  entry: PlayerIndexEntry,
): boolean {
  return targets.some((target) => target.atpPlayerId === entry.atpPlayerId);
}

function toRankingScale(view: ChartViewMode): RankingScale {
  return view === "career" ? "log" : "linear";
}

function fromRankingScale(scale: RankingScale): ChartViewMode {
  return scale === "log" ? "career" : "detail";
}

function buildDefaultComparisonState(granularity: TrajectoryGranularity = "yearly") {
  const playerIds = normalizePlayerIdsForMode(
    [...DEFAULT_SHARE_PLAYER_IDS],
    granularity,
  );

  return {
    playerIds,
    comparisonTargets: buildComparisonTargetsFromIds(playerIds),
  };
}

function CareerAtlasAppMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const snapshotAges = useMemo(() => getSnapshotAgeOptions(), []);
  const urlBootstrapRef = useRef(
    parseCompareUrlState(searchParams) ?? undefined,
  );
  const skipUrlSyncRef = useRef(true);

  const initialGranularity = urlBootstrapRef.current?.granularity ?? "yearly";
  const initialDefaults = buildDefaultComparisonState(initialGranularity);
  const initialPlayerIds = normalizePlayerIdsForMode(
    urlBootstrapRef.current?.playerIds !== undefined
      ? resolveSharePlayerIds(urlBootstrapRef.current.playerIds)
      : initialDefaults.playerIds,
    initialGranularity,
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(() => initialPlayerIds);
  const [comparisonTargets, setComparisonTargets] = useState<PlayerIndexEntry[]>(
    () => buildComparisonTargetsFromIds(initialPlayerIds),
  );
  const [granularity, setGranularity] = useState<TrajectoryGranularity>(
    () => initialGranularity,
  );
  const [selectedAge, setSelectedAge] = useState<number>(
    () => urlBootstrapRef.current?.age ?? DEFAULT_SNAPSHOT_AGE,
  );
  const [yScale, setYScale] = useState<RankingScale>(() =>
    toRankingScale(urlBootstrapRef.current?.view ?? "career"),
  );
  const [chartHoverAge, setChartHoverAge] = useState<number | null>(null);
  const selectedPlayers = useMemo(
    () => getPlayers().filter((player) => selectedIds.includes(player.id)),
    [selectedIds],
  );
  const displayAge = clampSnapshotAge(
    resolveDisplayAge(selectedAge, chartHoverAge),
  );
  const isAgeSyncedFromChart = chartHoverAge != null;

  useEffect(() => {
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }

    const nextPath = buildCompareSharePath({
      playerIds: selectedIds,
      age: selectedAge,
      granularity,
      view: fromRankingScale(yScale),
    });
    router.replace(nextPath, { scroll: false });
  }, [selectedIds, selectedAge, granularity, yScale, router]);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "/";

    return buildCompareShareUrl(
      {
        playerIds: selectedIds,
        age: selectedAge,
        granularity,
        view: fromRankingScale(yScale),
      },
      window.location.origin,
    );
  }, [selectedIds, selectedAge, granularity, yScale]);

  useEffect(() => {
    if (selectedIds.length > 0) return;

    const defaults = buildDefaultComparisonState(granularityRef.current);
    setSelectedIds(defaults.playerIds);
    setComparisonTargets(defaults.comparisonTargets);
  }, [selectedIds]);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comparisonTargetsRef = useRef(comparisonTargets);
  const granularityRef = useRef(granularity);

  useEffect(() => {
    comparisonTargetsRef.current = comparisonTargets;
  }, [comparisonTargets]);

  useEffect(() => {
    granularityRef.current = granularity;
  }, [granularity]);

  const showLimitWarning = useCallback((message: string) => {
    setLimitWarning(message);

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
      const currentGranularity = granularityRef.current;
      const maxPlayers = getMaxComparisonPlayers(currentGranularity);

      if (isAlreadyInComparison(current, entry)) {
        return true;
      }

      if (current.length >= maxPlayers) {
        showLimitWarning(
          currentGranularity === "weekly"
            ? WEEKLY_LIMIT_WARNING
            : `You can compare up to ${MAX_COMPARISON_PLAYERS} players at a time. Remove one to add another.`,
        );
        return false;
      }

      setComparisonTargets((prev) => [...prev, entry]);
      return true;
    },
    [showLimitWarning],
  );

  const togglePlayer = useCallback(
    (id: string) => {
      const player = getPlayerById(id);
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

  const handleGranularityChange = useCallback(
    (next: TrajectoryGranularity) => {
      if (
        next === "weekly" &&
        comparisonTargetsRef.current.length > MAX_WEEKLY_COMPARISON_PLAYERS
      ) {
        showLimitWarning(
          "Weekly view supports up to 2 players. Remove a player before switching to weekly.",
        );
        return;
      }

      setGranularity(next);
    },
    [showLimitWarning],
  );

  const selectAll = useCallback(() => {
    const maxPlayers = getMaxComparisonPlayers(granularityRef.current);
    const limitedIds = PLAYER_IDS.slice(0, maxPlayers);
    setSelectedIds(limitedIds);
    setComparisonTargets(
      limitedIds
        .map((id) => {
          const player = getPlayerById(id);
          return player ? getIndexEntryByAtpId(player.atpPlayerId) : undefined;
        })
        .filter((entry): entry is PlayerIndexEntry => Boolean(entry)),
    );
  }, []);

  const clearAll = useCallback(() => {
    const defaults = buildDefaultComparisonState(granularityRef.current);
    setSelectedIds(defaults.playerIds);
    setComparisonTargets(defaults.comparisonTargets);
    setLimitWarning(null);
  }, []);

  const applyPreset = useCallback(
    (playerIds: string[]) => {
      if (playerIds.length === 0) {
        clearAll();
        return;
      }

      const maxPlayers = getMaxComparisonPlayers(granularityRef.current);
      let effectiveIds = playerIds.slice(0, MAX_COMPARISON_PLAYERS);

      if (effectiveIds.length > maxPlayers) {
        effectiveIds = effectiveIds.slice(0, maxPlayers);
        showLimitWarning(
          granularityRef.current === "weekly"
            ? WEEKLY_LIMIT_WARNING
            : `You can compare up to ${MAX_COMPARISON_PLAYERS} players at a time. This preset was trimmed to ${effectiveIds.length} players.`,
        );
      }

      setSelectedIds(effectiveIds);
      setComparisonTargets(
        effectiveIds
          .map((id) => {
            const player = getPlayerById(id);
            return player ? getIndexEntryByAtpId(player.atpPlayerId) : undefined;
          })
          .filter((entry): entry is PlayerIndexEntry => Boolean(entry)),
      );
      setLimitWarning(null);
    },
    [clearAll, showLimitWarning],
  );

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
          career overview, then drill into monthly or weekly detail. Weekly view
          supports up to 2 players.
        </p>
      </header>

      {dataSourceMeta.isLatestWeekStale ? (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {dataSourceMeta.staleWarning ??
            `Recent ranking updates may be stale. Latest week: ${dataSourceMeta.latestWeek ?? "unknown"}`}
        </div>
      ) : null}

      <PlayerSelector
        players={getPlayers()}
        selectedIds={selectedIds}
        comparisonTargets={comparisonTargets}
        granularity={granularity}
        limitWarning={limitWarning}
        onToggle={togglePlayer}
        onAddToComparison={addToComparison}
        onRemoveComparisonTarget={removeComparisonTarget}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        onApplyPreset={applyPreset}
        shareLinkButton={<ShareLinkButton getShareUrl={getShareUrl} />}
      />

      <RankingChart
        players={getPlayers()}
        selectedIds={selectedIds}
        granularity={granularity}
        onGranularityChange={handleGranularityChange}
        onActiveAgeChange={setChartHoverAge}
        yScale={yScale}
        onYScaleChange={setYScale}
      />

      <CompareOverview players={selectedPlayers} displayAge={displayAge} />

      <GoatScorePanel players={selectedPlayers} />

      <CareerSummaryCards players={selectedPlayers} />

      <Top10LongevityCards players={selectedPlayers} />

      <AgeSnapshotTable
        players={selectedPlayers}
        ages={snapshotAges}
        displayAge={displayAge}
        onAgeChange={setSelectedAge}
        isSyncedFromChart={isAgeSyncedFromChart}
      />

      <GrandSlamResultsByAge
        players={selectedPlayers}
        ages={snapshotAges}
        displayAge={displayAge}
        onAgeChange={setSelectedAge}
        isSyncedFromChart={isAgeSyncedFromChart}
      />

      <GrandSlamCareerTimeline players={selectedPlayers} />

      <GrandSlamTitlesByAgeChart players={selectedPlayers} />

      <No1StreakTimeline players={selectedPlayers} />

      <footer className="pb-4 text-center text-xs leading-relaxed text-[#86868b] sm:text-left">
        <p>
          Historical ATP rankings are based on Jeff Sackmann archives. Recent weekly
          ranking updates are derived from BallDontLie API when available. This site
          is unofficial and is not affiliated with ATP.
        </p>
        <p className="mt-2">
          Archive: {dataSourceMeta.sources.archive.attribution}. Latest provider:{" "}
          {dataSourceMeta.sources.latest.enabled
            ? dataSourceMeta.sources.latest.provider
            : "not configured"}
          . Generated{" "}
          {new Date(dataSourceMeta.generatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {dataSourceMeta.latestWeek
            ? `. Latest ranking week: ${dataSourceMeta.latestWeek}.`
            : "."}{" "}
          Grand Slam results from Jeff Sackmann archives. Player photos from
          Wikimedia Commons via Wikidata when available.
        </p>
      </footer>
    </div>
  );
}

function CareerAtlasAppContent() {
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers()
      .then(() => setIsReady(true))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load player data";
        setLoadError(message);
      });
  }, []);

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[#86868b]">
          Failed to load player data. Please reload the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Reload page
        </button>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center text-sm text-[#86868b]">
        Loading player data…
      </div>
    );
  }

  return <CareerAtlasAppMain />;
}

export function CareerAtlasApp() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center text-sm text-[#86868b]">
          Loading comparison…
        </div>
      }
    >
      <CareerAtlasAppContent />
    </Suspense>
  );
}

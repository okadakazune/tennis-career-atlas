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
import { GrandSlamTabContent } from "@/components/GrandSlamTabContent";
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
  DEFAULT_BATTLE_PAIR,
  DEFAULT_SHARE_PLAYER_IDS,
  hasCompareUrlParams,
  parseBattlePair,
  parseCompareUrlState,
  resolveSharePlayerIds,
  resolveYearlyMetric,
  ChartViewMode,
  YearlyMetric,
} from "@/data/compare-url-state";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import {
  CompareDashboardTab,
} from "@/components/CompareTabNav";
import { CompareDashboardStickyHeader } from "@/components/CompareDashboardStickyHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CareerInsightsCard } from "@/components/CareerInsightsCard";
import { HeroBattle } from "@/components/HeroBattle";
import { BattleResult } from "@/components/BattleResult";
import { BattleEvidenceNav } from "@/components/BattleEvidenceNav";
import { BeyondSportsSection } from "@/components/BeyondSportsSection";
import {
  computeBattleScore,
  DEFAULT_BATTLE_PLAYER_A,
  DEFAULT_BATTLE_PLAYER_B,
} from "@/data/battle-score";
import { isLiveSport } from "@/data/sports/registry";
import { computeBattleTimeline } from "@/data/battle-timeline";
import {
  resolveSelectedSport,
  type SelectedSport,
} from "@/data/compare-url-state";

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

function resolveInitialBattleState(searchParams: URLSearchParams) {
  const urlState = parseCompareUrlState(searchParams);
  const battlePair =
    parseBattlePair(searchParams) ??
    (!hasCompareUrlParams(searchParams)
      ? ([...DEFAULT_BATTLE_PAIR] as [string, string])
      : undefined);

  if (battlePair) {
    return {
      battlePlayerAId: battlePair[0],
      battlePlayerBId: battlePair[1],
      battleActive: true,
      useBattleDefaults: true,
    };
  }

  const fallbackA = urlState?.playerIds?.[0] ?? DEFAULT_BATTLE_PLAYER_A;
  const fallbackB = urlState?.playerIds?.[1] ?? DEFAULT_BATTLE_PLAYER_B;

  return {
    battlePlayerAId: fallbackA,
    battlePlayerBId: fallbackB,
    battleActive: false,
    useBattleDefaults: false,
  };
}

function CareerAtlasAppMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const snapshotAges = useMemo(() => getSnapshotAgeOptions(), []);
  const initialBattleState = useMemo(
    () => resolveInitialBattleState(searchParams),
    [searchParams],
  );
  const urlBootstrapRef = useRef(
    parseCompareUrlState(searchParams) ?? undefined,
  );
  const skipUrlSyncRef = useRef(true);

  const initialGranularity = urlBootstrapRef.current?.granularity ?? "yearly";
  const initialDefaults = buildDefaultComparisonState(initialGranularity);
  const initialPlayerIds = normalizePlayerIdsForMode(
    initialBattleState.useBattleDefaults
      ? [initialBattleState.battlePlayerAId, initialBattleState.battlePlayerBId]
      : urlBootstrapRef.current?.playerIds !== undefined
        ? resolveSharePlayerIds(urlBootstrapRef.current.playerIds)
        : initialDefaults.playerIds,
    initialGranularity,
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(() => initialPlayerIds);
  const [comparisonTargets, setComparisonTargets] = useState<PlayerIndexEntry[]>(
    () => buildComparisonTargetsFromIds(initialPlayerIds),
  );
  const [battlePlayerAId, setBattlePlayerAId] = useState(
    () => initialBattleState.battlePlayerAId,
  );
  const [battlePlayerBId, setBattlePlayerBId] = useState(
    () => initialBattleState.battlePlayerBId,
  );
  const [battleActive, setBattleActive] = useState(
    () => initialBattleState.battleActive,
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
  const [yearlyMetric, setYearlyMetric] = useState<YearlyMetric>(() =>
    resolveYearlyMetric(urlBootstrapRef.current?.yearlyMetric),
  );
  const [selectedSport, setSelectedSport] = useState<SelectedSport>(() =>
    resolveSelectedSport(urlBootstrapRef.current?.sport),
  );
  const [chartHoverAge, setChartHoverAge] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CompareDashboardTab>("career");
  const dashboardPanelRef = useRef<HTMLDivElement>(null);
  const battleResultRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBattleRef = useRef(false);
  const selectedPlayers = useMemo(
    () => getPlayers().filter((player) => selectedIds.includes(player.id)),
    [selectedIds],
  );
  const displayAge = clampSnapshotAge(
    resolveDisplayAge(selectedAge, chartHoverAge),
  );
  const isAgeSyncedFromChart = chartHoverAge != null;

  const showBattleResult =
    isLiveSport(selectedSport) &&
    battleActive &&
    selectedIds.length === 2 &&
    selectedPlayers.length === 2;

  const battleScoreResult = useMemo(() => {
    if (!showBattleResult || !isLiveSport(selectedSport)) return null;
    const playerA = selectedPlayers[0];
    const playerB = selectedPlayers[1];
    return computeBattleScore({
      sport: selectedSport,
      playerA,
      playerB,
      displayAge,
    });
  }, [showBattleResult, selectedSport, selectedPlayers, displayAge]);

  const battleTimeline = useMemo(() => {
    if (!showBattleResult || !isLiveSport(selectedSport)) return null;
    return computeBattleTimeline({
      sport: selectedSport,
      playerA: selectedPlayers[0],
      playerB: selectedPlayers[1],
    });
  }, [showBattleResult, selectedSport, selectedPlayers]);

  const handleTimelineAgeSelect = useCallback((age: number) => {
    setChartHoverAge(null);
    setSelectedAge(clampSnapshotAge(age));
  }, []);

  const handleStartBattle = useCallback(() => {
    if (battlePlayerAId === battlePlayerBId) return;

    const nextIds = [battlePlayerAId, battlePlayerBId];
    setSelectedIds(nextIds);
    setComparisonTargets(buildComparisonTargetsFromIds(nextIds));
    setBattleActive(true);
    shouldScrollToBattleRef.current = true;
  }, [battlePlayerAId, battlePlayerBId]);

  useEffect(() => {
    if (!shouldScrollToBattleRef.current || !battleScoreResult) return;

    shouldScrollToBattleRef.current = false;
    requestAnimationFrame(() => {
      battleResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [battleScoreResult]);

  const handleTabChange = useCallback((tab: CompareDashboardTab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      dashboardPanelRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    });
  }, []);

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
      yearlyMetric: granularity === "yearly" ? yearlyMetric : undefined,
      sport: selectedSport,
      battle:
        battleActive && selectedIds.length === 2
          ? [selectedIds[0], selectedIds[1]]
          : undefined,
    });
    router.replace(nextPath, { scroll: false });
  }, [selectedIds, selectedAge, granularity, yScale, yearlyMetric, battleActive, selectedSport, router]);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "/";

    return buildCompareShareUrl(
      {
        playerIds: selectedIds,
        age: selectedAge,
        granularity,
        view: fromRankingScale(yScale),
        yearlyMetric: granularity === "yearly" ? yearlyMetric : undefined,
        sport: selectedSport,
        battle:
          battleActive && selectedIds.length === 2
            ? [selectedIds[0], selectedIds[1]]
            : undefined,
      },
      window.location.origin,
    );
  }, [selectedIds, selectedAge, granularity, yScale, yearlyMetric, battleActive, selectedSport]);

  const getBattleShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "/";
    if (selectedIds.length !== 2) return getShareUrl();

    return buildCompareShareUrl(
      {
        playerIds: selectedIds,
        age: selectedAge,
        granularity,
        view: fromRankingScale(yScale),
        yearlyMetric: granularity === "yearly" ? yearlyMetric : undefined,
        sport: selectedSport,
        battle: [selectedIds[0], selectedIds[1]],
      },
      window.location.origin,
    );
  }, [selectedIds, selectedAge, granularity, yScale, yearlyMetric, selectedSport, getShareUrl]);

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-2">
      <HeroBattle
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
        playerAId={battlePlayerAId}
        playerBId={battlePlayerBId}
        onPlayerAChange={setBattlePlayerAId}
        onPlayerBChange={setBattlePlayerBId}
        onStartBattle={handleStartBattle}
      />

      {dataSourceMeta.isLatestWeekStale ? (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {dataSourceMeta.staleWarning ??
            `Recent ranking updates may be stale. Latest week: ${dataSourceMeta.latestWeek ?? "unknown"}`}
        </div>
      ) : null}

      {battleScoreResult ? (
        <div ref={battleResultRef}>
          <BattleResult
            result={battleScoreResult}
            timeline={battleTimeline}
            onTimelineAgeSelect={handleTimelineAgeSelect}
            getBattleShareUrl={getBattleShareUrl}
          />
        </div>
      ) : null}

      {showBattleResult ? (
        <BattleEvidenceNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
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
        sectionTitle={showBattleResult ? "Change players" : "Choose your players"}
      />

      <section
        aria-label="Comparison dashboard"
        className="flex flex-col gap-3 border-t border-black/[0.05] pt-5"
      >
        <CompareDashboardStickyHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          ages={snapshotAges}
          displayAge={displayAge}
          onAgeChange={setSelectedAge}
          isSyncedFromChart={isAgeSyncedFromChart}
        />

        <CareerInsightsCard
          players={selectedPlayers}
          displayAge={displayAge}
          activeTab={activeTab}
          yearlyMetric={yearlyMetric}
          granularity={granularity}
        />

        <div
          ref={dashboardPanelRef}
          key={activeTab}
          className="ui-panel-enter flex min-h-[420px] flex-col gap-6"
        >
          {activeTab === "career" ? (
            <div
              role="tabpanel"
              id="compare-panel-career"
              aria-labelledby="compare-tab-career"
              className="-mx-1"
            >
              <RankingChart
                players={getPlayers()}
                selectedIds={selectedIds}
                granularity={granularity}
                onGranularityChange={handleGranularityChange}
                onActiveAgeChange={setChartHoverAge}
                yScale={yScale}
                onYScaleChange={setYScale}
                yearlyMetric={yearlyMetric}
                onYearlyMetricChange={setYearlyMetric}
              />
            </div>
          ) : null}

          {activeTab === "stats" ? (
            <div
              role="tabpanel"
              id="compare-panel-stats"
              aria-labelledby="compare-tab-stats"
              className="flex flex-col gap-6"
            >
              <CompareOverview players={selectedPlayers} displayAge={displayAge} />
              <CareerSummaryCards players={selectedPlayers} />
              <Top10LongevityCards players={selectedPlayers} />
            </div>
          ) : null}

          {activeTab === "age" ? (
            <div
              role="tabpanel"
              id="compare-panel-age"
              aria-labelledby="compare-tab-age"
            >
              <AgeSnapshotTable
                players={selectedPlayers}
                ages={snapshotAges}
                displayAge={displayAge}
                onAgeChange={setSelectedAge}
                isSyncedFromChart={isAgeSyncedFromChart}
                showAgeSelector={false}
              />
            </div>
          ) : null}

          {activeTab === "grand-slam" ? (
            <div
              role="tabpanel"
              id="compare-panel-grand-slam"
              aria-labelledby="compare-tab-grand-slam"
              className="flex flex-col gap-6"
            >
              <GrandSlamTabContent
                players={selectedPlayers}
                displayAge={displayAge}
              />
            </div>
          ) : null}

          {activeTab === "goat" ? (
            <div
              role="tabpanel"
              id="compare-panel-goat"
              aria-labelledby="compare-tab-goat"
            >
              <GoatScorePanel players={selectedPlayers} />
            </div>
          ) : null}

          {activeTab === "no1" ? (
            <div
              role="tabpanel"
              id="compare-panel-no1"
              aria-labelledby="compare-tab-no1"
            >
              <No1StreakTimeline
                players={selectedPlayers}
                displayAge={displayAge}
              />
            </div>
          ) : null}
        </div>
      </section>

      <BeyondSportsSection />

      <SiteFooter />
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

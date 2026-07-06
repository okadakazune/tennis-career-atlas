"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BattleCategoryResult, BattleScoreResult } from "@/data/battle-score";
import { generateCareerBattleWhyInsight } from "@/data/battle-insight";
import {
  getCategoryEmoji,
  sortCategoriesByPriority,
} from "@/data/battle-category-display";
import { getExploreMode } from "@/data/explore/explore-modes";
import type { ExploreModeId } from "@/data/explore/explore-types";
import { getSportDefinition } from "@/data/sports/registry";
import type { SportId } from "@/data/sports/types";
import type { BattleTimelineData } from "@/data/battle-timeline";
import { AgeSelector } from "@/components/AgeSelector";
import { BattleExploreBar } from "@/components/BattleExploreBar";
import { CareerBattleTimeline } from "@/components/CareerBattleTimeline";
import { ExploreCategoriesModal } from "@/components/ExploreCategoriesModal";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { CompareDashboardTab } from "@/components/CompareTabNav";

interface BattleResultProps {
  result: BattleScoreResult;
  comparisonLabel: string | null;
  exploreModeId: ExploreModeId;
  sport: SportId;
  timeline: BattleTimelineData | null;
  snapshotAges: number[];
  displayAge: number;
  onExploreModeChange: (modeId: ExploreModeId) => void;
  onAgeChange: (age: number) => void;
  onTimelineAgeSelect: (age: number) => void;
  onDeepDiveSelect: (tab: CompareDashboardTab) => void;
  getBattleShareUrl: () => string;
}

const EVIDENCE_TABS: {
  id: CompareDashboardTab;
  label: string;
  description: string;
}[] = [
  { id: "career", label: "Ranking", description: "Career ranking paths" },
  { id: "grand-slam", label: "Grand Slam", description: "Major titles by age" },
  { id: "goat", label: "GOAT", description: "GOAT score breakdown" },
  { id: "stats", label: "Stats", description: "Career milestones" },
  { id: "no1", label: "No.1", description: "Weeks at world No.1" },
  { id: "age", label: "Age", description: "Same-age snapshots" },
];

const BAR_SEGMENTS = 8;

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getWinner(result: BattleScoreResult) {
  return result.overallWinner === "a"
    ? result.playerA
    : result.overallWinner === "b"
      ? result.playerB
      : null;
}

function getLoser(result: BattleScoreResult) {
  return result.overallWinner === "a"
    ? result.playerB
    : result.overallWinner === "b"
      ? result.playerA
      : null;
}

function getWinnerScoreValue(result: BattleScoreResult): number {
  if (result.overallWinner === "a") return result.scoreA;
  if (result.overallWinner === "b") return result.scoreB;
  return Math.max(result.scoreA, result.scoreB);
}

function getWinnerScoreLabel(result: BattleScoreResult): string {
  if (result.isSingleMetric && result.categories[0]) {
    const category = result.categories[0];
    if (result.overallWinner === "tie") {
      return `${category.valueA} – ${category.valueB}`;
    }
    const winnerValue =
      result.overallWinner === "b" ? category.valueB : category.valueA;
    const loserValue =
      result.overallWinner === "b" ? category.valueA : category.valueB;
    return `${winnerValue} vs ${loserValue}`;
  }

  if (result.overallWinner === "a") {
    return `${formatScore(result.scoreA)}–${formatScore(result.scoreB)}`;
  }
  if (result.overallWinner === "b") {
    return `${formatScore(result.scoreB)}–${formatScore(result.scoreA)}`;
  }
  return `${formatScore(result.scoreA)}–${formatScore(result.scoreB)}`;
}

function groupCategoriesByLeader(result: BattleScoreResult) {
  const winner = getWinner(result);
  const loser = getLoser(result);
  const aWins = sortCategoriesByPriority(
    result.categories.filter((category) => category.outcome === "a"),
  );
  const bWins = sortCategoriesByPriority(
    result.categories.filter((category) => category.outcome === "b"),
  );
  const ties = sortCategoriesByPriority(
    result.categories.filter((category) => category.outcome === "tie"),
  );

  if (result.overallWinner === "b") {
    return {
      leaderWins: bWins,
      leaderName: winner?.shortName ?? result.playerB.shortName,
      challengerWins: aWins,
      challengerName: loser?.shortName ?? result.playerA.shortName,
      ties,
    };
  }

  return {
    leaderWins: aWins,
    leaderName: winner?.shortName ?? result.playerA.shortName,
    challengerWins: bWins,
    challengerName: loser?.shortName ?? result.playerB.shortName,
    ties,
  };
}

function ScoreBar({
  label,
  score,
  maxScore,
  accentColor,
}: {
  label: string;
  score: number;
  maxScore: number;
  accentColor: string;
}) {
  const filled = maxScore > 0 ? Math.round((score / maxScore) * BAR_SEGMENTS) : 0;

  return (
    <div className="w-full max-w-md">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-[#1d1d1f] sm:text-base">{label}</span>
        <span className="text-lg font-bold tabular-nums text-[#1d1d1f] sm:text-xl">
          {formatScore(score)}
        </span>
      </div>
      <div
        className="flex gap-0.5"
        role="img"
        aria-label={`${label}: ${score} of ${maxScore} categories`}
      >
        {Array.from({ length: BAR_SEGMENTS }).map((_, index) => (
          <span
            key={index}
            className="h-2.5 flex-1 rounded-sm sm:h-3"
            style={{
              backgroundColor: index < filled ? accentColor : "#e8e8ed",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SingleMetricHero({
  result,
  comparisonLabel,
}: {
  result: BattleScoreResult;
  comparisonLabel: string | null;
}) {
  const category = result.categories[0];
  const winner = getWinner(result);
  const exploreMode = getExploreMode(result.exploreModeId);

  return (
    <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-b from-amber-50 via-white to-white px-6 py-10 text-center shadow-[0_16px_48px_rgba(255,193,7,0.14)] sm:px-12 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700 sm:text-sm">
        <span aria-hidden="true">🔍 </span>
        {exploreMode.label}
      </p>

      {winner ? (
        <>
          <div className="mx-auto mt-6 flex justify-center">
            <div className="rounded-full ring-4 ring-amber-300/60 ring-offset-4">
              <PlayerAvatar
                name={winner.name}
                color={winner.color}
                imageUrl={winner.imageUrl}
                imagePosition={winner.imagePosition}
                size="summary"
              />
            </div>
          </div>
          <h3 className="mt-6 text-4xl font-bold tracking-tight text-[#1d1d1f] sm:text-5xl">
            {winner.name}
          </h3>
        </>
      ) : (
        <h3 className="mt-6 text-3xl font-bold tracking-tight text-[#86868b] sm:text-4xl">
          Even on {exploreMode.label}
        </h3>
      )}

      {category ? (
        <>
          <p className="mt-5 text-6xl font-bold tabular-nums tracking-tight text-[#1d1d1f] sm:text-7xl">
            {getWinnerScoreLabel(result)}
          </p>
          <p className="mt-3 text-base text-[#86868b] sm:text-lg">{category.label}</p>

          <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#fafafa] px-4 py-3">
              <p className="text-3xl font-bold tabular-nums text-[#1d1d1f]">
                {category.valueA}
              </p>
              <p className="mt-1 text-xs font-medium text-[#86868b]">
                {result.playerA.shortName}
              </p>
            </div>
            <div className="rounded-2xl bg-[#fafafa] px-4 py-3">
              <p className="text-3xl font-bold tabular-nums text-[#1d1d1f]">
                {category.valueB}
              </p>
              <p className="mt-1 text-xs font-medium text-[#86868b]">
                {result.playerB.shortName}
              </p>
            </div>
          </div>
        </>
      ) : null}

      {comparisonLabel ? (
        <p className="mx-auto mt-6 max-w-md text-sm text-[#86868b]">{comparisonLabel}</p>
      ) : null}
    </div>
  );
}

function CompositeWinnerHero({
  result,
  comparisonLabel,
}: {
  result: BattleScoreResult;
  comparisonLabel: string | null;
}) {
  const winner = getWinner(result);
  const winnerScore = getWinnerScoreValue(result);
  const maxScore = Math.max(result.scoreA, result.scoreB, 1);
  const exploreMode = getExploreMode(result.exploreModeId);

  return (
    <div className="rounded-3xl border border-amber-200/70 bg-gradient-to-b from-amber-50 via-white to-white px-6 py-10 text-center shadow-[0_16px_48px_rgba(255,193,7,0.14)] sm:px-12 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700 sm:text-sm">
        <span aria-hidden="true">🏆 </span>
        {exploreMode.label} Winner
      </p>

      {winner ? (
        <>
          <div className="mx-auto mt-6 flex justify-center">
            <div className="rounded-full ring-4 ring-amber-300/60 ring-offset-4">
              <PlayerAvatar
                name={winner.name}
                color={winner.color}
                imageUrl={winner.imageUrl}
                imagePosition={winner.imagePosition}
                size="summary"
              />
            </div>
          </div>
          <h3 className="mt-6 text-4xl font-bold tracking-tight text-[#1d1d1f] sm:text-5xl">
            {winner.name}
          </h3>
        </>
      ) : (
        <h3 className="mt-6 text-3xl font-bold tracking-tight text-[#86868b] sm:text-4xl">
          Even match
        </h3>
      )}

      <p className="mt-5 text-6xl font-bold tabular-nums tracking-tight text-[#1d1d1f] sm:text-7xl">
        {getWinnerScoreLabel(result)}
      </p>

      {winner ? (
        <p className="mt-3 text-base text-[#86868b] sm:text-lg">
          Won {winnerScore} of {result.countedCategories}{" "}
          {result.countedCategories === 1 ? "category" : "categories"}
        </p>
      ) : null}

      <div className="mx-auto mt-8 max-w-sm space-y-4 text-left">
        <ScoreBar
          label={result.playerA.shortName}
          score={result.scoreA}
          maxScore={maxScore}
          accentColor={result.playerA.color}
        />
        <ScoreBar
          label={result.playerB.shortName}
          score={result.scoreB}
          maxScore={maxScore}
          accentColor={result.playerB.color}
        />
      </div>

      {comparisonLabel ? (
        <p className="mx-auto mt-6 max-w-md text-sm text-[#86868b]">{comparisonLabel}</p>
      ) : null}
    </div>
  );
}

function BattleSummarySticky({
  result,
  exploreModeId,
  displayAge,
  visible,
}: {
  result: BattleScoreResult;
  exploreModeId: ExploreModeId;
  displayAge: number;
  visible: boolean;
}) {
  if (!visible) return null;

  const winner = getWinner(result);
  const modeLabel = getExploreMode(exploreModeId).label;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.08] bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="truncate text-sm font-semibold text-[#1d1d1f] sm:text-base">
            {result.playerA.shortName}
          </span>
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-amber-900">
            {getWinnerScoreLabel(result)}
          </span>
          <span className="truncate text-sm font-semibold text-[#1d1d1f] sm:text-base">
            {result.playerB.shortName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-[#86868b] sm:text-sm">
          {winner ? (
            <span className="hidden font-medium text-amber-800 sm:inline">
              {winner.shortName} · {modeLabel}
            </span>
          ) : null}
          {exploreModeId === "age" ? (
            <span className="rounded-full bg-[#f0f7ff] px-2.5 py-0.5 font-semibold text-[#0071e3]">
              Age {displayAge}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatStrengthList(strengths: string[]): string {
  if (strengths.length === 0) return "";
  if (strengths.length === 1) return strengths[0];
  if (strengths.length === 2) return `${strengths[0]} and ${strengths[1]}`;
  return `${strengths.slice(0, -1).join(", ")}, and ${strengths[strengths.length - 1]}`;
}

function WhyDidTheyWin({
  insight,
}: {
  insight: ReturnType<typeof generateCareerBattleWhyInsight>;
}) {
  if (!insight) return null;

  const title =
    insight.winnerStrengths.length > 0 || insight.loserStrengths
      ? `Why did ${insight.winnerName} win?`
      : "Why is it even?";

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-5 sm:px-6">
      <h3 className="text-base font-semibold text-[#1d1d1f] sm:text-lg">{title}</h3>

      <div className="mt-4 space-y-3 text-base leading-relaxed text-[#1d1d1f] sm:text-lg">
        {insight.winnerStrengths.length > 0 ? (
          <p>
            {insight.winnerIntro}{" "}
            {formatStrengthList(insight.winnerStrengths)}.
          </p>
        ) : (
          <p>{insight.winnerIntro}</p>
        )}

        {insight.loserName && insight.loserStrengths && insight.loserStrengths.length > 0 ? (
          <p className="text-[#86868b]">
            {insight.loserName} remains ahead in{" "}
            {formatStrengthList(insight.loserStrengths)}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CategoryLeadList({ categories }: { categories: BattleCategoryResult[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-[#aeaeb2]">—</p>;
  }

  return (
    <ul className="space-y-2.5">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center gap-2 text-sm text-[#1d1d1f] sm:text-base"
        >
          <span aria-hidden="true">{getCategoryEmoji(category.id)}</span>
          <span>{category.label}</span>
        </li>
      ))}
    </ul>
  );
}

function WinningCategories({ result }: { result: BattleScoreResult }) {
  const { leaderWins, leaderName, challengerWins, challengerName, ties } = useMemo(
    () => groupCategoriesByLeader(result),
    [result],
  );

  if (result.isSingleMetric) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
        Category Breakdown
      </h3>

      <div className="mt-4 space-y-4">
        {leaderWins.length > 0 ? (
          <div className="rounded-2xl border border-amber-200/50 bg-amber-50/40 p-4 sm:p-5">
            <p className="mb-3 text-sm font-bold text-[#1d1d1f] sm:text-base">
              {leaderName} leads
            </p>
            <CategoryLeadList categories={leaderWins} />
          </div>
        ) : null}

        {challengerWins.length > 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4 sm:p-5">
            <p className="mb-3 text-sm font-bold text-[#1d1d1f] sm:text-base">
              {challengerName} leads
            </p>
            <CategoryLeadList categories={challengerWins} />
          </div>
        ) : null}

        {ties.length > 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 sm:p-5">
            <p className="mb-3 text-sm font-bold text-[#86868b]">Tied</p>
            <ul className="space-y-2">
              {ties.map((category) => (
                <li key={category.id} className="text-sm text-[#86868b] sm:text-base">
                  {category.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuickComparisonCard({
  category,
  result,
}: {
  category: BattleCategoryResult;
  result: BattleScoreResult;
}) {
  const winnerLabel =
    category.outcome === "a"
      ? result.playerA.shortName
      : category.outcome === "b"
        ? result.playerB.shortName
        : "Tie";

  return (
    <div className="flex min-w-[140px] flex-col rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#1d1d1f]">
        <span aria-hidden="true">{getCategoryEmoji(category.id)} </span>
        {category.label}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums text-[#1d1d1f]">
            {category.valueA}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
            {result.playerA.shortName}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-[#1d1d1f]">
            {category.valueB}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
            {result.playerB.shortName}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-black/[0.06] pt-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
          Winner
        </p>
        <p
          className={`mt-0.5 text-sm font-bold ${
            category.outcome === "tie" ? "text-[#86868b]" : "text-[#1d1d1f]"
          }`}
        >
          {winnerLabel}
        </p>
      </div>
    </div>
  );
}

function QuickComparisonCards({ result }: { result: BattleScoreResult }) {
  const categories = useMemo(
    () => sortCategoriesByPriority(result.categories),
    [result.categories],
  );

  if (categories.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
        Quick Comparison
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:flex lg:gap-3 lg:overflow-x-auto lg:pb-1">
        {categories.map((category) => (
          <QuickComparisonCard key={category.id} category={category} result={result} />
        ))}
      </div>
    </div>
  );
}

function ExploreEvidenceNav({
  onSelect,
}: {
  onSelect: (tab: CompareDashboardTab) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
        Explore detailed evidence
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EVIDENCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="ui-transition group rounded-2xl border border-black/[0.06] bg-[#fafafa] px-4 py-4 text-left hover:border-[#0071e3]/30 hover:bg-[#f8fbff] hover:shadow-sm"
          >
            <p className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071e3]">
              {tab.label}
            </p>
            <p className="mt-1 text-xs text-[#86868b]">{tab.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BattleResult({
  result,
  comparisonLabel,
  exploreModeId,
  sport,
  timeline,
  snapshotAges,
  displayAge,
  onExploreModeChange,
  onAgeChange,
  onTimelineAgeSelect,
  onDeepDiveSelect,
  getBattleShareUrl,
}: BattleResultProps) {
  const [copied, setCopied] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whyInsight = generateCareerBattleWhyInsight(result);
  const sportDef = getSportDefinition(result.sport);
  const exploreMode = getExploreMode(exploreModeId);

  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleCopyBattleLink = useCallback(async () => {
    const url = getBattleShareUrl();

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [getBattleShareUrl]);

  return (
    <>
      <BattleSummarySticky
        result={result}
        exploreModeId={exploreModeId}
        displayAge={displayAge}
        visible={stickyVisible}
      />

      <ExploreCategoriesModal
        open={categoriesModalOpen}
        activeModeId={exploreModeId}
        sport={sport}
        onClose={() => setCategoriesModalOpen(false)}
        onSelect={onExploreModeChange}
      />

      <section
        id="battle-result"
        className="scroll-mt-4 overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
      >
        <div className="border-b border-black/[0.06] bg-[linear-gradient(180deg,#f0f7ff_0%,#ffffff_40%)] px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0071e3]">
                <span aria-hidden="true">{sportDef?.emoji ?? "🏆"}</span>
                Battle Explorer
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1d1d1f] sm:text-3xl">
                {result.playerA.shortName} vs {result.playerB.shortName}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void handleCopyBattleLink()}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#fafafa]"
            >
              {copied ? "Copied!" : "Copy Battle Link"}
            </button>
          </div>

          <div className="mt-5">
            <BattleExploreBar
              activeModeId={exploreModeId}
              sport={sport}
              onModeChange={onExploreModeChange}
              onOpenMoreCategories={() => setCategoriesModalOpen(true)}
            />
          </div>

          {exploreModeId === "age" ? (
            <div className="mt-4">
              <AgeSelector
                ages={snapshotAges}
                displayAge={displayAge}
                onAgeChange={onAgeChange}
                ariaLabel="Select age to compare"
              />
            </div>
          ) : null}

          <div ref={heroSentinelRef} className="mt-6">
            <div
              key={
                exploreModeId === "age"
                  ? `${exploreModeId}-${displayAge}`
                  : exploreModeId
              }
              className="ui-panel-enter space-y-5"
            >
              {result.isSingleMetric ? (
                <SingleMetricHero result={result} comparisonLabel={comparisonLabel} />
              ) : (
                <CompositeWinnerHero result={result} comparisonLabel={comparisonLabel} />
              )}
              {!result.isSingleMetric ? <WhyDidTheyWin insight={whyInsight} /> : null}
              <WinningCategories result={result} />
              <QuickComparisonCards result={result} />
              <ExploreEvidenceNav onSelect={onDeepDiveSelect} />
            </div>
          </div>
        </div>

        {timeline ? (
          <div key={`timeline-${exploreModeId}`} className="ui-panel-enter">
            <div className="border-b border-black/[0.06] px-5 py-3 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
                Timeline · {exploreMode.label}
              </p>
            </div>
            <CareerBattleTimeline
              timeline={timeline}
              displayAge={displayAge}
              onAgeSelect={onTimelineAgeSelect}
            />
          </div>
        ) : null}
      </section>
    </>
  );
}

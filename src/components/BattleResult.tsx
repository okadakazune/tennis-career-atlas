"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { BattleCategoryResult, BattleScoreResult } from "@/data/battle-score";
import { generateCareerBattleWhyInsight } from "@/data/battle-insight";
import { generateBattleSnapshotSummary } from "@/data/battle-snapshot-summary";
import { getSportDefinition } from "@/data/sports/registry";
import type { BattleTimelineData } from "@/data/battle-timeline";
import { CareerBattleTimeline } from "@/components/CareerBattleTimeline";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { CompareDashboardTab } from "@/components/CompareTabNav";

interface BattleResultProps {
  careerResult: BattleScoreResult;
  ageResult: BattleScoreResult;
  timeline: BattleTimelineData | null;
  onTimelineAgeSelect: (age: number) => void;
  onDeepDiveSelect: (tab: CompareDashboardTab) => void;
  getBattleShareUrl: () => string;
}

const DEEP_DIVE_TABS: {
  id: CompareDashboardTab;
  label: string;
  description: string;
}[] = [
  { id: "career", label: "Ranking", description: "Career ranking paths" },
  { id: "grand-slam", label: "Grand Slam", description: "Major titles by age" },
  { id: "goat", label: "GOAT", description: "GOAT score breakdown" },
  { id: "stats", label: "Stats", description: "Career milestones" },
  { id: "age", label: "Age", description: "Same-age snapshots" },
  { id: "no1", label: "No.1", description: "Weeks at world No.1" },
];

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

function getWinnerScore(result: BattleScoreResult): string {
  if (result.overallWinner === "a") {
    return `${formatScore(result.scoreA)} – ${formatScore(result.scoreB)}`;
  }
  if (result.overallWinner === "b") {
    return `${formatScore(result.scoreB)} – ${formatScore(result.scoreA)}`;
  }
  return `${formatScore(result.scoreA)} – ${formatScore(result.scoreB)}`;
}

function groupCategories(result: BattleScoreResult) {
  const aWins = result.categories.filter((category) => category.outcome === "a");
  const bWins = result.categories.filter((category) => category.outcome === "b");
  const ties = result.categories.filter((category) => category.outcome === "tie");
  return { aWins, bWins, ties };
}

function WinnerHero({ result }: { result: BattleScoreResult }) {
  const winner = getWinner(result);
  const loser = getLoser(result);

  return (
    <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-b from-amber-50/80 via-white to-white px-6 py-8 text-center shadow-[0_12px_40px_rgba(255,193,7,0.12)] sm:px-10 sm:py-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
        <span aria-hidden="true">🏆 </span>
        Winner
      </p>

      {winner ? (
        <>
          <div className="mx-auto mt-5 flex justify-center">
            <div className="rounded-full ring-4 ring-amber-200/70 ring-offset-2">
              <PlayerAvatar
                name={winner.name}
                color={winner.color}
                imageUrl={winner.imageUrl}
                imagePosition={winner.imagePosition}
                size="summary"
              />
            </div>
          </div>
          <h3 className="mt-5 text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-4xl">
            {winner.name}
          </h3>
        </>
      ) : (
        <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#86868b] sm:text-3xl">
          Even match
        </h3>
      )}

      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#86868b]">
        Career Battle
      </p>

      <p className="mt-3 text-5xl font-bold tabular-nums tracking-tight text-[#1d1d1f] sm:text-6xl">
        {getWinnerScore(result)}
      </p>

      <p className="mt-3 text-sm text-[#86868b]">
        Compared across {result.countedCategories}{" "}
        {result.countedCategories === 1 ? "category" : "categories"}
      </p>

      {loser ? (
        <p className="mt-2 text-xs text-[#aeaeb2]">
          vs {loser.shortName}
        </p>
      ) : null}
    </div>
  );
}

function WhyDidTheyWin({
  insight,
}: {
  insight: ReturnType<typeof generateCareerBattleWhyInsight>;
}) {
  if (!insight) return null;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-5 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
        Why did they win?
      </p>
      <p className="mt-3 text-base leading-relaxed text-[#1d1d1f] sm:text-lg">
        {insight.winnerLead}
      </p>
      {insight.loserCounter ? (
        <p className="mt-2 text-base leading-relaxed text-[#86868b] sm:text-lg">
          {insight.loserCounter}
        </p>
      ) : null}
    </div>
  );
}

function CategoryCheckList({ categories }: { categories: BattleCategoryResult[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-[#aeaeb2]">None</p>;
  }

  return (
    <ul className="space-y-2">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-start gap-2 text-sm text-[#1d1d1f] sm:text-base"
        >
          <span className="mt-0.5 shrink-0 font-semibold text-emerald-600" aria-hidden="true">
            ✓
          </span>
          <span>{category.label}</span>
        </li>
      ))}
    </ul>
  );
}

function WinningCategories({
  result,
  subtitle,
}: {
  result: BattleScoreResult;
  subtitle?: string;
}) {
  const { aWins, bWins, ties } = useMemo(() => groupCategories(result), [result]);

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
        Winning Categories
      </h3>
      {subtitle ? (
        <p className="mt-1 text-xs text-[#86868b]">{subtitle}</p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4">
          <p className="mb-3 text-sm font-semibold text-[#1d1d1f]">
            {result.playerA.shortName} wins
          </p>
          <CategoryCheckList categories={aWins} />
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4">
          <p className="mb-3 text-sm font-semibold text-[#1d1d1f]">
            {result.playerB.shortName} wins
          </p>
          <CategoryCheckList categories={bWins} />
        </div>

        {ties.length > 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4 sm:col-span-2 lg:col-span-1">
            <p className="mb-3 text-sm font-semibold text-[#86868b]">Tie</p>
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

      {result.comingSoonCategories.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-black/[0.08] bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
            Coming soon
          </p>
          <p className="mt-1 text-sm text-[#aeaeb2]">
            {result.comingSoonCategories.map((category) => category.label).join(" · ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DeepDiveNav({
  onSelect,
}: {
  onSelect: (tab: CompareDashboardTab) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
        Explore the evidence
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DEEP_DIVE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="ui-transition group rounded-2xl border border-black/[0.06] bg-white px-4 py-4 text-left shadow-sm hover:border-[#0071e3]/30 hover:bg-[#f8fbff] hover:shadow-md"
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

function AgeBattleSnapshot({ result }: { result: BattleScoreResult }) {
  const winner = getWinner(result);
  const scoreHeadline =
    result.overallWinner === "tie"
      ? `${result.playerA.shortName} and ${result.playerB.shortName} tie`
      : winner
        ? `${winner.shortName} leads`
        : "No leader yet";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#0071e3]">
          Age Battle
        </p>
        <p className="mt-1 text-sm text-[#86868b]">
          Snapshot at age {result.displayAge}
        </p>
        <p className="mt-2 text-lg font-semibold text-[#1d1d1f]">{scoreHeadline}</p>
      </div>
      <p className="text-3xl font-bold tabular-nums text-[#1d1d1f] sm:text-4xl">
        {formatScore(result.scoreA)} – {formatScore(result.scoreB)}
      </p>
    </div>
  );
}

export function BattleResult({
  careerResult,
  ageResult,
  timeline,
  onTimelineAgeSelect,
  onDeepDiveSelect,
  getBattleShareUrl,
}: BattleResultProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whyInsight = generateCareerBattleWhyInsight(careerResult);
  const ageStory = generateBattleSnapshotSummary(ageResult);
  const sportDef = getSportDefinition(careerResult.sport);

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
    <section
      id="battle-result"
      className="scroll-mt-4 overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
    >
      <div className="border-b border-black/[0.06] bg-[linear-gradient(180deg,#fff8eb_0%,#ffffff_40%)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#ff7a00]">
              <span aria-hidden="true">{sportDef?.emoji ?? "🏆"}</span>
              Battle Result
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1d1d1f] sm:text-3xl">
              {careerResult.playerA.shortName} vs {careerResult.playerB.shortName}
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

        <div className="mt-6 space-y-5">
          <WinnerHero result={careerResult} />
          <WhyDidTheyWin insight={whyInsight} />
          <WinningCategories result={careerResult} />
          <DeepDiveNav onSelect={onDeepDiveSelect} />
        </div>
      </div>

      <div className="border-b border-black/[0.06] bg-[#f8fbff] px-5 py-5 sm:px-6">
        <AgeBattleSnapshot result={ageResult} />
      </div>

      {timeline ? (
        <CareerBattleTimeline
          timeline={timeline}
          displayAge={ageResult.displayAge}
          onAgeSelect={onTimelineAgeSelect}
        />
      ) : null}

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <WinningCategories
          result={ageResult}
          subtitle={`Snapshot at age ${ageResult.displayAge}`}
        />

        {ageStory ? (
          <div className="rounded-2xl border border-[#0071e3]/15 bg-[#f0f7ff] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0071e3]">
              Age Story
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#1d1d1f] sm:text-base">
              {ageStory}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

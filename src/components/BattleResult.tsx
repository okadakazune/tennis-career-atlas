"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { BattleScoreResult } from "@/data/battle-score";
import { generateBattleInsight } from "@/data/battle-insight";
import { getSportDefinition } from "@/data/sports/registry";
import type { BattleTimelineData } from "@/data/battle-timeline";
import { CareerBattleTimeline } from "@/components/CareerBattleTimeline";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface BattleResultProps {
  result: BattleScoreResult;
  timeline: BattleTimelineData | null;
  getBattleShareUrl: () => string;
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function PlayerBattleCard({
  name,
  shortName,
  color,
  imageUrl,
  imagePosition,
  score,
  isWinner,
  isLoser,
  align,
}: {
  name: string;
  shortName: string;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl p-4 transition-all sm:p-5 ${
        isWinner
          ? "scale-[1.02] border-2 border-amber-400/80 bg-gradient-to-br from-amber-50/90 to-white shadow-[0_8px_32px_rgba(255,193,7,0.18)]"
          : isLoser
            ? "border border-black/[0.05] bg-white/50 opacity-75"
            : "border border-black/[0.06] bg-white/80 shadow-sm"
      } ${align === "right" ? "sm:flex-row-reverse sm:text-right" : ""}`}
    >
      {isWinner ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-sm">
          🏆 Winner
        </span>
      ) : null}

      <PlayerAvatar
        name={name}
        color={color}
        imageUrl={imageUrl}
        imagePosition={imagePosition}
        size={isWinner ? "summary" : "summary"}
      />
      <div className={isWinner ? "pt-1" : ""}>
        <p
          className={`font-semibold text-[#1d1d1f] ${
            isWinner ? "text-base sm:text-lg" : "text-sm"
          }`}
        >
          {shortName}
        </p>
        <p
          className={`font-bold tabular-nums text-[#1d1d1f] ${
            isWinner ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl text-[#86868b]"
          }`}
        >
          {formatScore(score)}
        </p>
      </div>
    </div>
  );
}

export function BattleResult({ result, timeline, getBattleShareUrl }: BattleResultProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insight = generateBattleInsight(result);
  const sportDef = getSportDefinition(result.sport);

  const winner =
    result.overallWinner === "a"
      ? result.playerA
      : result.overallWinner === "b"
        ? result.playerB
        : null;

  const categorySummary = useMemo(() => {
    const aWins = result.categories.filter((category) => category.outcome === "a").length;
    const bWins = result.categories.filter((category) => category.outcome === "b").length;
    const ties = result.categories.filter((category) => category.outcome === "tie").length;
    return { aWins, bWins, ties };
  }, [result.categories]);

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

  const scoreHeadline =
    result.overallWinner === "tie"
      ? `${result.playerA.shortName} and ${result.playerB.shortName} tie`
      : winner
        ? `${winner.shortName} wins`
        : "No winner yet";

  const scoreDisplay = `${formatScore(result.scoreA)} – ${formatScore(result.scoreB)}`;

  return (
    <section
      id="battle-result"
      className="scroll-mt-4 overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
    >
      <div className="border-b border-black/[0.06] bg-[linear-gradient(90deg,#fff8eb,#ffffff,#eff6ff)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#ff7a00]">
              <span aria-hidden="true">{sportDef?.emoji ?? "🏆"}</span>
              {sportDef?.battleLabel ?? "Battle Result"}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1d1d1f] sm:text-3xl">
              {result.playerA.shortName} vs {result.playerB.shortName}
            </h2>
            <p className="mt-1 text-sm text-[#86868b]">
              Age {result.displayAge} snapshot
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleCopyBattleLink()}
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#fafafa]"
          >
            {copied ? "Copied!" : "Copy Battle Link"}
          </button>
        </div>

        <div className="mt-6 text-center">
          {winner ? (
            <p className="text-lg font-semibold text-amber-700 sm:text-xl">
              <span aria-hidden="true">🏆 </span>
              {scoreHeadline}
            </p>
          ) : (
            <p className="text-lg font-semibold text-[#86868b] sm:text-xl">
              {scoreHeadline}
            </p>
          )}
          <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-[#1d1d1f] sm:text-5xl">
            {scoreDisplay}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <PlayerBattleCard
            name={result.playerA.name}
            shortName={result.playerA.shortName}
            color={result.playerA.color}
            imageUrl={result.playerA.imageUrl}
            imagePosition={result.playerA.imagePosition}
            score={result.scoreA}
            isWinner={result.overallWinner === "a"}
            isLoser={result.overallWinner === "b"}
            align="left"
          />
          <PlayerBattleCard
            name={result.playerB.name}
            shortName={result.playerB.shortName}
            color={result.playerB.color}
            imageUrl={result.playerB.imageUrl}
            imagePosition={result.playerB.imagePosition}
            score={result.scoreB}
            isWinner={result.overallWinner === "b"}
            isLoser={result.overallWinner === "a"}
            align="right"
          />
        </div>
      </div>

      {timeline ? (
        <CareerBattleTimeline
          timeline={timeline}
          displayAge={result.displayAge}
          overallWinner={result.overallWinner}
        />
      ) : null}

      <div className="px-5 py-5 sm:px-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#86868b]">
          Category Breakdown
        </h3>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f0f7ff] px-3 py-1.5 text-xs font-semibold text-[#0071e3]">
            {result.playerA.shortName} won: {categorySummary.aWins}{" "}
            {categorySummary.aWins === 1 ? "category" : "categories"}
          </span>
          <span className="rounded-full bg-[#fff8eb] px-3 py-1.5 text-xs font-semibold text-[#ff7a00]">
            {result.playerB.shortName} won: {categorySummary.bWins}{" "}
            {categorySummary.bWins === 1 ? "category" : "categories"}
          </span>
          {categorySummary.ties > 0 ? (
            <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-[#86868b]">
              Tied: {categorySummary.ties}{" "}
              {categorySummary.ties === 1 ? "category" : "categories"}
            </span>
          ) : null}
        </div>

        <ul className="grid gap-2">
          {result.categories.map((category) => (
            <li
              key={category.id}
              className="rounded-xl border border-black/[0.06] bg-[#fafafa] px-3 py-3 sm:px-4"
            >
              <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4">
                <span className="text-sm font-medium text-[#1d1d1f]">
                  {category.label}
                </span>
                <span className="text-sm tabular-nums text-[#86868b]">
                  {result.playerA.shortName} {category.valueA}
                  <span className="mx-1.5 text-[#c7c7cc]">/</span>
                  {result.playerB.shortName} {category.valueB}
                </span>
                <span
                  className={`shrink-0 text-sm font-semibold sm:text-right ${
                    category.outcome === "a" || category.outcome === "b"
                      ? "text-[#1d1d1f]"
                      : "text-[#86868b]"
                  }`}
                >
                  {category.outcome === "excluded"
                    ? "—"
                    : category.outcome === "tie"
                      ? "Tie"
                      : `Winner: ${category.winnerShortName}`}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {result.comingSoonCategories.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#86868b]">
              Coming Soon Categories
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {result.comingSoonCategories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-black/[0.08] bg-white px-3 py-2.5"
                >
                  <span className="text-sm text-[#1d1d1f]">{category.label}</span>
                  <span className="shrink-0 rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
                    Coming Soon
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {insight ? (
          <div className="mt-5 rounded-2xl border border-[#0071e3]/15 bg-[#f0f7ff] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0071e3]">
              Why did he win?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#1d1d1f]">{insight}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

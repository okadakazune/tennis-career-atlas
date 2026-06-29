"use client";

import { useCallback, useRef, useState } from "react";
import type { BattleScoreResult } from "@/data/battle-score";
import { generateBattleInsight } from "@/data/battle-insight";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface BattleResultProps {
  result: BattleScoreResult;
  getBattleShareUrl: () => string;
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function BattleResult({ result, getBattleShareUrl }: BattleResultProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insight = generateBattleInsight(result);

  const winner =
    result.overallWinner === "a"
      ? result.playerA
      : result.overallWinner === "b"
        ? result.playerB
        : null;

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
    <section className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
      <div className="border-b border-black/[0.06] bg-[linear-gradient(90deg,#fff8eb,#ffffff,#eff6ff)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#ff7a00]">
              <span aria-hidden="true">🏆</span>
              Battle Result
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1d1d1f] sm:text-3xl">
              {result.playerA.shortName} vs {result.playerB.shortName}
            </h2>
            <p className="mt-1 text-sm text-[#86868b]">
              Age {result.displayAge} snapshot included
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

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm">
            <PlayerAvatar
              name={result.playerA.name}
              color={result.playerA.color}
              imageUrl={result.playerA.imageUrl}
              imagePosition={result.playerA.imagePosition}
              size="summary"
            />
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">
                {result.playerA.shortName}
              </p>
              <p className="text-2xl font-bold tabular-nums text-[#1d1d1f]">
                {formatScore(result.scoreA)}
              </p>
            </div>
          </div>

          <div className="text-center">
            {winner ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
                  Overall Winner
                </p>
                <p className="mt-1 text-xl font-bold text-[#1d1d1f]">
                  🏆 {winner.shortName}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-[#86868b]">No winner yet</p>
            )}
            {result.overallWinner === "tie" ? (
              <p className="mt-1 text-sm font-medium text-[#86868b]">Overall Tie</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm sm:flex-row-reverse sm:text-right">
            <PlayerAvatar
              name={result.playerB.name}
              color={result.playerB.color}
              imageUrl={result.playerB.imageUrl}
              imagePosition={result.playerB.imagePosition}
              size="summary"
            />
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">
                {result.playerB.shortName}
              </p>
              <p className="text-2xl font-bold tabular-nums text-[#1d1d1f]">
                {formatScore(result.scoreB)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#86868b]">
          Category Breakdown
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {result.categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-[#fafafa] px-3 py-2.5"
            >
              <span className="text-sm text-[#1d1d1f]">{category.label}</span>
              <span className="shrink-0 text-sm font-semibold text-[#1d1d1f]">
                {category.outcome === "excluded"
                  ? "—"
                  : category.outcome === "tie"
                    ? "Tie"
                    : category.winnerShortName}
              </span>
            </li>
          ))}
        </ul>

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

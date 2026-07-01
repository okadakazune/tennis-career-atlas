"use client";

import {
  DEFAULT_BATTLE_PLAYER_A,
  DEFAULT_BATTLE_PLAYER_B,
} from "@/data/battle-score";
import { getSportDefinition, isLiveSport } from "@/data/sports/registry";
import type { SportId } from "@/data/sports/types";
import { BattlePlayerPicker } from "@/components/BattlePlayerPicker";
import { SportSelector, SelectedSport } from "@/components/SportSelector";

interface HeroBattleProps {
  selectedSport: SelectedSport;
  onSportChange: (sport: SelectedSport) => void;
  playerAId: string;
  playerBId: string;
  onPlayerAChange: (playerId: string) => void;
  onPlayerBChange: (playerId: string) => void;
  onStartBattle: () => void;
}

export function HeroBattle({
  selectedSport,
  onSportChange,
  playerAId,
  playerBId,
  onPlayerAChange,
  onPlayerBChange,
  onStartBattle,
}: HeroBattleProps) {
  const sportDef = getSportDefinition(selectedSport);
  const isLive = isLiveSport(selectedSport);
  const canStart =
    isLive &&
    playerAId.length > 0 &&
    playerBId.length > 0 &&
    playerAId !== playerBId;

  const heroTitle = isLive
    ? `The Ultimate ${sportDef?.label ?? "Sports"} Battle`
    : "The Ultimate Sports Battle";

  return (
    <section className="overflow-hidden rounded-3xl border border-[#ffd6a5]/40 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)] p-5 shadow-[0_20px_60px_rgba(255,149,0,0.12)] sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff7a00]">
          Sports Battle Engine
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-3 text-base font-medium text-[#1d1d1f] sm:text-lg">
          Who is the greatest? Pick two legends, settle it with data, then dig
          into the evidence.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-4xl space-y-8">
        <SportSelector
          selectedSport={selectedSport}
          onSportChange={onSportChange}
        />

        {isLive ? (
          <>
            <div className="text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#1d1d1f] shadow-sm">
                <span aria-hidden="true">⚔</span>
                {sportDef?.battleLabel ?? "Sports Battle"}
              </p>
              <p className="mt-3 text-2xl font-bold text-[#1d1d1f] sm:text-3xl">
                Who&apos;s Greater?
              </p>
              <p className="mt-1 text-sm text-[#86868b]">
                Tap a player card to swap them
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
              <BattlePlayerPicker
                label="Player A"
                sport={selectedSport as SportId}
                selectedId={playerAId || DEFAULT_BATTLE_PLAYER_A}
                otherSelectedId={playerBId}
                onChange={onPlayerAChange}
              />

              <div className="flex shrink-0 items-center justify-center px-1 py-2 sm:pb-8">
                <span className="rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
                  VS
                </span>
              </div>

              <BattlePlayerPicker
                label="Player B"
                sport={selectedSport as SportId}
                selectedId={playerBId || DEFAULT_BATTLE_PLAYER_B}
                otherSelectedId={playerAId}
                onChange={onPlayerBChange}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={onStartBattle}
                disabled={!canStart}
                className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-transform hover:scale-[1.02] hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <span aria-hidden="true">🏆</span>
                Start Battle
              </button>
            </div>

            <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-[#86868b]">
              {sportDef?.tagline ??
                "Compare careers by age, rankings, major titles, dominance, and more."}
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/[0.08] bg-white/80 px-6 py-10 text-center">
            <p className="text-4xl" aria-hidden="true">
              🌍
            </p>
            <p className="mt-4 text-xl font-bold text-[#1d1d1f]">Coming Soon</p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#86868b]">
              Cross-sport GOAT battles are in development. Tennis is live now —
              football, basketball, F1, and more are next.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

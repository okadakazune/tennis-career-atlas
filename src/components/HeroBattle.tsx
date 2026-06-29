"use client";

import {
  DEFAULT_BATTLE_PLAYER_A,
  DEFAULT_BATTLE_PLAYER_B,
} from "@/data/battle-score";
import { BattlePlayerPicker } from "@/components/BattlePlayerPicker";

interface HeroBattleProps {
  playerAId: string;
  playerBId: string;
  onPlayerAChange: (playerId: string) => void;
  onPlayerBChange: (playerId: string) => void;
  onStartBattle: () => void;
}

export function HeroBattle({
  playerAId,
  playerBId,
  onPlayerAChange,
  onPlayerBChange,
  onStartBattle,
}: HeroBattleProps) {
  const canStart =
    playerAId.length > 0 &&
    playerBId.length > 0 &&
    playerAId !== playerBId;

  return (
    <section className="overflow-hidden rounded-3xl border border-[#ffd6a5]/40 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)] p-5 shadow-[0_20px_60px_rgba(255,149,0,0.12)] sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ff7a00]">
          Tennis Career Atlas
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-5xl">
          The Ultimate Tennis Battle
        </h1>
        <p className="mt-3 text-base font-medium text-[#1d1d1f] sm:text-lg">
          Choose two players. Find out who wins. Then explore why.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-4xl">
        <div className="mb-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#1d1d1f] shadow-sm">
            <span aria-hidden="true">⚔</span>
            Tennis Battle
          </p>
          <p className="mt-3 text-2xl font-bold text-[#1d1d1f] sm:text-3xl">
            Who&apos;s Greater?
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
          <BattlePlayerPicker
            label="Player A"
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
            selectedId={playerBId || DEFAULT_BATTLE_PLAYER_B}
            otherSelectedId={playerAId}
            onChange={onPlayerBChange}
          />
        </div>

        <div className="mt-6 flex justify-center">
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

        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-[#86868b]">
          Compare careers by age, rankings, Grand Slam titles, World No.1 weeks
          and more.
        </p>
      </div>
    </section>
  );
}

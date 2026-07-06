"use client";

import {
  HERO_WHAT_IF_CARDS,
  type HeroWhatIfCard,
  SITE_NAME,
  WHAT_IF_ENGINE,
} from "@/data/what-if-brand";
import {
  DEFAULT_BATTLE_PLAYER_A,
  DEFAULT_BATTLE_PLAYER_B,
} from "@/data/battle-score";
import { getExploreMode } from "@/data/explore/explore-modes";
import type { ExploreModeId } from "@/data/explore/explore-types";
import { getSportDefinition, isLiveSport } from "@/data/sports/registry";
import type { SportId } from "@/data/sports/types";
import { BattlePlayerPicker } from "@/components/BattlePlayerPicker";
import { SportSelector, SelectedSport } from "@/components/SportSelector";

interface HeroBattleProps {
  selectedSport: SelectedSport;
  onSportChange: (sport: SelectedSport) => void;
  playerAId: string;
  playerBId: string;
  activeExploreModeId: ExploreModeId;
  onPlayerAChange: (playerId: string) => void;
  onPlayerBChange: (playerId: string) => void;
  onStartBattle: () => void;
  onWhatIfSelect: (modeId: ExploreModeId, ageOverride?: number) => void;
}

function WhatIfCard({
  card,
  isActive,
  disabled,
  onSelect,
}: {
  card: HeroWhatIfCard;
  isActive: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const mode = getExploreMode(card.modeId);
  const isComingSoon = mode.status === "comingSoon";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group relative flex w-full flex-col rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
        isActive
          ? "border-[#0071e3]/40 bg-white shadow-[0_8px_32px_rgba(0,113,227,0.12)] ring-1 ring-[#0071e3]/20"
          : disabled
            ? "cursor-not-allowed border-black/[0.04] bg-white/40 opacity-50"
            : "border-black/[0.06] bg-white/80 backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#0071e3]/25 hover:bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
      }`}
    >
      <span
        aria-hidden="true"
        className="text-xl leading-none transition-transform duration-300 group-hover:scale-110"
      >
        {card.emoji}
      </span>
      <span className="mt-3 text-sm font-medium leading-snug text-[#1d1d1f] sm:text-[15px]">
        {card.question}
      </span>
      {isComingSoon ? (
        <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#aeaeb2]">
          Coming soon
        </span>
      ) : null}
    </button>
  );
}

export function HeroBattle({
  selectedSport,
  onSportChange,
  playerAId,
  playerBId,
  activeExploreModeId,
  onPlayerAChange,
  onPlayerBChange,
  onStartBattle,
  onWhatIfSelect,
}: HeroBattleProps) {
  const sportDef = getSportDefinition(selectedSport);
  const isLive = isLiveSport(selectedSport);
  const canStart =
    isLive &&
    playerAId.length > 0 &&
    playerBId.length > 0 &&
    playerAId !== playerBId;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/[0.04] bg-[#fafafa] px-5 py-14 sm:px-10 sm:py-20 lg:px-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,113,227,0.07),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(255,149,0,0.05),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#1d1d1f] sm:text-xs">
          {WHAT_IF_ENGINE.heroSiteName}
        </p>
        <p className="mt-3 text-sm font-medium tracking-wide text-[#86868b] sm:text-base">
          {WHAT_IF_ENGINE.poweredBy}
        </p>

        <div className="mx-auto mt-10 max-w-2xl space-y-2">
          <p className="text-lg font-medium leading-relaxed text-[#424245] sm:text-xl">
            {WHAT_IF_ENGINE.heroLead1}
          </p>
          <p className="text-lg font-medium leading-relaxed text-[#424245] sm:text-xl">
            {WHAT_IF_ENGINE.heroLead2}
          </p>
          <p className="pt-2 text-base leading-relaxed text-[#86868b] sm:text-lg">
            {WHAT_IF_ENGINE.heroLead3}
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl">
        <p className="mb-5 text-center text-3xl font-semibold tracking-tight text-[#1d1d1f] sm:text-4xl">
          {WHAT_IF_ENGINE.whatIfSectionLabel}
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {HERO_WHAT_IF_CARDS.map((card) => (
            <li key={card.modeId + (card.ageOverride ?? "")}>
              <WhatIfCard
                card={card}
                isActive={activeExploreModeId === card.modeId}
                disabled={!isLive}
                onSelect={() => onWhatIfSelect(card.modeId, card.ageOverride)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto mt-16 max-w-4xl space-y-8 border-t border-black/[0.05] pt-12">
        <SportSelector
          selectedSport={selectedSport}
          onSportChange={onSportChange}
        />

        {isLive ? (
          <>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#1d1d1f] sm:text-xl">
                {WHAT_IF_ENGINE.heroPickerPrompt}
              </p>
              <ol className="mx-auto mt-4 flex max-w-lg flex-col gap-1.5 text-sm text-[#86868b] sm:text-base">
                {WHAT_IF_ENGINE.heroSteps.map((step, index) => (
                  <li key={step}>
                    <span className="font-semibold text-[#0071e3]">
                      {index + 1}.
                    </span>{" "}
                    {step}
                  </li>
                ))}
              </ol>
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
                className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_rgba(0,113,227,0.22)] transition-all hover:scale-[1.02] hover:bg-[#0077ed] hover:shadow-[0_16px_40px_rgba(0,113,227,0.28)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {WHAT_IF_ENGINE.heroCta}
              </button>
            </div>

            <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-[#86868b]">
              {sportDef?.tagline ?? WHAT_IF_ENGINE.tagline}
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/[0.08] bg-white/80 px-6 py-10 text-center">
            <p className="text-4xl" aria-hidden="true">
              🌍
            </p>
            <p className="mt-4 text-xl font-bold text-[#1d1d1f]">Coming Soon</p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#86868b]">
              {WHAT_IF_ENGINE.poweredBy} is expanding to football, basketball,
              baseball, golf, F1, and more. {SITE_NAME} is live now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

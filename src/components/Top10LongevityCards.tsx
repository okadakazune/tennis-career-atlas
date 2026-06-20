"use client";

import { Player } from "@/data/players";
import {
  Top10LongevityStats,
  computeTop10Longevity,
  formatCareerStatAge,
} from "@/data/career-stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface Top10LongevityCardsProps {
  players: Player[];
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#86868b]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#1d1d1f]">{value}</p>
    </div>
  );
}

function Top10LongevityCard({
  player,
  stats,
}: {
  player: Player;
  stats: Top10LongevityStats;
}) {
  return (
    <article className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <PlayerAvatar
          name={player.name}
          color={player.color}
          imageUrl={player.imageUrl}
          size="lg"
        />
        <h3 className="text-base font-semibold text-[#1d1d1f]">{player.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <StatItem
          label="Total years in Top 10"
          value={String(stats.totalYearsInTop10)}
        />
        <StatItem
          label="Consecutive years in Top 10"
          value={String(stats.consecutiveYearsInTop10)}
        />
        <StatItem
          label="First age entering Top 10"
          value={formatCareerStatAge(stats.firstAgeTop10)}
        />
        <StatItem
          label="Last age in Top 10"
          value={formatCareerStatAge(stats.lastAgeTop10)}
        />
      </div>
    </article>
  );
}

export function Top10LongevityCards({ players }: Top10LongevityCardsProps) {
  if (players.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Top 10 Longevity
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Calendar years with at least one weekly ranking inside the Top 10.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {players.map((player) => (
          <Top10LongevityCard
            key={player.id}
            player={player}
            stats={computeTop10Longevity(player)}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import { Player, formatBirthDate } from "@/data/players";
import {
  CareerStats,
  computeCareerStats,
  formatCareerStatAge,
} from "@/data/career-stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface CareerSummaryCardsProps {
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

function formatRank(value: number | null): string {
  return value == null ? "N/A" : `#${value}`;
}

function formatCount(value: number): string {
  return value > 0 ? String(value) : "0";
}

function formatWeeks(value: number): string {
  return value > 0 ? String(value) : "N/A";
}

function CareerSummaryCard({
  player,
  stats,
}: {
  player: Player;
  stats: CareerStats;
}) {
  return (
    <article className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-4 flex items-center gap-3 sm:gap-4">
        <PlayerAvatar
          name={player.name}
          color={player.color}
          imageUrl={player.imageUrl}
          imagePosition={player.imagePosition}
          size="summary"
        />
        <div>
          <h3 className="text-base font-semibold text-[#1d1d1f]">{player.name}</h3>
          <p className="text-xs text-[#86868b]">
            {player.countryCode} · Born {formatBirthDate(player.birthDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <StatItem label="Best ATP Rank" value={formatRank(stats.bestRank)} />
        <StatItem
          label="Total weeks at #1"
          value={formatWeeks(stats.totalWeeksAtNo1)}
        />
        <StatItem
          label="Longest #1 streak"
          value={formatWeeks(stats.longestConsecutiveWeeksAtNo1)}
        />
        <StatItem
          label="Grand Slam titles"
          value={formatCount(stats.grandSlamTitles)}
        />
        <StatItem
          label="Grand Slam finals"
          value={formatCount(stats.grandSlamFinals)}
        />
        <StatItem
          label="Years in Top 10"
          value={formatCount(stats.yearsInTop10)}
        />
        <StatItem
          label="Years in Top 5"
          value={formatCount(stats.yearsInTop5)}
        />
        <StatItem
          label="First age Top 100"
          value={formatCareerStatAge(stats.firstAgeTop100)}
        />
        <StatItem
          label="First age Top 10"
          value={formatCareerStatAge(stats.firstAgeTop10)}
        />
        <StatItem
          label="First age #1"
          value={formatCareerStatAge(stats.firstAgeNo1)}
        />
      </div>
    </article>
  );
}

export function CareerSummaryCards({ players }: CareerSummaryCardsProps) {
  if (players.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Career Summary
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Key milestones from ATP rankings and Grand Slam match results.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {players.map((player) => (
          <CareerSummaryCard
            key={player.id}
            player={player}
            stats={computeCareerStats(player)}
          />
        ))}
      </div>
    </section>
  );
}

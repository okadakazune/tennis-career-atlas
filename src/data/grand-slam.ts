import grandSlamData from "@/data/grand-slam-results.generated.json";
import { Player } from "@/data/players";
import { SNAPSHOT_AGES, SnapshotAge } from "@/data/career-stats";

export type GrandSlamKey = "ao" | "rg" | "wimbledon" | "usOpen";

export type GrandSlamResultLabel =
  | "Winner"
  | "Runner-up"
  | "Semifinal"
  | "Quarterfinal"
  | "R16"
  | "R32"
  | "R64"
  | "Did not play";

export interface GrandSlamSeasonResults {
  year: string;
  ao: GrandSlamResultLabel;
  rg: GrandSlamResultLabel;
  wimbledon: GrandSlamResultLabel;
  usOpen: GrandSlamResultLabel;
}

export interface GrandSlamPlayerCard {
  playerId: string;
  name: string;
  color: string;
  year: string | null;
  results: GrandSlamSeasonResults | null;
}

export const GRAND_SLAM_TOURNAMENTS: { key: GrandSlamKey; label: string }[] = [
  { key: "ao", label: "Australian Open" },
  { key: "rg", label: "Roland Garros" },
  { key: "wimbledon", label: "Wimbledon" },
  { key: "usOpen", label: "US Open" },
];

const DID_NOT_PLAY: GrandSlamResultLabel = "Did not play";

const resultsByPlayer = grandSlamData.players as Record<
  string,
  Record<string, Partial<Record<GrandSlamKey, GrandSlamResultLabel>>>
>;

function getCalendarYearForAge(player: Player, age: number): string | null {
  const yearlyPoint = player.trajectoryYearly.find(
    (point) => Math.round(point.age) === age,
  );
  return yearlyPoint ? yearlyPoint.rankingDate.slice(0, 4) : null;
}

function buildSeasonResults(
  playerId: string,
  year: string,
): GrandSlamSeasonResults {
  const season = resultsByPlayer[playerId]?.[year] ?? {};

  return {
    year,
    ao: season.ao ?? DID_NOT_PLAY,
    rg: season.rg ?? DID_NOT_PLAY,
    wimbledon: season.wimbledon ?? DID_NOT_PLAY,
    usOpen: season.usOpen ?? DID_NOT_PLAY,
  };
}

export function getGrandSlamResultsAtAge(
  player: Player,
  age: number,
): GrandSlamSeasonResults | null {
  const year = getCalendarYearForAge(player, age);
  if (!year) return null;

  return buildSeasonResults(player.id, year);
}

export function buildGrandSlamPlayerCards(
  players: Player[],
  age: number,
): GrandSlamPlayerCard[] {
  return players.map((player) => {
    const year = getCalendarYearForAge(player, age);
    return {
      playerId: player.id,
      name: player.name,
      color: player.color,
      year,
      results: year ? buildSeasonResults(player.id, year) : null,
    };
  });
}

export { SNAPSHOT_AGES, type SnapshotAge };

export const DEFAULT_SNAPSHOT_AGE: SnapshotAge = 24;

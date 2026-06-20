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
  gsTitlesThisSeason: number;
}

export interface GrandSlamResultDisplay {
  shortLabel: string;
  className: string;
  showTrophy: boolean;
}

export interface GrandSlamCareerTotals {
  titles: number;
  finals: number;
}

export const GRAND_SLAM_TOURNAMENTS: { key: GrandSlamKey; label: string; shortLabel: string }[] = [
  { key: "ao", label: "Australian Open", shortLabel: "AO" },
  { key: "rg", label: "Roland Garros", shortLabel: "RG" },
  { key: "wimbledon", label: "Wimbledon", shortLabel: "Wimbledon" },
  { key: "usOpen", label: "US Open", shortLabel: "US Open" },
];

const DID_NOT_PLAY: GrandSlamResultLabel = "Did not play";

const resultsByPlayer = grandSlamData.players as Record<
  string,
  Record<string, Partial<Record<GrandSlamKey, GrandSlamResultLabel>>>
>;

export function formatGrandSlamResultShort(result: GrandSlamResultLabel): string {
  switch (result) {
    case "Winner":
      return "Winner";
    case "Runner-up":
      return "F";
    case "Semifinal":
      return "SF";
    case "Quarterfinal":
      return "QF";
    case "R16":
      return "R16";
    case "R32":
      return "R32";
    case "R64":
      return "R64";
    case "Did not play":
      return "DNP";
    default:
      return result;
  }
}

export function getGrandSlamResultDisplay(
  result: GrandSlamResultLabel,
): GrandSlamResultDisplay {
  switch (result) {
    case "Winner":
      return {
        shortLabel: "Winner",
        className: "bg-[#e8f8ec] text-[#1b7f3a] ring-1 ring-[#34c759]/25",
        showTrophy: true,
      };
    case "Runner-up":
      return {
        shortLabel: "F",
        className: "bg-[#e8f1ff] text-[#0a58ca] ring-1 ring-[#0071e3]/20",
        showTrophy: false,
      };
    case "Semifinal":
      return {
        shortLabel: "SF",
        className: "bg-[#fff4e5] text-[#c93400] ring-1 ring-[#ff9500]/25",
        showTrophy: false,
      };
    case "Quarterfinal":
      return {
        shortLabel: "QF",
        className: "bg-[#fffbe6] text-[#9a7600] ring-1 ring-[#ffcc00]/30",
        showTrophy: false,
      };
    case "R16":
    case "R32":
    case "R64":
      return {
        shortLabel: formatGrandSlamResultShort(result),
        className: "bg-[#f0f0f2] text-[#636366] ring-1 ring-black/[0.06]",
        showTrophy: false,
      };
    case "Did not play":
    default:
      return {
        shortLabel: "DNP",
        className: "bg-[#fafafa] text-[#aeaeb2] ring-1 ring-black/[0.04]",
        showTrophy: false,
      };
  }
}

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

export function countGrandSlamTitlesInSeason(
  results: GrandSlamSeasonResults | null,
): number {
  if (!results) return 0;

  return GRAND_SLAM_TOURNAMENTS.filter(
    (tournament) => results[tournament.key] === "Winner",
  ).length;
}

export function computeGrandSlamCareerTotals(
  playerId: string,
): GrandSlamCareerTotals {
  const seasons = resultsByPlayer[playerId] ?? {};
  let titles = 0;
  let finals = 0;

  for (const season of Object.values(seasons)) {
    for (const result of Object.values(season)) {
      if (result === "Winner") {
        titles += 1;
        finals += 1;
      } else if (result === "Runner-up") {
        finals += 1;
      }
    }
  }

  return { titles, finals };
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
    const results = year ? buildSeasonResults(player.id, year) : null;

    return {
      playerId: player.id,
      name: player.name,
      color: player.color,
      year,
      results,
      gsTitlesThisSeason: countGrandSlamTitlesInSeason(results),
    };
  });
}

export { SNAPSHOT_AGES, type SnapshotAge };

export const DEFAULT_SNAPSHOT_AGE: SnapshotAge = 24;

export function resolveDisplayAge(
  selectedAge: SnapshotAge,
  chartHoverAge: number | null,
): number {
  if (chartHoverAge != null) {
    return Math.round(chartHoverAge);
  }

  return selectedAge;
}

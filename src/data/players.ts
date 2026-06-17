import playerIndexData from "@/data/player-index.json";
import playersGenerated from "@/data/players.generated.json";

export interface RankingPoint {
  rankingDate: string;
  age: number;
  ranking: number;
  points: number | null;
}

export interface Player {
  id: string;
  atpPlayerId: string;
  name: string;
  shortName: string;
  birthDate: string;
  countryCode: string;
  color: string;
  trajectory: RankingPoint[];
}

export interface PlayerIndexEntry {
  atpPlayerId: string;
  name: string;
  nameFirst: string;
  nameLast: string;
  birthDate: string | null;
  countryCode: string;
  hand: string;
  hasRankingData: boolean;
  slug?: string;
  shortName?: string;
  color?: string;
}

export const PLAYER_INDEX: PlayerIndexEntry[] = playerIndexData as PlayerIndexEntry[];
export const PLAYERS: Player[] = playersGenerated as Player[];

export const PLAYER_IDS = PLAYERS.map((player) => player.id);

const playersById = new Map(PLAYERS.map((player) => [player.id, player]));
const playersByAtpId = new Map(PLAYERS.map((player) => [player.atpPlayerId, player]));
const indexByAtpId = new Map(PLAYER_INDEX.map((entry) => [entry.atpPlayerId, entry]));

export function getPlayerById(id: string): Player | undefined {
  return playersById.get(id);
}

export function getPlayerByAtpId(atpPlayerId: string): Player | undefined {
  return playersByAtpId.get(atpPlayerId);
}

export function getIndexEntryByAtpId(atpPlayerId: string): PlayerIndexEntry | undefined {
  return indexByAtpId.get(atpPlayerId);
}

export function searchPlayers(query: string, limit = 20): PlayerIndexEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: PlayerIndexEntry[] = [];
  for (const entry of PLAYER_INDEX) {
    const haystack = `${entry.name} ${entry.nameFirst} ${entry.nameLast} ${entry.countryCode}`.toLowerCase();
    if (haystack.includes(normalized)) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function formatBirthDate(birthDate: string | null): string {
  if (!birthDate) return "Unknown";
  const date = new Date(`${birthDate}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export interface ChartRow {
  age: number;
  [playerId: string]: number | null;
}

export function buildChartData(selectedPlayerIds: string[]): ChartRow[] {
  const selectedPlayers = PLAYERS.filter((player) => selectedPlayerIds.includes(player.id));
  const rows = new Map<number, ChartRow>();

  selectedPlayers.forEach((player) => {
    player.trajectory.forEach((point) => {
      if (!rows.has(point.age)) {
        rows.set(point.age, { age: point.age });
      }
      rows.get(point.age)![player.id] = point.ranking;
    });
  });

  return Array.from(rows.values()).sort((a, b) => a.age - b.age);
}

export function getAgeRange(selectedPlayerIds: string[]): [number, number] {
  const selectedPlayers = PLAYERS.filter((player) => selectedPlayerIds.includes(player.id));

  let minAge = Infinity;
  let maxAge = -Infinity;

  selectedPlayers.forEach((player) => {
    player.trajectory.forEach((point) => {
      minAge = Math.min(minAge, point.age);
      maxAge = Math.max(maxAge, point.age);
    });
  });

  return [minAge === Infinity ? 15 : minAge, maxAge === -Infinity ? 25 : maxAge];
}

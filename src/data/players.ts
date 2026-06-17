export interface RankingPoint {
  age: number;
  ranking: number;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  birthYear: number;
  color: string;
  trajectory: RankingPoint[];
}

export const PLAYERS: Player[] = [
  {
    id: "federer",
    name: "Roger Federer",
    shortName: "Federer",
    birthYear: 1981,
    color: "#0071E3",
    trajectory: [
      { age: 17, ranking: 803 },
      { age: 18, ranking: 301 },
      { age: 19, ranking: 64 },
      { age: 20, ranking: 29 },
      { age: 21, ranking: 6 },
      { age: 22, ranking: 2 },
      { age: 23, ranking: 1 },
      { age: 24, ranking: 1 },
      { age: 25, ranking: 1 },
      { age: 26, ranking: 1 },
      { age: 27, ranking: 1 },
      { age: 28, ranking: 2 },
      { age: 29, ranking: 1 },
      { age: 30, ranking: 3 },
      { age: 31, ranking: 2 },
      { age: 32, ranking: 6 },
      { age: 33, ranking: 2 },
      { age: 34, ranking: 3 },
      { age: 35, ranking: 16 },
      { age: 36, ranking: 2 },
      { age: 37, ranking: 3 },
      { age: 38, ranking: 4 },
      { age: 39, ranking: 16 },
      { age: 40, ranking: 103 },
      { age: 41, ranking: 47 },
    ],
  },
  {
    id: "nadal",
    name: "Rafael Nadal",
    shortName: "Nadal",
    birthYear: 1986,
    color: "#FF9500",
    trajectory: [
      { age: 15, ranking: 762 },
      { age: 16, ranking: 200 },
      { age: 17, ranking: 49 },
      { age: 18, ranking: 51 },
      { age: 19, ranking: 2 },
      { age: 20, ranking: 2 },
      { age: 21, ranking: 2 },
      { age: 22, ranking: 1 },
      { age: 23, ranking: 1 },
      { age: 24, ranking: 1 },
      { age: 25, ranking: 1 },
      { age: 26, ranking: 1 },
      { age: 27, ranking: 1 },
      { age: 28, ranking: 1 },
      { age: 29, ranking: 2 },
      { age: 30, ranking: 2 },
      { age: 31, ranking: 2 },
      { age: 32, ranking: 1 },
      { age: 33, ranking: 1 },
      { age: 34, ranking: 2 },
      { age: 35, ranking: 2 },
      { age: 36, ranking: 4 },
      { age: 37, ranking: 2 },
      { age: 38, ranking: 4 },
      { age: 39, ranking: 6 },
      { age: 40, ranking: 377 },
      { age: 41, ranking: 246 },
      { age: 42, ranking: 711 },
    ],
  },
  {
    id: "djokovic",
    name: "Novak Djokovic",
    shortName: "Djokovic",
    birthYear: 1987,
    color: "#34C759",
    trajectory: [
      { age: 16, ranking: 687 },
      { age: 17, ranking: 183 },
      { age: 18, ranking: 78 },
      { age: 19, ranking: 16 },
      { age: 20, ranking: 3 },
      { age: 21, ranking: 3 },
      { age: 22, ranking: 3 },
      { age: 23, ranking: 2 },
      { age: 24, ranking: 1 },
      { age: 25, ranking: 1 },
      { age: 26, ranking: 1 },
      { age: 27, ranking: 1 },
      { age: 28, ranking: 1 },
      { age: 29, ranking: 1 },
      { age: 30, ranking: 2 },
      { age: 31, ranking: 1 },
      { age: 32, ranking: 1 },
      { age: 33, ranking: 1 },
      { age: 34, ranking: 2 },
      { age: 35, ranking: 1 },
      { age: 36, ranking: 1 },
      { age: 37, ranking: 1 },
      { age: 38, ranking: 1 },
      { age: 39, ranking: 1 },
      { age: 40, ranking: 1 },
      { age: 41, ranking: 1 },
      { age: 42, ranking: 1 },
      { age: 43, ranking: 7 },
    ],
  },
  {
    id: "alcaraz",
    name: "Carlos Alcaraz",
    shortName: "Alcaraz",
    birthYear: 2003,
    color: "#AF52DE",
    trajectory: [
      { age: 15, ranking: 934 },
      { age: 16, ranking: 266 },
      { age: 17, ranking: 47 },
      { age: 18, ranking: 32 },
      { age: 19, ranking: 5 },
      { age: 20, ranking: 1 },
      { age: 21, ranking: 2 },
      { age: 22, ranking: 3 },
    ],
  },
  {
    id: "sinner",
    name: "Jannik Sinner",
    shortName: "Sinner",
    birthYear: 2001,
    color: "#FF2D55",
    trajectory: [
      { age: 16, ranking: 551 },
      { age: 17, ranking: 78 },
      { age: 18, ranking: 37 },
      { age: 19, ranking: 13 },
      { age: 20, ranking: 10 },
      { age: 21, ranking: 15 },
      { age: 22, ranking: 4 },
      { age: 23, ranking: 1 },
      { age: 24, ranking: 1 },
    ],
  },
];

export const PLAYER_IDS = PLAYERS.map((p) => p.id);

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function buildChartData(selectedPlayerIds: string[]) {
  const selectedPlayers = PLAYERS.filter((p) =>
    selectedPlayerIds.includes(p.id),
  );

  const allAges = new Set<number>();
  selectedPlayers.forEach((player) => {
    player.trajectory.forEach((point) => allAges.add(point.age));
  });

  const sortedAges = Array.from(allAges).sort((a, b) => a - b);

  return sortedAges.map((age) => {
    const row: Record<string, number | null> = { age };
    selectedPlayers.forEach((player) => {
      const point = player.trajectory.find((p) => p.age === age);
      row[player.id] = point ? point.ranking : null;
    });
    return row;
  });
}

export function getAgeRange(selectedPlayerIds: string[]): [number, number] {
  const selectedPlayers = PLAYERS.filter((p) =>
    selectedPlayerIds.includes(p.id),
  );

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

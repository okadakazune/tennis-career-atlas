import type { PlayerIndexEntry } from "@/data/players";

const PLAYER_INDEX_URL = "/data/player-index.json";

let loadPromise: Promise<PlayerIndexEntry[]> | null = null;
let cachedIndex: PlayerIndexEntry[] | null = null;

export function loadPlayerSearchIndex(): Promise<PlayerIndexEntry[]> {
  if (cachedIndex) {
    return Promise.resolve(cachedIndex);
  }

  if (!loadPromise) {
    loadPromise = fetch(PLAYER_INDEX_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load player index (${response.status})`);
        }
        return response.json() as Promise<PlayerIndexEntry[]>;
      })
      .then((index) => {
        cachedIndex = index;
        return index;
      })
      .catch((error) => {
        loadPromise = null;
        throw error;
      });
  }

  return loadPromise;
}

export function searchPlayerIndex(
  index: PlayerIndexEntry[],
  query: string,
  limit = 20,
): PlayerIndexEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: PlayerIndexEntry[] = [];
  for (const entry of index) {
    const haystack =
      `${entry.name} ${entry.nameFirst} ${entry.nameLast} ${entry.countryCode}`.toLowerCase();
    if (haystack.includes(normalized)) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }

  return results;
}

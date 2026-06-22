const API_BASE = "https://api.balldontlie.io/atp/v1";
const MIN_INTERVAL_MS = 12_500;

let lastRequestAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestAt = Date.now();
}

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url;
}

export async function bdlFetch(endpoint, params, apiKey) {
  await throttle();
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`BallDontLie ${response.status} ${endpoint}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

export async function searchPlayer(apiKey, query) {
  const payload = await bdlFetch("/players", { search: query, per_page: 25 }, apiKey);
  return payload.data ?? [];
}

export async function fetchRankingsForDate(apiKey, date, balldontliePlayerIds) {
  if (balldontliePlayerIds.length === 0) return [];

  const params = {
    date,
    per_page: 100,
    "player_ids[]": balldontliePlayerIds,
  };

  const payload = await bdlFetch("/rankings", params, apiKey);
  return payload.data ?? [];
}

export function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pickBestPlayerMatch(candidates, firstName, lastName) {
  const target = normalizeName(`${firstName} ${lastName}`);
  const targetLast = normalizeName(lastName);

  let best = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const full = normalizeName(candidate.full_name ?? `${candidate.first_name} ${candidate.last_name}`);
    let score = 0;
    if (full === target) score = 100;
    else if (full.includes(target) || target.includes(full)) score = 80;
    else if (normalizeName(candidate.last_name) === targetLast) score = 60;
    else if (full.split(" ").at(-1) === targetLast) score = 50;

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return bestScore >= 50 ? best : null;
}

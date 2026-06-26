# data/latest — BallDontLie weekly ranking deltas (2025+)

Phase 2+ incremental rankings. Each week is one JSON file under `rankings/`.

## File format (`rankings/YYYY-MM-DD.json`)

```json
[
  {
    "playerId": "207989",
    "date": "2025-01-06",
    "rank": 2,
    "points": 9855,
    "source": "balldontlie"
  }
]
```

- `playerId` — Sackmann `atpPlayerId` (see `scripts/config/featured-players.json`)
- BallDontLie API ids are mapped in `scripts/config/player-id-map.json` (fetch only; not stored in delta files)

## Setup

Create `.env.local` in the project root (see `.env.example`):

```bash
BALLDONTLIE_API_KEY=your_key_here
```

The fetch script loads `.env.local` automatically; shell env vars take precedence.

## Commands

```bash
npm run data:update-latest
npm run data:build
```

Fetch failures warn and exit 0; build continues with archive data only.

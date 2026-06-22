Subject: Clarification on static storage of ATP rankings for Tennis Career Atlas (non-commercial visualization)

Hello BallDontLie team,

I am building Tennis Career Atlas, a non-commercial web visualization that compares ATP players' ranking trajectories by age (weekly / monthly / yearly charts and career summaries). I plan to use your ATP Rankings endpoint on the Free tier.

Before implementing, I would like to confirm that our intended use complies with Section 7 (Data Usage Restrictions) of your Terms of Service, especially 7(d) on caching and storage.

**Planned use**

- Fetch weekly ATP singles rankings via `GET /atp/v1/rankings` with `date` and `player_ids[]` filters (approximately 15 featured players, not the full Top 500).
- Run a scheduled job once per week (e.g. GitHub Actions or Vercel Cron).
- Persist only minimal derived fields per player per week:
  `{ playerId, date, rank, points }`
- Merge these deltas into our existing static site build (Next.js). Historical rankings through 2024 come from a frozen Jeff Sackmann CSV archive already in our repository; BallDontLie data would cover 2025 onward only.
- Display rankings in charts on our website with clear attribution to BallDontLie and a disclaimer that the data is unofficial aggregated data, not official ATP statistics.

**We would NOT**

- Store or publish raw API JSON responses.
- Resell, sublicense, or redistribute API access or data as a standalone dataset.
- Present the data as official ATP/league statistics or imply ATP endorsement.
- Build a competing sports-data API or database product.
- Bulk-download full Top 500 historical archives for open redistribution.

**Questions**

1. Does storing the minimal `{ playerId, date, rank, points }` records in our private repository and serving the merged results through our public website fall within "reasonable application needs" under Section 7(d), or would written consent be required?

2. If the generated JSON is committed to a public GitHub repository (still containing only the four fields above for ~15 players), would that be considered redistribution beyond reasonable application needs?

3. Is the Free tier acceptable for this non-commercial, low-volume use (~1 API request per week plus occasional backfill), or is a paid tier (ALL-STAR / GOAT) required?

4. Are there specific attribution or disclaimer requirements beyond not presenting the data as official league statistics (Section 7(b)–(c))?

5. Are there any restrictions we should be aware of regarding CC BY-NC-SA historical data (Jeff Sackmann / Tennis Abstract) combined with BallDontLie data in the same visualization?

Thank you for your guidance. I will wait for your response before enabling the live integration.

Best regards,
[Your name]
Tennis Career Atlas
[Project URL]

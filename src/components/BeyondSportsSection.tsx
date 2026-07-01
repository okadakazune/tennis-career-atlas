"use client";

import { COMING_SOON_SPORTS } from "@/data/sports/registry";
import { getLegendsBySport } from "@/data/sports/legends";
import type { SportId } from "@/data/sports/types";

export function BeyondSportsSection() {
  return (
    <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#86868b]">
          Beyond Tennis
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1d1d1f] sm:text-3xl">
          The Sports Battle Engine is just getting started
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#86868b] sm:text-base">
          Tennis is live today. Football, basketball, F1, boxing, and more are
          on deck — built on the same battle categories and age-based comparisons.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMING_SOON_SPORTS.map((sport) => {
          const legends = getLegendsBySport(sport.id as SportId);

          return (
            <article
              key={sport.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl" aria-hidden="true">
                    {sport.emoji}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1d1d1f]">
                    {sport.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
                    {sport.tagline}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f5f5f7] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
                  Coming Soon
                </span>
              </div>

              {legends.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {legends.slice(0, 4).map((legend) => (
                    <li
                      key={legend.id}
                      className="rounded-full bg-[#fafafa] px-2 py-1 text-[11px] font-medium text-[#1d1d1f]"
                    >
                      {legend.shortName}
                    </li>
                  ))}
                  {legends.length > 4 ? (
                    <li className="rounded-full bg-[#fafafa] px-2 py-1 text-[11px] font-medium text-[#86868b]">
                      +{legends.length - 4}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

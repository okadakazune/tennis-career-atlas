"use client";

import { useEffect, useMemo, useState } from "react";
import type { CompareDashboardTab } from "@/components/CompareTabNav";
import {
  buildComparisonFacts,
  generateRuleBasedInsightForFacts,
  hasEnoughComparisonData,
} from "@/data/comparison-facts";
import {
  buildInsightCacheKey,
  getCachedInsight,
  setCachedInsight,
} from "@/lib/insight-cache";
import { Player, TrajectoryGranularity, YearlyMetric } from "@/data/players";

interface CareerInsightsCardProps {
  players: Player[];
  displayAge: number;
  activeTab: CompareDashboardTab;
  yearlyMetric?: YearlyMetric;
  granularity?: TrajectoryGranularity;
}

type InsightSource = "ai" | "rule-based" | "none";

export function CareerInsightsCard({
  players,
  displayAge,
  activeTab,
  yearlyMetric,
  granularity,
}: CareerInsightsCardProps) {
  const facts = useMemo(
    () =>
      buildComparisonFacts(players, displayAge, activeTab, {
        yearlyMetric,
        granularity,
      }),
    [players, displayAge, activeTab, yearlyMetric, granularity],
  );

  const cacheKey = useMemo(() => buildInsightCacheKey(facts), [facts]);

  const fallbackInsight = useMemo(
    () => generateRuleBasedInsightForFacts(facts, players),
    [facts, players],
  );

  const [insight, setInsight] = useState<string | null>(null);
  const [source, setSource] = useState<InsightSource>("none");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (players.length < 2) {
      setInsight(null);
      setSource("none");
      setIsLoading(false);
      return;
    }

    const cached = getCachedInsight(cacheKey);
    if (cached) {
      setInsight(cached);
      setSource("ai");
      setIsLoading(false);
      return;
    }

    if (!hasEnoughComparisonData(facts)) {
      setInsight(fallbackInsight);
      setSource(fallbackInsight ? "rule-based" : "none");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setIsLoading(true);
    setInsight(null);
    setSource("none");

    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facts),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Insight request failed");
        }
        return response.json() as Promise<{ insight?: string }>;
      })
      .then((data) => {
        if (cancelled) return;

        if (data.insight) {
          setCachedInsight(cacheKey, data.insight);
          setInsight(data.insight);
          setSource("ai");
          return;
        }

        throw new Error("Empty insight");
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }

        setInsight(fallbackInsight);
        setSource(fallbackInsight ? "rule-based" : "none");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cacheKey, facts, fallbackInsight, players.length]);

  if (players.length < 2) return null;

  return (
    <section
      aria-label="Career insights"
      className="rounded-xl border border-[#0071e3]/15 bg-[#f0f7ff] px-4 py-3"
    >
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[#0071e3]">
          Career Insights
        </h2>
        {source === "ai" ? (
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-[#0071e3]">
            AI
          </span>
        ) : source === "rule-based" ? (
          <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-[#86868b]">
            Rule-based
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm leading-relaxed text-[#86868b]" aria-live="polite">
          Generating insight…
        </p>
      ) : insight ? (
        <p className="text-sm leading-relaxed text-[#1d1d1f]">{insight}</p>
      ) : (
        <p className="text-sm leading-relaxed text-[#86868b]">
          Not enough data for a comparison insight at age {displayAge}.
        </p>
      )}
    </section>
  );
}

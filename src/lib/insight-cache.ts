import type { ComparisonFacts } from "@/data/comparison-facts";

const insightCache = new Map<string, string>();

export function buildInsightCacheKey(facts: ComparisonFacts): string {
  return JSON.stringify(facts);
}

export function getCachedInsight(cacheKey: string): string | undefined {
  return insightCache.get(cacheKey);
}

export function setCachedInsight(cacheKey: string, insight: string): void {
  insightCache.set(cacheKey, insight);
}

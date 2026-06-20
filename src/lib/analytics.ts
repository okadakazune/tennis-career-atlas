import { track } from "@vercel/analytics";

/**
 * Future custom event names (not wired up yet):
 * - "Player Selected"
 * - "Compare Preset Clicked"
 * - "GS Section Viewed"
 */
export type AnalyticsEventName =
  | "Player Selected"
  | "Compare Preset Clicked"
  | "GS Section Viewed";

export type AnalyticsEventProperties = Record<
  string,
  string | number | boolean | null
>;

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties?: AnalyticsEventProperties,
) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  track(name, properties);
}

"use client";

import { Analytics } from "@vercel/analytics/next";

export function VercelAnalytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return <Analytics />;
}

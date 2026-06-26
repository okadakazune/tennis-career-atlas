"use client";

import {
  GrandSlamResultLabel,
  getGrandSlamResultDisplay,
} from "@/data/grand-slam";

interface GrandSlamResultBadgeProps {
  result: GrandSlamResultLabel;
  compact?: boolean;
}

function isEarlyRound(result: GrandSlamResultLabel): boolean {
  return (
    result === "R16" ||
    result === "R32" ||
    result === "R64" ||
    result === "R128" ||
    result === "Did not play"
  );
}

export function GrandSlamResultBadge({
  result,
  compact = false,
}: GrandSlamResultBadgeProps) {
  const display = getGrandSlamResultDisplay(result);
  const earlyRound = isEarlyRound(result);

  if (result === "Did not play") {
    return (
      <span className="text-[10px] font-medium text-[#c7c7cc]">—</span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${display.className} ${
        earlyRound
          ? "px-1 py-0 text-[10px] leading-4 opacity-80"
          : compact
            ? "px-1.5 py-0.5 text-[11px] leading-4"
            : "px-2 py-0.5 text-xs"
      }`}
    >
      {display.showTrophy ? (
        <span aria-label="Winner">🏆</span>
      ) : (
        display.shortLabel
      )}
    </span>
  );
}

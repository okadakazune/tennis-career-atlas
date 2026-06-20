"use client";

import { SNAPSHOT_AGES, SnapshotAge } from "@/data/career-stats";

interface AgeSelectorProps {
  displayAge: number;
  onAgeChange: (age: SnapshotAge) => void;
  isSyncedFromChart?: boolean;
  ariaLabel?: string;
}

export function AgeSelector({
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
  ariaLabel = "Select age",
}: AgeSelectorProps) {
  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div
        className="inline-flex flex-wrap gap-1 rounded-full bg-[#f5f5f7] p-1"
        role="group"
        aria-label={ariaLabel}
      >
        {SNAPSHOT_AGES.map((age) => {
          const isActive = displayAge === age;
          return (
            <button
              key={age}
              type="button"
              onClick={() => onAgeChange(age)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-white text-[#1d1d1f] shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              {age}
            </button>
          );
        })}
      </div>

      <p className="text-sm font-medium text-[#1d1d1f]">
        Age {displayAge}
        {isSyncedFromChart ? (
          <span className="ml-2 text-xs font-normal text-[#0071e3]">
            synced from chart
          </span>
        ) : null}
      </p>
    </div>
  );
}

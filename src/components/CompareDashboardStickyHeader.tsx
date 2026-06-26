"use client";

import { AgeSelector } from "@/components/AgeSelector";
import {
  CompareDashboardTab,
  CompareTabNav,
} from "@/components/CompareTabNav";

interface CompareDashboardStickyHeaderProps {
  activeTab: CompareDashboardTab;
  onTabChange: (tab: CompareDashboardTab) => void;
  ages: number[];
  displayAge: number;
  onAgeChange: (age: number) => void;
  isSyncedFromChart?: boolean;
}

export function CompareDashboardStickyHeader({
  activeTab,
  onTabChange,
  ages,
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
}: CompareDashboardStickyHeaderProps) {
  return (
    <div className="sticky top-0 z-40 -mx-4 mb-2 px-4 sm:-mx-0 sm:px-0">
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/85">
        <CompareTabNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          embedded
        />
        <div className="border-t border-black/[0.05] px-3 py-3 sm:px-4">
          <AgeSelector
            ages={ages}
            displayAge={displayAge}
            onAgeChange={onAgeChange}
            isSyncedFromChart={isSyncedFromChart}
            ariaLabel="Select comparison age"
            compact
          />
        </div>
      </div>
    </div>
  );
}

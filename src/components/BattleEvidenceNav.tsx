"use client";

import {
  COMPARE_DASHBOARD_TABS,
  CompareDashboardTab,
} from "@/components/CompareTabNav";

interface BattleEvidenceNavProps {
  activeTab: CompareDashboardTab;
  onTabChange: (tab: CompareDashboardTab) => void;
}

export function BattleEvidenceNav({
  activeTab,
  onTabChange,
}: BattleEvidenceNavProps) {
  return (
    <nav aria-label="Explore the evidence" className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4">
      <p className="mb-3 text-sm font-semibold text-[#1d1d1f]">
        Explore the evidence:
      </p>
      <div className="flex flex-wrap gap-2">
        {COMPARE_DASHBOARD_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`ui-transition rounded-full px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-[#1d1d1f] text-white shadow-sm"
                  : "bg-white text-[#1d1d1f] ring-1 ring-black/[0.08] hover:bg-[#f5f5f7]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

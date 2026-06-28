"use client";

export type CompareDashboardTab =
  | "career"
  | "stats"
  | "age"
  | "grand-slam"
  | "goat"
  | "no1";

export const COMPARE_DASHBOARD_TABS: {
  id: CompareDashboardTab;
  label: string;
}[] = [
  { id: "career", label: "Ranking" },
  { id: "stats", label: "Stats" },
  { id: "age", label: "Age" },
  { id: "grand-slam", label: "Grand Slam" },
  { id: "goat", label: "GOAT" },
  { id: "no1", label: "No.1" },
];

interface CompareTabNavProps {
  activeTab: CompareDashboardTab;
  onTabChange: (tab: CompareDashboardTab) => void;
  embedded?: boolean;
}

export function CompareTabNav({
  activeTab,
  onTabChange,
  embedded = false,
}: CompareTabNavProps) {
  return (
    <nav
      aria-label="Compare dashboard views"
      className={embedded ? "" : "border-b border-black/[0.08]"}
    >
      <div
        role="tablist"
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {COMPARE_DASHBOARD_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`compare-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`compare-panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`ui-transition shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium ${
                isActive
                  ? "border-b-2 border-[#1d1d1f] text-[#1d1d1f]"
                  : "border-b-2 border-transparent text-[#86868b] hover:text-[#1d1d1f]"
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

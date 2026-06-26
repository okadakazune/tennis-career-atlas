"use client";

interface AgeSelectorProps {
  ages: number[];
  displayAge: number;
  onAgeChange: (age: number) => void;
  isSyncedFromChart?: boolean;
  ariaLabel?: string;
}

export function AgeSelector({
  ages,
  displayAge,
  onAgeChange,
  isSyncedFromChart = false,
  ariaLabel = "Select age",
}: AgeSelectorProps) {
  if (ages.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="w-full max-w-full overflow-x-auto pb-1">
        <div
          className="inline-flex min-w-max gap-1 rounded-full bg-[#f5f5f7] p-1"
          role="group"
          aria-label={ariaLabel}
        >
          {ages.map((age) => {
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

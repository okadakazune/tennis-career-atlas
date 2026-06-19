"use client";

import { COMPARISON_PRESETS } from "@/data/comparison-presets";

interface ComparisonPresetsProps {
  onApplyPreset: (playerIds: string[]) => void;
  onClear: () => void;
}

export function ComparisonPresets({
  onApplyPreset,
  onClear,
}: ComparisonPresetsProps) {
  return (
    <div className="mb-5 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
        Quick compare
      </p>
      <div className="flex flex-wrap gap-2">
        {COMPARISON_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset.playerIds)}
            className="rounded-full border border-black/[0.08] bg-[#fafafa] px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:border-black/[0.12] hover:bg-white"
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-medium text-[#86868b] transition-colors hover:border-black/[0.12] hover:text-[#1d1d1f]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

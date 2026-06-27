"use client";

import { useMemo } from "react";
import {
  COMPARISON_PRESET_CATEGORIES,
  findActivePresetId,
  presetMatchesSelection,
} from "@/data/comparison-presets";

interface ComparisonPresetsProps {
  selectedIds: string[];
  onApplyPreset: (playerIds: string[]) => void;
}

function PresetChip({
  label,
  description,
  isActive,
  onClick,
}: {
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={description}
      aria-pressed={isActive}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
        isActive
          ? "border-transparent bg-[#1d1d1f] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          : "border-black/[0.08] bg-[#fafafa] text-[#1d1d1f] hover:border-black/[0.12] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function PresetCategorySection({
  categoryId,
  label,
  presets,
  selectedIds,
  activePresetId,
  onApplyPreset,
}: {
  categoryId: string;
  label: string;
  presets: (typeof COMPARISON_PRESET_CATEGORIES)[number]["presets"];
  selectedIds: string[];
  activePresetId: string | null;
  onApplyPreset: (playerIds: string[]) => void;
}) {
  const hasActivePreset = presets.some((preset) => preset.id === activePresetId);
  const defaultOpen =
    categoryId === "legendary-rivalries" || hasActivePreset;

  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-black/[0.05] bg-[#fafafa]/60"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#86868b] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <span className="text-[10px] font-medium normal-case tracking-normal text-[#aeaeb2] group-open:hidden">
          Show
        </span>
        <span className="hidden text-[10px] font-medium normal-case tracking-normal text-[#aeaeb2] group-open:inline">
          Hide
        </span>
      </summary>
      <div className="border-t border-black/[0.04] px-3 pb-3 pt-2">
        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [scrollbar-width:thin]">
          <div className="flex w-max min-w-full gap-2 sm:w-auto sm:flex-wrap">
            {presets.map((preset) => (
              <PresetChip
                key={preset.id}
                label={preset.label}
                description={preset.description}
                isActive={presetMatchesSelection(preset.playerIds, selectedIds)}
                onClick={() => onApplyPreset(preset.playerIds)}
              />
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

export function ComparisonPresets({
  selectedIds,
  onApplyPreset,
}: ComparisonPresetsProps) {
  const activePresetId = useMemo(
    () => findActivePresetId(selectedIds),
    [selectedIds],
  );

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
          Compare presets
        </p>
        <p className="text-[11px] text-[#aeaeb2]">
          Tap a preset to replace the current selection
        </p>
      </div>
      <div className="space-y-2">
        {COMPARISON_PRESET_CATEGORIES.map((category) => (
          <PresetCategorySection
            key={category.id}
            categoryId={category.id}
            label={category.label}
            presets={category.presets}
            selectedIds={selectedIds}
            activePresetId={activePresetId}
            onApplyPreset={onApplyPreset}
          />
        ))}
      </div>
    </div>
  );
}

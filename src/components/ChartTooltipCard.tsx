"use client";

import { ReactNode } from "react";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface ChartTooltipCardProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
}

export function ChartTooltipCard({
  active,
  children,
  className = "",
}: ChartTooltipCardProps) {
  if (!active) return null;

  return (
    <div
      className={`chart-tooltip-card max-w-[min(calc(100vw-2rem),340px)] rounded-2xl border border-black/[0.06] bg-white/95 px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

interface TooltipStatRowProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

export function TooltipStatRow({
  label,
  value,
  highlight = false,
}: TooltipStatRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[#86868b]">{label}</span>
      <span
        className={`tabular-nums ${highlight ? "font-semibold text-[#1d1d1f]" : "font-medium text-[#1d1d1f]"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function TooltipPlayerHeader({
  name,
  subtitle,
  color,
  imageUrl,
  imagePosition,
}: {
  name: string;
  subtitle?: string;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3 border-b border-black/[0.06] pb-3">
      <PlayerAvatar
        name={name}
        color={color}
        imageUrl={imageUrl}
        imagePosition={imagePosition}
        size="tooltip"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#1d1d1f]">{name}</p>
        {subtitle ? (
          <p className="truncate text-xs text-[#86868b]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

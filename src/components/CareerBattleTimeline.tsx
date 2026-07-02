"use client";

import { useRef, useState } from "react";
import type { BattleCategoryResult, BattleSide } from "@/data/battle-score";
import type { BattleTimelineData, BattleTimelinePoint } from "@/data/battle-timeline";

interface CareerBattleTimelineProps {
  timeline: BattleTimelineData;
  displayAge: number;
  onAgeSelect: (age: number) => void;
}

const TIE_COLOR = "#c7c7cc";
const DOT_ANIMATION_MS = 45;

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getLeaderColor(
  leader: BattleSide | "tie" | null,
  playerAColor: string,
  playerBColor: string,
): string {
  if (leader === "a") return playerAColor;
  if (leader === "b") return playerBColor;
  return TIE_COLOR;
}

function getCategoryLists(
  point: BattleTimelinePoint,
  playerAShortName: string,
  playerBShortName: string,
  leader: BattleSide | "tie" | null,
) {
  const winning: BattleCategoryResult[] = [];
  const losing: BattleCategoryResult[] = [];

  for (const category of point.categories) {
    if (category.outcome === "excluded") continue;

    if (leader === "a" && category.outcome === "a") {
      winning.push(category);
    } else if (leader === "b" && category.outcome === "b") {
      winning.push(category);
    } else if (leader === "a" && category.outcome === "b") {
      losing.push(category);
    } else if (leader === "b" && category.outcome === "a") {
      losing.push(category);
    }
  }

  return { winning, losing, playerAShortName, playerBShortName };
}

function TimelineHoverCard({
  point,
  timeline,
}: {
  point: BattleTimelinePoint;
  timeline: BattleTimelineData;
}) {
  const { winning, losing } = getCategoryLists(
    point,
    timeline.playerA.shortName,
    timeline.playerB.shortName,
    point.leader,
  );

  const leaderName =
    point.leader === "a"
      ? timeline.playerA.shortName
      : point.leader === "b"
        ? timeline.playerB.shortName
        : "Even";

  return (
    <div className="chart-tooltip-card pointer-events-none w-56 rounded-xl border border-black/[0.08] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.16)] sm:w-64">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
        Age {point.age}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-[#1d1d1f]">
        {timeline.playerA.shortName} {formatScore(point.scoreA)}
        <span className="mx-1.5 font-normal text-[#c7c7cc]">·</span>
        {timeline.playerB.shortName} {formatScore(point.scoreB)}
      </p>
      <p className="mt-1 text-xs font-medium text-[#86868b]">Leader: {leaderName}</p>
      {point.isLeadChange ? (
        <p className="mt-1 text-xs font-medium text-[#ff7a00]">⚡ Lead changed here</p>
      ) : null}

      {winning.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
            Winning Categories
          </p>
          <ul className="mt-1 space-y-0.5">
            {winning.slice(0, 4).map((category) => (
              <li
                key={category.id}
                className="text-xs text-[#1d1d1f]"
              >
                ✓ {category.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {losing.length > 0 ? (
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">
            Losing
          </p>
          <ul className="mt-1 space-y-0.5">
            {losing.slice(0, 3).map((category) => (
              <li
                key={category.id}
                className="text-xs text-[#86868b]"
              >
                {category.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

interface TimelineTooltipState {
  point: BattleTimelinePoint;
  x: number;
  y: number;
}

export function CareerBattleTimeline({
  timeline,
  displayAge,
  onAgeSelect,
}: CareerBattleTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TimelineTooltipState | null>(null);

  if (timeline.points.length === 0) {
    return null;
  }

  function showTooltip(button: HTMLButtonElement, point: BattleTimelinePoint) {
    const track = trackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    setTooltip({
      point,
      x: buttonRect.left + buttonRect.width / 2 - trackRect.left,
      y: buttonRect.bottom - trackRect.top + 10,
    });
    setHoveredAge(point.age);
  }

  function hideTooltip() {
    setTooltip(null);
    setHoveredAge(null);
  }

  return (
    <div className="border-b border-black/[0.06] px-5 py-5 sm:px-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
          Age Timeline
        </h3>
        <p className="mt-1 text-sm text-[#86868b]">
          Explore how the Age Battle shifts over time. Click an age to update
          the Age Battle, categories, and story below.
        </p>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-[#86868b]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: timeline.playerA.color }}
          />
          {timeline.playerA.shortName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: timeline.playerB.color }}
          />
          {timeline.playerB.shortName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TIE_COLOR }}
          />
          Tie
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="text-[#ff7a00]">
            ⚡
          </span>
          Lead change
        </span>
      </div>

      <div
        ref={trackRef}
        className={`relative -mx-1 pt-2 transition-[padding] ${tooltip ? "pb-44" : "pb-2"}`}
        onMouseLeave={hideTooltip}
      >
        <div
          className="overflow-x-auto pb-4 [scrollbar-width:thin]"
          onScroll={hideTooltip}
        >
          <div className="relative flex min-w-max items-end px-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[18px] left-2 right-2 h-px bg-black/[0.06]"
            />

            {timeline.points.map((point, index) => {
              const color = getLeaderColor(
                point.leader,
                timeline.playerA.color,
                timeline.playerB.color,
              );
              const isActive = point.age === displayAge;
              const isHovered = hoveredAge === point.age;
              const animationDelayMs = index * DOT_ANIMATION_MS;

              return (
                <div
                  key={point.age}
                  className={`relative flex w-10 shrink-0 flex-col items-center sm:w-11 ${
                    isHovered ? "z-10" : "z-0"
                  }`}
                >
                  <div className="relative mb-2 flex h-4 w-full items-end justify-center">
                    {point.isLeadChange ? (
                      <span
                        className="battle-timeline-lead-label absolute -top-0.5 text-[11px] leading-none text-[#ff7a00]"
                        style={{ animationDelay: `${animationDelayMs + 120}ms` }}
                        title={`Lead change at age ${point.age}`}
                        aria-label={`Lead change at age ${point.age}`}
                      >
                        ⚡
                      </span>
                    ) : null}
                    <span
                      className={`text-[10px] font-medium tabular-nums ${
                        isActive
                          ? "font-bold text-[#1d1d1f]"
                          : "text-[#86868b]"
                      }`}
                    >
                      {point.age}
                    </span>
                  </div>

                  <div className="relative flex h-11 items-center justify-center">
                    <button
                      type="button"
                      aria-label={`Select age ${point.age}: ${
                        point.leader === "a"
                          ? timeline.playerA.shortName
                          : point.leader === "b"
                            ? timeline.playerB.shortName
                            : "Tie"
                      } leads ${formatScore(point.scoreA)} to ${formatScore(point.scoreB)}`}
                      aria-pressed={isActive}
                      aria-describedby={
                        isHovered ? `timeline-tooltip-${point.age}` : undefined
                      }
                      className={`battle-timeline-dot ui-transition cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 ${
                        point.isLeadChange ? "battle-timeline-lead-dot" : ""
                      } ${
                        isActive
                          ? "scale-125 ring-2 ring-[#1d1d1f] ring-offset-2 shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
                          : "ring-2 ring-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:scale-110 hover:ring-[#0071e3]/35 hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)]"
                      }`}
                      style={{
                        backgroundColor: color,
                        width: point.isLeadChange ? 16 : 14,
                        height: point.isLeadChange ? 16 : 14,
                        animationDelay: `${animationDelayMs}ms`,
                        boxShadow: point.isLeadChange
                          ? isActive
                            ? `0 0 0 4px ${color}55`
                            : `0 0 0 3px ${color}33`
                          : undefined,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAgeSelect(point.age);
                      }}
                      onMouseEnter={(event) =>
                        showTooltip(event.currentTarget, point)
                      }
                      onFocus={(event) =>
                        showTooltip(event.currentTarget, point)
                      }
                      onBlur={hideTooltip}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {tooltip ? (
          <div
            id={`timeline-tooltip-${tooltip.point.age}`}
            role="tooltip"
            className="pointer-events-none absolute z-[200]"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translateX(-50%)",
            }}
          >
            <TimelineHoverCard point={tooltip.point} timeline={timeline} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

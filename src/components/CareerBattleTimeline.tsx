"use client";

import { useMemo, useState } from "react";
import type { BattleCategoryResult, BattleSide } from "@/data/battle-score";
import type { BattleTimelineData, BattleTimelinePoint } from "@/data/battle-timeline";
import { generateBattleStory } from "@/data/battle-story";

interface CareerBattleTimelineProps {
  timeline: BattleTimelineData;
  displayAge: number;
  overallWinner: BattleSide | "tie" | null;
}

const TIE_COLOR = "#c7c7cc";
const DOT_ANIMATION_MS = 45;
const STORY_DELAY_MS = 400;

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
    <div className="chart-tooltip-card absolute bottom-full left-1/2 z-20 mb-3 w-56 -translate-x-1/2 rounded-xl border border-black/[0.08] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:w-64">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
        Age {point.age}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-[#1d1d1f]">
        {timeline.playerA.shortName} {formatScore(point.scoreA)}
        <span className="mx-1.5 font-normal text-[#c7c7cc]">·</span>
        {timeline.playerB.shortName} {formatScore(point.scoreB)}
      </p>
      <p className="mt-1 text-xs font-medium text-[#86868b]">Leader: {leaderName}</p>

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

export function CareerBattleTimeline({
  timeline,
  displayAge,
  overallWinner,
}: CareerBattleTimelineProps) {
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  const story = useMemo(
    () => generateBattleStory({ timeline, displayAge, overallWinner }),
    [timeline, displayAge, overallWinner],
  );

  const storyDelayMs =
    timeline.points.length * DOT_ANIMATION_MS + STORY_DELAY_MS;

  if (timeline.points.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-black/[0.06] px-5 py-5 sm:px-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">
          Career Battle Timeline
        </h3>
        <p className="mt-1 text-sm text-[#86868b]">
          Who was ahead at each stage of their career?
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
      </div>

      <div className="relative -mx-1 overflow-x-auto pb-6 pt-2 [scrollbar-width:thin]">
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
                className="relative flex w-10 shrink-0 flex-col items-center sm:w-11"
                onMouseEnter={() => setHoveredAge(point.age)}
                onMouseLeave={() => setHoveredAge(null)}
                onFocus={() => setHoveredAge(point.age)}
                onBlur={() => setHoveredAge(null)}
              >
                {point.isLeadChange ? (
                  <div
                    className="battle-timeline-lead-label mb-2 flex flex-col items-center"
                    style={{ animationDelay: `${animationDelayMs + 120}ms` }}
                  >
                    <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-[#ff7a00] sm:text-[10px]">
                      ⚡ Lead changes
                    </span>
                    <span className="mt-0.5 text-[10px] font-medium tabular-nums text-[#86868b]">
                      Age {point.age}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 h-6 w-px bg-[#ff7a00]/40"
                    />
                  </div>
                ) : (
                  <span className="mb-2 text-[10px] font-medium tabular-nums text-[#86868b]">
                    {point.age}
                  </span>
                )}

                <div className="relative flex h-10 items-center justify-center">
                  {isHovered ? (
                    <TimelineHoverCard point={point} timeline={timeline} />
                  ) : null}

                  <button
                    type="button"
                    aria-label={`Age ${point.age}: ${
                      point.leader === "a"
                        ? timeline.playerA.shortName
                        : point.leader === "b"
                          ? timeline.playerB.shortName
                          : "Tie"
                    } leads ${formatScore(point.scoreA)} to ${formatScore(point.scoreB)}`}
                    className={`battle-timeline-dot relative rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 ${
                      point.isLeadChange ? "battle-timeline-lead-dot" : ""
                    } ${isActive ? "ring-2 ring-[#1d1d1f] ring-offset-2" : ""}`}
                    style={{
                      backgroundColor: color,
                      width: point.isLeadChange ? 16 : 12,
                      height: point.isLeadChange ? 16 : 12,
                      animationDelay: `${animationDelayMs}ms`,
                      boxShadow: point.isLeadChange
                        ? `0 0 0 4px ${color}33`
                        : undefined,
                    }}
                  />
                </div>

                {point.isLeadChange ? (
                  <span className="mt-1 text-[10px] font-medium tabular-nums text-[#86868b]">
                    {point.age}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {story ? (
        <p
          className="battle-timeline-story mt-2 text-sm leading-relaxed text-[#1d1d1f]"
          style={{ animationDelay: `${storyDelayMs}ms` }}
        >
          {story}
        </p>
      ) : null}
    </div>
  );
}

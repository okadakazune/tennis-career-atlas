"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Player,
  TrajectoryGranularity,
  buildChartData,
  chartCalendarYearKey,
  chartCareerEndKey,
  chartDateKey,
  chartLatestWeekKey,
  chartPeakRankKey,
  chartStreakKey,
  chartYearEndDateKey,
  chartYearEndRankKey,
  getAutoZoomAgeDomain,
  getAgeTicksForDomain,
  getMaxComparisonPlayers,
  getYAxisConfig,
  YearlyMetric,
} from "@/data/players";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import {
  ChartTooltipCard,
  TooltipPlayerHeader,
  TooltipStatRow,
} from "@/components/ChartTooltipCard";
import { getLineHighlightStyle } from "@/lib/chart-line-highlight";

interface RankingChartProps {
  players: Player[];
  selectedIds: string[];
  granularity: TrajectoryGranularity;
  onGranularityChange: (granularity: TrajectoryGranularity) => void;
  onActiveAgeChange?: (age: number | null) => void;
  yScale?: RankingScale;
  onYScaleChange?: (scale: RankingScale) => void;
  yearlyMetric?: YearlyMetric;
  onYearlyMetricChange?: (metric: YearlyMetric) => void;
}

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
  dataKey: string;
  payload?: Record<string, number | string | boolean | null | undefined>;
}

const GRANULARITY_OPTIONS: { value: TrajectoryGranularity; label: string }[] = [
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

const GRANULARITY_DESCRIPTIONS: Record<TrajectoryGranularity, string> = {
  yearly: "Compare careers by integer age. Use Peak Rank or Year-end Rank below.",
  monthly: "Month-end rankings for a more detailed career view.",
  weekly: "Full weekly ranking history for deep analysis. Supports up to 2 players.",
};

const YEARLY_METRIC_OPTIONS: { value: YearlyMetric; label: string }[] = [
  { value: "peak", label: "Peak Rank" },
  { value: "yearEnd", label: "Year-end Rank" },
];

const YEARLY_METRIC_DESCRIPTIONS: Record<YearlyMetric, string> = {
  peak: "Best ranking reached during each age year.",
  yearEnd: "Ranking at the final available week of each age year.",
};

type RankingScale = "linear" | "log";

export type { RankingScale };

const SCALE_OPTIONS: { value: RankingScale; label: string; title: string }[] = [
  {
    value: "log",
    label: "Career",
    title: "Compare career peaks and longevity. Focus on Top 100 rankings.",
  },
  {
    value: "linear",
    label: "Detail",
    title: "Inspect full ranking history down to Top 1000.",
  },
];

const SCALE_HELP_TEXT: Record<RankingScale, string> = {
  log: "Compare career peaks and longevity. Focus on Top 100 rankings.",
  linear: "Inspect full ranking history down to Top 1000.",
};

const CHART_HEIGHT_PX = 580;

function YearlyMetricSelector({
  value,
  onChange,
}: {
  value: YearlyMetric;
  onChange: (value: YearlyMetric) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-black/[0.08] bg-[#fafafa] px-3.5 py-2.5">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">
        Ranking Metric
      </legend>
      <div className="mt-1 flex flex-col gap-1" role="radiogroup" aria-label="Ranking metric">
        {YEARLY_METRIC_OPTIONS.map((option) => {
          const isActive = value === option.value;

          return (
            <label
              key={option.value}
              className={`ui-transition flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                isActive
                  ? "bg-white text-[#1d1d1f] shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              <input
                type="radio"
                name="yearly-metric"
                value={option.value}
                checked={isActive}
                onChange={() => onChange(option.value)}
                className="h-3.5 w-3.5 accent-[#1d1d1f]"
              />
              <span className="font-medium">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: Record<string, number | string | boolean | null | undefined>;
  index?: number;
}

function CareerChartDot({
  cx,
  cy,
  payload,
  player,
  defaultRadius,
  showDefaultDot,
}: ChartDotProps & {
  player: Player;
  defaultRadius: number;
  showDefaultDot: boolean;
}) {
  if (cx == null || cy == null || !payload) {
    return null;
  }

  const isCareerEnd = payload[chartCareerEndKey(player.id)] === true;
  const isRetired = player.careerStatus === "retired";
  const radius = isCareerEnd ? 7 : defaultRadius;

  if (!showDefaultDot && !isCareerEnd) {
    return null;
  }

  return (
    <g className="ui-transition">
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={player.color}
        stroke="#fff"
        strokeWidth={2}
      />
      {isCareerEnd ? (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={radius + 3}
            fill="none"
            stroke={player.color}
            strokeWidth={1.5}
            strokeOpacity={0.45}
          />
          <text
            x={cx + radius + 8}
            y={cy + 4}
            fill={isRetired ? "#86868b" : "#0071e3"}
            fontSize={10}
            fontWeight={600}
          >
            {isRetired ? "● Retired" : "▶ Active"}
          </text>
        </>
      ) : null}
    </g>
  );
}

function ChartToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-full bg-[#f5f5f7] p-1"
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            title={option.title}
            className={`ui-transition rounded-full px-3.5 py-1.5 text-xs font-medium ${
              isActive
                ? "bg-white text-[#1d1d1f] shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ChartLegend({ players }: { players: Player[] }) {
  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-0.5"
      aria-label="Selected players"
    >
      {players.map((player) => {
        const isRetired = player.careerStatus === "retired";

        return (
          <div key={player.id} className="flex items-center gap-1.5">
            <PlayerAvatar
              name={player.name}
              color={player.color}
              imageUrl={player.imageUrl}
              imagePosition={player.imagePosition}
              size="chip"
            />
            <span className="text-xs font-medium text-[#1d1d1f]">{player.shortName}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                isRetired
                  ? "bg-[#f5f5f7] text-[#86868b]"
                  : "bg-[#e8f4fd] text-[#0071e3]"
              }`}
            >
              {isRetired ? "Retired" : "Active"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function getLineStyle(granularity: TrajectoryGranularity, color: string) {
  switch (granularity) {
    case "yearly":
      return {
        strokeWidth: 2.5,
        strokeOpacity: 0.75,
        dot: {
          r: 5,
          fill: color,
          fillOpacity: 1,
          stroke: "#fff",
          strokeWidth: 2,
        },
        activeDot: { r: 7, strokeWidth: 2, stroke: "#fff" },
        type: "linear" as const,
      };
    case "monthly":
      return {
        strokeWidth: 2,
        strokeOpacity: 1,
        dot: { r: 3.5, fill: color, fillOpacity: 1, strokeWidth: 0 },
        activeDot: { r: 5, strokeWidth: 2, stroke: "#fff" },
        type: "monotone" as const,
      };
    case "weekly":
      return {
        strokeWidth: 1.5,
        strokeOpacity: 0.85,
        dot: false as const,
        activeDot: { r: 4, strokeWidth: 2, stroke: "#fff" },
        type: "monotone" as const,
      };
  }
}

function formatTooltipPeriod(
  rankingDate: string,
  granularity: TrajectoryGranularity,
  isLatestWeek = false,
  isRetired = false,
): { label: string; value: string } {
  if (isLatestWeek) {
    const date = new Date(`${rankingDate}T00:00:00Z`);
    return {
      label: isRetired ? "Career week" : "Latest week",
      value: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    };
  }

  if (granularity === "yearly") {
    return { label: "Year-end week", value: rankingDate.slice(0, 4) };
  }

  if (granularity === "monthly") {
    const date = new Date(`${rankingDate}T00:00:00Z`);
    return {
      label: "Month",
      value: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    };
  }

  return { label: "Date", value: rankingDate };
}

function formatTooltipAge(age: number | null, granularity: TrajectoryGranularity): string {
  if (age == null) return "—";
  return granularity === "yearly" ? String(Math.round(age)) : age.toFixed(1);
}

function ActiveAgeSync({
  active,
  label,
  onChange,
}: {
  active?: boolean;
  label?: number;
  onChange: (age: number | null) => void;
}) {
  useEffect(() => {
    if (active && typeof label === "number") {
      onChange(Math.round(label));
    } else {
      onChange(null);
    }
  }, [active, label, onChange]);

  return null;
}

function ActiveAgeHeader({ age }: { age: number }) {
  return (
    <div
      className="ui-transition pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-black/[0.06] bg-white/95 px-4 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
        Age {age}
      </p>
    </div>
  );
}

function formatYearlyTooltipDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
  players,
  granularity,
  yearlyMetric = "peak",
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
  players: Player[];
  granularity: TrajectoryGranularity;
  yearlyMetric?: YearlyMetric;
}) {
  if (!active || !payload?.length) return null;

  const validEntries = payload.filter(
    (entry) =>
      entry.value != null &&
      !Number.isNaN(entry.value) &&
      !entry.dataKey.endsWith("__date") &&
      !entry.dataKey.endsWith("__streak"),
  );

  if (!validEntries.length) return null;

  const hoveredAge =
    typeof label === "number" ? label : validEntries[0]?.payload?.age;

  return (
    <ChartTooltipCard active={active}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#86868b]">
        Age {formatTooltipAge(typeof hoveredAge === "number" ? hoveredAge : null, granularity)}
      </p>
      <div className="space-y-3">
        {validEntries
          .sort((a, b) => a.value - b.value)
          .map((entry, index) => {
            const player = players.find((p) => p.id === entry.dataKey);
            const dateReached = entry.payload?.[chartDateKey(entry.dataKey)];
            const calendarYear = entry.payload?.[chartCalendarYearKey(entry.dataKey)];
            const peakRank = entry.payload?.[chartPeakRankKey(entry.dataKey)];
            const yearEndRank = entry.payload?.[chartYearEndRankKey(entry.dataKey)];
            const yearEndDate = entry.payload?.[chartYearEndDateKey(entry.dataKey)];
            const isLatestWeek =
              entry.payload?.[chartLatestWeekKey(entry.dataKey)] === true;
            const streakValue = entry.payload?.[chartStreakKey(entry.dataKey)];
            const consecutiveWeeksAtNo1 =
              entry.value === 1 && typeof streakValue === "number"
                ? streakValue
                : null;
            const rankAmong =
              validEntries.findIndex((item) => item.dataKey === entry.dataKey) + 1;
            const displayYear =
              typeof calendarYear === "number"
                ? calendarYear
                : typeof dateReached === "string"
                  ? dateReached.slice(0, 4)
                  : null;

            return (
              <div
                key={entry.dataKey}
                className={index > 0 ? "border-t border-black/[0.06] pt-3" : ""}
              >
                <TooltipPlayerHeader
                  name={player?.name ?? entry.name}
                  subtitle={player?.shortName}
                  color={player?.color ?? entry.color}
                  imageUrl={player?.imageUrl}
                  imagePosition={player?.imagePosition}
                />

                <div className="space-y-1">
                  {granularity === "yearly" ? (
                    <>
                      <TooltipStatRow
                        label="Age"
                        value={formatTooltipAge(
                          typeof hoveredAge === "number" ? hoveredAge : null,
                          granularity,
                        )}
                      />
                      {displayYear != null ? (
                        <TooltipStatRow label="Year" value={String(displayYear)} />
                      ) : null}
                      {typeof peakRank === "number" ? (
                        <TooltipStatRow
                          label="Peak Rank"
                          value={`#${peakRank}`}
                          highlight={yearlyMetric === "peak"}
                        />
                      ) : null}
                      {typeof dateReached === "string" ? (
                        <TooltipStatRow
                          label="Date Reached"
                          value={formatYearlyTooltipDate(dateReached)}
                        />
                      ) : null}
                      {typeof yearEndRank === "number" ? (
                        <TooltipStatRow
                          label="Year-end Rank"
                          value={`#${yearEndRank}`}
                          highlight={yearlyMetric === "yearEnd"}
                        />
                      ) : null}
                      {typeof yearEndDate === "string" ? (
                        <TooltipStatRow
                          label="Year-end Date"
                          value={formatYearlyTooltipDate(yearEndDate)}
                        />
                      ) : null}
                      <TooltipStatRow
                        label="Rank among selected"
                        value={`#${rankAmong} of ${validEntries.length}`}
                      />
                      {isLatestWeek ? (
                        <TooltipStatRow
                          label={player?.careerStatus === "retired" ? "Career year" : "Latest year"}
                          value="Partial season in dataset"
                        />
                      ) : null}
                    </>
                  ) : (
                    <>
                      <TooltipStatRow
                        label="ATP ranking"
                        value={`#${entry.value}`}
                        highlight
                      />
                      <TooltipStatRow
                        label="Rank among selected"
                        value={`#${rankAmong} of ${validEntries.length}`}
                      />
                      {typeof dateReached === "string" ? (
                        <TooltipStatRow
                          label={
                            formatTooltipPeriod(
                              dateReached,
                              granularity,
                              isLatestWeek,
                              player?.careerStatus === "retired",
                            ).label
                          }
                          value={
                            formatTooltipPeriod(
                              dateReached,
                              granularity,
                              isLatestWeek,
                              player?.careerStatus === "retired",
                            ).value
                          }
                        />
                      ) : null}
                      {consecutiveWeeksAtNo1 != null ? (
                        <TooltipStatRow
                          label="Consecutive weeks at #1"
                          value={consecutiveWeeksAtNo1}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </ChartTooltipCard>
  );
}

export function RankingChart({
  players,
  selectedIds,
  granularity,
  onGranularityChange,
  onActiveAgeChange,
  yScale: yScaleProp,
  onYScaleChange,
  yearlyMetric = "peak",
  onYearlyMetricChange,
}: RankingChartProps) {
  const [internalYScale, setInternalYScale] = useState<RankingScale>("log");
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const yScale = yScaleProp ?? internalYScale;
  const setYScale = onYScaleChange ?? setInternalYScale;
  const [activeAge, setActiveAge] = useState<number | null>(null);
  const handleActiveAgeChange = useCallback(
    (age: number | null) => {
      setActiveAge(age);
      onActiveAgeChange?.(age);
    },
    [onActiveAgeChange],
  );
  const maxPlayers = getMaxComparisonPlayers(granularity);
  const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));
  const chartData = buildChartData(selectedIds, granularity, yearlyMetric);
  const { domain: yDomain, ticks: yTicks } = getYAxisConfig(
    chartData,
    selectedIds,
    yScale,
  );
  const [, yMax] = yDomain;
  const isYearly = granularity === "yearly";
  const zoomDomain = getAutoZoomAgeDomain(selectedIds, granularity);
  const xDomain: [number, number] | ["dataMin", "dataMax"] =
    zoomDomain ?? ["dataMin", "dataMax"];
  const ageTicks =
    zoomDomain != null
      ? getAgeTicksForDomain(zoomDomain[0], zoomDomain[1], granularity)
      : [];

  if (selectedPlayers.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-black/[0.08] bg-[#fafafa]"
        style={{ height: CHART_HEIGHT_PX }}
      >
        <p className="text-sm text-[#86868b]">
          Select at least one player with chart data to view the chart
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_12px_48px_rgba(0,0,0,0.08)] sm:p-6 lg:p-7">
      <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            ATP Ranking by Age
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Compare up to {maxPlayers} players.{" "}
            {isYearly
              ? YEARLY_METRIC_DESCRIPTIONS[yearlyMetric]
              : GRANULARITY_DESCRIPTIONS[granularity]}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <ChartToggleGroup
            label="Ranking granularity"
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={onGranularityChange}
          />
          {isYearly && onYearlyMetricChange ? (
            <YearlyMetricSelector
              value={yearlyMetric}
              onChange={onYearlyMetricChange}
            />
          ) : null}
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <ChartToggleGroup
              label="Y-axis scale"
              options={SCALE_OPTIONS}
              value={yScale}
              onChange={setYScale}
            />
            <p className="max-w-[240px] text-left text-[10px] leading-snug text-[#86868b] sm:text-right">
              <span className="font-medium text-[#1d1d1f]">
                {yScale === "log" ? "Career" : "Detail"}:
              </span>{" "}
              {SCALE_HELP_TEXT[yScale]}
            </p>
          </div>
        </div>
      </div>

      <ChartLegend players={selectedPlayers} />

      <div
        key={`${granularity}-${yearlyMetric}`}
        className="ui-chart-metric-enter relative w-full"
        style={{ height: CHART_HEIGHT_PX }}
      >
        {activeAge != null ? <ActiveAgeHeader age={activeAge} /> : null}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 12, left: 4, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#ececf0"
              vertical={false}
            />
            {yTicks.map((tick) => (
              <ReferenceLine
                key={tick}
                y={tick}
                stroke={tick <= 20 ? "#d8d8de" : "#ececf0"}
                strokeDasharray={tick === 1 ? undefined : "4 4"}
              />
            ))}
            <XAxis
              dataKey="age"
              type="number"
              domain={xDomain}
              ticks={ageTicks.length > 0 ? ageTicks : undefined}
              allowDecimals
              tick={{ fill: "#86868b", fontSize: 12 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
              interval={isYearly ? 0 : undefined}
              tickFormatter={(value: number) =>
                isYearly ? String(Math.round(value)) : value.toFixed(0)
              }
              label={{
                value: "Age",
                position: "insideBottom",
                offset: -2,
                fill: "#86868b",
                fontSize: 12,
              }}
            />
            <YAxis
              scale={yScale === "log" ? "log" : "auto"}
              reversed
              domain={[1, yMax]}
              ticks={yTicks}
              allowDataOverflow
              padding={{ top: 28, bottom: 8 }}
              tick={{ fill: "#86868b", fontSize: 11 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
              tickFormatter={(value: number) => `#${value}`}
              width={48}
              label={{
                value:
                  yScale === "log"
                    ? "ATP Ranking (Career)"
                    : "ATP Ranking (Detail)",
                angle: -90,
                position: "insideLeft",
                fill: "#86868b",
                fontSize: 12,
                dx: 4,
              }}
            />
            <Tooltip
              wrapperStyle={{
                zIndex: 20,
                maxWidth: "min(calc(100vw - 2rem), 320px)",
                pointerEvents: "none",
              }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={(props) => (
                <>
                  <ActiveAgeSync
                    active={props.active}
                    label={typeof props.label === "number" ? props.label : undefined}
                    onChange={handleActiveAgeChange}
                  />
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as TooltipPayloadItem[] | undefined}
                    label={typeof props.label === "number" ? props.label : undefined}
                    players={selectedPlayers}
                    granularity={granularity}
                    yearlyMetric={yearlyMetric}
                  />
                </>
              )}
            />
            {selectedPlayers.map((player) => {
              const lineStyle = getLineStyle(granularity, player.color);
              const highlight = getLineHighlightStyle(
                player.id,
                hoveredPlayerId,
                lineStyle.strokeOpacity,
                lineStyle.strokeWidth,
              );
              const defaultDotRadius =
                granularity === "yearly"
                  ? 5
                  : granularity === "monthly"
                    ? 3.5
                    : 0;
              const showDefaultDot = lineStyle.dot !== false;

              return (
                <Line
                  key={player.id}
                  type={lineStyle.type}
                  dataKey={player.id}
                  name={player.shortName}
                  stroke={player.color}
                  strokeWidth={highlight.strokeWidth}
                  strokeOpacity={highlight.strokeOpacity}
                  dot={(props) => (
                    <CareerChartDot
                      {...props}
                      player={player}
                      defaultRadius={defaultDotRadius}
                      showDefaultDot={showDefaultDot}
                    />
                  )}
                  activeDot={lineStyle.activeDot}
                  connectNulls={isYearly}
                  legendType="none"
                  onMouseEnter={() => setHoveredPlayerId(player.id)}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

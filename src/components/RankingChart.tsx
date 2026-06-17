"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Player,
  TrajectoryGranularity,
  buildChartData,
  chartDateKey,
  getVisibleRankingTicks,
  getYAxisDomain,
} from "@/data/players";

interface RankingChartProps {
  players: Player[];
  selectedIds: string[];
}

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
  dataKey: string;
  payload?: Record<string, number | string | null | undefined>;
}

const GRANULARITY_OPTIONS: { value: TrajectoryGranularity; label: string }[] = [
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

const GRANULARITY_LABELS: Record<TrajectoryGranularity, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const GRANULARITY_DESCRIPTIONS: Record<TrajectoryGranularity, string> = {
  yearly: "Career overview by year-end ranking. Dots show each age checkpoint.",
  monthly: "Month-end rankings for a more detailed career view.",
  weekly: "Full weekly ranking history for deep analysis.",
};

type RankingScale = "linear" | "log";

const SCALE_OPTIONS: { value: RankingScale; label: string }[] = [
  { value: "log", label: "Log" },
  { value: "linear", label: "Linear" },
];

const SCALE_DESCRIPTIONS: Record<RankingScale, string> = {
  log: "Log scale treats 10× ranking gaps equally (#1→#10, #10→#100).",
  linear: "Linear scale highlights small differences among top-ranked players.",
};

function ChartToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
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
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
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

function getLineStyle(granularity: TrajectoryGranularity, color: string) {
  switch (granularity) {
    case "yearly":
      return {
        strokeWidth: 1,
        strokeOpacity: 0.3,
        dot: { r: 6, fill: color, stroke: "#fff", strokeWidth: 2 },
        activeDot: { r: 8, strokeWidth: 2, stroke: "#fff" },
      };
    case "monthly":
      return {
        strokeWidth: 2,
        strokeOpacity: 1,
        dot: { r: 3.5, fill: color, strokeWidth: 0 },
        activeDot: { r: 5, strokeWidth: 2, stroke: "#fff" },
      };
    case "weekly":
      return {
        strokeWidth: 1.5,
        strokeOpacity: 0.85,
        dot: false as const,
        activeDot: { r: 4, strokeWidth: 2, stroke: "#fff" },
      };
  }
}

function CustomTooltip({
  active,
  payload,
  label,
  players,
  granularity,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
  players: Player[];
  granularity: TrajectoryGranularity;
}) {
  if (!active || !payload?.length) return null;

  const validEntries = payload.filter(
    (entry) =>
      entry.value != null &&
      !Number.isNaN(entry.value) &&
      !entry.dataKey.endsWith("__date"),
  );

  if (!validEntries.length) return null;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#86868b]">
        {GRANULARITY_LABELS[granularity]} · Age{" "}
        {typeof label === "number" ? label.toFixed(1) : label}
      </p>
      <div className="space-y-2">
        {validEntries
          .sort((a, b) => a.value - b.value)
          .map((entry) => {
            const player = players.find((p) => p.id === entry.dataKey);
            const rankingDate = entry.payload?.[chartDateKey(entry.dataKey)];

            return (
              <div key={entry.dataKey} className="space-y-0.5">
                <div className="flex items-center justify-between gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium text-[#1d1d1f]">
                      {player?.name ?? entry.name}
                    </span>
                  </div>
                  <span className="tabular-nums font-medium text-[#1d1d1f]">
                    #{entry.value}
                  </span>
                </div>
                <p className="pl-[18px] text-xs text-[#86868b]">
                  {typeof rankingDate === "string"
                    ? rankingDate
                    : "Ranking date unavailable"}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function RankingChart({ players, selectedIds }: RankingChartProps) {
  const [granularity, setGranularity] = useState<TrajectoryGranularity>("yearly");
  const [yScale, setYScale] = useState<RankingScale>("log");
  const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));
  const chartData = buildChartData(selectedIds, granularity);
  const [, yMax] = getYAxisDomain(chartData, selectedIds);
  const yTicks = getVisibleRankingTicks(yMax);

  if (selectedPlayers.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-black/[0.08] bg-[#fafafa]">
        <p className="text-sm text-[#86868b]">
          Select at least one player with chart data to view the chart
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            ATP Ranking by Age
          </h2>
          <p className="mt-0.5 text-sm text-[#86868b]">
            Compare up to 5 players. {GRANULARITY_DESCRIPTIONS[granularity]}{" "}
            {SCALE_DESCRIPTIONS[yScale]}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <ChartToggleGroup
            label="Ranking granularity"
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={setGranularity}
          />
          <ChartToggleGroup
            label="Y-axis scale"
            options={SCALE_OPTIONS}
            value={yScale}
            onChange={setYScale}
          />
        </div>
      </div>

      <div className="h-[360px] w-full sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
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
                stroke={tick <= 100 ? "#d8d8de" : "#ececf0"}
                strokeDasharray={tick === 1 ? undefined : "4 4"}
              />
            ))}
            <XAxis
              dataKey="age"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: "#86868b", fontSize: 12 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
              label={{
                value: "Age",
                position: "insideBottom",
                offset: -2,
                fill: "#86868b",
                fontSize: 12,
              }}
              tickFormatter={(value: number) => value.toFixed(0)}
            />
            <YAxis
              scale={yScale === "log" ? "log" : "auto"}
              reversed
              domain={[1, yMax]}
              ticks={yTicks}
              allowDataOverflow
              tick={{ fill: "#86868b", fontSize: 11 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
              tickFormatter={(value: number) => `#${value}`}
              width={48}
              label={{
                value: yScale === "log" ? "ATP Ranking (log)" : "ATP Ranking",
                angle: -90,
                position: "insideLeft",
                fill: "#86868b",
                fontSize: 12,
                dx: 4,
              }}
            />
            <Tooltip
              content={
                <CustomTooltip players={selectedPlayers} granularity={granularity} />
              }
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 16, fontSize: 13 }}
            />
            {selectedPlayers.map((player) => {
              const lineStyle = getLineStyle(granularity, player.color);

              return (
                <Line
                  key={player.id}
                  type="monotone"
                  dataKey={player.id}
                  name={player.shortName}
                  stroke={player.color}
                  strokeWidth={lineStyle.strokeWidth}
                  strokeOpacity={lineStyle.strokeOpacity}
                  dot={lineStyle.dot}
                  activeDot={lineStyle.activeDot}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

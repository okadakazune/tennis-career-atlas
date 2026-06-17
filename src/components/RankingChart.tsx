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
} from "recharts";
import {
  Player,
  TrajectoryGranularity,
  buildChartData,
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
}

const GRANULARITY_OPTIONS: { value: TrajectoryGranularity; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const GRANULARITY_DESCRIPTIONS: Record<TrajectoryGranularity, string> = {
  weekly: "All weekly ranking snapshots from source data.",
  monthly: "Last ranking date of each calendar month.",
  yearly: "Last ranking date of each calendar year.",
};

function CustomTooltip({
  active,
  payload,
  label,
  players,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
  players: Player[];
}) {
  if (!active || !payload?.length) return null;

  const validEntries = payload.filter(
    (entry) => entry.value != null && !Number.isNaN(entry.value),
  );

  if (!validEntries.length) return null;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#86868b]">
        Age {typeof label === "number" ? label.toFixed(2) : label}
      </p>
      <div className="space-y-1.5">
        {validEntries
          .sort((a, b) => a.value - b.value)
          .map((entry) => {
            const player = players.find((p) => p.id === entry.dataKey);
            return (
              <div
                key={entry.dataKey}
                className="flex items-center justify-between gap-6 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium text-[#1d1d1f]">
                    {player?.shortName ?? entry.name}
                  </span>
                </div>
                <span className="tabular-nums text-[#1d1d1f]">
                  #{entry.value}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function RankingChart({ players, selectedIds }: RankingChartProps) {
  const [granularity, setGranularity] = useState<TrajectoryGranularity>("yearly");
  const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));
  const chartData = buildChartData(selectedIds, granularity);

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
            {GRANULARITY_DESCRIPTIONS[granularity]} Lower rank numbers sit higher on the chart.
          </p>
        </div>

        <div
          className="inline-flex self-start rounded-full bg-[#f5f5f7] p-1"
          role="group"
          aria-label="Ranking granularity"
        >
          {GRANULARITY_OPTIONS.map((option) => {
            const isActive = granularity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setGranularity(option.value)}
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
      </div>

      <div className="h-[360px] w-full sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e8e8ed"
              vertical={false}
            />
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
              tickFormatter={(value: number) => value.toFixed(1)}
            />
            <YAxis
              reversed
              domain={[1, "auto"]}
              tick={{ fill: "#86868b", fontSize: 12 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
              tickFormatter={(value: number) => `#${value}`}
              label={{
                value: "ATP Ranking",
                angle: -90,
                position: "insideLeft",
                fill: "#86868b",
                fontSize: 12,
                dx: 10,
              }}
            />
            <Tooltip
              content={<CustomTooltip players={selectedPlayers} />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 16, fontSize: 13 }}
            />
            {selectedPlayers.map((player) => (
              <Line
                key={player.id}
                type="monotone"
                dataKey={player.id}
                name={player.shortName}
                stroke={player.color}
                strokeWidth={granularity === "weekly" ? 1.5 : 2}
                dot={granularity !== "weekly"}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

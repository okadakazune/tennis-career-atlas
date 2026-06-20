"use client";

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
import { Player } from "@/data/players";
import { buildGrandSlamTitlesChartData } from "@/data/grand-slam";

interface GrandSlamTitlesByAgeChartProps {
  players: Player[];
}

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

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
  if (!active || !payload?.length || label == null) return null;

  const validEntries = payload.filter(
    (entry) => entry.value != null && !Number.isNaN(entry.value),
  );

  if (!validEntries.length) return null;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#86868b]">
        Age {label}
      </p>
      <div className="space-y-1.5">
        {validEntries
          .sort((a, b) => b.value - a.value)
          .map((entry) => {
            const player = players.find((item) => item.id === entry.dataKey);
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
                <span className="tabular-nums font-medium text-[#1d1d1f]">
                  {entry.value}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function GrandSlamTitlesByAgeChart({
  players,
}: GrandSlamTitlesByAgeChartProps) {
  if (players.length === 0) return null;

  const chartData = buildGrandSlamTitlesChartData(players);
  const maxTitles = chartData.reduce((max, row) => {
    const rowMax = players.reduce((innerMax, player) => {
      const value = row[player.id];
      return typeof value === "number" ? Math.max(innerMax, value) : innerMax;
    }, 0);
    return Math.max(max, rowMax);
  }, 0);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          Grand Slam Titles by Age
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Cumulative Grand Slam titles at each age, computed from match results.
        </p>
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
              allowDecimals={false}
              label={{
                value: "Age",
                position: "insideBottom",
                offset: -2,
                fill: "#86868b",
                fontSize: 12,
              }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, Math.max(maxTitles, 1)]}
              tick={{ fill: "#86868b", fontSize: 12 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
              label={{
                value: "Grand Slam titles",
                angle: -90,
                position: "insideLeft",
                fill: "#86868b",
                fontSize: 12,
                dx: 10,
              }}
            />
            <Tooltip content={<CustomTooltip players={players} />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 16, fontSize: 13 }}
            />
            {players.map((player) => (
              <Line
                key={player.id}
                type="stepAfter"
                dataKey={player.id}
                name={player.shortName}
                stroke={player.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: player.color, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

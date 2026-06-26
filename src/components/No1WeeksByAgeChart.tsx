"use client";

import { useMemo, useState } from "react";
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
import { Player } from "@/data/players";
import { countWeeksAtNo1ThroughAge } from "@/data/compare-stats";
import {
  ChartTooltipCard,
  TooltipPlayerHeader,
  TooltipStatRow,
} from "@/components/ChartTooltipCard";
import { getLineHighlightStyle } from "@/lib/chart-line-highlight";

interface No1WeeksByAgeChartProps {
  players: Player[];
  displayAge: number;
}

interface ChartRow {
  age: number;
  [playerId: string]: number;
}

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

function buildNo1WeeksChartData(players: Player[]): ChartRow[] {
  if (players.length === 0) return [];

  let minAge = Infinity;
  let maxAge = -Infinity;

  for (const player of players) {
    for (const point of player.trajectoryYearly) {
      const age = Math.round(point.age);
      minAge = Math.min(minAge, age);
      maxAge = Math.max(maxAge, age);
    }
  }

  if (!Number.isFinite(minAge) || !Number.isFinite(maxAge)) {
    return [];
  }

  const rows: ChartRow[] = [];

  for (let age = minAge; age <= maxAge; age += 1) {
    const row: ChartRow = { age };
    for (const player of players) {
      row[player.id] = countWeeksAtNo1ThroughAge(player, age);
    }
    rows.push(row);
  }

  return rows;
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

  const sorted = [...validEntries].sort((a, b) => b.value - a.value);

  return (
    <ChartTooltipCard active={active}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#86868b]">
        Age {label}
      </p>
      <div className="space-y-3">
        {sorted.map((entry, index) => {
          const player = players.find((item) => item.id === entry.dataKey);
          if (!player) return null;

          const rankAmong =
            sorted.findIndex((item) => item.dataKey === entry.dataKey) + 1;

          return (
            <div
              key={entry.dataKey}
              className={index > 0 ? "border-t border-black/[0.06] pt-3" : ""}
            >
              <TooltipPlayerHeader
                name={player.name}
                subtitle={player.shortName}
                color={player.color}
                imageUrl={player.imageUrl}
                imagePosition={player.imagePosition}
              />
              <div className="space-y-1">
                <TooltipStatRow
                  label="Cumulative weeks at #1"
                  value={entry.value}
                  highlight
                />
                <TooltipStatRow
                  label="Rank among selected"
                  value={`#${rankAmong} of ${sorted.length}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartTooltipCard>
  );
}

export function No1WeeksByAgeChart({
  players,
  displayAge,
}: No1WeeksByAgeChartProps) {
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const chartData = useMemo(() => buildNo1WeeksChartData(players), [players]);

  if (players.length === 0 || chartData.length === 0) return null;

  const maxWeeks = chartData.reduce((max, row) => {
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
          Weeks at World No. 1 by Age
        </h2>
        <p className="mt-0.5 text-sm text-[#86868b]">
          Cumulative weeks ranked #1 through each age. The dashed line marks age{" "}
          {displayAge}.
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
            />
            <YAxis
              allowDecimals={false}
              domain={[0, Math.max(maxWeeks, 1)]}
              tick={{ fill: "#86868b", fontSize: 12 }}
              axisLine={{ stroke: "#d2d2d7" }}
              tickLine={{ stroke: "#d2d2d7" }}
            />
            <ReferenceLine
              x={displayAge}
              stroke="#0071e3"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Tooltip
              wrapperStyle={{ zIndex: 30, pointerEvents: "none" }}
              content={<CustomTooltip players={players} />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 16, fontSize: 13 }}
            />
            {players.map((player) => {
              const highlight = getLineHighlightStyle(
                player.id,
                hoveredPlayerId,
                1,
                2.5,
              );

              return (
                <Line
                  key={player.id}
                  type="stepAfter"
                  dataKey={player.id}
                  name={player.shortName}
                  stroke={player.color}
                  strokeWidth={highlight.strokeWidth}
                  strokeOpacity={highlight.strokeOpacity}
                  dot={{ r: 3, fill: player.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  onMouseEnter={() => setHoveredPlayerId(player.id)}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useControlStore } from "@/store/controlStore";

const SERIES = [
  { key: "inbound", label: "입고", color: "#3b82f6" },   // blue
  { key: "picking", label: "피킹", color: "#8b5cf6" },   // violet
  { key: "packing", label: "패킹", color: "#f97316" },   // orange
  { key: "shipping", label: "출고", color: "#22c55e" },  // green
] as const;

export function OperationChart() {
  const operationStats = useControlStore((s) => s.operationStats);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          실시간 처리 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={operationStats}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {SERIES.map(({ key, color }) => (
                <linearGradient
                  key={key}
                  id={`gradient-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              interval={2}
            />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e4e4e7",
              }}
              formatter={(value, name) => {
                const series = SERIES.find((s) => s.key === (name as string));
                return [`${value}건`, series?.label ?? (name as string)];
              }}
            />
            <Legend
              formatter={(value) => {
                const series = SERIES.find((s) => s.key === value);
                return (
                  <span style={{ fontSize: 11, color: "#71717a" }}>
                    {series?.label ?? value}
                  </span>
                );
              }}
            />
            {SERIES.map(({ key, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${key})`}
                fillOpacity={0.2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

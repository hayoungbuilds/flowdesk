"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useZoneStore } from "@/store/zoneStore";

export function ZoneBarChart() {
  const getZoneStats = useZoneStore((s) => s.getZoneStats);
  const data = getZoneStats();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        권역별 배송 현황
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis
            dataKey="region"
            tick={{ fontSize: 12, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="delivered" name="완료" fill="#22c55e" radius={[3, 3, 0, 0]} stackId="a" />
          <Bar dataKey="inTransit" name="배송 중" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="a" />
          <Bar dataKey="failed" name="실패" fill="#ef4444" radius={[3, 3, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

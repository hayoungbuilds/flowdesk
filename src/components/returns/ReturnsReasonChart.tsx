"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import { useReturnsStore } from "@/store/returnsStore";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#6b7280"];

export function ReturnsReasonChart() {
  const items = useReturnsStore((s) => s.items);
  const getReasonStats = useReturnsStore((s) => s.getReasonStats);
  const data = useMemo(() => getReasonStats(), [items, getReasonStats]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        반품 사유 분포
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={70}
            label={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
            }}
            formatter={(value, name) => {
              const total = data.reduce((sum, d) => sum + d.value, 0);
              const percent = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : "0.0";
              return [`${value}건 (${percent}%)`, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReturnsDailyChart() {
  const items = useReturnsStore((s) => s.items);
  const getDailyData = useReturnsStore((s) => s.getDailyData);
  const data = useMemo(() => getDailyData(), [items, getDailyData]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        일별 반품 접수 현황
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis
            dataKey="date"
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
            formatter={(value) => [`${value}건`, "반품 건수"]}
          />
          <Bar dataKey="count" name="반품 건수" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useMemo } from "react";
import { useSettlementStore } from "@/store/settlementStore";

function formatEok(value: number) {
  const eok = value / 1_0000_0000;
  if (eok >= 0.1) return `${eok.toFixed(1)}억`;
  const baekman = value / 1_000_000;
  return `${baekman.toFixed(0)}백만`;
}

export function SettlementSupplierChart() {
  const settlements = useSettlementStore((s) => s.settlements);
  const getSupplierStats = useSettlementStore((s) => s.getSupplierStats);
  const data = useMemo(() => getSupplierStats(), [settlements, getSupplierStats]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        공급사별 정산 금액 (상위 8개)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-700" />
          <XAxis
            dataKey="supplier"
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => formatEok(v)}
          />
          <Tooltip
            formatter={(value) => [formatEok(Number(value)), "정산 금액"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              backgroundColor: "var(--tooltip-bg, #fff)",
            }}
          />
          <Bar dataKey="totalAmount" fill="#7c3aed" radius={[4, 4, 0, 0]} name="정산 금액" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SettlementMonthlyChart() {
  const settlements = useSettlementStore((s) => s.settlements);
  const getMonthlyData = useSettlementStore((s) => s.getMonthlyData);
  const data = useMemo(() => getMonthlyData(), [settlements, getMonthlyData]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        월별 정산 추이
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-700" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => formatEok(v)}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "amount") return [formatEok(Number(value)), "정산 금액"];
              return [`${value}건`, "정산 건수"];
            }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              backgroundColor: "var(--tooltip-bg, #fff)",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ r: 4, fill: "#7c3aed" }}
            name="amount"
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 4, fill: "#0ea5e9" }}
            yAxisId={0}
            name="count"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="inline-block w-3 h-0.5 bg-violet-600 rounded" />
          정산 금액
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="inline-block w-3 h-0.5 bg-sky-500 rounded" />
          정산 건수
        </div>
      </div>
    </div>
  );
}

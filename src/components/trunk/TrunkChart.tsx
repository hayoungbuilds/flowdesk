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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMemo } from "react";
import { useTrunkStore } from "@/store/trunkStore";
import { TrunkStatus } from "@/types";

const STATUS_LABEL: Record<TrunkStatus, string> = {
  SCHEDULED: "출발 예정",
  DEPARTED: "출발",
  IN_TRANSIT: "운행 중",
  ARRIVED: "도착 완료",
  DELAYED: "지연",
};

const STATUS_COLORS: Record<TrunkStatus, string> = {
  SCHEDULED: "#a1a1aa",
  DEPARTED: "#3b82f6",
  IN_TRANSIT: "#7c3aed",
  ARRIVED: "#22c55e",
  DELAYED: "#ef4444",
};

const STATUSES: TrunkStatus[] = ["SCHEDULED", "DEPARTED", "IN_TRANSIT", "ARRIVED", "DELAYED"];

export function TrunkHubChart() {
  const routes = useTrunkStore((s) => s.routes);
  const getHubFlowData = useTrunkStore((s) => s.getHubFlowData);
  const data = useMemo(() => getHubFlowData(), [routes, getHubFlowData]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        허브별 물량 현황
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis
            dataKey="hub"
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={36}
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
          <Bar dataKey="outbound" name="출고" fill="#7c3aed" radius={[3, 3, 0, 0]} />
          <Bar dataKey="inbound" name="입고" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrunkStatusChart() {
  const routes = useTrunkStore((s) => s.routes);

  const data = STATUSES.map((status) => ({
    name: STATUS_LABEL[status],
    value: routes.filter((r) => r.status === status).length,
    color: STATUS_COLORS[status],
  })).filter((d) => d.value > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        간선 상태 분포
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
            }}
            formatter={(value, name) => [`${value}건`, name]}
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

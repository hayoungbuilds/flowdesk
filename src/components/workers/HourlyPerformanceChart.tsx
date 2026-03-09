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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkerStore } from "@/store/workerStore";

export function HourlyPerformanceChart() {
  const hourlyPerformance = useWorkerStore((s) => s.hourlyPerformance);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700">
          시간대별 작업 처리량
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={hourlyPerformance}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              interval={3}
            />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e4e4e7",
              }}
              formatter={(value, name) => [
                `${value}건`,
                name === "picking" ? "피킹" : name === "packing" ? "패킹" : "출고",
              ]}
            />
            <Legend
              formatter={(v) => v === "picking" ? "피킹" : v === "packing" ? "패킹" : "출고"}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="picking" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
            <Bar dataKey="packing" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="shipping" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

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
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInboundStore } from "@/store/inboundStore";

export function InboundChart() {
  const items = useInboundStore((s) => s.items);
  const getSupplierStats = useInboundStore((s) => s.getSupplierStats);
  const supplierStats = useMemo(() => getSupplierStats(), [items, getSupplierStats]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          공급사별 입고 현황 (상위 8개)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={supplierStats}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="supplier"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={40}
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
                name === "count" ? "전체 입고" : "완료",
              ]}
            />
            <Legend
              formatter={(v) => (v === "count" ? "전체 입고" : "완료")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} name="count" />
            <Bar dataKey="completed" stackId="b" fill="#10b981" radius={[4, 4, 0, 0]} name="completed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

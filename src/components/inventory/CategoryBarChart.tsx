"use client";

import { useMemo } from "react";
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
import { useInventoryStore } from "@/store/inventoryStore";

export function CategoryBarChart() {
  const getCategoryStats = useInventoryStore((s) => s.getCategoryStats);
  const items = useInventoryStore((s) => s.items);

  // items 변경 시 재계산 트리거 — 배열 반환이므로 useShallow 대신 useMemo 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => getCategoryStats(), [items]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          카테고리별 재고 현황
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#71717a" }} />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e4e4e7",
              }}
              formatter={(value, name) => [
                String(value),
                name === "stock" ? "현재 재고" : "최소 기준",
              ]}
            />
            <Legend
              formatter={(value) => (value === "stock" ? "현재 재고" : "최소 기준")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="stock" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="threshold" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

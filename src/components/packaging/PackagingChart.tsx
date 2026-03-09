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
import { Badge } from "@/components/ui/badge";
import { usePackagingStore } from "@/store/packagingStore";

export function PackagingChart() {
  const getTypeStats = usePackagingStore((s) => s.getTypeStats);
  const materials = usePackagingStore((s) => s.materials);

  // materials 변경 시 재계산 트리거 — 배열 반환이므로 useShallow 대신 useMemo 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => getTypeStats(), [materials]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          포장재 유형별 사용량 vs 현재재고
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#71717a" }} />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e4e4e7",
              }}
              formatter={(value, name) => [
                Number(value).toLocaleString(),
                name === "used" ? "30일 사용량" : "현재 재고",
              ]}
            />
            <Legend
              formatter={(value) => (value === "used" ? "30일 사용량" : "현재 재고")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="used" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
            <Bar dataKey="remaining" stackId="a" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PackagingLowStockAlert() {
  const getLowStockMaterials = usePackagingStore((s) => s.getLowStockMaterials);
  const materials = usePackagingStore((s) => s.materials);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lowStock = useMemo(() => getLowStockMaterials(), [materials]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
          재고 부족 포장재 경고
          {lowStock.length > 0 && (
            <Badge className="bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 text-xs">
              {lowStock.length}건
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStock.length === 0 ? (
          <div className="text-sm text-zinc-400 py-4 text-center">
            부족 재고 없음
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {lowStock.map((item) => {
              const isCritical = item.currentStock < item.minStock * 0.5;
              const ratio = Math.round((item.currentStock / item.minStock) * 100);
              const days = Math.floor(item.currentStock / item.dailyUsage);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCritical
                      ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50"
                      : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/40"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.id} · 재고일수 {days}일
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        isCritical
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.currentStock.toLocaleString()} {item.unit}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500">
                      최소 {item.minStock.toLocaleString()} · {ratio}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

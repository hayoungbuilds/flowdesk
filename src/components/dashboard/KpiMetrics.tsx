"use client";

import { useShallow } from "zustand/shallow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/orderStore";

export function KpiMetrics() {
  const kpi = useOrderStore(useShallow((s) => s.getKpiMetrics()));

  const metrics = [
    {
      title: "지연율",
      value: `${kpi.delayRate}%`,
      sub: kpi.delayRate > 10 ? "주의 필요" : "정상 범위",
      color: kpi.delayRate > 10 ? "text-red-500" : "text-zinc-700",
      bar: { rate: kpi.delayRate, color: kpi.delayRate > 10 ? "bg-red-400" : "bg-green-400" },
    },
    {
      title: "완료율",
      value: `${kpi.completionRate}%`,
      sub: "전체 주문 대비",
      color: "text-green-600",
      bar: { rate: kpi.completionRate, color: "bg-green-400" },
    },
    {
      title: "평균 처리 시간",
      value: kpi.avgProcessingMin > 0 ? `${kpi.avgProcessingMin}분` : "-",
      sub: "접수 → 배송완료",
      color: "text-violet-600",
      bar: null,
    },
    {
      title: "일일 목표 달성률",
      value: `${kpi.dailyGoalRate}%`,
      sub: "완료 목표 300건",
      color: kpi.dailyGoalRate >= 80 ? "text-green-600" : "text-orange-500",
      bar: {
        rate: kpi.dailyGoalRate,
        color: kpi.dailyGoalRate >= 80 ? "bg-green-400" : "bg-orange-400",
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.title} className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              {m.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
            {m.bar && (
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.bar.color}`}
                  style={{ width: `${m.bar.rate}%` }}
                />
              </div>
            )}
            <div className="text-xs text-zinc-400">{m.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

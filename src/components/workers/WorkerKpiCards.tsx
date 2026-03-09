"use client";

import { useShallow } from "zustand/shallow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkerStore } from "@/store/workerStore";

export function WorkerKpiCards() {
  const kpi = useWorkerStore(useShallow((s) => s.getKpi()));

  const cards = [
    {
      title: "전체 작업자",
      value: `${kpi.total}명`,
      sub: `활동 중 ${kpi.active}명`,
      color: "text-zinc-800 dark:text-zinc-100",
      bg: "bg-white dark:bg-zinc-900",
    },
    {
      title: "비활동",
      value: `${kpi.total - kpi.active}명`,
      sub: "휴식 + 오프라인",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "평균 목표 달성률",
      value: `${kpi.avgAchievementRate}%`,
      sub: kpi.avgAchievementRate >= 80 ? "목표 근접" : "목표 미달",
      color: kpi.avgAchievementRate >= 80 ? "text-green-600" : "text-red-500",
      bg: kpi.avgAchievementRate >= 80 ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "평균 처리 시간",
      value: `${kpi.avgTimeSeconds}초`,
      sub: "건당 평균",
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={`${card.bg} border-0 shadow-sm`}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{card.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

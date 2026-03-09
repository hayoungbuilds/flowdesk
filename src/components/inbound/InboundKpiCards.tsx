"use client";

import { useShallow } from "zustand/shallow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInboundStore } from "@/store/inboundStore";

export function InboundKpiCards() {
  const kpi = useInboundStore(useShallow((s) => s.getKpi()));

  const cards = [
    {
      title: "오늘 입고 예정",
      value: `${kpi.scheduled}건`,
      sub: `전체 ${kpi.total}건 중`,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "입고 진행 중",
      value: `${kpi.inProgress}건`,
      sub: "현재 입고 처리 중",
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "검수 중",
      value: `${kpi.inspecting}건`,
      sub: "품질 검수 진행 중",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "입고 완료",
      value: `${kpi.completed}건`,
      sub: `반려 ${kpi.rejected}건`,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "완료율",
      value: `${kpi.completionRate}%`,
      sub: kpi.completionRate >= 70 ? "양호" : "개선 필요",
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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

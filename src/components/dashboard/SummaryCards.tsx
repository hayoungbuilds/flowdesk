"use client";

import { useShallow } from "zustand/shallow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/orderStore";

export function SummaryCards() {
  // useShallow: orders 변경 시에만 재렌더 (shallow equality로 불필요한 렌더 방지)
  const summary = useOrderStore(useShallow((s) => s.getSummary()));

  const cards = [
    {
      title: "전체 주문",
      value: summary.total,
      sub: "오늘 기준",
      color: "text-zinc-800 dark:text-zinc-100",
      bg: "bg-white dark:bg-zinc-900",
    },
    {
      title: "처리 중",
      value: summary.processing,
      sub: `${((summary.processing / summary.total) * 100).toFixed(1)}%`,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "배송 완료",
      value: summary.completed,
      sub: `${((summary.completed / summary.total) * 100).toFixed(1)}%`,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "지연",
      value: summary.delayed,
      sub: summary.delayed > 0 ? "주의 필요" : "정상",
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
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
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{card.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

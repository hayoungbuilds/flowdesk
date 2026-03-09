"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/orderStore";

export function SummaryCards() {
  const getSummary = useOrderStore((s) => s.getSummary);
  const orders = useOrderStore((s) => s.orders);

  const summary = useMemo(() => getSummary(), [getSummary, orders]);

  const cards = [
    {
      title: "전체 주문",
      value: summary.total,
      sub: "오늘 기준",
      color: "text-zinc-800",
      bg: "bg-white",
    },
    {
      title: "처리 중",
      value: summary.processing,
      sub: `${((summary.processing / summary.total) * 100).toFixed(1)}%`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "배송 완료",
      value: summary.completed,
      sub: `${((summary.completed / summary.total) * 100).toFixed(1)}%`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "지연",
      value: summary.delayed,
      sub: summary.delayed > 0 ? "주의 필요" : "정상",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={`${card.bg} border-0 shadow-sm`}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400 mt-1">{card.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

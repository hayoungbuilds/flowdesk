"use client";

import { useMemo } from "react";
import { useReturnsStore } from "@/store/returnsStore";

function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

export function ReturnsKpiCards() {
  const items = useReturnsStore((s) => s.items);
  const getKpi = useReturnsStore((s) => s.getKpi);
  const kpi = useMemo(() => getKpi(), [items, getKpi]);

  const cards = [
    {
      label: "오늘 반품 접수",
      value: `${kpi.requested}건`,
      sub: "반품 접수 대기",
      color: "text-blue-600",
    },
    {
      label: "수거 중",
      value: `${kpi.collecting}건`,
      sub: "수거 진행 중",
      color: "text-yellow-600",
    },
    {
      label: "환불 완료",
      value: `${kpi.refunded}건`,
      sub: `환불율 ${kpi.refundRate}%`,
      color: "text-green-600",
    },
    {
      label: "반려",
      value: `${kpi.rejected}건`,
      sub: kpi.rejected > 0 ? "처리 완료" : "이슈 없음",
      color: kpi.rejected > 0 ? "text-red-500" : "text-zinc-400",
    },
    {
      label: "총 환불액",
      value: formatAmount(kpi.totalRefundAmount),
      sub: "환불 완료 합계",
      color: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm"
        >
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

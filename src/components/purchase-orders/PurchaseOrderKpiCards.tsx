"use client";

import { usePurchaseOrderStore } from "@/store/purchaseOrderStore";

export function PurchaseOrderKpiCards() {
  const getKpi = usePurchaseOrderStore((s) => s.getKpi);
  const orders = usePurchaseOrderStore((s) => s.orders);
  const kpi = getKpi();

  const cards = [
    {
      label: "전체 발주",
      value: `${kpi.total}건`,
      sub: "이번 달 누계",
      color: "text-violet-600",
    },
    {
      label: "승인 대기",
      value: `${kpi.pending}건`,
      sub: "처리 필요",
      color: kpi.pending > 0 ? "text-amber-500" : "text-zinc-500",
    },
    {
      label: "입고 진행 중",
      value: `${kpi.receiving}건`,
      sub: "현재 입고 중",
      color: "text-blue-600",
    },
    {
      label: "총 발주 금액",
      value: `${(kpi.totalAmount / 1_000_000).toFixed(1)}백만원`,
      sub: `완료 ${kpi.completed}건 포함`,
      color: "text-zinc-800 dark:text-zinc-100",
    },
  ];

  // 카드 렌더링에 orders가 필요하진 않지만 polling 반응성을 위해 구독 유지
  void orders;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

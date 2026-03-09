"use client";

import { useSettlementStore } from "@/store/settlementStore";

export function SettlementKpiCards() {
  const getKpi = useSettlementStore((s) => s.getKpi);
  const settlements = useSettlementStore((s) => s.settlements);
  const kpi = getKpi();

  // 억 단위 포맷 (e.g. 3.2억)
  const formatEok = (amount: number) => {
    const eok = amount / 1_0000_0000;
    if (eok >= 1) return `${eok.toFixed(1)}억`;
    const baekman = amount / 1_000_000;
    return `${baekman.toFixed(0)}백만`;
  };

  const cards = [
    {
      label: "전체 정산",
      value: `${kpi.total}건`,
      sub: "이번 달 누계",
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "정산 대기",
      value: `${kpi.pending}건`,
      sub: "처리 필요",
      color: kpi.pending > 0 ? "text-amber-500" : "text-zinc-500",
    },
    {
      label: "처리 중",
      value: `${kpi.processing}건`,
      sub: "진행 중",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "정산 완료",
      value: `${kpi.completed}건`,
      sub: `완료율 ${kpi.total > 0 ? Math.round((kpi.completed / kpi.total) * 100) : 0}%`,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "이번 달 총액",
      value: formatEok(kpi.totalAmount),
      sub: `완료 ${formatEok(kpi.completedAmount)}`,
      color: "text-violet-700 dark:text-violet-300",
    },
  ];

  // settlements 구독 유지 (polling 반응성)
  void settlements;

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

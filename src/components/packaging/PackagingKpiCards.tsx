"use client";

import { useShallow } from "zustand/shallow";
import { usePackagingStore } from "@/store/packagingStore";

export function PackagingKpiCards() {
  const kpi = usePackagingStore(useShallow((s) => s.getKpi()));

  const cards = [
    {
      label: "전체 포장재 종류",
      value: `${kpi.total}종`,
      sub: `평균 재고일수 ${kpi.daysUntilEmpty}일`,
      color: "text-violet-600",
    },
    {
      label: "재고 충분",
      value: `${kpi.sufficient}종`,
      sub: "최소 재고 이상",
      color: "text-green-600",
    },
    {
      label: "재고 부족",
      value: `${kpi.lowStock}종`,
      sub: "최소 재고 미만",
      color: kpi.lowStock > 0 ? "text-amber-500" : "text-zinc-500",
    },
    {
      label: "즉시 발주 필요",
      value: `${kpi.critical}종`,
      sub: "최소 재고 50% 미만",
      color: kpi.critical > 0 ? "text-red-500" : "text-zinc-500",
    },
  ];

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

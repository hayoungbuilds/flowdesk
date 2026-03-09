"use client";

import { useMemo } from "react";
import { useTrunkStore } from "@/store/trunkStore";

export function TrunkKpiCards() {
  const routes = useTrunkStore((s) => s.routes);
  const getKpi = useTrunkStore((s) => s.getKpi);
  const kpi = useMemo(() => getKpi(), [routes, getKpi]);

  const cards = [
    {
      label: "전체 간선",
      value: `${kpi.total}건`,
      sub: "오늘 운행 물량",
      color: "text-zinc-800 dark:text-zinc-100",
    },
    {
      label: "운행 중",
      value: `${kpi.inTransit}건`,
      sub: "현재 이동 중",
      color: "text-blue-600",
    },
    {
      label: "도착 완료",
      value: `${kpi.arrived}건`,
      sub: "도착 처리 완료",
      color: "text-green-600",
    },
    {
      label: "출발 예정",
      value: `${kpi.scheduled}건`,
      sub: "출발 대기 중",
      color: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: "정시 도착률",
      value: `${kpi.onTimeRate}%`,
      sub: kpi.delayed > 0 ? `지연 ${kpi.delayed}건` : "지연 없음",
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

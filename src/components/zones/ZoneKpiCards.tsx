"use client";

import { useZoneStore } from "@/store/zoneStore";

export function ZoneKpiCards() {
  const getKpi = useZoneStore((s) => s.getKpi);
  const kpi = getKpi();

  const cards = [
    {
      label: "전체 배송",
      value: `${kpi.total}건`,
      sub: "오늘 배송 물량",
      color: "text-zinc-800 dark:text-zinc-100",
    },
    {
      label: "배송 완료",
      value: `${kpi.delivered}건`,
      sub: `완료율 ${kpi.deliveryRate}%`,
      color: "text-green-600",
    },
    {
      label: "배송 중",
      value: `${kpi.inTransit}건`,
      sub: "현재 이동 중",
      color: "text-blue-600",
    },
    {
      label: "배송 실패",
      value: `${kpi.failed}건`,
      sub: kpi.failed > 0 ? "재배송 필요" : "이슈 없음",
      color: kpi.failed > 0 ? "text-red-500" : "text-zinc-400",
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

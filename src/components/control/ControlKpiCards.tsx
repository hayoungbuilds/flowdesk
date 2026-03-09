"use client";

import { useShallow } from "zustand/shallow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useControlStore } from "@/store/controlStore";

export function ControlKpiCards() {
  const kpi = useControlStore(useShallow((s) => s.getKpi()));
  const systemStatus = useControlStore(useShallow((s) => s.getSystemStatus()));

  const statusColor =
    systemStatus === "정상"
      ? "text-green-600"
      : systemStatus === "주의"
      ? "text-yellow-500"
      : "text-red-600";

  const statusBg =
    systemStatus === "정상"
      ? "bg-green-50 dark:bg-green-950/30"
      : systemStatus === "주의"
      ? "bg-yellow-50 dark:bg-yellow-950/30"
      : "bg-red-50 dark:bg-red-950/30";

  const activeColor =
    kpi.criticalCount > 0
      ? "text-red-600"
      : kpi.activeAlerts > 5
      ? "text-yellow-500"
      : "text-zinc-800 dark:text-zinc-100";

  const activeBg =
    kpi.criticalCount > 0
      ? "bg-red-50 dark:bg-red-950/30"
      : kpi.activeAlerts > 5
      ? "bg-yellow-50 dark:bg-yellow-950/30"
      : "bg-white dark:bg-zinc-900";

  const cards = [
    {
      title: "시스템 상태",
      value: systemStatus,
      sub: systemStatus === "정상" ? "모든 시스템 정상" : "점검 필요",
      color: statusColor,
      bg: statusBg,
    },
    {
      title: "활성 알림",
      value: kpi.activeAlerts,
      sub: `전체 ${kpi.totalAlerts}건 중`,
      color: activeColor,
      bg: activeBg,
    },
    {
      title: "해결율",
      value: `${kpi.resolvedRate}%`,
      sub: "전체 알림 대비",
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "긴급 알림",
      value: kpi.criticalCount,
      sub: kpi.criticalCount > 0 ? "즉시 조치 필요" : "없음",
      color: kpi.criticalCount > 0 ? "text-red-600" : "text-zinc-400",
      bg: kpi.criticalCount > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-white dark:bg-zinc-900",
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
              {typeof card.value === "number"
                ? card.value.toLocaleString()
                : card.value}
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {card.sub}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

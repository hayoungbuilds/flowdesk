import { Worker, WorkerRole, WorkerStatus, HourlyPerformance } from "@/types";

const NAMES = [
  "김태민", "이지수", "박현우", "최예진", "정민호",
  "강수빈", "조성준", "윤아름", "임재현", "한지민",
  "오세훈", "신다은", "배준영", "류민아", "송현석",
  "권나연", "문성빈", "유하린", "남건우", "서지은",
];

const ZONES: Record<WorkerRole, string[]> = {
  PICKING: ["A구역", "B구역", "C구역", "D구역"],
  PACKING: ["P1라인", "P2라인", "P3라인"],
  SHIPPING: ["출고1번홀", "출고2번홀"],
};

const ROLE_CONFIG: Record<WorkerRole, { target: number; avgBase: number }> = {
  PICKING: { target: 200, avgBase: 45 },   // 목표 200건, 평균 45초
  PACKING: { target: 150, avgBase: 80 },   // 목표 150건, 평균 80초
  SHIPPING: { target: 100, avgBase: 120 }, // 목표 100건, 평균 120초
};

const ROLES: WorkerRole[] = ["PICKING", "PACKING", "SHIPPING"];
const STATUSES: WorkerStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "BREAK", "OFFLINE"];

export function generateWorkers(): Worker[] {
  const shuffled = [...NAMES].sort(() => Math.random() - 0.5);

  return shuffled.map((name, i) => {
    const role = ROLES[i % ROLES.length];
    const { target, avgBase } = ROLE_CONFIG[role];
    const zones = ZONES[role];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const processed = status === "OFFLINE"
      ? Math.floor(target * Math.random() * 0.5)
      : Math.floor(target * (0.4 + Math.random() * 0.7));

    return {
      id: `WRK-${String(i + 1).padStart(3, "0")}`,
      name,
      role,
      status,
      zone: zones[Math.floor(Math.random() * zones.length)],
      processed: Math.min(processed, target + 20),
      target,
      avgTimeSeconds: Math.floor(avgBase + (Math.random() - 0.5) * 20),
    };
  });
}

export function generateHourlyPerformance(): HourlyPerformance[] {
  return Array.from({ length: 24 }, (_, i) => {
    const isWorkHour = i >= 6 && i <= 22;
    const isPeak = (i >= 10 && i <= 12) || (i >= 15 && i <= 17);
    const base = isWorkHour ? 30 : 2;
    const peak = isPeak ? 25 : 0;
    return {
      hour: `${String(i).padStart(2, "0")}:00`,
      picking: base + peak + Math.floor(Math.random() * 15),
      packing: Math.floor((base + peak) * 0.75) + Math.floor(Math.random() * 12),
      shipping: Math.floor((base + peak) * 0.5) + Math.floor(Math.random() * 8),
    };
  });
}

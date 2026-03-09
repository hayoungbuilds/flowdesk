import { create } from "zustand";
import { Worker, WorkerRole, HourlyPerformance } from "@/types";
import { generateWorkers, generateHourlyPerformance } from "@/lib/mock/workers";

interface WorkerStore {
  workers: Worker[];
  hourlyPerformance: HourlyPerformance[];
  selectedRole: WorkerRole | "ALL";

  setSelectedRole: (role: WorkerRole | "ALL") => void;
  getFilteredWorkers: () => Worker[];
  getKpi: () => {
    total: number;
    active: number;
    avgAchievementRate: number;
    avgTimeSeconds: number;
  };
}

export const useWorkerStore = create<WorkerStore>((set, get) => ({
  workers: generateWorkers(),
  hourlyPerformance: generateHourlyPerformance(),
  selectedRole: "ALL",

  setSelectedRole: (role) => set({ selectedRole: role }),

  getFilteredWorkers: () => {
    const { workers, selectedRole } = get();
    if (selectedRole === "ALL") return workers;
    return workers.filter((w) => w.role === selectedRole);
  },

  getKpi: () => {
    const { workers } = get();
    if (workers.length === 0) {
      return { total: 0, active: 0, avgAchievementRate: 0, avgTimeSeconds: 0 };
    }

    const active = workers.filter((w) => w.status === "ACTIVE").length;

    // 작업자별 달성률을 평균 내어 전체 목표 달성률 산출
    const { totalRate, totalAvgTime } = workers.reduce(
      (acc, w) => ({
        totalRate: acc.totalRate + w.processed / w.target,
        totalAvgTime: acc.totalAvgTime + w.avgTimeSeconds,
      }),
      { totalRate: 0, totalAvgTime: 0 }
    );

    return {
      total: workers.length,
      active,
      avgAchievementRate: Math.round((totalRate / workers.length) * 100),
      avgTimeSeconds: Math.round(totalAvgTime / workers.length),
    };
  },
}));

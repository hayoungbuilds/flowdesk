import { create } from "zustand";
import { SystemAlert, AlertLevel, OperationStat } from "@/types";
import { generateSystemAlerts, generateOperationStats } from "@/lib/mock/control";

const LEVEL_ORDER: Record<AlertLevel, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
};

interface ControlStore {
  alerts: SystemAlert[];
  operationStats: OperationStat[];
  isLive: boolean;
  lastUpdated: Date | null;

  // actions
  toggleLive: () => void;
  resolveAlert: (id: string) => void;
  refresh: () => void;

  // selectors
  getActiveAlerts: () => SystemAlert[];
  getAlertCounts: () => { critical: number; warning: number; info: number; total: number };
  getSystemStatus: () => "정상" | "주의" | "위험";
  getKpi: () => {
    totalAlerts: number;
    activeAlerts: number;
    resolvedRate: number;
    criticalCount: number;
  };
}

export const useControlStore = create<ControlStore>((set, get) => ({
  alerts: generateSystemAlerts(40),
  operationStats: generateOperationStats(),
  isLive: false,
  lastUpdated: new Date(),

  toggleLive: () => set((state) => ({ isLive: !state.isLive })),

  resolveAlert: (id: string) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, resolved: true } : a
      ),
    })),

  refresh: () => {
    set((state) => {
      // Add 0-2 new alerts
      const newCount = Math.floor(Math.random() * 3); // 0, 1, or 2
      const newAlerts =
        newCount > 0
          ? generateSystemAlerts(newCount).map((a, i) => ({
              ...a,
              id: `ALERT-${String(state.alerts.length + i + 1).padStart(5, "0")}`,
              createdAt: new Date().toISOString(),
              resolved: false,
            }))
          : [];

      // Update operation stats: add new time slot, remove oldest
      const now = new Date();
      const hour = now.getHours();
      const mins = now.getMinutes();
      const label = `${String(hour).padStart(2, "0")}:${mins >= 30 ? "30" : "00"}`;

      const multiplier =
        hour >= 10 && hour <= 12
          ? 1.0
          : hour >= 15 && hour <= 17
          ? 0.9
          : hour >= 8 && hour <= 9
          ? 0.6
          : 0.5;

      const newStat: OperationStat = {
        time: label,
        inbound: Math.floor(Math.random() * (100 * multiplier - 20 * multiplier) + 20 * multiplier),
        picking: Math.floor(Math.random() * (200 * multiplier - 50 * multiplier) + 50 * multiplier),
        packing: Math.floor(Math.random() * (180 * multiplier - 40 * multiplier) + 40 * multiplier),
        shipping: Math.floor(Math.random() * (150 * multiplier - 30 * multiplier) + 30 * multiplier),
      };

      const updatedStats = [...state.operationStats.slice(1), newStat];

      return {
        alerts: [...newAlerts, ...state.alerts],
        operationStats: updatedStats,
        lastUpdated: new Date(),
      };
    });
  },

  getActiveAlerts: () => {
    const { alerts } = get();
    return alerts
      .filter((a) => !a.resolved)
      .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
  },

  getAlertCounts: () => {
    const { alerts } = get();
    const active = alerts.filter((a) => !a.resolved);
    return {
      critical: active.filter((a) => a.level === "CRITICAL").length,
      warning: active.filter((a) => a.level === "WARNING").length,
      info: active.filter((a) => a.level === "INFO").length,
      total: active.length,
    };
  },

  getSystemStatus: (): "정상" | "주의" | "위험" => {
    const { alerts } = get();
    const active = alerts.filter((a) => !a.resolved);
    const criticalCount = active.filter((a) => a.level === "CRITICAL").length;
    const warningCount = active.filter((a) => a.level === "WARNING").length;
    if (criticalCount > 0) return "위험";
    if (warningCount > 2) return "주의";
    return "정상";
  },

  getKpi: () => {
    const { alerts } = get();
    const total = alerts.length;
    const active = alerts.filter((a) => !a.resolved);
    const resolved = alerts.filter((a) => a.resolved);
    const criticalCount = active.filter((a) => a.level === "CRITICAL").length;
    return {
      totalAlerts: total,
      activeAlerts: active.length,
      resolvedRate: total > 0 ? Math.round((resolved.length / total) * 100) : 0,
      criticalCount,
    };
  },
}));

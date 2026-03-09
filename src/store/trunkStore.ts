import { create } from "zustand";
import { TrunkRoute, TrunkStatus } from "@/types";
import { generateTrunkRoutes, generateHubFlowData } from "@/lib/mock/trunk";

interface TrunkStore {
  routes: TrunkRoute[];
  selectedStatus: TrunkStatus | "ALL";
  selectedOrigin: string | "ALL";
  searchQuery: string;

  setSelectedStatus: (status: TrunkStatus | "ALL") => void;
  setSelectedOrigin: (origin: string | "ALL") => void;
  setSearchQuery: (query: string) => void;

  getFilteredRoutes: () => TrunkRoute[];
  getKpi: () => {
    total: number;
    scheduled: number;
    inTransit: number;
    arrived: number;
    delayed: number;
    onTimeRate: number;
  };
  getHubFlowData: () => { hub: string; outbound: number; inbound: number }[];
  getRouteStats: () => { route: string; count: number; avgCargo: number }[];
}

export const useTrunkStore = create<TrunkStore>((set, get) => ({
  routes: generateTrunkRoutes(60),
  selectedStatus: "ALL",
  selectedOrigin: "ALL",
  searchQuery: "",

  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedOrigin: (origin) => set({ selectedOrigin: origin }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredRoutes: () => {
    const { routes, selectedStatus, selectedOrigin, searchQuery } = get();
    const q = searchQuery.trim().toLowerCase();
    return routes.filter((r) => {
      const statusOk = selectedStatus === "ALL" || r.status === selectedStatus;
      const originOk = selectedOrigin === "ALL" || r.origin === selectedOrigin;
      const searchOk =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q) ||
        r.vehicleNo.toLowerCase().includes(q);
      return statusOk && originOk && searchOk;
    });
  },

  getKpi: () => {
    const { routes } = get();
    const total = routes.length;
    if (total === 0)
      return { total: 0, scheduled: 0, inTransit: 0, arrived: 0, delayed: 0, onTimeRate: 0 };

    const scheduled = routes.filter((r) => r.status === "SCHEDULED").length;
    const inTransit = routes.filter((r) => r.status === "IN_TRANSIT").length;
    const arrived = routes.filter((r) => r.status === "ARRIVED").length;
    const delayed = routes.filter((r) => r.status === "DELAYED").length;

    const completedOrDelayed = arrived + delayed;
    const onTimeRate =
      completedOrDelayed === 0
        ? 0
        : Math.round((arrived / completedOrDelayed) * 100);

    return { total, scheduled, inTransit, arrived, delayed, onTimeRate };
  },

  getHubFlowData: () => {
    return generateHubFlowData();
  },

  getRouteStats: () => {
    const { routes } = get();
    const map: Record<string, { count: number; totalCargo: number }> = {};

    routes.forEach((r) => {
      const key = `${r.origin} → ${r.destination}`;
      if (!map[key]) map[key] = { count: 0, totalCargo: 0 };
      map[key].count++;
      map[key].totalCargo += r.cargoCount;
    });

    return Object.entries(map)
      .map(([route, { count, totalCargo }]) => ({
        route,
        count,
        avgCargo: Math.round(totalCargo / count),
      }))
      .sort((a, b) => b.count - a.count);
  },
}));

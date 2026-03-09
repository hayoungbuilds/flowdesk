import { create } from "zustand";
import { InboundItem, InboundStatus } from "@/types";
import { generateInboundItems } from "@/lib/mock/inbound";

interface InboundStore {
  items: InboundItem[];
  selectedStatus: InboundStatus | "ALL";
  searchQuery: string;

  setSelectedStatus: (status: InboundStatus | "ALL") => void;
  setSearchQuery: (query: string) => void;

  getFilteredItems: () => InboundItem[];
  getKpi: () => {
    total: number;
    scheduled: number;
    inProgress: number;
    inspecting: number;
    completed: number;
    rejected: number;
    completionRate: number;
  };
  getStatusCounts: () => { name: string; value: number }[];
  getSupplierStats: () => { supplier: string; count: number; completed: number }[];
}

export const useInboundStore = create<InboundStore>((set, get) => ({
  items: generateInboundItems(80),
  selectedStatus: "ALL",
  searchQuery: "",

  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredItems: () => {
    const { items, selectedStatus, searchQuery } = get();
    const q = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const matchesQuery =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  },

  getKpi: () => {
    const { items } = get();
    const scheduled = items.filter((i) => i.status === "SCHEDULED").length;
    const inProgress = items.filter((i) => i.status === "IN_PROGRESS").length;
    const inspecting = items.filter((i) => i.status === "INSPECTING").length;
    const completed = items.filter((i) => i.status === "COMPLETED").length;
    const rejected = items.filter((i) => i.status === "REJECTED").length;
    const completionRate =
      items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

    return {
      total: items.length,
      scheduled,
      inProgress,
      inspecting,
      completed,
      rejected,
      completionRate,
    };
  },

  getStatusCounts: () => {
    const { items } = get();
    const counts: Record<InboundStatus, number> = {
      SCHEDULED: 0,
      IN_PROGRESS: 0,
      INSPECTING: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };
    for (const item of items) {
      counts[item.status]++;
    }
    return [
      { name: "입고 예정", value: counts.SCHEDULED },
      { name: "입고 중", value: counts.IN_PROGRESS },
      { name: "검수 중", value: counts.INSPECTING },
      { name: "입고 완료", value: counts.COMPLETED },
      { name: "반려", value: counts.REJECTED },
    ];
  },

  getSupplierStats: () => {
    const { items } = get();
    const map = new Map<string, { count: number; completed: number }>();

    for (const item of items) {
      const existing = map.get(item.supplier) ?? { count: 0, completed: 0 };
      map.set(item.supplier, {
        count: existing.count + 1,
        completed: existing.completed + (item.status === "COMPLETED" ? 1 : 0),
      });
    }

    return Array.from(map.entries())
      .map(([supplier, stats]) => ({ supplier, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  },
}));

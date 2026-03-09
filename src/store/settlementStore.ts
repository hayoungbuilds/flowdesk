import { create } from "zustand";
import { Settlement, SettlementStatus } from "@/types";
import { generateSettlements, generateMonthlySettlementData } from "@/lib/mock/settlement";

interface SettlementStore {
  settlements: Settlement[];
  selectedStatus: SettlementStatus | "ALL";
  searchQuery: string;

  setSelectedStatus: (status: SettlementStatus | "ALL") => void;
  setSearchQuery: (query: string) => void;

  getFilteredSettlements: () => Settlement[];
  getKpi: () => {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    error: number;
    totalAmount: number;
    completedAmount: number;
  };
  getSupplierStats: () => { supplier: string; totalAmount: number; count: number }[];
  getMonthlyData: () => { month: string; amount: number; count: number }[];
}

export const useSettlementStore = create<SettlementStore>((set, get) => ({
  settlements: generateSettlements(60),
  selectedStatus: "ALL",
  searchQuery: "",

  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredSettlements: () => {
    const { settlements, selectedStatus, searchQuery } = get();
    let result = selectedStatus === "ALL"
      ? settlements
      : settlements.filter((s) => s.status === selectedStatus);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.supplier.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.period.toLowerCase().includes(q)
      );
    }
    return result;
  },

  getKpi: () => {
    const { settlements } = get();
    return settlements.reduce(
      (acc, s) => {
        acc.total++;
        if (s.status === "PENDING") acc.pending++;
        if (s.status === "PROCESSING") acc.processing++;
        if (s.status === "COMPLETED") acc.completed++;
        if (s.status === "ERROR") acc.error++;
        acc.totalAmount += s.totalAmount;
        if (s.status === "COMPLETED") acc.completedAmount += s.totalAmount;
        return acc;
      },
      { total: 0, pending: 0, processing: 0, completed: 0, error: 0, totalAmount: 0, completedAmount: 0 }
    );
  },

  getSupplierStats: () => {
    const { settlements } = get();
    const map: Record<string, { totalAmount: number; count: number }> = {};
    settlements.forEach((s) => {
      if (!map[s.supplier]) map[s.supplier] = { totalAmount: 0, count: 0 };
      map[s.supplier].totalAmount += s.totalAmount;
      map[s.supplier].count++;
    });
    return Object.entries(map)
      .map(([supplier, v]) => ({ supplier, ...v }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 8);
  },

  getMonthlyData: () => {
    return generateMonthlySettlementData();
  },
}));

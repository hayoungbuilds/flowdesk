import { create } from "zustand";
import { ReturnItem, ReturnReason, ReturnStatus } from "@/types";
import { generateReturns, generateDailyReturnData } from "@/lib/mock/returns";

const REASON_LABELS: Record<ReturnReason, string> = {
  DAMAGED: "상품파손",
  WRONG_ITEM: "오배송",
  CHANGE_OF_MIND: "단순변심",
  DEFECTIVE: "불량",
  OTHER: "기타",
};

interface ReturnsStore {
  items: ReturnItem[];
  selectedStatus: ReturnStatus | "ALL";
  selectedReason: ReturnReason | "ALL";
  searchQuery: string;

  setSelectedStatus: (status: ReturnStatus | "ALL") => void;
  setSelectedReason: (reason: ReturnReason | "ALL") => void;
  setSearchQuery: (query: string) => void;

  getFilteredItems: () => ReturnItem[];
  getKpi: () => {
    total: number;
    requested: number;
    collecting: number;
    inspecting: number;
    refunded: number;
    rejected: number;
    totalRefundAmount: number;
    refundRate: number;
  };
  getReasonStats: () => { name: string; value: number }[];
  getDailyData: () => { date: string; count: number; refundAmount: number }[];
}

export const useReturnsStore = create<ReturnsStore>((set, get) => ({
  items: generateReturns(100),
  selectedStatus: "ALL",
  selectedReason: "ALL",
  searchQuery: "",

  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedReason: (reason) => set({ selectedReason: reason }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredItems: () => {
    const { items, selectedStatus, selectedReason, searchQuery } = get();
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const statusOk = selectedStatus === "ALL" || item.status === selectedStatus;
      const reasonOk = selectedReason === "ALL" || item.reason === selectedReason;
      const searchOk =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return statusOk && reasonOk && searchOk;
    });
  },

  getKpi: () => {
    const { items } = get();
    const total = items.length;
    if (total === 0) {
      return { total: 0, requested: 0, collecting: 0, inspecting: 0, refunded: 0, rejected: 0, totalRefundAmount: 0, refundRate: 0 };
    }
    const requested = items.filter((i) => i.status === "REQUESTED").length;
    const collecting = items.filter((i) => i.status === "COLLECTING").length;
    const inspecting = items.filter((i) => i.status === "INSPECTING").length;
    const refunded = items.filter((i) => i.status === "REFUNDED").length;
    const rejected = items.filter((i) => i.status === "REJECTED").length;
    const totalRefundAmount = items
      .filter((i) => i.status === "REFUNDED")
      .reduce((sum, i) => sum + i.refundAmount, 0);
    const refundRate = Math.round((refunded / total) * 100);
    return { total, requested, collecting, inspecting, refunded, rejected, totalRefundAmount, refundRate };
  },

  getReasonStats: () => {
    const { items } = get();
    const map: Record<string, number> = {};
    items.forEach((item) => {
      const name = REASON_LABELS[item.reason];
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  },

  getDailyData: () => generateDailyReturnData(),
}));

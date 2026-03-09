import { create } from "zustand";
import { PurchaseOrder, PurchaseOrderStatus } from "@/types";
import { generatePurchaseOrders } from "@/lib/mock/purchase-orders";

interface PurchaseOrderStore {
  orders: PurchaseOrder[];
  selectedStatus: PurchaseOrderStatus | "ALL";

  setSelectedStatus: (status: PurchaseOrderStatus | "ALL") => void;
  getFilteredOrders: () => PurchaseOrder[];
  getKpi: () => {
    total: number;
    pending: number;
    receiving: number;
    completed: number;
    totalAmount: number; // 총 발주 금액
  };
  getSupplierStats: () => { supplier: string; count: number; amount: number }[];
}

export const usePurchaseOrderStore = create<PurchaseOrderStore>((set, get) => ({
  orders: generatePurchaseOrders(40),
  selectedStatus: "ALL",

  setSelectedStatus: (status) => set({ selectedStatus: status }),

  getFilteredOrders: () => {
    const { orders, selectedStatus } = get();
    if (selectedStatus === "ALL") return orders;
    return orders.filter((o) => o.status === selectedStatus);
  },

  getKpi: () => {
    const { orders } = get();
    return orders.reduce(
      (acc, o) => {
        acc.total++;
        if (o.status === "PENDING") acc.pending++;
        if (o.status === "RECEIVING") acc.receiving++;
        if (o.status === "COMPLETED") acc.completed++;
        acc.totalAmount += o.quantity * o.unitPrice;
        return acc;
      },
      { total: 0, pending: 0, receiving: 0, completed: 0, totalAmount: 0 }
    );
  },

  getSupplierStats: () => {
    const { orders } = get();
    const map: Record<string, { count: number; amount: number }> = {};
    orders.forEach((o) => {
      if (!map[o.supplier]) map[o.supplier] = { count: 0, amount: 0 };
      map[o.supplier].count++;
      map[o.supplier].amount += o.quantity * o.unitPrice;
    });
    return Object.entries(map)
      .map(([supplier, v]) => ({ supplier, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // 상위 8개 공급업체
  },
}));

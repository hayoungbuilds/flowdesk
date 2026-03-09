import { create } from "zustand";
import { Order, OrderStatus, OrderSummary, HourlyData } from "@/types";
import { generateOrders, generateHourlyData } from "@/lib/mock/orders";

interface OrderStore {
  orders: Order[];
  hourlyData: HourlyData[];
  selectedStatus: OrderStatus | "ALL";
  isPolling: boolean;
  lastUpdated: Date | null;

  // actions
  setSelectedStatus: (status: OrderStatus | "ALL") => void;
  refreshOrders: () => void;
  startPolling: () => void;
  stopPolling: () => void;

  // computed (selectors)
  getFilteredOrders: () => Order[];
  getSummary: () => OrderSummary;
  getStatusCounts: () => { name: string; value: number }[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: generateOrders(200),
  hourlyData: generateHourlyData(),
  selectedStatus: "ALL",
  isPolling: false,
  lastUpdated: new Date(),

  setSelectedStatus: (status) => set({ selectedStatus: status }),

  refreshOrders: () => {
    // 실시간 업데이트 시뮬레이션: 일부 주문 상태 무작위 변경
    const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
      RECEIVED: "PICKING",
      PICKING: "PACKING",
      PACKING: "SHIPPED",
      SHIPPED: "DELIVERED",
      DELIVERED: "DELIVERED",
      DELAYED: "PICKING",
    };

    set((state) => {
      const updated = state.orders.map((order) => {
        if (Math.random() < 0.05) {
          return {
            ...order,
            status: NEXT_STATUS[order.status],
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      });

      // 새 주문 1~3개 추가
      const newCount = Math.floor(Math.random() * 3) + 1;
      const newOrders = generateOrders(newCount).map((o, i) => ({
        ...o,
        id: `ORD-${String(state.orders.length + i + 1).padStart(5, "0")}`,
        status: "RECEIVED" as OrderStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // 배열 상한선 500건 유지 (polling으로 인한 무한 증가 방지)
      const combined = [...newOrders, ...updated];
      return {
        orders: combined.length > 500 ? combined.slice(0, 500) : combined,
        lastUpdated: new Date(),
      };
    });
  },

  startPolling: () => set({ isPolling: true }),
  stopPolling: () => set({ isPolling: false }),

  getFilteredOrders: () => {
    const { orders, selectedStatus } = get();
    if (selectedStatus === "ALL") return orders;
    return orders.filter((o) => o.status === selectedStatus);
  },

  getSummary: (): OrderSummary => {
    const { orders } = get();
    // orders를 단 1번 순회해서 모든 카운트 집계
    const acc = orders.reduce(
      (a, o) => {
        if (o.status === "DELIVERED") a.completed++;
        else if (o.status === "DELAYED") a.delayed++;
        else a.processing++;
        return a;
      },
      { processing: 0, completed: 0, delayed: 0 }
    );
    return { total: orders.length, ...acc };
  },

  getStatusCounts: () => {
    const { orders } = get();
    // 순서 고정: 파이 차트 색상이 렌더마다 달라지지 않도록
    const STATUS_ORDER: OrderStatus[] = [
      "RECEIVED", "PICKING", "PACKING", "SHIPPED", "DELIVERED", "DELAYED",
    ];
    const labels: Record<OrderStatus, string> = {
      RECEIVED: "접수",
      PICKING: "피킹",
      PACKING: "패킹",
      SHIPPED: "출고",
      DELIVERED: "배송완료",
      DELAYED: "지연",
    };
    const counts: Partial<Record<OrderStatus, number>> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return STATUS_ORDER.filter((s) => counts[s] !== undefined).map((s) => ({
      name: labels[s],
      value: counts[s]!,
    }));
  },
}));

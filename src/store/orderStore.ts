import { create } from "zustand";
import { Order, OrderStatus, OrderSummary, HourlyData } from "@/types";
import { generateOrders, generateHourlyData } from "@/lib/mock/orders";

export interface DelayedNotification {
  orderId: string;
  customerName: string;
}

interface OrderStore {
  orders: Order[];
  hourlyData: HourlyData[];
  selectedStatus: OrderStatus | "ALL";
  isPolling: boolean;
  lastUpdated: Date | null;
  pendingNotifications: DelayedNotification[];

  // actions
  setSelectedStatus: (status: OrderStatus | "ALL") => void;
  refreshOrders: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  clearPendingNotifications: () => void;

  // computed (selectors)
  getFilteredOrders: () => Order[];
  getSummary: () => OrderSummary;
  getStatusCounts: () => { name: string; value: number }[];
  getKpiMetrics: () => {
    delayRate: number;         // 지연율 (%)
    completionRate: number;    // 완료율 (%)
    avgProcessingMin: number;  // 평균 처리 시간 (분, 접수→완료)
    dailyGoalRate: number;     // 일일 목표 달성률 (목표: 완료 300건)
  };
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: generateOrders(200),
  hourlyData: generateHourlyData(),
  selectedStatus: "ALL",
  isPolling: false,
  lastUpdated: new Date(),
  pendingNotifications: [],

  setSelectedStatus: (status) => set({ selectedStatus: status }),
  clearPendingNotifications: () => set({ pendingNotifications: [] }),

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
      const prevDelayedIds = new Set(
        state.orders.filter((o) => o.status === "DELAYED").map((o) => o.id)
      );

      const updated = state.orders.map((order) => {
        if (Math.random() < 0.05) {
          return {
            ...order,
            status: NEXT_STATUS[order.status],
            updatedAt: new Date().toISOString(),
          };
        }
        // 피킹/패킹 중 일부를 DELAYED로 전환 (1% 확률)
        if (
          (order.status === "PICKING" || order.status === "PACKING") &&
          Math.random() < 0.01
        ) {
          return { ...order, status: "DELAYED" as OrderStatus, updatedAt: new Date().toISOString() };
        }
        return order;
      });

      // 새로 DELAYED가 된 주문만 추출 (기존에 DELAYED였던 건 제외)
      const newlyDelayed: DelayedNotification[] = updated
        .filter((o) => o.status === "DELAYED" && !prevDelayedIds.has(o.id))
        .map((o) => ({ orderId: o.id, customerName: o.customerName }));

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
        pendingNotifications: newlyDelayed,
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

  getKpiMetrics: () => {
    const { orders } = get();
    const total = orders.length;
    if (total === 0) return { delayRate: 0, completionRate: 0, avgProcessingMin: 0, dailyGoalRate: 0 };

    const delivered = orders.filter((o) => o.status === "DELIVERED");
    const delayed = orders.filter((o) => o.status === "DELAYED");

    // 완료된 주문의 createdAt → updatedAt 평균 처리 시간(분)
    const avgProcessingMin =
      delivered.length > 0
        ? Math.round(
            delivered.reduce((sum, o) => {
              const diffMs =
                new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime();
              return sum + diffMs / 1000 / 60;
            }, 0) / delivered.length
          )
        : 0;

    return {
      delayRate: Math.round((delayed.length / total) * 100),
      completionRate: Math.round((delivered.length / total) * 100),
      avgProcessingMin,
      // 일일 목표: 완료 300건
      dailyGoalRate: Math.min(Math.round((delivered.length / 300) * 100), 100),
    };
  },
}));

import { create } from "zustand";

export type NotificationLevel = "info" | "warning" | "critical";

export interface Notification {
  id: string;
  level: NotificationLevel;
  title: string;
  message: string;
  source: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  isOpen: boolean;

  // actions
  add: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  setOpen: (open: boolean) => void;

  // selectors
  getUnreadCount: () => number;
  getByLevel: (level: NotificationLevel) => Notification[];
}

// 초기 샘플 알림
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    level: "critical",
    title: "피킹 지연 감지",
    message: "A구역 피킹 처리 속도가 목표치의 60%로 떨어졌습니다.",
    source: "피킹시스템",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: "notif-002",
    level: "warning",
    title: "재고 임박 알림",
    message: "소형 박스 재고가 최소 기준의 80%에 도달했습니다.",
    source: "재고시스템",
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    read: false,
  },
  {
    id: "notif-003",
    level: "warning",
    title: "배송 지연 주문 발생",
    message: "3건의 주문이 배송 지연 상태로 전환되었습니다.",
    source: "배송시스템",
    createdAt: new Date(Date.now() - 32 * 60 * 1000),
    read: false,
  },
  {
    id: "notif-004",
    level: "info",
    title: "입고 완료",
    message: "농심 입고 배치 (INB-00142) 검수가 완료되었습니다.",
    source: "입고시스템",
    createdAt: new Date(Date.now() - 55 * 60 * 1000),
    read: true,
  },
  {
    id: "notif-005",
    level: "info",
    title: "정산 처리 완료",
    message: "CJ제일제당 2025-05 정산이 완료되었습니다.",
    source: "정산시스템",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "notif-006",
    level: "info",
    title: "간선 도착",
    message: "서울 허브 → 부산 허브 (TRK-00023) 도착 완료.",
    source: "간선시스템",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
  },
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  isOpen: false,

  add: (n) =>
    set((state) => ({
      notifications: [
        {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, 50), // 최대 50개 유지
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),

  setOpen: (open) => set({ isOpen: open }),

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

  getByLevel: (level) => get().notifications.filter((n) => n.level === level),
}));

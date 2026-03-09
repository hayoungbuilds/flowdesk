"use client";

import { useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useToastStore } from "@/store/toastStore";

// 지연 주문 발생 시 orderStore의 pendingNotifications를 감지하여 toast 발행
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pendingNotifications = useOrderStore((s) => s.pendingNotifications);
  const clearPendingNotifications = useOrderStore((s) => s.clearPendingNotifications);
  const addToast = useToastStore((s) => s.add);

  useEffect(() => {
    if (pendingNotifications.length === 0) return;

    pendingNotifications.forEach(({ orderId, customerName }) => {
      addToast({
        type: "warning",
        message: `지연 발생 — ${customerName} (${orderId})`,
      });
    });
    clearPendingNotifications();
  }, [pendingNotifications, clearPendingNotifications, addToast]);

  return <>{children}</>;
}

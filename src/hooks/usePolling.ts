import { useEffect, useRef } from "react";
import { useOrderStore } from "@/store/orderStore";

export function usePolling(intervalMs: number = 5000) {
  const { isPolling, refreshOrders, startPolling, stopPolling } =
    useOrderStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPolling) {
      timerRef.current = setInterval(() => {
        refreshOrders();
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPolling, intervalMs, refreshOrders]);

  return { isPolling, startPolling, stopPolling };
}

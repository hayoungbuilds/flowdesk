import { useEffect, useRef } from "react";
import { useOrderStore } from "@/store/orderStore";

export function usePolling(intervalMs: number = 5000) {
  const isPolling = useOrderStore((s) => s.isPolling);
  const startPolling = useOrderStore((s) => s.startPolling);
  const stopPolling = useOrderStore((s) => s.stopPolling);
  const refreshOrders = useOrderStore((s) => s.refreshOrders);

  // refreshOrders를 ref로 관리해 setInterval 클로저가 항상 최신 참조를 사용하도록 보장.
  // useEffect dependency array에서 함수를 제외해 불필요한 interval 재생성을 방지한다.
  const refreshRef = useRef(refreshOrders);
  useEffect(() => {
    refreshRef.current = refreshOrders;
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPolling) {
      timerRef.current = setInterval(() => {
        refreshRef.current();
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
        timerRef.current = null;
      }
    };
  }, [isPolling, intervalMs]); // refreshOrders 의존성 제거 — ref로 대체

  return { isPolling, startPolling, stopPolling };
}

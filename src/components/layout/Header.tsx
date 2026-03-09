"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import { usePolling } from "@/hooks/usePolling";

export function Header({ title }: { title: string }) {
  const lastUpdated = useOrderStore((s) => s.lastUpdated);
  const { isPolling, startPolling, stopPolling } = usePolling(5000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 마운트 전에는 시각 표시 안 함 (SSR hydration mismatch 방지)
  const formattedTime = mounted && lastUpdated
    ? lastUpdated.toLocaleTimeString("ko-KR")
    : "-";

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <span>마지막 업데이트: {formattedTime}</span>
        <button
          onClick={isPolling ? stopPolling : startPolling}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isPolling
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {isPolling ? "● 실시간 ON" : "○ 실시간 OFF"}
        </button>
      </div>
    </header>
  );
}

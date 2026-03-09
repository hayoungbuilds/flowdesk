"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import { usePolling } from "@/hooks/usePolling";
import { useDarkMode } from "@/hooks/useDarkMode";
import { GlobalSearchTrigger } from "./GlobalSearch";
import { NotificationBell } from "./NotificationPanel";

export function Header({ title }: { title: string }) {
  const lastUpdated = useOrderStore((s) => s.lastUpdated);
  const { isPolling, startPolling, stopPolling } = usePolling(5000);
  const { isDark, toggle: toggleDark, mounted: darkMounted } = useDarkMode();
  const [timeMounted, setTimeMounted] = useState(false);

  // SSR hydration mismatch 방지를 위한 패턴 — Date.toLocaleTimeString()은 서버/클라이언트 결과가 다름
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setTimeMounted(true); }, []);

  // 마운트 전에는 시각 표시 안 함 (SSR hydration mismatch 방지)
  const formattedTime = timeMounted && lastUpdated
    ? lastUpdated.toLocaleTimeString("ko-KR")
    : "-";

  return (
    <header className="h-14 border-b bg-white dark:bg-zinc-900 dark:border-zinc-700 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>

      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        {/* 글로벌 검색 */}
        <GlobalSearchTrigger />

        <span className="hidden md:inline text-xs text-zinc-400 dark:text-zinc-600 ml-1">
          마지막 업데이트: {formattedTime}
        </span>

        {/* 알림 센터 */}
        <NotificationBell />

        {/* 다크모드 토글 */}
        {darkMounted && (
          <button
            onClick={toggleDark}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
          >
            {isDark ? "☀" : "🌙"}
          </button>
        )}

        {/* 실시간 폴링 토글 */}
        <button
          onClick={isPolling ? stopPolling : startPolling}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isPolling
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          {isPolling ? "● 실시간 ON" : "○ 실시간 OFF"}
        </button>
      </div>
    </header>
  );
}

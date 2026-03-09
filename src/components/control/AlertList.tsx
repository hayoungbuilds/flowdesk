"use client";

import { useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useControlStore } from "@/store/controlStore";
import { cn } from "@/lib/utils";
import { AlertLevel } from "@/types";

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH}시간 전`;
}

const LEVEL_BORDER: Record<AlertLevel, string> = {
  CRITICAL: "border-l-red-500",
  WARNING: "border-l-yellow-400",
  INFO: "border-l-blue-400",
};

const LEVEL_BADGE_CLASS: Record<AlertLevel, string> = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
  WARNING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400",
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
};

const LEVEL_LABEL: Record<AlertLevel, string> = {
  CRITICAL: "긴급",
  WARNING: "주의",
  INFO: "정보",
};

export function AlertList() {
  const alerts = useControlStore((s) => s.alerts);
  const getActiveAlerts = useControlStore((s) => s.getActiveAlerts);
  const activeAlerts = useMemo(() => getActiveAlerts(), [alerts, getActiveAlerts]);
  const isLive = useControlStore((s) => s.isLive);
  const toggleLive = useControlStore((s) => s.toggleLive);
  const resolveAlert = useControlStore((s) => s.resolveAlert);
  const refresh = useControlStore((s) => s.refresh);

  // Mirror the usePolling pattern: ref to keep refresh stable in setInterval closure
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLive) {
      timerRef.current = setInterval(() => {
        refreshRef.current();
      }, 5000);
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
  }, [isLive]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            활성 알림
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                실시간 업데이트 중...
              </span>
            )}
            <button
              onClick={toggleLive}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full border transition-colors",
                isLive
                  ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-950/40 dark:border-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/60"
                  : "bg-zinc-100 border-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {isLive ? "라이브 ON" : "라이브 OFF"}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-400 dark:text-zinc-500 gap-1">
            <span className="text-2xl">✓</span>
            <span className="text-sm">모든 알림이 해결되었습니다.</span>
          </div>
        ) : (
          <ul className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {activeAlerts.map((alert) => (
              <li
                key={alert.id}
                className={cn(
                  "border-l-4 pl-3 py-2 rounded-r-lg bg-zinc-50 dark:bg-zinc-800/50",
                  LEVEL_BORDER[alert.level]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "text-xs font-semibold px-1.5 py-0.5 rounded",
                          LEVEL_BADGE_CLASS[alert.level]
                        )}
                      >
                        {LEVEL_LABEL[alert.level]}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {alert.source}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {timeAgo(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="shrink-0 text-xs font-medium px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  >
                    해결
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

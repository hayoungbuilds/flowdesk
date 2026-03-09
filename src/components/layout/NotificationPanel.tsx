"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore, NotificationLevel } from "@/store/notificationStore";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<NotificationLevel, { label: string; dot: string; border: string; badge: string }> = {
  critical: {
    label: "긴급",
    dot: "bg-red-500",
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  warning: {
    label: "주의",
    dot: "bg-yellow-500",
    border: "border-l-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  },
  info: {
    label: "정보",
    dot: "bg-blue-400",
    border: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function NotificationBell() {
  const isOpen = useNotificationStore((s) => s.isOpen);
  const setOpen = useNotificationStore((s) => s.setOpen);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
  const unread = getUnreadCount();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!isOpen)}
        aria-label={`알림 ${unread > 0 ? `(${unread}개 읽지 않음)` : ""}`}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors relative"
      >
        <span className="text-sm">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {isOpen && <NotificationPanel />}
    </div>
  );
}

function NotificationPanel() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const remove = useNotificationStore((s) => s.remove);
  const setOpen = useNotificationStore((s) => s.setOpen);
  const panelRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-10 w-96 max-h-[480px] bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-xl shadow-2xl z-50 flex flex-col"
      role="dialog"
      aria-label="알림 목록"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">알림</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              모두 읽음
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            ✕
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y dark:divide-zinc-800">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600">
            <span className="text-3xl mb-2">🔕</span>
            <span className="text-sm">알림이 없습니다</span>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = LEVEL_CONFIG[n.level];
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex gap-3 px-4 py-3 border-l-2 cursor-pointer transition-colors",
                  cfg.border,
                  n.read
                    ? "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    : "bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-zinc-800"
                )}
              >
                {/* Dot */}
                <div className="mt-1.5 flex-shrink-0">
                  <div className={cn("w-2 h-2 rounded-full", n.read ? "bg-zinc-300 dark:bg-zinc-600" : cfg.dot)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", cfg.badge)}>
                        {cfg.label}
                      </span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate">
                        {n.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      aria-label="삭제"
                      className="flex-shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{n.source}</span>
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

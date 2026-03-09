"use client";

import { useEffect } from "react";
import { useToastStore, Toast } from "@/store/toastStore";

const TYPE_STYLES: Record<Toast["type"], string> = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const TYPE_ICONS: Record<Toast["type"], string> = {
  warning: "⚠",
  error: "✕",
  success: "✓",
  info: "ℹ",
};

const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-md text-sm animate-in slide-in-from-right-4 fade-in duration-200 ${TYPE_STYLES[toast.type]}`}
    >
      <span className="mt-px font-bold shrink-0">{TYPE_ICONS[toast.type]}</span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        aria-label="알림 닫기"
        className="opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-px"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label="알림 목록"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}

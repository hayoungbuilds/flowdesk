"use client";

import { useEffect } from "react";
import { Order, OrderStatus } from "@/types";
import { StatusBadge } from "./StatusBadge";

const STATUS_STEPS: OrderStatus[] = [
  "RECEIVED",
  "PICKING",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "접수",
  PICKING: "피킹",
  PACKING: "패킹",
  SHIPPED: "출고",
  DELIVERED: "배송완료",
  DELAYED: "지연",
};

function StatusTimeline({ status }: { status: OrderStatus }) {
  const isDelayed = status === "DELAYED";
  const currentIndex = isDelayed ? 1 : STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex && !isDelayed;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-violet-600 text-white"
                    : isCurrent
                    ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`text-[10px] whitespace-nowrap ${
                  isCurrent
                    ? "text-violet-700 font-semibold"
                    : isDone
                    ? "text-zinc-500 dark:text-zinc-400"
                    : "text-zinc-400 dark:text-zinc-600"
                }`}
              >
                {STATUS_LABEL[step]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 mb-5 ${
                  isDone ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailDrawer({ order, onClose }: Props) {
  const open = order !== null;

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="주문 상세"
        className={`fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transform transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-zinc-700">
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
            주문 상세
          </h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {order && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* 주문 ID + 상태 */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">주문번호</p>
                <p className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {order.id}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* 상태 타임라인 */}
            <div>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-3 uppercase tracking-wide">
                처리 단계
              </p>
              <StatusTimeline status={order.status} />
              {order.status === "DELAYED" && (
                <p className="mt-2 text-xs text-red-500 font-medium">
                  ⚠ 처리 지연 중 — 피킹 단계에서 지연이 발생했습니다
                </p>
              )}
            </div>

            {/* 주문 정보 */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                주문 정보
              </p>
              <InfoRow label="고객명" value={order.customerName} />
              <InfoRow label="상품명" value={order.productName} />
              <InfoRow label="수량" value={`${order.quantity}개`} />
              <InfoRow label="권역" value={order.region} />
            </div>

            {/* 시각 정보 */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                시각 정보
              </p>
              <InfoRow
                label="주문 접수"
                value={new Date(order.createdAt).toLocaleString("ko-KR")}
              />
              <InfoRow
                label="최종 업데이트"
                value={new Date(order.updatedAt).toLocaleString("ko-KR")}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-700 dark:text-zinc-200 font-medium">
        {value}
      </span>
    </div>
  );
}

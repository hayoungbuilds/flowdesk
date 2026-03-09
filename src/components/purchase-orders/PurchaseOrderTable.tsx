"use client";

import { useCallback, useMemo } from "react";
import { usePurchaseOrderStore } from "@/store/purchaseOrderStore";
import { downloadCSV } from "@/lib/csv";
import { PurchaseOrder, PurchaseOrderStatus } from "@/types";

const STATUS_OPTIONS: { value: PurchaseOrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "승인 대기" },
  { value: "APPROVED", label: "승인 완료" },
  { value: "RECEIVING", label: "입고 중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소" },
];

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  RECEIVING: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-zinc-100 text-zinc-500",
};

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  RECEIVING: "입고 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}

export function PurchaseOrderTable() {
  const getFilteredOrders = usePurchaseOrderStore((s) => s.getFilteredOrders);
  const selectedStatus = usePurchaseOrderStore((s) => s.selectedStatus);
  const setSelectedStatus = usePurchaseOrderStore((s) => s.setSelectedStatus);
  const orders = usePurchaseOrderStore((s) => s.orders);

  const filtered = useMemo(
    () => getFilteredOrders(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, selectedStatus]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["발주번호", "공급업체", "상품명", "카테고리", "수량", "단가", "총액", "상태", "발주일", "입고예정일"];
    const rows = filtered.map((o) => [
      o.id, o.supplier, o.productName, o.category,
      o.quantity, o.unitPrice, o.quantity * o.unitPrice,
      STATUS_LABEL[o.status],
      formatDate(o.orderedAt), formatDate(o.expectedAt),
    ]);
    downloadCSV(`purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filtered]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      {/* 필터 탭 */}
      <div
        role="tablist"
        aria-label="발주 상태 필터"
        className="flex items-center gap-1 px-4 pt-4 pb-0 border-b dark:border-zinc-700 flex-wrap"
      >
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selectedStatus === opt.value}
            onClick={() => setSelectedStatus(opt.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedStatus === opt.value
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-2 pr-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{filtered.length}건</span>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-[100px_1fr_1fr_80px_100px_100px_120px_110px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700">
        <span>발주번호</span>
        <span>공급업체</span>
        <span>상품명</span>
        <span>카테고리</span>
        <span>수량</span>
        <span>단가</span>
        <span>총액</span>
        <span>상태</span>
      </div>

      {/* 행 */}
      <div className="divide-y dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
        {filtered.map((order) => (
          <PurchaseOrderRow key={order.id} order={order} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            해당 상태의 발주가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

function PurchaseOrderRow({ order }: { order: PurchaseOrder }) {
  return (
    <div className="grid grid-cols-[100px_1fr_1fr_80px_100px_100px_120px_110px] items-center px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{order.id}</span>
      <span className="text-zinc-700 dark:text-zinc-300 truncate">{order.supplier}</span>
      <div>
        <div className="text-zinc-800 dark:text-zinc-200 truncate">{order.productName}</div>
        <div className="text-xs text-zinc-400">
          발주 {formatDate(order.orderedAt)} → 예정 {formatDate(order.expectedAt)}
        </div>
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{order.category}</span>
      <span className="text-zinc-700 dark:text-zinc-300">{order.quantity.toLocaleString()}개</span>
      <span className="text-zinc-600 dark:text-zinc-400 text-xs">{order.unitPrice.toLocaleString()}원</span>
      <span className="text-zinc-700 dark:text-zinc-200 font-medium text-xs">
        {(order.quantity * order.unitPrice).toLocaleString()}원
      </span>
      <span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </span>
    </div>
  );
}

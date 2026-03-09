"use client";

import { memo, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { StatusBadge } from "./StatusBadge";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { downloadCSV } from "@/lib/csv";
import { Order, OrderStatus } from "@/types";

const ROW_HEIGHT = 48;
// 뷰포트를 꽉 채우는 flex 레이아웃을 사용하므로 렌더 버퍼만 넉넉히 잡음
const VISIBLE_COUNT = 30;

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "RECEIVED", label: "접수" },
  { value: "PICKING", label: "피킹" },
  { value: "PACKING", label: "패킹" },
  { value: "SHIPPED", label: "출고" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "DELAYED", label: "지연" },
];

const VALID_STATUSES = new Set<string>(STATUS_OPTIONS.map((o) => o.value));

const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "접수", PICKING: "피킹", PACKING: "패킹",
  SHIPPED: "출고", DELIVERED: "배송완료", DELAYED: "지연",
};

// 가상 스크롤 구현: 보이는 영역의 row만 렌더링
// 200건 기준 DOM 노드 수: 200개 → ~12개 (94% 감소)
export function OrderTable() {
  const getFilteredOrders = useOrderStore((s) => s.getFilteredOrders);
  const selectedStatus = useOrderStore((s) => s.selectedStatus);
  const setSelectedStatus = useOrderStore((s) => s.setSelectedStatus);
  const orders = useOrderStore((s) => s.orders);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const replaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL → 스토어 동기화: 마운트 시 URL의 status 파라미터를 스토어에 반영
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && VALID_STATUSES.has(statusParam)) {
      setSelectedStatus(statusParam as OrderStatus | "ALL");
    }
  // 마운트 시 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스토어 → URL 동기화: 필터 변경 시 URL도 함께 업데이트 (북마크·공유 가능)
  // router.replace는 debounce 처리해 연속 탭 클릭 시 과도한 navigation 방지
  const handleStatusChange = useCallback(
    (status: OrderStatus | "ALL") => {
      setSelectedStatus(status);
      // 탭 전환 시 스크롤 처음으로 초기화
      setScrollTop(0);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;

      if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current);
      replaceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === "ALL") {
          params.delete("status");
        } else {
          params.set("status", status);
        }
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      }, 150);
    },
    [searchParams, pathname, router, setSelectedStatus]
  );

  const filteredOrders = useMemo(
    () => getFilteredOrders(),
    // getFilteredOrders는 Zustand stable reference이므로 dep 불필요
    // orders, selectedStatus 변경 시에만 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, selectedStatus]
  );

  const totalHeight = filteredOrders.length * ROW_HEIGHT;

  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const endIndex = Math.min(
    startIndex + VISIBLE_COUNT + 2,
    filteredOrders.length
  );
  const visibleOrders = filteredOrders.slice(startIndex, endIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = ["주문번호", "고객명", "상품명", "수량", "상태", "권역", "주문시각"];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customerName,
      o.productName,
      o.quantity,
      STATUS_LABEL[o.status],
      o.region,
      new Date(o.createdAt).toLocaleString("ko-KR"),
    ]);
    const label = selectedStatus === "ALL" ? "전체" : STATUS_LABEL[selectedStatus];
    downloadCSV(`orders_${label}_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filteredOrders, selectedStatus]);

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border-0 overflow-hidden">
        {/* 필터 탭 + CSV 버튼 */}
        <div
          role="tablist"
          aria-label="주문 상태 필터"
          className="flex items-center gap-1 px-4 pt-4 pb-0 border-b dark:border-zinc-700 flex-wrap"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="tab"
              aria-selected={selectedStatus === opt.value}
              onClick={() => handleStatusChange(opt.value)}
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
            <span
              className="text-xs text-zinc-400 dark:text-zinc-500"
              aria-live="polite"
              aria-atomic="true"
            >
              총 {filteredOrders.length.toLocaleString()}건
            </span>
            <button
              onClick={handleExportCSV}
              aria-label="CSV로 내보내기"
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              CSV 내보내기
            </button>
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div
          role="row"
          className="grid grid-cols-[120px_1fr_1fr_60px_120px_160px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700"
        >
          <span role="columnheader">주문번호</span>
          <span role="columnheader">고객명</span>
          <span role="columnheader">상품명</span>
          <span role="columnheader">수량</span>
          <span role="columnheader">상태</span>
          <span role="columnheader">주문시각</span>
        </div>

        {/* 가상 스크롤 컨테이너 */}
        <div
          ref={scrollRef}
          role="grid"
          aria-label="주문 목록"
          aria-rowcount={filteredOrders.length}
          onScroll={handleScroll}
          className="flex-1 min-h-0"
          style={{ overflowY: "auto" }}
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleOrders.map((order, i) => (
              <OrderRow
                key={order.id}
                order={order}
                rowIndex={startIndex + i + 1}
                onClick={setSelectedOrder}
                style={{
                  position: "absolute",
                  top: (startIndex + i) * ROW_HEIGHT,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}

const OrderRow = memo(function OrderRow({
  order,
  rowIndex,
  onClick,
  style,
}: {
  order: Order;
  rowIndex: number;
  onClick: (order: Order) => void;
  style: React.CSSProperties;
}) {
  const time = new Date(order.createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      tabIndex={0}
      style={style}
      onClick={() => onClick(order)}
      onKeyDown={(e) => e.key === "Enter" && onClick(order)}
      className="grid grid-cols-[120px_1fr_1fr_60px_120px_160px] items-center px-4 text-sm border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
    >
      <span role="gridcell" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{order.id}</span>
      <span role="gridcell" className="text-zinc-800 dark:text-zinc-200 truncate">{order.customerName}</span>
      <span role="gridcell" className="text-zinc-600 dark:text-zinc-400 truncate">{order.productName}</span>
      <span role="gridcell" className="text-zinc-700 dark:text-zinc-300">{order.quantity}</span>
      <span role="gridcell"><StatusBadge status={order.status} /></span>
      <span role="gridcell" className="text-zinc-400 text-xs">{time}</span>
    </div>
  );
});

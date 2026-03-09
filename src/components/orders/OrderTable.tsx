"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { useOrderStore } from "@/store/orderStore";
import { StatusBadge } from "./StatusBadge";
import { Order, OrderStatus } from "@/types";

const ROW_HEIGHT = 48;
const VISIBLE_COUNT = 15;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_COUNT;

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "RECEIVED", label: "접수" },
  { value: "PICKING", label: "피킹" },
  { value: "PACKING", label: "패킹" },
  { value: "SHIPPED", label: "출고" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "DELAYED", label: "지연" },
];

// 가상 스크롤 구현: 보이는 영역의 row만 렌더링
export function OrderTable() {
  const getFilteredOrders = useOrderStore((s) => s.getFilteredOrders);
  const selectedStatus = useOrderStore((s) => s.selectedStatus);
  const setSelectedStatus = useOrderStore((s) => s.setSelectedStatus);
  const orders = useOrderStore((s) => s.orders);

  const [scrollTop, setScrollTop] = useState(0);

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

  return (
    <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden">
      {/* 필터 탭 */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedStatus(opt.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedStatus === opt.value
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-400 pr-2 pb-2">
          총 {filteredOrders.length.toLocaleString()}건
        </span>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[120px_1fr_1fr_60px_120px_160px] text-xs font-semibold text-zinc-500 uppercase tracking-wide bg-zinc-50 px-4 py-3 border-b">
        <span>주문번호</span>
        <span>고객명</span>
        <span>상품명</span>
        <span>수량</span>
        <span>상태</span>
        <span>주문시각</span>
      </div>

      {/* 가상 스크롤 컨테이너 */}
      <div
        onScroll={handleScroll}
        style={{ height: CONTAINER_HEIGHT, overflowY: "auto" }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleOrders.map((order, i) => (
            <OrderRow
              key={order.id}
              order={order}
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
  );
}

const OrderRow = memo(function OrderRow({
  order,
  style,
}: {
  order: Order;
  style: React.CSSProperties;
}) {
  const time = new Date(order.createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={style}
      className="grid grid-cols-[120px_1fr_1fr_60px_120px_160px] items-center px-4 text-sm border-b hover:bg-zinc-50 transition-colors"
    >
      <span className="font-mono text-xs text-zinc-500">{order.id}</span>
      <span className="text-zinc-800 truncate">{order.customerName}</span>
      <span className="text-zinc-600 truncate">{order.productName}</span>
      <span className="text-zinc-700">{order.quantity}</span>
      <StatusBadge status={order.status} />
      <span className="text-zinc-400 text-xs">{time}</span>
    </div>
  );
});

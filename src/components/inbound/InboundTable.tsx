"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useInboundStore } from "@/store/inboundStore";
import { downloadCSV } from "@/lib/csv";
import { InboundItem, InboundStatus } from "@/types";

const STATUS_OPTIONS: { value: InboundStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "SCHEDULED", label: "입고 예정" },
  { value: "IN_PROGRESS", label: "입고 중" },
  { value: "INSPECTING", label: "검수 중" },
  { value: "COMPLETED", label: "입고 완료" },
  { value: "REJECTED", label: "반려" },
];

const VALID_STATUSES = new Set<string>(STATUS_OPTIONS.map((o) => o.value));

const STATUS_CONFIG: Record<InboundStatus, { label: string; className: string }> = {
  SCHEDULED: {
    label: "입고 예정",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300",
  },
  IN_PROGRESS: {
    label: "입고 중",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  INSPECTING: {
    label: "검수 중",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300",
  },
  COMPLETED: {
    label: "입고 완료",
    className: "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function InboundTable() {
  const getFilteredItems = useInboundStore((s) => s.getFilteredItems);
  const selectedStatus = useInboundStore((s) => s.selectedStatus);
  const setSelectedStatus = useInboundStore((s) => s.setSelectedStatus);
  const searchQuery = useInboundStore((s) => s.searchQuery);
  const setSearchQuery = useInboundStore((s) => s.setSearchQuery);
  const items = useInboundStore((s) => s.items);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const replaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && VALID_STATUSES.has(statusParam)) {
      setSelectedStatus(statusParam as InboundStatus | "ALL");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedStatus]);

  const handleStatusChange = useCallback(
    (status: InboundStatus | "ALL") => {
      setSelectedStatus(status);

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

  const filtered = useMemo(
    () => getFilteredItems(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selectedStatus, searchQuery]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["입고ID", "공급사", "상품명", "카테고리", "예정수량", "입고수량", "상태", "예정일"];
    const rows = filtered.map((item) => [
      item.id,
      item.supplier,
      item.productName,
      item.category,
      item.expectedQty,
      item.receivedQty,
      STATUS_CONFIG[item.status].label,
      formatDate(item.scheduledAt),
    ]);
    const label = selectedStatus === "ALL" ? "전체" : STATUS_CONFIG[selectedStatus as InboundStatus].label;
    downloadCSV(`inbound_${label}_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filtered, selectedStatus]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      <div
        role="tablist"
        aria-label="입고 상태 필터"
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
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ID, 공급사, 상품명 검색"
            aria-label="입고 항목 검색"
            className="px-3 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 w-44"
          />
          <span className="text-xs text-zinc-400 dark:text-zinc-500" aria-live="polite" aria-atomic="true">
            {filtered.length}건
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

      <div
        role="row"
        className="grid grid-cols-[140px_100px_1fr_90px_90px_90px_100px_140px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700"
      >
        <span role="columnheader">입고ID</span>
        <span role="columnheader">공급사</span>
        <span role="columnheader">상품명</span>
        <span role="columnheader">카테고리</span>
        <span role="columnheader">예정수량</span>
        <span role="columnheader">입고수량</span>
        <span role="columnheader">상태</span>
        <span role="columnheader">예정일</span>
      </div>

      <div
        ref={scrollRef}
        role="grid"
        aria-label="입고 목록"
        aria-rowcount={filtered.length}
        className="flex-1 min-h-0 overflow-y-auto divide-y dark:divide-zinc-800"
      >
        {filtered.map((item, i) => (
          <InboundRow key={item.id} item={item} rowIndex={i + 1} />
        ))}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-400 dark:text-zinc-500">
            조회된 입고 항목이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

function InboundRow({ item, rowIndex }: { item: InboundItem; rowIndex: number }) {
  const status = STATUS_CONFIG[item.status];
  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      className="grid grid-cols-[140px_100px_1fr_90px_90px_90px_100px_140px] items-center px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
    >
      <span role="gridcell" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {item.id}
      </span>
      <span role="gridcell" className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-2">
        {item.supplier}
      </span>
      <span role="gridcell" className="text-zinc-600 dark:text-zinc-400 text-xs truncate pr-2">
        {item.productName}
      </span>
      <span role="gridcell" className="text-zinc-500 dark:text-zinc-400 text-xs">
        {item.category}
      </span>
      <span role="gridcell" className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">
        {item.expectedQty.toLocaleString()}
      </span>
      <span role="gridcell" className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">
        {item.receivedQty.toLocaleString()}
      </span>
      <span role="gridcell">
        <Badge className={`${status.className} text-xs font-medium w-fit`}>
          {status.label}
        </Badge>
      </span>
      <span role="gridcell" className="text-zinc-500 dark:text-zinc-400 text-xs">
        {formatDate(item.scheduledAt)}
      </span>
    </div>
  );
}

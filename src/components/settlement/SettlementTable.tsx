"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useSettlementStore } from "@/store/settlementStore";
import { downloadCSV } from "@/lib/csv";
import { Settlement, SettlementStatus } from "@/types";

const STATUS_OPTIONS: { value: SettlementStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "정산 대기" },
  { value: "PROCESSING", label: "처리 중" },
  { value: "COMPLETED", label: "정산 완료" },
  { value: "ERROR", label: "오류" },
];

const STATUS_STYLE: Record<SettlementStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_LABEL: Record<SettlementStatus, string> = {
  PENDING: "정산 대기",
  PROCESSING: "처리 중",
  COMPLETED: "정산 완료",
  ERROR: "오류",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function SettlementTable() {
  const getFilteredSettlements = useSettlementStore((s) => s.getFilteredSettlements);
  const selectedStatus = useSettlementStore((s) => s.selectedStatus);
  const setSelectedStatus = useSettlementStore((s) => s.setSelectedStatus);
  const searchQuery = useSettlementStore((s) => s.searchQuery);
  const setSearchQuery = useSettlementStore((s) => s.setSearchQuery);
  const settlements = useSettlementStore((s) => s.settlements);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 탭 전환 시 스크롤 리셋
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedStatus]);

  const filtered = useMemo(
    () => getFilteredSettlements(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settlements, selectedStatus, searchQuery]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["정산ID", "공급사", "정산 기간", "품목 수", "정산 금액", "상태", "정산 기한", "정산 완료일"];
    const rows = filtered.map((s) => [
      s.id,
      s.supplier,
      s.period,
      s.itemCount,
      s.totalAmount,
      STATUS_LABEL[s.status],
      formatDate(s.dueDate),
      s.settledAt ? formatDate(s.settledAt) : "-",
    ]);
    downloadCSV(`settlement_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filtered]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      {/* 필터 탭 */}
      <div
        role="tablist"
        aria-label="정산 상태 필터"
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
                ? "border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-2 pr-2 flex-wrap">
          {/* 검색 입력 */}
          <input
            type="search"
            placeholder="공급사, ID, 기간 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 w-44"
          />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{filtered.length}건</span>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* 행 */}
      <div ref={scrollRef} className="divide-y dark:divide-zinc-800 max-h-120 overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 grid grid-cols-[110px_1fr_100px_80px_160px_110px_110px] gap-x-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700">
          <span>정산 ID</span>
          <span>공급사</span>
          <span>정산 기간</span>
          <span>품목 수</span>
          <span>정산 금액</span>
          <span>상태</span>
          <span>정산 기한</span>
        </div>
        {filtered.map((settlement) => (
          <SettlementRow key={settlement.id} settlement={settlement} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            해당 조건의 정산 내역이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

function SettlementRow({ settlement }: { settlement: Settlement }) {
  return (
    <div className="grid grid-cols-[110px_1fr_100px_80px_160px_110px_110px] gap-x-3 items-center px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{settlement.id}</span>
      <span className="text-zinc-700 dark:text-zinc-300 truncate">{settlement.supplier}</span>
      <span className="text-zinc-600 dark:text-zinc-400 text-xs">{settlement.period}</span>
      <span className="text-zinc-600 dark:text-zinc-400 text-xs">{settlement.itemCount.toLocaleString()}개</span>
      <span className="text-zinc-700 dark:text-zinc-200 font-medium text-xs">
        {formatAmount(settlement.totalAmount)}
      </span>
      <span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[settlement.status]}`}>
          {STATUS_LABEL[settlement.status]}
        </span>
      </span>
      <span className="text-zinc-500 dark:text-zinc-400 text-xs">{formatDate(settlement.dueDate)}</span>
    </div>
  );
}

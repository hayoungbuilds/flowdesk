"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { usePackagingStore } from "@/store/packagingStore";
import { downloadCSV } from "@/lib/csv";
import { PackagingMaterial, PackagingType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<PackagingType, string> = {
  BOX_SMALL: "소형 박스",
  BOX_MEDIUM: "중형 박스",
  BOX_LARGE: "대형 박스",
  COLD_BOX: "냉장 박스",
  ENVELOPE: "봉투",
  BUBBLE_WRAP: "에어캡",
};

const TYPE_OPTIONS: { value: PackagingType | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "BOX_SMALL", label: "소형 박스" },
  { value: "BOX_MEDIUM", label: "중형 박스" },
  { value: "BOX_LARGE", label: "대형 박스" },
  { value: "COLD_BOX", label: "냉장 박스" },
  { value: "ENVELOPE", label: "봉투" },
  { value: "BUBBLE_WRAP", label: "에어캡" },
];

type StockStatus = "sufficient" | "low" | "critical";

function getStockStatus(material: PackagingMaterial): StockStatus {
  if (material.currentStock < material.minStock * 0.5) return "critical";
  if (material.currentStock < material.minStock) return "low";
  return "sufficient";
}

const STATUS_CONFIG: Record<StockStatus, { label: string; className: string }> = {
  sufficient: {
    label: "충분",
    className:
      "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400",
  },
  low: {
    label: "부족",
    className:
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-400",
  },
  critical: {
    label: "위험",
    className:
      "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400",
  },
};

function StockBar({ current, min }: { current: number; min: number }) {
  const ratio = Math.min((current / min) * 100, 100);
  const status = current < min * 0.5 ? "critical" : current < min ? "low" : "sufficient";
  const barColor =
    status === "critical"
      ? "bg-red-500"
      : status === "low"
      ? "bg-yellow-400"
      : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(ratio)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`재고 비율 ${Math.round(ratio)}%`}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
      <span className="text-xs font-medium w-10 text-right text-zinc-500 dark:text-zinc-400">
        {Math.round(ratio)}%
      </span>
    </div>
  );
}

export function PackagingTable() {
  const getFilteredMaterials = usePackagingStore((s) => s.getFilteredMaterials);
  const selectedType = usePackagingStore((s) => s.selectedType);
  const setSelectedType = usePackagingStore((s) => s.setSelectedType);
  const searchQuery = usePackagingStore((s) => s.searchQuery);
  const setSearchQuery = usePackagingStore((s) => s.setSearchQuery);
  const materials = usePackagingStore((s) => s.materials);

  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedType]);

  const filtered = useMemo(
    () => getFilteredMaterials(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [materials, selectedType, searchQuery]
  );

  const handleExportCSV = useCallback(() => {
    const headers = [
      "포장재ID",
      "분류",
      "포장재명",
      "현재재고",
      "단위",
      "최소재고",
      "일사용량",
      "재고상태",
      "재고일수",
      "최근입고일",
    ];
    const rows = filtered.map((m) => {
      const status = getStockStatus(m);
      const days = Math.floor(m.currentStock / m.dailyUsage);
      return [
        m.id,
        TYPE_LABEL[m.type],
        m.name,
        m.currentStock,
        m.unit,
        m.minStock,
        m.dailyUsage,
        STATUS_CONFIG[status].label,
        days,
        new Date(m.lastRestockedAt).toLocaleDateString("ko-KR"),
      ];
    });
    const label =
      selectedType === "ALL" ? "전체" : TYPE_LABEL[selectedType];
    downloadCSV(
      `packaging_${label}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );
  }, [filtered, selectedType]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      {/* Tabs + search + CSV */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b dark:border-zinc-700 flex-wrap">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selectedType === opt.value}
            onClick={() => setSelectedType(opt.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedType === opt.value
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
            placeholder="포장재 검색..."
            aria-label="포장재 검색"
            className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-400 w-40"
          />
          <span
            className="text-xs text-zinc-400 dark:text-zinc-500"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length}종
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

      {/* Rows */}
      <div
        ref={scrollRef}
        role="grid"
        aria-label="포장재 목록"
        aria-rowcount={filtered.length}
        className="flex-1 min-h-0 overflow-y-auto divide-y dark:divide-zinc-800"
      >
        {/* Header row */}
        <div
          role="row"
          className="sticky top-0 z-10 grid grid-cols-[130px_90px_1fr_110px_100px_100px_80px_80px_110px] gap-x-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700"
        >
          <span role="columnheader">포장재ID</span>
          <span role="columnheader">분류</span>
          <span role="columnheader">포장재명</span>
          <span role="columnheader">현재재고</span>
          <span role="columnheader">최소재고</span>
          <span role="columnheader">일사용량</span>
          <span role="columnheader">재고 상태</span>
          <span role="columnheader">재고일수</span>
          <span role="columnheader">최근 입고일</span>
        </div>
        {filtered.map((material, i) => (
          <PackagingRow key={material.id} material={material} rowIndex={i + 1} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

function PackagingRow({
  material,
  rowIndex,
}: {
  material: PackagingMaterial;
  rowIndex: number;
}) {
  const status = getStockStatus(material);
  const statusConfig = STATUS_CONFIG[status];
  const days = Math.floor(material.currentStock / material.dailyUsage);
  const isLow = status !== "sufficient";

  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      className={cn(
        "grid grid-cols-[130px_90px_1fr_110px_100px_100px_80px_80px_110px] gap-x-3 items-center px-4 py-3 text-sm transition-colors",
        isLow
          ? "bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
      )}
    >
      <span role="gridcell" className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
        {material.id}
      </span>
      <span role="gridcell" className="text-xs text-zinc-500 dark:text-zinc-400">
        {TYPE_LABEL[material.type]}
      </span>
      <div role="gridcell" className="min-w-0 overflow-hidden pr-4">
        <div className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
          {material.name}
        </div>
        <StockBar current={material.currentStock} min={material.minStock} />
      </div>
      <span role="gridcell" className="text-zinc-700 dark:text-zinc-300 font-mono text-xs whitespace-nowrap tabular-nums">
        {material.currentStock.toLocaleString()} {material.unit}
      </span>
      <span role="gridcell" className="text-zinc-500 dark:text-zinc-400 font-mono text-xs whitespace-nowrap tabular-nums">
        {material.minStock.toLocaleString()} {material.unit}
      </span>
      <span role="gridcell" className="text-zinc-500 dark:text-zinc-400 font-mono text-xs whitespace-nowrap tabular-nums">
        {material.dailyUsage.toLocaleString()} {material.unit}
      </span>
      <span role="gridcell">
        <Badge className={`${statusConfig.className} text-xs font-medium w-fit`}>
          {statusConfig.label}
        </Badge>
      </span>
      <span
        role="gridcell"
        className={cn(
          "text-xs font-medium tabular-nums whitespace-nowrap",
          days < 7
            ? "text-red-600 dark:text-red-400"
            : days < 14
            ? "text-amber-500"
            : "text-zinc-600 dark:text-zinc-400"
        )}
      >
        {days}일
      </span>
      <span role="gridcell" className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
        {new Date(material.lastRestockedAt).toLocaleDateString("ko-KR")}
      </span>
    </div>
  );
}

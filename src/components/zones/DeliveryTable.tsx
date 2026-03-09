"use client";

import { useCallback, useMemo } from "react";
import { useZoneStore } from "@/store/zoneStore";
import { downloadCSV } from "@/lib/csv";
import { Delivery, DeliveryStatus, ZoneRegion } from "@/types";

const REGION_OPTIONS: { value: ZoneRegion | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체 권역" },
  { value: "수도권", label: "수도권" },
  { value: "강원", label: "강원" },
  { value: "충청", label: "충청" },
  { value: "전라", label: "전라" },
  { value: "경상", label: "경상" },
  { value: "제주", label: "제주" },
];

const STATUS_STYLE: Record<DeliveryStatus, string> = {
  PENDING: "bg-zinc-100 text-zinc-500",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "대기",
  IN_TRANSIT: "배송 중",
  DELIVERED: "완료",
  FAILED: "실패",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DeliveryTable() {
  const getFilteredDeliveries = useZoneStore((s) => s.getFilteredDeliveries);
  const selectedRegion = useZoneStore((s) => s.selectedRegion);
  const setSelectedRegion = useZoneStore((s) => s.setSelectedRegion);
  const deliveries = useZoneStore((s) => s.deliveries);

  const filtered = useMemo(
    () => getFilteredDeliveries(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deliveries, selectedRegion]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["배송번호", "주문번호", "권역", "기사명", "상태", "예정시각", "완료시각"];
    const rows = filtered.map((d) => [
      d.id, d.orderId, d.region, d.driverName,
      STATUS_LABEL[d.status],
      formatTime(d.scheduledAt),
      d.deliveredAt ? formatTime(d.deliveredAt) : "-",
    ]);
    downloadCSV(`deliveries_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filtered]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      {/* 권역 필터 탭 */}
      <div
        role="tablist"
        aria-label="권역 필터"
        className="flex items-center gap-1 px-4 pt-4 pb-0 border-b dark:border-zinc-700 flex-wrap"
      >
        {REGION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selectedRegion === opt.value}
            onClick={() => setSelectedRegion(opt.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedRegion === opt.value
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
      <div className="grid grid-cols-[110px_110px_70px_100px_80px_90px_90px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700">
        <span>배송번호</span>
        <span>주문번호</span>
        <span>권역</span>
        <span>배송기사</span>
        <span>상태</span>
        <span>예정시각</span>
        <span>완료시각</span>
      </div>

      {/* 행 */}
      <div className="divide-y dark:divide-zinc-800 max-h-[380px] overflow-y-auto">
        {filtered.map((d) => (
          <DeliveryRow key={d.id} delivery={d} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            해당 권역의 배송이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

function DeliveryRow({ delivery: d }: { delivery: Delivery }) {
  return (
    <div className="grid grid-cols-[110px_110px_70px_100px_80px_90px_90px] items-center px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{d.id}</span>
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{d.orderId}</span>
      <span className="text-zinc-700 dark:text-zinc-300">{d.region}</span>
      <span className="text-zinc-700 dark:text-zinc-300">{d.driverName}</span>
      <span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[d.status]}`}>
          {STATUS_LABEL[d.status]}
        </span>
      </span>
      <span className="text-zinc-500 dark:text-zinc-400 text-xs">{formatTime(d.scheduledAt)}</span>
      <span className="text-zinc-500 dark:text-zinc-400 text-xs">
        {d.deliveredAt ? formatTime(d.deliveredAt) : "—"}
      </span>
    </div>
  );
}

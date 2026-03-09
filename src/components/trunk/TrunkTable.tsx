"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTrunkStore } from "@/store/trunkStore";
import { downloadCSV } from "@/lib/csv";
import { TrunkRoute, TrunkStatus } from "@/types";

const STATUS_TABS: { value: TrunkStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "SCHEDULED", label: "출발 예정" },
  { value: "DEPARTED", label: "출발" },
  { value: "IN_TRANSIT", label: "운행 중" },
  { value: "ARRIVED", label: "도착 완료" },
  { value: "DELAYED", label: "지연" },
];

const STATUS_STYLE: Record<TrunkStatus, string> = {
  SCHEDULED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  DEPARTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  IN_TRANSIT: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  ARRIVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  DELAYED: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
};

const STATUS_LABEL: Record<TrunkStatus, string> = {
  SCHEDULED: "출발 예정",
  DEPARTED: "출발",
  IN_TRANSIT: "운행 중",
  ARRIVED: "도착 완료",
  DELAYED: "지연",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TrunkTable() {
  const getFilteredRoutes = useTrunkStore((s) => s.getFilteredRoutes);
  const selectedStatus = useTrunkStore((s) => s.selectedStatus);
  const setSelectedStatus = useTrunkStore((s) => s.setSelectedStatus);
  const searchQuery = useTrunkStore((s) => s.searchQuery);
  const setSearchQuery = useTrunkStore((s) => s.setSearchQuery);
  const routes = useTrunkStore((s) => s.routes);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const scrollRef = useRef<HTMLDivElement>(null);

  // URL query sync: read status from URL on mount
  useLayoutEffect(() => {
    const statusParam = searchParams.get("status") as TrunkStatus | "ALL" | null;
    if (statusParam && [...STATUS_TABS.map((t) => t.value)].includes(statusParam)) {
      setSelectedStatus(statusParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll reset on tab change
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedStatus]);

  const handleStatusChange = useCallback(
    (status: TrunkStatus | "ALL") => {
      setSelectedStatus(status);
      const params = new URLSearchParams(searchParams.toString());
      if (status === "ALL") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, setSelectedStatus]
  );

  const filtered = useMemo(
    () => getFilteredRoutes(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routes, selectedStatus, searchQuery]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["간선ID", "출발허브", "도착허브", "기사명", "차량번호", "화물 수", "상태", "출발시간", "도착예정"];
    const rows = filtered.map((r) => [
      r.id,
      r.origin,
      r.destination,
      r.driverName,
      r.vehicleNo,
      r.cargoCount,
      STATUS_LABEL[r.status],
      formatTime(r.departedAt),
      formatTime(r.estimatedAt),
    ]);
    downloadCSV(`trunk_routes_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filtered]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      {/* 상태 필터 탭 */}
      <div
        role="tablist"
        aria-label="상태 필터"
        className="flex items-center gap-1 px-4 pt-4 pb-0 border-b dark:border-zinc-700 flex-wrap"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={selectedStatus === tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedStatus === tab.value
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-2 pr-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="간선ID / 기사명 / 차량번호"
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

      {/* 헤더 */}
      <div className="grid grid-cols-[120px_100px_100px_90px_110px_70px_90px_80px_80px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700">
        <span>간선ID</span>
        <span>출발허브</span>
        <span>도착허브</span>
        <span>기사명</span>
        <span>차량번호</span>
        <span>화물 수</span>
        <span>상태</span>
        <span>출발시간</span>
        <span>도착예정</span>
      </div>

      {/* 행 */}
      <div ref={scrollRef} className="divide-y dark:divide-zinc-800 max-h-96 overflow-y-auto">
        {filtered.map((r) => (
          <TrunkRow key={r.id} route={r} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            해당 조건의 간선이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

function TrunkRow({ route: r }: { route: TrunkRoute }) {
  return (
    <div className="grid grid-cols-[120px_100px_100px_90px_110px_70px_90px_80px_80px] items-center px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.id}</span>
      <span className="text-zinc-700 dark:text-zinc-300 text-xs">{r.origin}</span>
      <span className="text-zinc-700 dark:text-zinc-300 text-xs">{r.destination}</span>
      <span className="text-zinc-700 dark:text-zinc-300">{r.driverName}</span>
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{r.vehicleNo}</span>
      <span className="text-zinc-700 dark:text-zinc-300 text-xs">{r.cargoCount}</span>
      <span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[r.status]}`}>
          {STATUS_LABEL[r.status]}
        </span>
      </span>
      <span className="text-zinc-500 dark:text-zinc-400 text-xs">{formatTime(r.departedAt)}</span>
      <span className="text-zinc-500 dark:text-zinc-400 text-xs">{formatTime(r.estimatedAt)}</span>
    </div>
  );
}

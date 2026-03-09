"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useWorkerStore } from "@/store/workerStore";
import { downloadCSV } from "@/lib/csv";
import { Worker, WorkerRole, WorkerStatus } from "@/types";

const ROLE_LABEL: Record<WorkerRole, string> = {
  PICKING: "피킹",
  PACKING: "패킹",
  SHIPPING: "출고",
};

const ROLE_OPTIONS: { value: WorkerRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "PICKING", label: "피킹" },
  { value: "PACKING", label: "패킹" },
  { value: "SHIPPING", label: "출고" },
];

const VALID_ROLES = new Set<string>(ROLE_OPTIONS.map((o) => o.value));

const STATUS_CONFIG: Record<WorkerStatus, { label: string; className: string }> = {
  ACTIVE: { label: "활동 중", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  BREAK: { label: "휴식", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  OFFLINE: { label: "오프라인", className: "bg-zinc-100 text-zinc-500 hover:bg-zinc-100" },
};

function AchievementBar({ processed, target }: { processed: number; target: number }) {
  const rate = Math.min((processed / target) * 100, 100);
  const isOver = processed > target;
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round((processed / target) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`달성률 ${Math.round((processed / target) * 100)}%`}
      >
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-green-500" : "bg-violet-500"}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-10 text-right ${isOver ? "text-green-600" : "text-zinc-600 dark:text-zinc-400"}`}>
        {Math.round((processed / target) * 100)}%
      </span>
    </div>
  );
}

export function WorkerTable() {
  const getFilteredWorkers = useWorkerStore((s) => s.getFilteredWorkers);
  const selectedRole = useWorkerStore((s) => s.selectedRole);
  const setSelectedRole = useWorkerStore((s) => s.setSelectedRole);
  const workers = useWorkerStore((s) => s.workers);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const replaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && VALID_ROLES.has(roleParam)) {
      setSelectedRole(roleParam as WorkerRole | "ALL");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = useCallback(
    (role: WorkerRole | "ALL") => {
      setSelectedRole(role);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;

      if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current);
      replaceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (role === "ALL") {
          params.delete("role");
        } else {
          params.set("role", role);
        }
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      }, 150);
    },
    [searchParams, pathname, router, setSelectedRole]
  );

  const filtered = useMemo(
    () => getFilteredWorkers(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workers, selectedRole]
  );

  const handleExportCSV = useCallback(() => {
    const headers = ["작업자ID", "이름", "역할", "구역", "상태", "처리량", "목표", "달성률(%)", "평균처리시간(초)"];
    const rows = filtered.map((w) => [
      w.id,
      w.name,
      ROLE_LABEL[w.role],
      w.zone,
      STATUS_CONFIG[w.status].label,
      w.processed,
      w.target,
      Math.round((w.processed / w.target) * 100),
      w.avgTimeSeconds,
    ]);
    const label = selectedRole === "ALL" ? "전체" : ROLE_LABEL[selectedRole];
    downloadCSV(`workers_${label}_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }, [filtered, selectedRole]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
      <div
        role="tablist"
        aria-label="작업자 역할 필터"
        className="flex items-center gap-1 px-4 pt-4 pb-0 border-b dark:border-zinc-700 flex-wrap"
      >
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selectedRole === opt.value}
            onClick={() => handleRoleChange(opt.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedRole === opt.value
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-2 pr-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500" aria-live="polite" aria-atomic="true">
            {filtered.length}명
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
        className="grid grid-cols-[180px_80px_100px_80px_120px_1fr_100px] text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b dark:border-zinc-700"
      >
        <span role="columnheader">작업자</span>
        <span role="columnheader">역할</span>
        <span role="columnheader">구역</span>
        <span role="columnheader">상태</span>
        <span role="columnheader">처리량 / 목표</span>
        <span role="columnheader">달성률</span>
        <span role="columnheader">평균 처리</span>
      </div>

      <div ref={scrollRef} role="grid" aria-label="작업자 목록" aria-rowcount={filtered.length} className="flex-1 min-h-0 overflow-y-auto divide-y dark:divide-zinc-800">
        {filtered.map((worker, i) => (
          <WorkerRow key={worker.id} worker={worker} rowIndex={i + 1} />
        ))}
      </div>
    </div>
  );
}

function WorkerRow({ worker, rowIndex }: { worker: Worker; rowIndex: number }) {
  const status = STATUS_CONFIG[worker.status];
  return (
    <div
      role="row"
      aria-rowindex={rowIndex}
      className="grid grid-cols-[180px_80px_100px_80px_120px_1fr_100px] items-center px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
    >
      <div role="gridcell">
        <div className="font-medium text-zinc-800 dark:text-zinc-200">{worker.name}</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">{worker.id}</div>
      </div>
      <span role="gridcell" className="text-zinc-600 dark:text-zinc-400">{ROLE_LABEL[worker.role]}</span>
      <span role="gridcell" className="text-zinc-500 dark:text-zinc-400 text-xs">{worker.zone}</span>
      <span role="gridcell">
        <Badge className={`${status.className} text-xs font-medium w-fit`}>
          {status.label}
        </Badge>
      </span>
      <span role="gridcell" className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">
        {worker.processed} / {worker.target}
      </span>
      <span role="gridcell">
        <AchievementBar processed={worker.processed} target={worker.target} />
      </span>
      <span role="gridcell" className="text-zinc-500 dark:text-zinc-400 text-xs">{worker.avgTimeSeconds}초</span>
    </div>
  );
}

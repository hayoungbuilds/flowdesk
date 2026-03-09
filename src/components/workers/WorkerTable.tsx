"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useWorkerStore } from "@/store/workerStore";
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
        className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden"
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
      <span className={`text-xs font-medium w-10 text-right ${isOver ? "text-green-600" : "text-zinc-600"}`}>
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

  // URL → 스토어 동기화: 마운트 시 URL의 role 파라미터를 스토어에 반영
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && VALID_ROLES.has(roleParam)) {
      setSelectedRole(roleParam as WorkerRole | "ALL");
    }
  // 마운트 시 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스토어 → URL 동기화: 필터 변경 시 URL도 함께 업데이트 (북마크·공유 가능)
  const handleRoleChange = useCallback(
    (role: WorkerRole | "ALL") => {
      setSelectedRole(role);
      // 탭 전환 시 스크롤 처음으로 초기화
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      const params = new URLSearchParams(searchParams.toString());
      if (role === "ALL") {
        params.delete("role");
      } else {
        params.set("role", role);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    },
    [searchParams, pathname, router, setSelectedRole]
  );

  const filtered = useMemo(
    () => getFilteredWorkers(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workers, selectedRole]
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 역할 필터 탭 */}
      <div
        role="tablist"
        aria-label="작업자 역할 필터"
        className="flex items-center gap-1 px-4 pt-4 pb-0 border-b flex-wrap"
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
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span
          className="ml-auto text-xs text-zinc-400 pr-2 pb-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {filtered.length}명
        </span>
      </div>

      {/* 헤더 */}
      <div
        role="row"
        className="grid grid-cols-[180px_80px_100px_80px_120px_1fr_100px] text-xs font-semibold text-zinc-500 uppercase tracking-wide bg-zinc-50 px-4 py-3 border-b"
      >
        <span role="columnheader">작업자</span>
        <span role="columnheader">역할</span>
        <span role="columnheader">구역</span>
        <span role="columnheader">상태</span>
        <span role="columnheader">처리량 / 목표</span>
        <span role="columnheader">달성률</span>
        <span role="columnheader">평균 처리</span>
      </div>

      {/* 행 */}
      <div ref={scrollRef} role="grid" aria-label="작업자 목록" aria-rowcount={filtered.length} className="flex-1 min-h-0 overflow-y-auto divide-y">
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
      className="grid grid-cols-[180px_80px_100px_80px_120px_1fr_100px] items-center px-4 py-3 text-sm hover:bg-zinc-50 transition-colors"
    >
      <div role="gridcell">
        <div className="font-medium text-zinc-800">{worker.name}</div>
        <div className="text-xs text-zinc-400">{worker.id}</div>
      </div>
      <span role="gridcell" className="text-zinc-600">{ROLE_LABEL[worker.role]}</span>
      <span role="gridcell" className="text-zinc-500 text-xs">{worker.zone}</span>
      <span role="gridcell">
        <Badge className={`${status.className} text-xs font-medium w-fit`}>
          {status.label}
        </Badge>
      </span>
      <span role="gridcell" className="text-zinc-700 font-mono text-xs">
        {worker.processed} / {worker.target}
      </span>
      <span role="gridcell">
        <AchievementBar processed={worker.processed} target={worker.target} />
      </span>
      <span role="gridcell" className="text-zinc-500 text-xs">{worker.avgTimeSeconds}초</span>
    </div>
  );
}

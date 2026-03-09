"use client";

import { useMemo } from "react";
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
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
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

  const filtered = useMemo(
    () => getFilteredWorkers(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workers, selectedRole]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 역할 필터 탭 */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b flex-wrap">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedRole(opt.value)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
              selectedRole === opt.value
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-400 pr-2 pb-2">
          {filtered.length}명
        </span>
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-[180px_80px_100px_80px_120px_1fr_100px] text-xs font-semibold text-zinc-500 uppercase tracking-wide bg-zinc-50 px-4 py-3 border-b">
        <span>작업자</span>
        <span>역할</span>
        <span>구역</span>
        <span>상태</span>
        <span>처리량 / 목표</span>
        <span>달성률</span>
        <span>평균 처리</span>
      </div>

      {/* 행 */}
      <div className="divide-y">
        {filtered.map((worker) => (
          <WorkerRow key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
}

function WorkerRow({ worker }: { worker: Worker }) {
  const status = STATUS_CONFIG[worker.status];
  return (
    <div className="grid grid-cols-[180px_80px_100px_80px_120px_1fr_100px] items-center px-4 py-3 text-sm hover:bg-zinc-50 transition-colors">
      <div>
        <div className="font-medium text-zinc-800">{worker.name}</div>
        <div className="text-xs text-zinc-400">{worker.id}</div>
      </div>
      <span className="text-zinc-600">{ROLE_LABEL[worker.role]}</span>
      <span className="text-zinc-500 text-xs">{worker.zone}</span>
      <Badge className={`${status.className} text-xs font-medium w-fit`}>
        {status.label}
      </Badge>
      <span className="text-zinc-700 font-mono text-xs">
        {worker.processed} / {worker.target}
      </span>
      <AchievementBar processed={worker.processed} target={worker.target} />
      <span className="text-zinc-500 text-xs">{worker.avgTimeSeconds}초</span>
    </div>
  );
}

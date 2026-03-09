import { Skeleton } from "@/components/ui/skeleton";

export function WorkersSkeleton() {
  return (
    <div className="space-y-4">
      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      {/* 차트 */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="w-full h-[220px] rounded-lg" />
      </div>
      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex gap-2 px-4 pt-4 pb-3 border-b">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-14 rounded-md" />
          ))}
        </div>
        <div className="flex gap-4 px-4 py-3 bg-zinc-50 border-b">
          {[180, 80, 100, 80, 120, 200, 100].map((w, i) => (
            <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4 border-b">
            {[180, 80, 100, 80, 120, 200, 100].map((w, j) => (
              <Skeleton key={j} className="h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

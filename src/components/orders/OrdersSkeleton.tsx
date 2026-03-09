import { Skeleton } from "@/components/ui/skeleton";

export function OrdersSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 필터 탭 */}
      <div className="flex gap-2 px-4 pt-4 pb-3 border-b">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-14 rounded-md" />
        ))}
      </div>
      {/* 헤더 */}
      <div className="flex gap-4 px-4 py-3 bg-zinc-50 border-b">
        {[120, 80, 160, 50, 100, 120].map((w, i) => (
          <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
        ))}
      </div>
      {/* 행 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b">
          {[120, 80, 160, 50, 100, 120].map((w, j) => (
            <Skeleton key={j} className="h-4 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartSkeleton height={220} />
        </div>
        <ChartSkeleton height={220} />
      </div>
    </div>
  );
}

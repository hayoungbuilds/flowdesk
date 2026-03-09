import { Skeleton } from "@/components/ui/skeleton";

export function InventorySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="w-full h-[280px] rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-zinc-50">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-1.5 items-end flex flex-col">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

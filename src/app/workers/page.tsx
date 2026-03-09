import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { WorkerKpiCards } from "@/components/workers/WorkerKpiCards";
import { HourlyPerformanceChart } from "@/components/workers/HourlyPerformanceChart";
import { WorkerTable } from "@/components/workers/WorkerTable";
import { WorkersSkeleton } from "@/components/workers/WorkersSkeleton";

export default function WorkersPage() {
  return (
    <>
      <Header title="작업자 실적" />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4 p-6">
        {/* Suspense: WorkerTable의 useSearchParams() 사용으로 인한 필수 래핑 */}
        <Suspense fallback={<WorkersSkeleton />}>
          <ClientOnly fallback={<WorkersSkeleton />}>
            <WorkerKpiCards />
            <HourlyPerformanceChart />
            <WorkerTable />
          </ClientOnly>
        </Suspense>
      </div>
    </>
  );
}

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
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <ClientOnly fallback={<WorkersSkeleton />}>
          <WorkerKpiCards />
          <HourlyPerformanceChart />
          <WorkerTable />
        </ClientOnly>
      </div>
    </>
  );
}

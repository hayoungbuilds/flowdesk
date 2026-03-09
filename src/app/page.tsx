import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { KpiMetrics } from "@/components/dashboard/KpiMetrics";
import { HourlyLineChart } from "@/components/dashboard/HourlyLineChart";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  return (
    <>
      <Header title="대시보드" />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <ClientOnly fallback={<DashboardSkeleton />}>
          <SummaryCards />
          <KpiMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <HourlyLineChart />
            </div>
            <StatusPieChart />
          </div>
        </ClientOnly>
      </div>
    </>
  );
}

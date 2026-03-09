import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { ZoneKpiCards } from "@/components/zones/ZoneKpiCards";
import { ZoneBarChart } from "@/components/zones/ZoneBarChart";
import { DeliveryTable } from "@/components/zones/DeliveryTable";

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
        ))}
      </div>
      <div className="h-56 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
      <div className="h-80 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
    </div>
  );
}

export default function ZonesPage() {
  return (
    <>
      <Header title="권역 배송 현황" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Suspense fallback={<Skeleton />}>
          <ClientOnly fallback={<Skeleton />}>
            <ZoneKpiCards />
            <ZoneBarChart />
            <DeliveryTable />
          </ClientOnly>
        </Suspense>
      </div>
    </>
  );
}

import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { ControlKpiCards } from "@/components/control/ControlKpiCards";
import { AlertList } from "@/components/control/AlertList";
import { OperationChart } from "@/components/control/OperationChart";

export default function ControlPage() {
  return (
    <>
      <Header title="관제 센터" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Suspense fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
          <ClientOnly fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ControlKpiCards />
          </ClientOnly>
        </Suspense>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-80 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-80 bg-zinc-100 rounded-xl animate-pulse" />}>
              <OperationChart />
            </ClientOnly>
          </Suspense>
          <Suspense fallback={<div className="h-80 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-80 bg-zinc-100 rounded-xl animate-pulse" />}>
              <AlertList />
            </ClientOnly>
          </Suspense>
        </div>
      </div>
    </>
  );
}

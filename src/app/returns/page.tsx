import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { ReturnsKpiCards } from "@/components/returns/ReturnsKpiCards";
import { ReturnsTable } from "@/components/returns/ReturnsTable";
import { ReturnsReasonChart, ReturnsDailyChart } from "@/components/returns/ReturnsReasonChart";

export default function ReturnsPage() {
  return (
    <>
      <Header title="회수/반품 관리" />
      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
        <div className="shrink-0">
          <Suspense fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
              <ReturnsKpiCards />
            </ClientOnly>
          </Suspense>
        </div>
        <div className="shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
              <ReturnsReasonChart />
            </ClientOnly>
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
              <ReturnsDailyChart />
            </ClientOnly>
          </Suspense>
        </div>
        <div className="flex-1 min-h-60 flex flex-col">
          <Suspense fallback={<div className="h-full bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-full bg-zinc-100 rounded-xl animate-pulse" />}>
              <ReturnsTable />
            </ClientOnly>
          </Suspense>
        </div>
      </div>
    </>
  );
}

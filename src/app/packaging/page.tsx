import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { PackagingKpiCards } from "@/components/packaging/PackagingKpiCards";
import { PackagingTable } from "@/components/packaging/PackagingTable";
import { PackagingChart, PackagingLowStockAlert } from "@/components/packaging/PackagingChart";

export default function PackagingPage() {
  return (
    <>
      <Header title="포장재 관리" />
      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
        <div className="shrink-0">
          <Suspense fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
              <PackagingKpiCards />
            </ClientOnly>
          </Suspense>
        </div>
        <div className="shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
              <PackagingChart />
            </ClientOnly>
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
              <PackagingLowStockAlert />
            </ClientOnly>
          </Suspense>
        </div>
        <div className="flex-1 min-h-60 flex flex-col">
          <Suspense fallback={<div className="h-full bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-full bg-zinc-100 rounded-xl animate-pulse" />}>
              <PackagingTable />
            </ClientOnly>
          </Suspense>
        </div>
      </div>
    </>
  );
}

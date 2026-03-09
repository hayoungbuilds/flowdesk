import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { SettlementKpiCards } from "@/components/settlement/SettlementKpiCards";
import { SettlementTable } from "@/components/settlement/SettlementTable";
import { SettlementSupplierChart } from "@/components/settlement/SettlementChart";
import { SettlementMonthlyChart } from "@/components/settlement/SettlementChart";

export default function SettlementPage() {
  return (
    <>
      <Header title="정산 관리" />
      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
        <div className="shrink-0">
          <Suspense fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />}>
              <SettlementKpiCards />
            </ClientOnly>
          </Suspense>
        </div>
        <div className="shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
              <SettlementSupplierChart />
            </ClientOnly>
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />}>
              <SettlementMonthlyChart />
            </ClientOnly>
          </Suspense>
        </div>
        <div className="flex-1 min-h-60 flex flex-col">
          <Suspense fallback={<div className="h-full bg-zinc-100 rounded-xl animate-pulse" />}>
            <ClientOnly fallback={<div className="h-full bg-zinc-100 rounded-xl animate-pulse" />}>
              <SettlementTable />
            </ClientOnly>
          </Suspense>
        </div>
      </div>
    </>
  );
}

import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { PurchaseOrderKpiCards } from "@/components/purchase-orders/PurchaseOrderKpiCards";
import { SupplierChart } from "@/components/purchase-orders/SupplierChart";
import { PurchaseOrderTable } from "@/components/purchase-orders/PurchaseOrderTable";

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

export default function PurchaseOrdersPage() {
  return (
    <>
      <Header title="발주 관리" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Suspense fallback={<Skeleton />}>
          <ClientOnly fallback={<Skeleton />}>
            <PurchaseOrderKpiCards />
            <SupplierChart />
            <PurchaseOrderTable />
          </ClientOnly>
        </Suspense>
      </div>
    </>
  );
}

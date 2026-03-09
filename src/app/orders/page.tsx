import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrdersSkeleton } from "@/components/orders/OrdersSkeleton";

export default function OrdersPage() {
  return (
    <>
      <Header title="주문 관리" />
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {/* Suspense: useSearchParams() 사용으로 인한 필수 래핑 */}
        <Suspense fallback={<OrdersSkeleton />}>
          <ClientOnly fallback={<OrdersSkeleton />}>
            <OrderTable />
          </ClientOnly>
        </Suspense>
      </div>
    </>
  );
}

import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrdersSkeleton } from "@/components/orders/OrdersSkeleton";

export default function OrdersPage() {
  return (
    <>
      <Header title="주문 관리" />
      <div className="flex-1 overflow-auto p-6">
        <ClientOnly fallback={<OrdersSkeleton />}>
          <OrderTable />
        </ClientOnly>
      </div>
    </>
  );
}

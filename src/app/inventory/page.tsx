import { Header } from "@/components/layout/Header";
import { ClientOnly } from "@/components/layout/ClientOnly";
import { CategoryBarChart } from "@/components/inventory/CategoryBarChart";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { InventorySkeleton } from "@/components/inventory/InventorySkeleton";

export default function InventoryPage() {
  return (
    <>
      <Header title="재고 현황" />
      <div className="flex-1 min-h-0 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ClientOnly fallback={<InventorySkeleton />}>
            <div className="lg:col-span-2">
              <CategoryBarChart />
            </div>
            <LowStockAlert />
          </ClientOnly>
        </div>
      </div>
    </>
  );
}

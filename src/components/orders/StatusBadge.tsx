import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  RECEIVED: { label: "접수", className: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100" },
  PICKING: { label: "피킹", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  PACKING: { label: "패킹", className: "bg-violet-100 text-violet-700 hover:bg-violet-100" },
  SHIPPED: { label: "출고", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
  DELIVERED: { label: "배송완료", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  DELAYED: { label: "지연", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={`${config.className} font-medium text-xs`}>
      {config.label}
    </Badge>
  );
}

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventoryStore } from "@/store/inventoryStore";

export function LowStockAlert() {
  const getLowStockItems = useInventoryStore((s) => s.getLowStockItems);
  const items = useInventoryStore((s) => s.items);

  // items 변경 시 재계산 트리거 — 배열 반환이므로 useShallow 대신 useMemo 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lowStock = useMemo(() => getLowStockItems(), [items]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
          부족 재고 경고
          {lowStock.length > 0 && (
            <Badge className="bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 text-xs">
              {lowStock.length}건
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStock.length === 0 ? (
          <div className="text-sm text-zinc-400 py-4 text-center">
            부족 재고 없음
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {lowStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {item.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.category} · {item.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">
                    {item.stock}
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500">
                    기준 {item.threshold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

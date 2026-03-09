"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePurchaseOrderStore } from "@/store/purchaseOrderStore";

export function SupplierChart() {
  const getSupplierStats = usePurchaseOrderStore((s) => s.getSupplierStats);
  const data = getSupplierStats();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
        공급업체별 발주 현황
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis
            dataKey="supplier"
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <Tooltip
            formatter={(value) => [`${value}건`, "발주 건수"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
            }}
          />
          <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="발주 건수" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

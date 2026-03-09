"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "📊" },
  { href: "/orders", label: "주문 관리", icon: "📦" },
  { href: "/workers", label: "작업자 실적", icon: "👷" },
  { href: "/inventory", label: "재고 현황", icon: "🏭" },
  { href: "/purchase-orders", label: "발주 관리", icon: "🛒" },
  { href: "/zones", label: "권역 배송", icon: "🗺" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-zinc-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-700">
        <h1 className="text-lg font-bold tracking-tight text-white">
          Flow<span className="text-violet-400">Desk</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">물류 운영 어드민</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-700 text-xs text-zinc-500">
        © 2025 FlowDesk
      </div>
    </aside>
  );
}

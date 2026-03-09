"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "개요",
    items: [
      { href: "/", label: "대시보드", icon: "📊" },
      { href: "/control", label: "관제 센터", icon: "🖥️" },
    ],
  },
  {
    label: "입출고 · SCM",
    items: [
      { href: "/inbound", label: "입고 관리", icon: "📥" },
      { href: "/inventory", label: "재고 현황", icon: "🏭" },
      { href: "/purchase-orders", label: "발주 관리", icon: "🛒" },
      { href: "/settlement", label: "정산 관리", icon: "💰" },
    ],
  },
  {
    label: "작업 · 출고",
    items: [
      { href: "/orders", label: "주문 관리", icon: "📦" },
      { href: "/workers", label: "작업자 실적", icon: "👷" },
      { href: "/packaging", label: "포장재 관리", icon: "📫" },
    ],
  },
  {
    label: "배송 · 물류",
    items: [
      { href: "/zones", label: "권역 배송", icon: "🗺️" },
      { href: "/trunk", label: "간선 관리", icon: "🚛" },
      { href: "/returns", label: "회수/반품", icon: "↩️" },
    ],
  },
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

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-violet-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-700 text-xs text-zinc-500">
        © 2025 FlowDesk
      </div>
    </aside>
  );
}

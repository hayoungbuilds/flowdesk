"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { useWorkerStore } from "@/store/workerStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  category: string;
  label: string;
  sub: string;
  href: string;
  icon: string;
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // 주문 검색
  const orders = useOrderStore.getState().orders;
  orders
    .filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q)
    )
    .slice(0, 4)
    .forEach((o) => {
      results.push({
        id: o.id,
        category: "주문",
        label: o.id,
        sub: `${o.customerName} · ${o.productName}`,
        href: `/orders?status=${o.status}`,
        icon: "📦",
      });
    });

  // 작업자 검색
  const workers = useWorkerStore.getState().workers;
  workers
    .filter(
      (w) =>
        w.id.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.zone.toLowerCase().includes(q)
    )
    .slice(0, 3)
    .forEach((w) => {
      results.push({
        id: w.id,
        category: "작업자",
        label: w.name,
        sub: `${w.id} · ${w.zone}`,
        href: "/workers",
        icon: "👷",
      });
    });

  // 재고 검색
  const items = useInventoryStore.getState().items;
  items
    .filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
    .slice(0, 3)
    .forEach((item) => {
      results.push({
        id: item.id,
        category: "재고",
        label: item.name,
        sub: `${item.category} · 재고 ${item.stock.toLocaleString()}개`,
        href: "/inventory",
        icon: "🏭",
      });
    });

  return results.slice(0, 8);
}

export function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false);

  // Cmd+K / Ctrl+K 단축키
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="전체 검색 (Cmd+K)"
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <span>🔍</span>
        <span>검색...</span>
        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded font-mono">
          ⌘K
        </kbd>
      </button>
      {open && <GlobalSearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQuery = useCallback((q: string) => {
    setQuery(q);
    setActiveIdx(0);
    setResults(search(q));
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIdx]) {
        navigate(results[activeIdx].href);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, activeIdx, navigate, onClose]
  );

  // 카테고리별 그룹핑
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="전체 검색"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border dark:border-zinc-700 overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b dark:border-zinc-700">
          <span className="text-zinc-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="주문번호, 고객명, 작업자, 상품명으로 검색..."
            className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none"
            autoComplete="off"
          />
          <kbd
            onClick={onClose}
            className="px-1.5 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.trim() ? (
          results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {category}
                  </div>
                  {items.map((r) => {
                    const globalIdx = results.indexOf(r);
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate(r.href)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          globalIdx === activeIdx
                            ? "bg-violet-50 dark:bg-violet-900/20"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        )}
                      >
                        <span className="text-base w-5 text-center flex-shrink-0">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                            {r.label}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{r.sub}</div>
                        </div>
                        <span className="text-xs text-zinc-300 dark:text-zinc-600 flex-shrink-0">→</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-400 dark:text-zinc-600 text-sm">
              검색 결과가 없습니다
            </div>
          )
        ) : (
          <div className="px-4 py-4 space-y-1">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">빠른 이동</p>
            {[
              { label: "주문 관리", href: "/orders", icon: "📦" },
              { label: "입고 관리", href: "/inbound", icon: "📥" },
              { label: "재고 현황", href: "/inventory", icon: "🏭" },
              { label: "작업자 실적", href: "/workers", icon: "👷" },
              { label: "관제 센터", href: "/control", icon: "🖥️" },
              { label: "회수/반품", href: "/returns", icon: "↩️" },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 border-t dark:border-zinc-700 flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-600">
          <span><kbd className="font-mono">↑↓</kbd> 이동</span>
          <span><kbd className="font-mono">↵</kbd> 선택</span>
          <span><kbd className="font-mono">ESC</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}

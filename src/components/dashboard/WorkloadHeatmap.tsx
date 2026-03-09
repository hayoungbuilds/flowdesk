"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// 시간대(6~23시) × 요일 피킹 작업량 히트맵
// 실제 데이터가 없으므로 현실적인 패턴으로 목업 생성

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06~23시
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

function generateHeatmapData(): number[][] {
  // [day][hour] 형태, 0~100 스케일
  return DAYS.map((_, d) => {
    const isWeekend = d >= 5;
    return HOURS.map((h) => {
      // 기저값
      let base = isWeekend ? 30 : 50;
      // 점심 피크 (11-13시)
      if (h >= 11 && h <= 13) base += isWeekend ? 20 : 35;
      // 저녁 피크 (18-20시)
      if (h >= 18 && h <= 20) base += isWeekend ? 30 : 25;
      // 새벽/야간 감소
      if (h < 8 || h > 22) base = Math.max(base - 30, 5);
      // 노이즈 추가 (결정론적 — seed 기반)
      const noise = ((d * 18 + (h - 6)) * 37 + 13) % 25 - 12;
      return Math.max(0, Math.min(100, base + noise));
    });
  });
}

const DATA = generateHeatmapData();

// 0~100 → 6단계 색상 (violet 테마)
function getCellClass(value: number): string {
  if (value < 10) return "bg-zinc-100 dark:bg-zinc-800";
  if (value < 25) return "bg-violet-100 dark:bg-violet-900/30";
  if (value < 45) return "bg-violet-200 dark:bg-violet-800/50";
  if (value < 65) return "bg-violet-400 dark:bg-violet-600/70";
  if (value < 80) return "bg-violet-600 dark:bg-violet-500";
  return "bg-violet-800 dark:bg-violet-400";
}

function getCellTextClass(value: number): string {
  if (value < 45) return "text-zinc-600 dark:text-zinc-400";
  return "text-white dark:text-zinc-900";
}

interface TooltipState {
  day: string;
  hour: number;
  value: number;
  x: number;
  y: number;
}

export function WorkloadHeatmap() {
  const maxVal = useMemo(() => Math.max(...DATA.flat()), []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            시간대별 작업량 히트맵
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">피킹 처리량 (0 – {maxVal}건)</p>
        </div>
        {/* 범례 */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
          <span>낮음</span>
          {["bg-zinc-100 dark:bg-zinc-800", "bg-violet-100 dark:bg-violet-900/30", "bg-violet-200 dark:bg-violet-800/50", "bg-violet-400", "bg-violet-600", "bg-violet-800 dark:bg-violet-400"].map((cls, i) => (
            <div key={i} className={cn("w-4 h-4 rounded-sm", cls)} />
          ))}
          <span>높음</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-1 ml-8">
            {HOURS.filter((h) => h % 2 === 0).map((h) => {
              const idx = HOURS.indexOf(h);
              return (
                <div
                  key={h}
                  className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center"
                  style={{ width: `${(2 / HOURS.length) * 100}%`, marginLeft: idx === 0 ? 0 : undefined }}
                >
                  {String(h).padStart(2, "0")}시
                </div>
              );
            })}
          </div>

          {/* Grid */}
          {DATA.map((row, d) => (
            <div key={DAYS[d]} className="flex items-center mb-1 gap-1">
              {/* Day label */}
              <div className="w-7 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-right flex-shrink-0">
                {DAYS[d]}
              </div>
              {/* Cells */}
              <div className="flex gap-1 flex-1">
                {row.map((val, h) => (
                  <div
                    key={h}
                    title={`${DAYS[d]}요일 ${HOURS[h]}시: ${Math.round(val)}건`}
                    className={cn(
                      "flex-1 rounded-sm flex items-center justify-center cursor-default transition-opacity hover:opacity-80",
                      getCellClass(val)
                    )}
                    style={{ height: 28 }}
                  >
                    <span className={cn("text-[9px] font-medium hidden xl:block", getCellTextClass(val))}>
                      {Math.round(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Hour axis bottom */}
          <div className="flex mt-2 ml-8">
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="flex-1 text-[9px] text-center text-zinc-300 dark:text-zinc-600"
              >
                {i % 3 === 0 ? `${h}` : ""}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

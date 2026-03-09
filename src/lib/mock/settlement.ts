import { Settlement, SettlementStatus } from "@/types";

const SUPPLIERS = [
  "농심", "CJ제일제당", "오리온", "롯데제과", "풀무원",
  "동원F&B", "삼양식품", "하림", "매일유업", "빙그레",
  "아모레퍼시픽", "LG생활건강",
];

const STATUSES: SettlementStatus[] = ["PENDING", "PROCESSING", "COMPLETED", "ERROR"];

// ~25% PENDING, ~15% PROCESSING, ~55% COMPLETED, ~5% ERROR
const STATUS_WEIGHTS = [0.25, 0.15, 0.55, 0.05];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r < acc) return items[i];
  }
  return items[items.length - 1];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/** 최근 6개월 기간 목록 (예: ["2025-10", "2025-11", ...]) */
function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
  }
  return months;
}

const PERIODS = getLast6Months();

export function generateSettlements(count = 60): Settlement[] {
  return Array.from({ length: count }, (_, i) => {
    const status = weightedRandom(STATUSES, STATUS_WEIGHTS);
    const totalAmount =
      (Math.floor(Math.random() * 9950) + 50) * 10000 +
      Math.floor(Math.random() * 9999) * 100;
    // clamp between 500_000 and 50_000_000
    const clamped = Math.min(50_000_000, Math.max(500_000, totalAmount));

    const isCompleted = status === "COMPLETED";
    const settledAt = isCompleted ? daysAgo(Math.floor(Math.random() * 30) + 1) : undefined;

    return {
      id: `SET-${String(i + 1).padStart(4, "0")}`,
      supplier: SUPPLIERS[i % SUPPLIERS.length],
      period: PERIODS[i % PERIODS.length],
      totalAmount: clamped,
      itemCount: Math.floor(Math.random() * 491) + 10,
      status,
      dueDate: daysFromNow(Math.floor(Math.random() * 30) + 1),
      settledAt,
    };
  });
}

export function generateMonthlySettlementData(): { month: string; amount: number; count: number }[] {
  const settlements = generateSettlements(60);
  const map: Record<string, { amount: number; count: number }> = {};

  PERIODS.forEach((p) => {
    map[p] = { amount: 0, count: 0 };
  });

  settlements.forEach((s) => {
    if (map[s.period]) {
      map[s.period].amount += s.totalAmount;
      map[s.period].count++;
    }
  });

  return PERIODS.map((month) => ({
    month,
    amount: map[month]?.amount ?? 0,
    count: map[month]?.count ?? 0,
  }));
}

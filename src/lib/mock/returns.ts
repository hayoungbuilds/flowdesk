import { ReturnItem, ReturnReason, ReturnStatus } from "@/types";

const CUSTOMERS = [
  "김민준", "이서연", "박지호", "최수아", "정우진",
  "강나은", "조현우", "윤지아", "임도현", "한소율",
  "오준혁", "신예린", "배성민", "류하늘", "송지원",
];

const PRODUCTS = [
  "컬리 샛별배송 유기농 우유 1L",
  "제주 감귤 5kg",
  "무항생제 닭가슴살 1kg",
  "국내산 청경채 500g",
  "수입 아보카도 4개입",
  "샴푸 오가닉 펌프형 500ml",
  "천연 세탁세제 3L",
  "마스크팩 10매입",
  "유아용 물티슈 100매",
  "반려견 사료 2kg",
  "컬리 한우 불고기 500g",
  "유기농 사과 1.5kg",
  "냉동 새우 500g",
  "저지방 요거트 6개입",
  "올리브오일 엑스트라버진 500ml",
];

const UNIT_PRICES = [8000, 25000, 18000, 3500, 12000, 22000, 15000, 9000, 7000, 35000, 42000, 20000, 16000, 11000, 28000];

const STATUSES: ReturnStatus[] = ["REQUESTED", "COLLECTING", "INSPECTING", "REFUNDED", "REJECTED"];
// ~25% REQUESTED, ~20% COLLECTING, ~15% INSPECTING, ~35% REFUNDED, ~5% REJECTED
const STATUS_WEIGHTS = [0.25, 0.20, 0.15, 0.35, 0.05];

const REASONS: ReturnReason[] = ["DAMAGED", "WRONG_ITEM", "CHANGE_OF_MIND", "DEFECTIVE", "OTHER"];
// ~15% DAMAGED, ~10% WRONG_ITEM, ~40% CHANGE_OF_MIND, ~20% DEFECTIVE, ~15% OTHER
const REASON_WEIGHTS = [0.15, 0.10, 0.40, 0.20, 0.15];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T>(arr: T[], weights: number[]): T {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < arr.length; i++) {
    acc += weights[i];
    if (r < acc) return arr[i];
  }
  return arr[arr.length - 1];
}

function daysAgo(days: number, extraMs = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - Math.floor(extraMs / 3600000));
  return d.toISOString();
}

export function generateReturns(count: number): ReturnItem[] {
  return Array.from({ length: count }, (_, i) => {
    const productIdx = i % PRODUCTS.length;
    const productName = PRODUCTS[productIdx];
    const unitPrice = UNIT_PRICES[productIdx];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const refundAmount = quantity * unitPrice;
    const status = weightedPick(STATUSES, STATUS_WEIGHTS);
    const reason = weightedPick(REASONS, REASON_WEIGHTS);
    const daysOffset = Math.floor(Math.random() * 7);
    const requestedAt = daysAgo(daysOffset, Math.floor(Math.random() * 86400000));

    return {
      id: `RET-${String(i + 1).padStart(5, "0")}`,
      orderId: `ORD-${String(Math.floor(Math.random() * 500) + 1).padStart(5, "0")}`,
      customerName: randomFrom(CUSTOMERS),
      productName,
      quantity,
      reason,
      status,
      requestedAt,
      refundAmount,
      completedAt:
        status === "REFUNDED" || status === "REJECTED"
          ? new Date(
              new Date(requestedAt).getTime() + Math.random() * 3 * 24 * 3600000
            ).toISOString()
          : undefined,
    };
  });
}

export function generateDailyReturnData(): { date: string; count: number; refundAmount: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }).replace(". ", "/").replace(".", "");
    const count = Math.floor(Math.random() * 20) + 8;
    const refundAmount = count * (Math.floor(Math.random() * 20000) + 10000);
    return { date, count, refundAmount };
  });
}

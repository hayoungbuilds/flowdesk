import { Order, OrderStatus, HourlyData } from "@/types";

const STATUSES: OrderStatus[] = [
  "RECEIVED",
  "PICKING",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
  "DELAYED",
];

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
];

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrderId(index: number): string {
  return `ORD-${String(index + 1).padStart(5, "0")}`;
}

function randomDate(): string {
  const now = new Date();
  const offset = Math.floor(Math.random() * 8 * 60 * 60 * 1000); // 최근 8시간 내
  return new Date(now.getTime() - offset).toISOString();
}

export function generateOrders(count: number = 200): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = randomDate();
    return {
      id: generateOrderId(i),
      customerName: randomFrom(CUSTOMERS),
      productName: randomFrom(PRODUCTS),
      quantity: Math.floor(Math.random() * 5) + 1,
      status: randomFrom(STATUSES),
      createdAt,
      updatedAt: new Date(
        new Date(createdAt).getTime() + Math.random() * 30 * 60 * 1000
      ).toISOString(),
      region: randomFrom(REGIONS),
    };
  });
}

export function generateHourlyData(): HourlyData[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = `${String(i).padStart(2, "0")}:00`;
    const base = i >= 9 && i <= 22 ? 80 : 20;
    const peak = i >= 11 && i <= 13 ? 60 : i >= 18 && i <= 20 ? 50 : 0;
    return {
      hour,
      orders: base + peak + Math.floor(Math.random() * 30),
    };
  });
}

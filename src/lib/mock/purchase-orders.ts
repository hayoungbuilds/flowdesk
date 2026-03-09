import { PurchaseOrder, PurchaseOrderStatus, InventoryCategory } from "@/types";

const SUPPLIERS = [
  "CJ대한통운", "롯데글로벌로지스", "한진물류", "동원로엑스", "현대글로비스",
  "신세계L&B", "풀무원", "대상", "오뚜기", "농심",
];

const PRODUCTS: { name: string; category: InventoryCategory }[] = [
  { name: "비비고 왕교자", category: "식품" },
  { name: "신라면 멀티팩", category: "식품" },
  { name: "참치캔 세트", category: "식품" },
  { name: "세탁세제 드럼용", category: "생활용품" },
  { name: "주방세제 대용량", category: "생활용품" },
  { name: "화장솜 500매", category: "뷰티" },
  { name: "기초케어 세트", category: "뷰티" },
  { name: "무선 충전기", category: "가전" },
  { name: "블루투스 이어폰", category: "가전" },
  { name: "강아지 사료 15kg", category: "반려동물" },
  { name: "고양이 간식 세트", category: "반려동물" },
  { name: "면 티셔츠 박스", category: "패션" },
];

const STATUSES: PurchaseOrderStatus[] = [
  "PENDING", "APPROVED", "RECEIVING", "COMPLETED", "CANCELLED",
];

const STATUS_WEIGHTS = [0.15, 0.2, 0.15, 0.45, 0.05];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r < acc) return items[i];
  }
  return items[items.length - 1];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export function generatePurchaseOrders(count = 40): PurchaseOrder[] {
  return Array.from({ length: count }, (_, i) => {
    const product = PRODUCTS[i % PRODUCTS.length];
    const status = weightedRandom(STATUSES, STATUS_WEIGHTS);
    const orderedDaysAgo = Math.floor(Math.random() * 14) + 1;
    return {
      id: `PO-${String(i + 1).padStart(4, "0")}`,
      supplier: SUPPLIERS[i % SUPPLIERS.length],
      productName: product.name,
      category: product.category,
      quantity: (Math.floor(Math.random() * 20) + 1) * 10,
      unitPrice: (Math.floor(Math.random() * 50) + 5) * 1000,
      status,
      orderedAt: daysAgo(orderedDaysAgo),
      expectedAt: daysFromNow(Math.floor(Math.random() * 7) + 1),
    };
  });
}

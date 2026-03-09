import { InboundItem, InboundStatus, InventoryCategory } from "@/types";

const SUPPLIERS = [
  "농심", "CJ제일제당", "오리온", "롯데제과", "풀무원",
  "동원F&B", "삼양식품", "하림", "매일유업", "빙그레",
];

const CATEGORIES: InventoryCategory[] = [
  "식품", "식품", "식품", "생활용품", "뷰티", "가전", "패션", "반려동물",
];

const PRODUCT_NAMES: Record<string, string[]> = {
  농심: ["신라면 20입", "너구리 20입", "육개장 사발면 30입", "짜파게티 20입"],
  CJ제일제당: ["햇반 12입", "비비고 왕교자 1kg", "스팸 클래식 12캔", "백설 설탕 3kg"],
  오리온: ["초코파이 30입", "포카칩 오리지널 10입", "꼬북칩 12입", "마켓오 리얼브라우니 12입"],
  롯데제과: ["빼빼로 오리지널 20입", "자일리톨 껌 10입", "몽쉘 12입", "칸초 12입"],
  풀무원: ["두부 찌개용 12팩", "국산콩 두부 10팩", "생라면 4인분 8팩", "냉동 만두 1kg"],
  "동원F&B": ["동원참치 150g 24캔", "양반김 30팩", "덴마크 우유 1L 12팩", "고추참치 24캔"],
  삼양식품: ["불닭볶음면 20입", "삼양라면 20입", "짜짜로니 20입", "나가사끼 짬뽕 20입"],
  하림: ["닭가슴살 슬라이스 500g 10팩", "IFF 닭볶음탕 1kg 6팩", "훈제 닭가슴살 200g 10팩", "닭다리 구이 400g 8팩"],
  매일유업: ["매일우유 1L 12팩", "상하목장 유기농우유 1L 6팩", "매일 두유 190ml 24팩", "바리스타 룰스 500ml 12팩"],
  빙그레: ["바나나맛우유 200ml 24팩", "요플레 오리지널 8팩", "빙그레 우유 1L 12팩", "아카페라 아메리카노 12캔"],
};

const INSPECTORS = ["김검수", "이점검", "박확인", "최심사"];

const STATUS_WEIGHTS: InboundStatus[] = [
  "SCHEDULED", "SCHEDULED", "SCHEDULED", "SCHEDULED", "SCHEDULED", "SCHEDULED",
  "IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS",
  "INSPECTING", "INSPECTING", "INSPECTING",
  "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED",
  "REJECTED",
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoDateOffset(daysAgo: number, hour?: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  if (hour !== undefined) {
    d.setHours(hour, randomBetween(0, 59), 0, 0);
  }
  return d.toISOString();
}

export function generateInboundItems(count: number = 80): InboundItem[] {
  return Array.from({ length: count }, (_, i) => {
    const supplier = SUPPLIERS[i % SUPPLIERS.length];
    const products = PRODUCT_NAMES[supplier];
    const productName = randomFrom(products);
    const status = randomFrom(STATUS_WEIGHTS);
    const daysAgo = randomBetween(0, 2);
    const scheduledHour = randomBetween(6, 20);
    const scheduledAt = isoDateOffset(daysAgo, scheduledHour);
    const expectedQty = randomBetween(50, 500) * 10;
    const needsInspector = status === "INSPECTING" || status === "COMPLETED" || status === "REJECTED";
    const completedAt =
      status === "COMPLETED" || status === "REJECTED"
        ? isoDateOffset(daysAgo, scheduledHour + randomBetween(1, 4))
        : undefined;

    return {
      id: `INB-${String(i + 1).padStart(4, "0")}`,
      supplier,
      productName,
      category: randomFrom(CATEGORIES),
      expectedQty,
      receivedQty:
        status === "SCHEDULED"
          ? 0
          : status === "IN_PROGRESS"
          ? Math.floor(expectedQty * (0.2 + Math.random() * 0.5))
          : status === "INSPECTING"
          ? Math.floor(expectedQty * (0.8 + Math.random() * 0.2))
          : status === "COMPLETED"
          ? expectedQty
          : Math.floor(expectedQty * (0.3 + Math.random() * 0.4)),
      status,
      scheduledAt,
      completedAt,
      inspector: needsInspector ? randomFrom(INSPECTORS) : undefined,
    };
  });
}

export function generateInboundHourlyData(): { hour: string; count: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    const isWorkHour = i >= 7 && i <= 21;
    const isPeak = (i >= 9 && i <= 11) || (i >= 14 && i <= 16);
    const base = isWorkHour ? 4 : 0;
    const peak = isPeak ? 4 : 0;
    return {
      hour: `${String(i).padStart(2, "0")}:00`,
      count: base + peak + (isWorkHour ? randomBetween(0, 3) : 0),
    };
  });
}

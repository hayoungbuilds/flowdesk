import { PackagingMaterial, PackagingType } from "@/types";

function daysAgo(n: number): string {
  const d = new Date("2026-03-09");
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MATERIALS: Omit<PackagingMaterial, "id">[] = [
  // BOX_SMALL
  {
    type: "BOX_SMALL",
    name: "소형 박스 (60x40x30)",
    currentStock: 15200,
    minStock: 3000,
    dailyUsage: 800,
    unit: "개",
    lastRestockedAt: daysAgo(5),
  },
  {
    type: "BOX_SMALL",
    name: "소형 박스 (60x40x30) 강화형",
    currentStock: 2100,
    minStock: 3000,
    dailyUsage: 800,
    unit: "개",
    lastRestockedAt: daysAgo(18),
  },
  // BOX_MEDIUM
  {
    type: "BOX_MEDIUM",
    name: "중형 박스 (80x60x40)",
    currentStock: 9500,
    minStock: 2000,
    dailyUsage: 600,
    unit: "개",
    lastRestockedAt: daysAgo(3),
  },
  {
    type: "BOX_MEDIUM",
    name: "중형 박스 (80x60x40) 강화형",
    currentStock: 4200,
    minStock: 2000,
    dailyUsage: 600,
    unit: "개",
    lastRestockedAt: daysAgo(10),
  },
  {
    type: "BOX_MEDIUM",
    name: "중형 박스 (80x60x40) 슬림형",
    currentStock: 1600,
    minStock: 2000,
    dailyUsage: 600,
    unit: "개",
    lastRestockedAt: daysAgo(22),
  },
  // BOX_LARGE
  {
    type: "BOX_LARGE",
    name: "대형 박스 (100x80x60)",
    currentStock: 6800,
    minStock: 1000,
    dailyUsage: 300,
    unit: "개",
    lastRestockedAt: daysAgo(7),
  },
  {
    type: "BOX_LARGE",
    name: "대형 박스 (100x80x60) 강화형",
    currentStock: 2300,
    minStock: 1000,
    dailyUsage: 300,
    unit: "개",
    lastRestockedAt: daysAgo(14),
  },
  {
    type: "BOX_LARGE",
    name: "특대형 박스 (120x100x80)",
    currentStock: 400,
    minStock: 1000,
    dailyUsage: 300,
    unit: "개",
    lastRestockedAt: daysAgo(28),
  },
  // COLD_BOX
  {
    type: "COLD_BOX",
    name: "냉장 박스 (60x40x40) 아이스팩 포함",
    currentStock: 4500,
    minStock: 1500,
    dailyUsage: 500,
    unit: "개",
    lastRestockedAt: daysAgo(4),
  },
  {
    type: "COLD_BOX",
    name: "냉동 박스 (60x40x40) 드라이아이스용",
    currentStock: 700,
    minStock: 1500,
    dailyUsage: 500,
    unit: "개",
    lastRestockedAt: daysAgo(25),
  },
  // ENVELOPE
  {
    type: "ENVELOPE",
    name: "서류봉투 A4",
    currentStock: 12000,
    minStock: 2000,
    dailyUsage: 400,
    unit: "장",
    lastRestockedAt: daysAgo(6),
  },
  {
    type: "ENVELOPE",
    name: "택배봉투 중 (38x48cm)",
    currentStock: 8500,
    minStock: 3000,
    dailyUsage: 700,
    unit: "장",
    lastRestockedAt: daysAgo(9),
  },
  {
    type: "ENVELOPE",
    name: "택배봉투 대 (50x60cm)",
    currentStock: 2800,
    minStock: 3000,
    dailyUsage: 700,
    unit: "장",
    lastRestockedAt: daysAgo(16),
  },
  // BUBBLE_WRAP
  {
    type: "BUBBLE_WRAP",
    name: "에어캡 100m 롤",
    currentStock: 180,
    minStock: 50,
    dailyUsage: 8,
    unit: "롤",
    lastRestockedAt: daysAgo(2),
  },
  {
    type: "BUBBLE_WRAP",
    name: "뽁뽁이 시트 (50x50cm)",
    currentStock: 30,
    minStock: 100,
    dailyUsage: 20,
    unit: "롤",
    lastRestockedAt: daysAgo(20),
  },
];

export function generatePackagingMaterials(): PackagingMaterial[] {
  return MATERIALS.map((m, i) => ({
    ...m,
    id: `PKG-${String(i + 1).padStart(4, "0")}`,
  }));
}

export function generatePackagingUsageData(): {
  type: PackagingType;
  name: string;
  used: number;
  remaining: number;
}[] {
  const typeMap: Partial<Record<PackagingType, { name: string; used: number; remaining: number }>> = {};

  generatePackagingMaterials().forEach((m) => {
    if (!typeMap[m.type]) {
      typeMap[m.type] = { name: typeLabel(m.type), used: 0, remaining: 0 };
    }
    typeMap[m.type]!.used += m.dailyUsage * 30;
    typeMap[m.type]!.remaining += m.currentStock;
  });

  return (Object.entries(typeMap) as [PackagingType, { name: string; used: number; remaining: number }][]).map(
    ([type, val]) => ({ type, ...val })
  );
}

function typeLabel(type: PackagingType): string {
  const labels: Record<PackagingType, string> = {
    BOX_SMALL: "소형 박스",
    BOX_MEDIUM: "중형 박스",
    BOX_LARGE: "대형 박스",
    COLD_BOX: "냉장 박스",
    ENVELOPE: "봉투",
    BUBBLE_WRAP: "에어캡",
  };
  return labels[type];
}

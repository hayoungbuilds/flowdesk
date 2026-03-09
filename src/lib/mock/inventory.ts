import { InventoryItem, InventoryCategory } from "@/types";

const ITEMS_BY_CATEGORY: Record<InventoryCategory, string[]> = {
  식품: ["유기농 우유", "제주 감귤", "닭가슴살", "청경채", "아보카도", "연어", "두부"],
  생활용품: ["세탁세제", "물티슈", "화장지", "주방세제", "비닐봉투"],
  뷰티: ["마스크팩", "샴푸", "바디로션", "선크림", "토너"],
  가전: ["공기청정기 필터", "청소기 먼지봉투", "전구 LED", "배터리 AA"],
  패션: ["양말 5켤레", "면 티셔츠", "레깅스", "운동화"],
  반려동물: ["강아지 사료", "고양이 사료", "펫 패드", "간식 저키"],
};

const LOCATIONS = ["A-1", "A-2", "B-1", "B-2", "C-1", "C-2", "D-1", "D-2"];

let idCounter = 1;

export function generateInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];

  (Object.entries(ITEMS_BY_CATEGORY) as [InventoryCategory, string[]][]).forEach(
    ([category, names]) => {
      names.forEach((name) => {
        const threshold = Math.floor(Math.random() * 50) + 20;
        const stock = Math.floor(Math.random() * 200);
        items.push({
          id: `INV-${String(idCounter++).padStart(4, "0")}`,
          name,
          category,
          stock,
          threshold,
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        });
      });
    }
  );

  return items;
}

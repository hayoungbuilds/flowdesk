import { describe, it, expect, beforeEach } from "vitest";
import { useInventoryStore } from "@/store/inventoryStore";
import { InventoryItem } from "@/types";

const makeItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: "ITEM-001",
  name: "테스트 상품",
  category: "식품",
  stock: 100,
  threshold: 50,
  location: "A-01",
  ...overrides,
});

beforeEach(() => {
  useInventoryStore.setState({ items: [], selectedCategory: "ALL" });
});

describe("useInventoryStore", () => {
  describe("getLowStockItems", () => {
    it("임계값 미만 재고 상품만 반환한다", () => {
      useInventoryStore.setState({
        items: [
          makeItem({ id: "1", stock: 10, threshold: 50 }),  // 부족
          makeItem({ id: "2", stock: 100, threshold: 50 }), // 충분
          makeItem({ id: "3", stock: 0, threshold: 20 }),   // 부족
        ],
      });
      const lowStock = useInventoryStore.getState().getLowStockItems();
      expect(lowStock).toHaveLength(2);
      expect(lowStock.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "3"]));
    });

    it("재고가 임계값과 같으면 반환하지 않는다", () => {
      useInventoryStore.setState({
        items: [makeItem({ stock: 50, threshold: 50 })],
      });
      const lowStock = useInventoryStore.getState().getLowStockItems();
      expect(lowStock).toHaveLength(0);
    });

    it("모든 재고가 충분하면 빈 배열을 반환한다", () => {
      useInventoryStore.setState({
        items: [makeItem({ stock: 200, threshold: 50 })],
      });
      expect(useInventoryStore.getState().getLowStockItems()).toHaveLength(0);
    });
  });

  describe("getFilteredItems", () => {
    beforeEach(() => {
      useInventoryStore.setState({
        items: [
          makeItem({ id: "1", category: "식품" }),
          makeItem({ id: "2", category: "뷰티" }),
          makeItem({ id: "3", category: "식품" }),
        ],
      });
    });

    it("ALL이면 전체 상품을 반환한다", () => {
      const items = useInventoryStore.getState().getFilteredItems();
      expect(items).toHaveLength(3);
    });

    it("카테고리로 필터링하면 해당 상품만 반환한다", () => {
      useInventoryStore.setState({ selectedCategory: "식품" });
      const items = useInventoryStore.getState().getFilteredItems();
      expect(items).toHaveLength(2);
      expect(items.every((i) => i.category === "식품")).toBe(true);
    });
  });

  describe("getCategoryStats", () => {
    it("카테고리별 재고와 임계값을 합산한다", () => {
      useInventoryStore.setState({
        items: [
          makeItem({ id: "1", category: "식품", stock: 100, threshold: 30 }),
          makeItem({ id: "2", category: "식품", stock: 50, threshold: 20 }),
          makeItem({ id: "3", category: "뷰티", stock: 80, threshold: 40 }),
        ],
      });
      const stats = useInventoryStore.getState().getCategoryStats();
      const food = stats.find((s) => s.category === "식품");
      const beauty = stats.find((s) => s.category === "뷰티");
      expect(food?.stock).toBe(150);
      expect(food?.threshold).toBe(50);
      expect(beauty?.stock).toBe(80);
    });
  });

  describe("setSelectedCategory", () => {
    it("카테고리를 변경한다", () => {
      useInventoryStore.getState().setSelectedCategory("뷰티");
      expect(useInventoryStore.getState().selectedCategory).toBe("뷰티");
    });
  });
});

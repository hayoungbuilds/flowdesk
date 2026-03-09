import { create } from "zustand";
import { InventoryItem, InventoryCategory } from "@/types";
import { generateInventory } from "@/lib/mock/inventory";

interface InventoryStore {
  items: InventoryItem[];
  selectedCategory: InventoryCategory | "ALL";
  setSelectedCategory: (category: InventoryCategory | "ALL") => void;
  getFilteredItems: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getCategoryStats: () => { category: string; stock: number; threshold: number }[];
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: generateInventory(),
  selectedCategory: "ALL",

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getFilteredItems: () => {
    const { items, selectedCategory } = get();
    if (selectedCategory === "ALL") return items;
    return items.filter((i) => i.category === selectedCategory);
  },

  getLowStockItems: () => {
    return get().items.filter((i) => i.stock < i.threshold);
  },

  getCategoryStats: () => {
    const { items } = get();
    const map: Record<string, { stock: number; threshold: number }> = {};
    items.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = { stock: 0, threshold: 0 };
      }
      map[item.category].stock += item.stock;
      map[item.category].threshold += item.threshold;
    });
    return Object.entries(map).map(([category, val]) => ({
      category,
      ...val,
    }));
  },
}));

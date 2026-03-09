import { create } from "zustand";
import { PackagingMaterial, PackagingType } from "@/types";
import {
  generatePackagingMaterials,
  generatePackagingUsageData,
} from "@/lib/mock/packaging";

interface PackagingStore {
  materials: PackagingMaterial[];
  selectedType: PackagingType | "ALL";
  searchQuery: string;

  setSelectedType: (type: PackagingType | "ALL") => void;
  setSearchQuery: (query: string) => void;

  getFilteredMaterials: () => PackagingMaterial[];
  getLowStockMaterials: () => PackagingMaterial[];
  getKpi: () => {
    total: number;
    sufficient: number;
    lowStock: number;
    critical: number;
    daysUntilEmpty: number;
  };
  getTypeStats: () => { name: string; used: number; remaining: number }[];
}

export const usePackagingStore = create<PackagingStore>((set, get) => ({
  materials: generatePackagingMaterials(),
  selectedType: "ALL",
  searchQuery: "",

  setSelectedType: (type) => set({ selectedType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredMaterials: () => {
    const { materials, selectedType, searchQuery } = get();
    let filtered = materials;
    if (selectedType !== "ALL") {
      filtered = filtered.filter((m) => m.type === selectedType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  getLowStockMaterials: () => {
    return get()
      .materials.filter((m) => m.currentStock < m.minStock)
      .sort(
        (a, b) =>
          a.currentStock / a.minStock - b.currentStock / b.minStock
      );
  },

  getKpi: () => {
    const { materials } = get();
    if (materials.length === 0) {
      return { total: 0, sufficient: 0, lowStock: 0, critical: 0, daysUntilEmpty: 0 };
    }

    const sufficient = materials.filter((m) => m.currentStock >= m.minStock).length;
    const lowStock = materials.filter(
      (m) => m.currentStock < m.minStock && m.currentStock >= m.minStock * 0.5
    ).length;
    const critical = materials.filter(
      (m) => m.currentStock < m.minStock * 0.5
    ).length;

    const avgDays =
      materials.reduce((acc, m) => acc + m.currentStock / m.dailyUsage, 0) /
      materials.length;

    return {
      total: materials.length,
      sufficient,
      lowStock,
      critical,
      daysUntilEmpty: Math.floor(avgDays),
    };
  },

  getTypeStats: () => {
    return generatePackagingUsageData().map(({ name, used, remaining }) => ({
      name,
      used,
      remaining,
    }));
  },
}));

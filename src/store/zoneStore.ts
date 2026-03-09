import { create } from "zustand";
import { Delivery, DeliveryStatus, ZoneRegion, ZoneStat } from "@/types";
import { generateDeliveries } from "@/lib/mock/zones";

interface ZoneStore {
  deliveries: Delivery[];
  selectedRegion: ZoneRegion | "ALL";
  selectedStatus: DeliveryStatus | "ALL";

  setSelectedRegion: (region: ZoneRegion | "ALL") => void;
  setSelectedStatus: (status: DeliveryStatus | "ALL") => void;
  getFilteredDeliveries: () => Delivery[];
  getZoneStats: () => ZoneStat[];
  getKpi: () => {
    total: number;
    delivered: number;
    inTransit: number;
    failed: number;
    deliveryRate: number; // 완료율 (%)
  };
}

export const useZoneStore = create<ZoneStore>((set, get) => ({
  deliveries: generateDeliveries(120),
  selectedRegion: "ALL",
  selectedStatus: "ALL",

  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),

  getFilteredDeliveries: () => {
    const { deliveries, selectedRegion, selectedStatus } = get();
    return deliveries.filter((d) => {
      const regionOk = selectedRegion === "ALL" || d.region === selectedRegion;
      const statusOk = selectedStatus === "ALL" || d.status === selectedStatus;
      return regionOk && statusOk;
    });
  },

  getZoneStats: (): ZoneStat[] => {
    const { deliveries } = get();
    const ZONES: ZoneRegion[] = ["수도권", "강원", "충청", "전라", "경상", "제주"];
    const map: Record<string, ZoneStat> = {};

    ZONES.forEach((r) => {
      map[r] = { region: r, total: 0, delivered: 0, inTransit: 0, failed: 0 };
    });

    deliveries.forEach((d) => {
      const s = map[d.region];
      if (!s) return;
      s.total++;
      if (d.status === "DELIVERED") s.delivered++;
      else if (d.status === "IN_TRANSIT") s.inTransit++;
      else if (d.status === "FAILED") s.failed++;
    });

    return ZONES.map((r) => map[r]);
  },

  getKpi: () => {
    const { deliveries } = get();
    const total = deliveries.length;
    if (total === 0) return { total: 0, delivered: 0, inTransit: 0, failed: 0, deliveryRate: 0 };

    const delivered = deliveries.filter((d) => d.status === "DELIVERED").length;
    const inTransit = deliveries.filter((d) => d.status === "IN_TRANSIT").length;
    const failed = deliveries.filter((d) => d.status === "FAILED").length;

    return {
      total,
      delivered,
      inTransit,
      failed,
      deliveryRate: Math.round((delivered / total) * 100),
    };
  },
}));

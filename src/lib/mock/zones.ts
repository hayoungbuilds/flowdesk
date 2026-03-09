import { Delivery, DeliveryStatus, ZoneRegion } from "@/types";

const ZONES: ZoneRegion[] = ["수도권", "강원", "충청", "전라", "경상", "제주"];

const DRIVER_NAMES = [
  "김철수", "이영희", "박민준", "최지영", "정수현",
  "강동원", "윤미래", "임성한", "홍길동", "오준서",
  "서민지", "장하준", "남궁도", "황보민", "백수진",
];

const STATUS_WEIGHTS: Record<ZoneRegion, number[]> = {
  수도권:  [0.10, 0.35, 0.50, 0.05],
  강원:    [0.20, 0.30, 0.40, 0.10],
  충청:    [0.15, 0.30, 0.48, 0.07],
  전라:    [0.18, 0.28, 0.44, 0.10],
  경상:    [0.12, 0.33, 0.48, 0.07],
  제주:    [0.25, 0.20, 0.42, 0.13],
};

const STATUSES: DeliveryStatus[] = ["PENDING", "IN_TRANSIT", "DELIVERED", "FAILED"];

function weightedStatus(region: ZoneRegion): DeliveryStatus {
  const weights = STATUS_WEIGHTS[region];
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < STATUSES.length; i++) {
    acc += weights[i];
    if (r < acc) return STATUSES[i];
  }
  return "DELIVERED";
}

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export function generateDeliveries(count = 120): Delivery[] {
  return Array.from({ length: count }, (_, i) => {
    const region = ZONES[i % ZONES.length];
    const status = weightedStatus(region);
    const scheduledHoursAgo = Math.floor(Math.random() * 12);
    return {
      id: `DLV-${String(i + 1).padStart(5, "0")}`,
      orderId: `ORD-${String(Math.floor(Math.random() * 200) + 1).padStart(5, "0")}`,
      region,
      driverName: DRIVER_NAMES[i % DRIVER_NAMES.length],
      status,
      scheduledAt: hoursAgo(scheduledHoursAgo),
      deliveredAt: status === "DELIVERED"
        ? hoursAgo(Math.max(scheduledHoursAgo - Math.floor(Math.random() * 3 + 1), 0))
        : undefined,
    };
  });
}

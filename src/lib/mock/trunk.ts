import { TrunkRoute, TrunkStatus } from "@/types";

const HUBS = [
  "서울 허브",
  "경기 허브",
  "부산 허브",
  "대구 허브",
  "광주 허브",
  "대전 허브",
  "인천 허브",
] as const;

const DRIVER_NAMES = [
  "김철수", "이영희", "박민준", "최지영", "정수현",
  "강동원", "윤미래", "임성한", "홍길동", "오준서",
  "서민지", "장하준", "남궁도", "황보민", "백수진",
  "문재웅", "조성훈", "신예진", "류광호", "엄태준",
];

const VEHICLE_PREFIXES = ["서울", "경기", "부산", "대구", "광주", "대전", "인천"];
const VEHICLE_CHARS = ["가", "나", "다", "라", "마", "거", "너", "더"];

const STATUSES: TrunkStatus[] = [
  "SCHEDULED",
  "DEPARTED",
  "IN_TRANSIT",
  "ARRIVED",
  "DELAYED",
];

// ~20% SCHEDULED, ~15% DEPARTED, ~40% IN_TRANSIT, ~20% ARRIVED, ~5% DELAYED
const STATUS_WEIGHTS = [0.20, 0.15, 0.40, 0.20, 0.05];

function pickWeightedStatus(): TrunkStatus {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < STATUSES.length; i++) {
    acc += STATUS_WEIGHTS[i];
    if (r < acc) return STATUSES[i];
  }
  return "IN_TRANSIT";
}

function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function addHours(iso: string, h: number): string {
  const d = new Date(iso);
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

function generateVehicleNo(seed: number): string {
  const prefix = VEHICLE_PREFIXES[seed % VEHICLE_PREFIXES.length];
  const char = VEHICLE_CHARS[seed % VEHICLE_CHARS.length];
  const num = String(1000 + (seed * 37 + seed * seed * 13) % 9000).padStart(4, "0");
  return `${prefix} ${char} ${num}`;
}

export function generateTrunkRoutes(count: number = 60): TrunkRoute[] {
  return Array.from({ length: count }, (_, i) => {
    const originIdx = i % HUBS.length;
    const destIdx = (originIdx + 1 + (i % (HUBS.length - 1))) % HUBS.length;

    const origin = HUBS[originIdx];
    const destination = HUBS[destIdx];

    const driverName = DRIVER_NAMES[i % DRIVER_NAMES.length];
    const vehicleNo = generateVehicleNo(i);
    const cargoCount = 50 + Math.floor(((i * 137 + 53) % 451));
    const status = pickWeightedStatus();

    const departHour = 4 + (i % 18); // 04:00 ~ 21:00
    const departMinute = (i * 7) % 60;
    const departedAt = todayAt(departHour, departMinute);

    const estimatedHours = 2 + (i % 7); // 2 ~ 8 hours
    const estimatedAt = addHours(departedAt, estimatedHours);

    const arrivedAt =
      status === "ARRIVED"
        ? addHours(departedAt, Math.max(1, estimatedHours - 1 + (i % 2)))
        : undefined;

    return {
      id: `TRK-${String(i + 1).padStart(5, "0")}`,
      origin,
      destination,
      driverName,
      vehicleNo,
      cargoCount,
      status,
      departedAt,
      estimatedAt,
      arrivedAt,
    };
  });
}

export function generateHubFlowData(): { hub: string; outbound: number; inbound: number }[] {
  const routes = generateTrunkRoutes(60);

  const outboundMap: Record<string, number> = {};
  const inboundMap: Record<string, number> = {};

  HUBS.forEach((hub) => {
    outboundMap[hub] = 0;
    inboundMap[hub] = 0;
  });

  routes.forEach((r) => {
    outboundMap[r.origin] = (outboundMap[r.origin] ?? 0) + r.cargoCount;
    inboundMap[r.destination] = (inboundMap[r.destination] ?? 0) + r.cargoCount;
  });

  return HUBS.map((hub) => ({
    hub,
    outbound: outboundMap[hub] ?? 0,
    inbound: inboundMap[hub] ?? 0,
  }));
}

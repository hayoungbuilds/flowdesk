import { SystemAlert, AlertLevel, OperationStat } from "@/types";

const SOURCES = [
  "입고시스템",
  "피킹시스템",
  "패킹시스템",
  "배송시스템",
  "재고시스템",
  "정산시스템",
];

const CRITICAL_TITLES = ["시스템 오류", "처리 지연 임계치 초과"];
const CRITICAL_MESSAGES: Record<string, string[]> = {
  "시스템 오류": [
    "데이터베이스 연결이 끊어졌습니다. 즉시 확인이 필요합니다.",
    "API 서버 응답 없음. 서비스 중단 위험.",
    "메모리 사용량이 임계치를 초과했습니다.",
  ],
  "처리 지연 임계치 초과": [
    "처리 대기열이 500건을 초과했습니다.",
    "평균 처리 시간이 목표의 300%를 넘었습니다.",
    "배치 작업 지연으로 SLA 위반이 우려됩니다.",
  ],
};

const WARNING_TITLES = ["처리량 감소", "재고 임박", "지연 증가"];
const WARNING_MESSAGES: Record<string, string[]> = {
  "처리량 감소": [
    "전일 대비 처리량이 20% 감소했습니다.",
    "피킹 속도가 목표치 대비 15% 저하되었습니다.",
  ],
  "재고 임박": [
    "소형 박스 재고가 최소 임계값에 근접했습니다.",
    "냉장 보관 공간이 90% 이상 사용 중입니다.",
  ],
  "지연 증가": [
    "지연 주문이 전체의 8%를 초과했습니다.",
    "배송 대기 시간이 평균 40분 이상으로 증가했습니다.",
  ],
};

const INFO_TITLES = ["배치 처리 완료", "정상 운영 중"];
const INFO_MESSAGES: Record<string, string[]> = {
  "배치 처리 완료": [
    "오전 배치 작업이 정상적으로 완료되었습니다.",
    "정산 배치가 성공적으로 처리되었습니다.",
    "재고 동기화 배치가 완료되었습니다.",
  ],
  "정상 운영 중": [
    "모든 시스템이 정상 가동 중입니다.",
    "처리량이 목표 범위 내에 있습니다.",
    "서비스 응답 시간이 정상 수준입니다.",
  ],
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSystemAlerts(count: number): SystemAlert[] {
  const now = Date.now();
  const twoHoursAgo = now - 2 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, i) => {
    const rand = Math.random();
    let level: AlertLevel;
    let title: string;
    let message: string;

    if (rand < 0.05) {
      // 5% CRITICAL
      level = "CRITICAL";
      title = pickRandom(CRITICAL_TITLES);
      message = pickRandom(CRITICAL_MESSAGES[title]);
    } else if (rand < 0.30) {
      // 25% WARNING
      level = "WARNING";
      title = pickRandom(WARNING_TITLES);
      message = pickRandom(WARNING_MESSAGES[title]);
    } else {
      // 70% INFO
      level = "INFO";
      title = pickRandom(INFO_TITLES);
      message = pickRandom(INFO_MESSAGES[title]);
    }

    const createdAt = new Date(
      twoHoursAgo + Math.random() * (now - twoHoursAgo)
    ).toISOString();

    // ~80% resolved, ~20% active
    const resolved = Math.random() < 0.8;

    return {
      id: `ALERT-${String(i + 1).padStart(5, "0")}`,
      level,
      title,
      message,
      source: pickRandom(SOURCES),
      createdAt,
      resolved,
    };
  });
}

// Realistic throughput: peaks around 10:00-12:00 and 15:00-17:00
function getPeakMultiplier(hour: number): number {
  if (hour >= 10 && hour <= 12) return 1.0;        // morning peak
  if (hour >= 15 && hour <= 17) return 0.9;        // afternoon peak
  if (hour >= 8 && hour <= 9) return 0.6;          // ramp up
  if (hour >= 13 && hour <= 14) return 0.7;        // post-lunch dip
  if (hour >= 18 && hour <= 19) return 0.5;        // wind down
  return 0.4;                                       // off-peak
}

export function generateOperationStats(): OperationStat[] {
  // Build last 12 half-hour slots ending at the current time
  const now = new Date();
  // Floor to nearest 30-min boundary
  const base = new Date(now);
  base.setSeconds(0, 0);
  const mins = base.getMinutes();
  base.setMinutes(mins >= 30 ? 30 : 0);

  const slots: OperationStat[] = [];
  for (let i = 11; i >= 0; i--) {
    const t = new Date(base.getTime() - i * 30 * 60 * 1000);
    const hour = t.getHours();
    const label = `${String(hour).padStart(2, "0")}:${t.getMinutes() === 0 ? "00" : "30"}`;
    const multiplier = getPeakMultiplier(hour);

    slots.push({
      time: label,
      inbound: randomBetween(
        Math.round(20 * multiplier),
        Math.round(100 * multiplier)
      ),
      picking: randomBetween(
        Math.round(50 * multiplier),
        Math.round(200 * multiplier)
      ),
      packing: randomBetween(
        Math.round(40 * multiplier),
        Math.round(180 * multiplier)
      ),
      shipping: randomBetween(
        Math.round(30 * multiplier),
        Math.round(150 * multiplier)
      ),
    });
  }

  return slots;
}

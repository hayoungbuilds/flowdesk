export type OrderStatus =
  | "RECEIVED"
  | "PICKING"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "DELAYED";

export interface Order {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  region: string;
}

export interface OrderSummary {
  total: number;
  processing: number;
  completed: number;
  delayed: number;
}

export interface HourlyData {
  hour: string;
  orders: number;
}

export type WorkerRole = "PICKING" | "PACKING" | "SHIPPING";
export type WorkerStatus = "ACTIVE" | "BREAK" | "OFFLINE";

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
  zone: string;
  processed: number;       // 오늘 처리량
  target: number;          // 목표량
  avgTimeSeconds: number;  // 건당 평균 처리 시간(초)
}

export interface HourlyPerformance {
  hour: string;
  picking: number;
  packing: number;
  shipping: number;
}

export type InventoryCategory =
  | "식품"
  | "생활용품"
  | "뷰티"
  | "가전"
  | "패션"
  | "반려동물";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  threshold: number;
  location: string;
}

// ─── 발주(Purchase Order) ───────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | "PENDING"     // 승인 대기
  | "APPROVED"    // 승인 완료
  | "RECEIVING"   // 입고 중
  | "COMPLETED"   // 입고 완료
  | "CANCELLED";  // 취소

export interface PurchaseOrder {
  id: string;
  supplier: string;
  productName: string;
  category: InventoryCategory;
  quantity: number;
  unitPrice: number;
  status: PurchaseOrderStatus;
  orderedAt: string;
  expectedAt: string;
}

// ─── 권역 배송 ──────────────────────────────────────────────────────────────

export type ZoneRegion = "수도권" | "강원" | "충청" | "전라" | "경상" | "제주";
export type DeliveryStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

export interface Delivery {
  id: string;
  orderId: string;
  region: ZoneRegion;
  driverName: string;
  status: DeliveryStatus;
  scheduledAt: string;
  deliveredAt?: string;
}

export interface ZoneStat {
  region: ZoneRegion;
  total: number;
  delivered: number;
  inTransit: number;
  failed: number;
}

// ─── 입고 관리 (Inbound) ─────────────────────────────────────────────────────

export type InboundStatus =
  | "SCHEDULED"   // 입고 예정
  | "IN_PROGRESS" // 입고 중
  | "INSPECTING"  // 검수 중
  | "COMPLETED"   // 입고 완료
  | "REJECTED";   // 반려

export interface InboundItem {
  id: string;
  supplier: string;
  productName: string;
  category: InventoryCategory;
  expectedQty: number;
  receivedQty: number;
  status: InboundStatus;
  scheduledAt: string;
  completedAt?: string;
  inspector?: string;
}

// ─── 정산 관리 (Settlement) ──────────────────────────────────────────────────

export type SettlementStatus =
  | "PENDING"     // 정산 대기
  | "PROCESSING"  // 처리 중
  | "COMPLETED"   // 정산 완료
  | "ERROR";      // 오류

export interface Settlement {
  id: string;
  supplier: string;
  period: string;          // e.g. "2025-06"
  totalAmount: number;
  itemCount: number;
  status: SettlementStatus;
  dueDate: string;
  settledAt?: string;
}

// ─── 회수/반품 (Returns) ─────────────────────────────────────────────────────

export type ReturnStatus =
  | "REQUESTED"   // 반품 접수
  | "COLLECTING"  // 수거 중
  | "INSPECTING"  // 검수 중
  | "REFUNDED"    // 환불 완료
  | "REJECTED";   // 반려

export type ReturnReason =
  | "DAMAGED"        // 상품 파손
  | "WRONG_ITEM"     // 오배송
  | "CHANGE_OF_MIND" // 단순 변심
  | "DEFECTIVE"      // 불량
  | "OTHER";         // 기타

export interface ReturnItem {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  reason: ReturnReason;
  status: ReturnStatus;
  requestedAt: string;
  refundAmount: number;
  completedAt?: string;
}

// ─── 포장재 관리 (Packaging) ─────────────────────────────────────────────────

export type PackagingType =
  | "BOX_SMALL"    // 소형 박스
  | "BOX_MEDIUM"   // 중형 박스
  | "BOX_LARGE"    // 대형 박스
  | "COLD_BOX"     // 냉장 박스
  | "ENVELOPE"     // 봉투
  | "BUBBLE_WRAP"; // 에어캡

export interface PackagingMaterial {
  id: string;
  type: PackagingType;
  name: string;
  currentStock: number;
  minStock: number;     // 최소 재고 임계값
  dailyUsage: number;   // 일평균 사용량
  unit: string;         // "개", "롤", "장"
  lastRestockedAt: string;
}

// ─── 관제 센터 (Control Center) ──────────────────────────────────────────────

export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

export interface SystemAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  source: string;   // e.g. "입고시스템", "배송시스템"
  createdAt: string;
  resolved: boolean;
}

export interface OperationStat {
  time: string;
  inbound: number;
  picking: number;
  packing: number;
  shipping: number;
}

// ─── 간선 관리 (Trunk Lines) ─────────────────────────────────────────────────

export type TrunkStatus =
  | "SCHEDULED"  // 출발 예정
  | "DEPARTED"   // 출발
  | "IN_TRANSIT" // 운행 중
  | "ARRIVED"    // 도착
  | "DELAYED";   // 지연

export interface TrunkRoute {
  id: string;
  origin: string;       // 출발 허브
  destination: string;  // 도착 허브
  driverName: string;
  vehicleNo: string;
  cargoCount: number;
  status: TrunkStatus;
  departedAt: string;
  estimatedAt: string;
  arrivedAt?: string;
}

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

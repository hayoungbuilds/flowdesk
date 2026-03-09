import { describe, it, expect, beforeEach } from "vitest";
import { useOrderStore } from "@/store/orderStore";

// 각 테스트 전 스토어 초기 상태로 리셋
beforeEach(() => {
  useOrderStore.setState({
    orders: [],
    selectedStatus: "ALL",
    isPolling: false,
    lastUpdated: null,
  });
});

describe("useOrderStore", () => {
  describe("getSummary", () => {
    it("orders가 비어있으면 모두 0을 반환한다", () => {
      const summary = useOrderStore.getState().getSummary();
      expect(summary).toEqual({ total: 0, processing: 0, completed: 0, delayed: 0 });
    });

    it("DELIVERED 주문을 completed로 집계한다", () => {
      useOrderStore.setState({
        orders: [
          { id: "1", customerName: "홍길동", productName: "상품A", quantity: 1, status: "DELIVERED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "서울" },
          { id: "2", customerName: "김철수", productName: "상품B", quantity: 2, status: "DELIVERED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "부산" },
        ],
      });
      const summary = useOrderStore.getState().getSummary();
      expect(summary.completed).toBe(2);
      expect(summary.processing).toBe(0);
    });

    it("DELAYED 주문을 delayed로 집계한다", () => {
      useOrderStore.setState({
        orders: [
          { id: "1", customerName: "홍길동", productName: "상품A", quantity: 1, status: "DELAYED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "서울" },
        ],
      });
      const summary = useOrderStore.getState().getSummary();
      expect(summary.delayed).toBe(1);
    });

    it("PICKING, PACKING, SHIPPED를 processing으로 집계한다", () => {
      useOrderStore.setState({
        orders: [
          { id: "1", customerName: "홍길동", productName: "상품A", quantity: 1, status: "PICKING", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "서울" },
          { id: "2", customerName: "김철수", productName: "상품B", quantity: 1, status: "PACKING", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "부산" },
          { id: "3", customerName: "이영희", productName: "상품C", quantity: 1, status: "SHIPPED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "대구" },
        ],
      });
      const summary = useOrderStore.getState().getSummary();
      expect(summary.processing).toBe(3);
      expect(summary.total).toBe(3);
    });
  });

  describe("getFilteredOrders", () => {
    beforeEach(() => {
      useOrderStore.setState({
        orders: [
          { id: "1", customerName: "홍길동", productName: "상품A", quantity: 1, status: "RECEIVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "서울" },
          { id: "2", customerName: "김철수", productName: "상품B", quantity: 1, status: "PICKING", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "부산" },
          { id: "3", customerName: "이영희", productName: "상품C", quantity: 1, status: "DELIVERED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "대구" },
        ],
        selectedStatus: "ALL",
      });
    });

    it("ALL이면 전체 주문을 반환한다", () => {
      const orders = useOrderStore.getState().getFilteredOrders();
      expect(orders).toHaveLength(3);
    });

    it("특정 상태로 필터링하면 해당 주문만 반환한다", () => {
      useOrderStore.setState({ selectedStatus: "PICKING" });
      const orders = useOrderStore.getState().getFilteredOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe("PICKING");
    });

    it("해당 상태 주문이 없으면 빈 배열을 반환한다", () => {
      useOrderStore.setState({ selectedStatus: "DELAYED" });
      const orders = useOrderStore.getState().getFilteredOrders();
      expect(orders).toHaveLength(0);
    });
  });

  describe("getStatusCounts", () => {
    it("상태별 카운트를 고정된 순서로 반환한다", () => {
      useOrderStore.setState({
        orders: [
          { id: "1", customerName: "홍길동", productName: "상품A", quantity: 1, status: "DELIVERED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "서울" },
          { id: "2", customerName: "김철수", productName: "상품B", quantity: 1, status: "RECEIVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "부산" },
          { id: "3", customerName: "이영희", productName: "상품C", quantity: 1, status: "RECEIVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "대구" },
        ],
      });
      const counts = useOrderStore.getState().getStatusCounts();
      // RECEIVED가 DELIVERED보다 앞에 와야 함 (STATUS_ORDER 기준)
      const names = counts.map((c) => c.name);
      expect(names.indexOf("접수")).toBeLessThan(names.indexOf("배송완료"));
      expect(counts.find((c) => c.name === "접수")?.value).toBe(2);
      expect(counts.find((c) => c.name === "배송완료")?.value).toBe(1);
    });
  });

  describe("getKpiMetrics", () => {
    it("orders가 비어있으면 모두 0을 반환한다", () => {
      const kpi = useOrderStore.getState().getKpiMetrics();
      expect(kpi).toEqual({ delayRate: 0, completionRate: 0, avgProcessingMin: 0, dailyGoalRate: 0 });
    });

    it("지연율을 올바르게 계산한다", () => {
      useOrderStore.setState({
        orders: [
          { id: "1", customerName: "홍길동", productName: "상품A", quantity: 1, status: "DELAYED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "서울" },
          { id: "2", customerName: "김철수", productName: "상품B", quantity: 1, status: "RECEIVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "부산" },
          { id: "3", customerName: "이영희", productName: "상품C", quantity: 1, status: "RECEIVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "대구" },
          { id: "4", customerName: "박민준", productName: "상품D", quantity: 1, status: "RECEIVED", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), region: "인천" },
        ],
      });
      const kpi = useOrderStore.getState().getKpiMetrics();
      expect(kpi.delayRate).toBe(25); // 1/4 = 25%
    });

    it("dailyGoalRate는 100%를 초과하지 않는다", () => {
      // 300건 이상 DELIVERED 시 100% 상한
      const deliveredOrders = Array.from({ length: 400 }, (_, i) => ({
        id: String(i),
        customerName: "홍길동",
        productName: "상품A",
        quantity: 1,
        status: "DELIVERED" as const,
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date().toISOString(),
        region: "서울",
      }));
      useOrderStore.setState({ orders: deliveredOrders });
      const kpi = useOrderStore.getState().getKpiMetrics();
      expect(kpi.dailyGoalRate).toBe(100);
    });
  });

  describe("refreshOrders", () => {
    it("주문 배열이 500건을 초과하지 않는다", () => {
      const manyOrders = Array.from({ length: 499 }, (_, i) => ({
        id: String(i),
        customerName: "홍길동",
        productName: "상품A",
        quantity: 1,
        status: "RECEIVED" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        region: "서울",
      }));
      useOrderStore.setState({ orders: manyOrders });
      useOrderStore.getState().refreshOrders();
      const { orders } = useOrderStore.getState();
      expect(orders.length).toBeLessThanOrEqual(500);
    });

    it("refreshOrders 후 lastUpdated가 갱신된다", () => {
      const before = new Date("2024-01-01");
      useOrderStore.setState({ lastUpdated: before, orders: [] });
      useOrderStore.getState().refreshOrders();
      const { lastUpdated } = useOrderStore.getState();
      expect(lastUpdated!.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe("startPolling / stopPolling", () => {
    it("startPolling은 isPolling을 true로 만든다", () => {
      useOrderStore.getState().startPolling();
      expect(useOrderStore.getState().isPolling).toBe(true);
    });

    it("stopPolling은 isPolling을 false로 만든다", () => {
      useOrderStore.setState({ isPolling: true });
      useOrderStore.getState().stopPolling();
      expect(useOrderStore.getState().isPolling).toBe(false);
    });
  });
});

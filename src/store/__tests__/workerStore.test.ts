import { describe, it, expect, beforeEach } from "vitest";
import { useWorkerStore } from "@/store/workerStore";
import { Worker } from "@/types";

const makeWorker = (overrides: Partial<Worker> = {}): Worker => ({
  id: "W001",
  name: "홍길동",
  role: "PICKING",
  status: "ACTIVE",
  zone: "A구역",
  processed: 100,
  target: 200,
  avgTimeSeconds: 45,
  ...overrides,
});

beforeEach(() => {
  useWorkerStore.setState({ workers: [], selectedRole: "ALL" });
});

describe("useWorkerStore", () => {
  describe("getFilteredWorkers", () => {
    beforeEach(() => {
      useWorkerStore.setState({
        workers: [
          makeWorker({ id: "W001", role: "PICKING" }),
          makeWorker({ id: "W002", role: "PACKING" }),
          makeWorker({ id: "W003", role: "SHIPPING" }),
        ],
      });
    });

    it("ALL이면 전체 작업자를 반환한다", () => {
      const workers = useWorkerStore.getState().getFilteredWorkers();
      expect(workers).toHaveLength(3);
    });

    it("역할로 필터링하면 해당 작업자만 반환한다", () => {
      useWorkerStore.setState({ selectedRole: "PICKING" });
      const workers = useWorkerStore.getState().getFilteredWorkers();
      expect(workers).toHaveLength(1);
      expect(workers[0].role).toBe("PICKING");
    });
  });

  describe("getKpi", () => {
    it("작업자가 없으면 NaN 없이 계산한다", () => {
      // workers가 빈 배열이면 나눗셈이 NaN이 되지 않도록
      useWorkerStore.setState({ workers: [] });
      const kpi = useWorkerStore.getState().getKpi();
      expect(kpi.total).toBe(0);
      expect(kpi.active).toBe(0);
    });

    it("ACTIVE 작업자 수를 올바르게 집계한다", () => {
      useWorkerStore.setState({
        workers: [
          makeWorker({ id: "W001", status: "ACTIVE" }),
          makeWorker({ id: "W002", status: "ACTIVE" }),
          makeWorker({ id: "W003", status: "OFFLINE" }),
        ],
      });
      const kpi = useWorkerStore.getState().getKpi();
      expect(kpi.active).toBe(2);
      expect(kpi.total).toBe(3);
    });

    it("평균 달성률을 올바르게 계산한다", () => {
      useWorkerStore.setState({
        workers: [
          makeWorker({ id: "W001", processed: 100, target: 200 }), // 50%
          makeWorker({ id: "W002", processed: 200, target: 200 }), // 100%
        ],
      });
      const kpi = useWorkerStore.getState().getKpi();
      expect(kpi.avgAchievementRate).toBe(75); // (50 + 100) / 2
    });

    it("평균 처리 시간을 올바르게 계산한다", () => {
      useWorkerStore.setState({
        workers: [
          makeWorker({ id: "W001", avgTimeSeconds: 40 }),
          makeWorker({ id: "W002", avgTimeSeconds: 60 }),
        ],
      });
      const kpi = useWorkerStore.getState().getKpi();
      expect(kpi.avgTimeSeconds).toBe(50);
    });
  });

  describe("setSelectedRole", () => {
    it("역할을 변경한다", () => {
      useWorkerStore.getState().setSelectedRole("PACKING");
      expect(useWorkerStore.getState().selectedRole).toBe("PACKING");
    });

    it("ALL로 초기화할 수 있다", () => {
      useWorkerStore.setState({ selectedRole: "PICKING" });
      useWorkerStore.getState().setSelectedRole("ALL");
      expect(useWorkerStore.getState().selectedRole).toBe("ALL");
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePolling } from "@/hooks/usePolling";
import { useOrderStore } from "@/store/orderStore";

beforeEach(() => {
  vi.useFakeTimers();
  useOrderStore.setState({ isPolling: false, orders: [], lastUpdated: null });
});

afterEach(() => {
  vi.useRealTimers();
  useOrderStore.setState({ isPolling: false });
});

describe("usePolling", () => {
  it("초기 상태에서 isPolling은 false다", () => {
    const { result } = renderHook(() => usePolling(1000));
    expect(result.current.isPolling).toBe(false);
  });

  it("startPolling 호출 후 isPolling이 true가 된다", () => {
    const { result } = renderHook(() => usePolling(1000));
    act(() => {
      result.current.startPolling();
    });
    expect(result.current.isPolling).toBe(true);
  });

  it("stopPolling 호출 후 isPolling이 false가 된다", () => {
    const { result } = renderHook(() => usePolling(1000));
    act(() => {
      result.current.startPolling();
    });
    act(() => {
      result.current.stopPolling();
    });
    expect(result.current.isPolling).toBe(false);
  });

  it("폴링 중 interval 경과 후 lastUpdated가 갱신된다", () => {
    const { result } = renderHook(() => usePolling(1000));

    act(() => {
      result.current.startPolling();
    });

    const before = useOrderStore.getState().lastUpdated;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const after = useOrderStore.getState().lastUpdated;
    expect(after).not.toBeNull();
    // before가 null이거나 after가 더 최신이어야 함
    if (before !== null) {
      expect(after!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    }
  });

  it("언마운트 시 interval이 정리된다", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { result, unmount } = renderHook(() => usePolling(1000));

    act(() => {
      result.current.startPolling();
    });

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("stopPolling 호출 시 더 이상 refreshOrders를 실행하지 않는다", () => {
    const { result } = renderHook(() => usePolling(1000));
    act(() => { result.current.startPolling(); });
    act(() => { result.current.stopPolling(); });

    const lastUpdatedAfterStop = useOrderStore.getState().lastUpdated;
    act(() => { vi.advanceTimersByTime(5000); });
    const lastUpdatedAfterWait = useOrderStore.getState().lastUpdated;

    expect(lastUpdatedAfterWait).toEqual(lastUpdatedAfterStop);
  });
});

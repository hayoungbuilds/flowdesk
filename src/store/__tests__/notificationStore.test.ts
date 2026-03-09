import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "@/store/notificationStore";

beforeEach(() => {
  useNotificationStore.setState({
    notifications: [],
    isOpen: false,
  });
});

describe("useNotificationStore", () => {
  describe("add", () => {
    it("알림을 추가하면 notifications에 추가된다", () => {
      useNotificationStore.getState().add({
        level: "info",
        title: "테스트 알림",
        message: "내용",
        source: "테스트",
      });
      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe("테스트 알림");
      expect(notifications[0].read).toBe(false);
    });

    it("최신 알림이 배열 앞에 추가된다", () => {
      const store = useNotificationStore.getState();
      store.add({ level: "info", title: "첫 번째", message: "", source: "" });
      store.add({ level: "warning", title: "두 번째", message: "", source: "" });
      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].title).toBe("두 번째");
    });

    it("최대 50개를 초과하면 오래된 것이 제거된다", () => {
      for (let i = 0; i < 55; i++) {
        useNotificationStore.getState().add({
          level: "info",
          title: `알림 ${i}`,
          message: "",
          source: "",
        });
      }
      expect(useNotificationStore.getState().notifications).toHaveLength(50);
    });
  });

  describe("markRead", () => {
    it("특정 알림을 읽음으로 표시한다", () => {
      useNotificationStore.getState().add({ level: "info", title: "테스트", message: "", source: "" });
      const { notifications } = useNotificationStore.getState();
      const id = notifications[0].id;

      useNotificationStore.getState().markRead(id);
      expect(useNotificationStore.getState().notifications[0].read).toBe(true);
    });
  });

  describe("markAllRead", () => {
    it("모든 알림을 읽음으로 표시한다", () => {
      const store = useNotificationStore.getState();
      store.add({ level: "info", title: "A", message: "", source: "" });
      store.add({ level: "warning", title: "B", message: "", source: "" });
      store.add({ level: "critical", title: "C", message: "", source: "" });

      useNotificationStore.getState().markAllRead();
      const allRead = useNotificationStore.getState().notifications.every((n) => n.read);
      expect(allRead).toBe(true);
    });
  });

  describe("remove", () => {
    it("특정 알림을 삭제한다", () => {
      useNotificationStore.getState().add({ level: "info", title: "삭제 대상", message: "", source: "" });
      const id = useNotificationStore.getState().notifications[0].id;

      useNotificationStore.getState().remove(id);
      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });
  });

  describe("getUnreadCount", () => {
    it("읽지 않은 알림 수를 반환한다", () => {
      const store = useNotificationStore.getState();
      store.add({ level: "info", title: "A", message: "", source: "" });
      store.add({ level: "warning", title: "B", message: "", source: "" });

      const id = useNotificationStore.getState().notifications[1].id;
      useNotificationStore.getState().markRead(id);

      expect(useNotificationStore.getState().getUnreadCount()).toBe(1);
    });

    it("알림이 없으면 0을 반환한다", () => {
      expect(useNotificationStore.getState().getUnreadCount()).toBe(0);
    });
  });

  describe("setOpen", () => {
    it("isOpen 상태를 변경한다", () => {
      useNotificationStore.getState().setOpen(true);
      expect(useNotificationStore.getState().isOpen).toBe(true);
      useNotificationStore.getState().setOpen(false);
      expect(useNotificationStore.getState().isOpen).toBe(false);
    });
  });
});

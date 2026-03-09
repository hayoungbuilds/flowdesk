import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { NotificationBell } from "@/components/layout/NotificationPanel";
import { useNotificationStore } from "@/store/notificationStore";

const meta: Meta<typeof NotificationBell> = {
  title: "Layout/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "헤더에 위치하는 알림 벨 버튼. 클릭 시 알림 목록 패널이 열립니다. 읽지 않은 알림 수가 뱃지로 표시됩니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

export const WithUnread: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useNotificationStore.setState({ isOpen: false });
        // 읽지 않은 알림 3개 세팅
        useNotificationStore.setState({
          notifications: [
            {
              id: "1",
              level: "critical",
              title: "긴급: 피킹 지연",
              message: "A구역 피킹 처리 속도가 목표치의 60% 이하입니다.",
              source: "피킹시스템",
              createdAt: new Date(Date.now() - 5 * 60 * 1000),
              read: false,
            },
            {
              id: "2",
              level: "warning",
              title: "재고 임박",
              message: "소형 박스 재고가 최소 기준에 근접했습니다.",
              source: "재고시스템",
              createdAt: new Date(Date.now() - 20 * 60 * 1000),
              read: false,
            },
            {
              id: "3",
              level: "info",
              title: "입고 완료",
              message: "농심 배치 입고가 완료되었습니다.",
              source: "입고시스템",
              createdAt: new Date(Date.now() - 60 * 60 * 1000),
              read: false,
            },
          ],
        });
      }, []);
      return <Story />;
    },
  ],
};

export const AllRead: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useNotificationStore.getState().markAllRead();
      }, []);
      return <Story />;
    },
  ],
};

export const Empty: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useNotificationStore.setState({ notifications: [], isOpen: false });
      }, []);
      return <Story />;
    },
  ],
};

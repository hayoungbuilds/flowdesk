import type { Meta, StoryObj } from "@storybook/react";
import { WorkloadHeatmap } from "@/components/dashboard/WorkloadHeatmap";

const meta: Meta<typeof WorkloadHeatmap> = {
  title: "Dashboard/WorkloadHeatmap",
  component: WorkloadHeatmap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "시간대(06~23시) × 요일별 피킹 작업량을 히트맵으로 시각화합니다. 색상이 진할수록 처리량이 많습니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkloadHeatmap>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-zinc-950 p-6 rounded-xl">
        <Story />
      </div>
    ),
  ],
};

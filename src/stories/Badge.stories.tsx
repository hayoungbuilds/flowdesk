import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "기본" },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge className="bg-blue-100 text-blue-700">접수</Badge>
      <Badge className="bg-violet-100 text-violet-700">피킹</Badge>
      <Badge className="bg-yellow-100 text-yellow-700">패킹</Badge>
      <Badge className="bg-orange-100 text-orange-700">출고</Badge>
      <Badge className="bg-green-100 text-green-700">배송완료</Badge>
      <Badge className="bg-red-100 text-red-700">지연</Badge>
    </div>
  ),
};

export const InboundStatus: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge className="bg-blue-100 text-blue-700">입고예정</Badge>
      <Badge className="bg-yellow-100 text-yellow-700">입고중</Badge>
      <Badge className="bg-orange-100 text-orange-700">검수중</Badge>
      <Badge className="bg-green-100 text-green-700">완료</Badge>
      <Badge className="bg-red-100 text-red-700">반려</Badge>
    </div>
  ),
};

export const AlertLevels: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge className="bg-red-100 text-red-700">긴급</Badge>
      <Badge className="bg-yellow-100 text-yellow-700">주의</Badge>
      <Badge className="bg-blue-100 text-blue-700">정보</Badge>
    </div>
  ),
};

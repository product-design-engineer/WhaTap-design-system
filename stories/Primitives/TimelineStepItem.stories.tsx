import type { Meta, StoryObj } from "@storybook/react-vite";
import TimelineStepItem from "../../src/widget/TimelineStepItem";

const meta: Meta<typeof TimelineStepItem> = {
  title: "Primitives/TimelineStepItem",
  component: TimelineStepItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**타임라인 단계 행 (part)** — [[AiStepsTimeline]] 의 단일 단계 행. 상태 마커(완료 ✓ / 진행 spinner) + 라벨 + 우측 화살표.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4px" style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TimelineStepItem>;

export const Completed: Story = {
  args: {
    label: "지표 수집",
    running: false,
  },
};

export const Running: Story = {
  args: {
    label: "리포트 생성",
    running: true,
  },
};

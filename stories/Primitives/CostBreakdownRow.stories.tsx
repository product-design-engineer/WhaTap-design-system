import type { Meta, StoryObj } from "@storybook/react-vite";
import CostBreakdownRow from "../../src/widget/CostBreakdownRow";

const meta: Meta<typeof CostBreakdownRow> = {
  title: "Primitives/CostBreakdownRow",
  component: CostBreakdownRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**비용 표 행** — [[AiCostBreakdown]] 5컬럼 표(GPU / Pod / 평균 사용률 / 유휴 비율 / 일일 낭비)의 데이터 행 한 건. 부모 표 헤더와 동일한 grid 트랙을 공유한다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 440,
          border: "1px solid var(--color-border-default)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CostBreakdownRow>;

export const Default: Story = {
  args: {
    row: { gpu: "#3", pod: "infer-batch-2", avg: "12%", idle: "88%", daily: "₩59,136" },
  },
};

export const LongPodName: Story = {
  args: {
    row: {
      gpu: "#7",
      pod: "very-long-inference-pod-name-that-truncates",
      avg: "4%",
      idle: "96%",
      daily: "₩62,400",
    },
  },
};

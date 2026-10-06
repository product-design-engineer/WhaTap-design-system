import type { Meta, StoryObj } from "@storybook/react-vite";
import ClassificationTableRow from "../../src/widget/ClassificationTableRow";

const meta: Meta<typeof ClassificationTableRow> = {
  title: "Primitives/ClassificationTableRow",
  component: ClassificationTableRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**분류 표 행** — [[ClassificationTable]] 7컬럼 표(GPU / 모델명 / 평균 / 최대 / 최소 / Pod / 분류)의 데이터 행 한 건. 부모 표 헤더와 동일한 grid 트랙을 공유하며, 분류 배지의 배경/도트/라벨 색은 부모 `TONE_BADGE` 매핑에서 풀어 props 로 전달된다.",
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
type Story = StoryObj<typeof ClassificationTableRow>;

export const HighUtilization: Story = {
  args: {
    row: { gpu: 1, model: "A100", avg: "82%", max: "97%", min: "61%", pod: "train-1", tone: "high" },
    badgeBg: "var(--color-tone-surface-critical)",
    badgeDot: "var(--color-indicator-critical)",
    badgeLabel: "고활용",
  },
};

export const LowUtilization: Story = {
  args: {
    row: { gpu: 3, model: "A100", avg: "12%", max: "20%", min: "4%", pod: "infer-2", tone: "low" },
    badgeBg: "var(--color-tone-surface-info)",
    badgeDot: "var(--color-brand-blue)",
    badgeLabel: "저활용",
  },
};

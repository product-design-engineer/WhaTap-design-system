import type { Meta, StoryObj } from "@storybook/react-vite";
import MigPlanRow from "../../src/widget/MigPlanRow";

const meta: Meta<typeof MigPlanRow> = {
  title: "Primitives/MigPlanRow",
  component: MigPlanRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**MIG 계획 표 행** — [[AiMigPlan]] 요약 표(구성 / 분할·Pod / 월 환산)의 데이터 행 한 건. 부모 표 헤더와 동일한 grid 트랙(`1.4fr 1.4fr 1fr`)을 공유한다.",
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
type Story = StoryObj<typeof MigPlanRow>;

export const Default: Story = {
  args: {
    label: "Inference",
    config: "MIG (3g.40gb × 1)",
    monthly: "₩520,125",
  },
};

export const Highlighted: Story = {
  args: {
    label: "백업",
    config: "MIG (1g.10gb × 1)",
    monthly: "₩134,400",
    highlight: true,
  },
};

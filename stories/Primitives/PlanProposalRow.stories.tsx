import type { Meta, StoryObj } from "@storybook/react-vite";
import PlanProposalRow from "../../src/widget/PlanProposalRow";

const meta: Meta<typeof PlanProposalRow> = {
  title: "Primitives/PlanProposalRow",
  component: PlanProposalRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**실행 계획 제안 비교 표 행** — [[PlanProposal]] 비교 표(항목 / 구성 / 비용)의 데이터 행 한 건. 부모 표 머리와 같은 grid 트랙(`1.4fr 1.4fr 1fr`)을 공유한다(구 `MigPlanRow`).",
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
type Story = StoryObj<typeof PlanProposalRow>;

export const Default: Story = {
  args: {
    label: "현재",
    detail: "c5.2xlarge × 4",
    value: "₩1,240,000",
  },
};

/** 추천 행 강조. */
export const Highlighted: Story = {
  args: {
    label: "제안",
    detail: "c5.xlarge × 4",
    value: "₩768,000",
    highlight: true,
  },
};

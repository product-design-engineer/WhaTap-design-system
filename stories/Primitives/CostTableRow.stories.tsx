import type { Meta, StoryObj } from "@storybook/react-vite";
import CostTableRow from "../../src/widget/CostTableRow";

const meta: Meta<typeof CostTableRow> = {
  title: "Primitives/CostTableRow",
  component: CostTableRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**비용 비교 행** — AiCostTable 본문의 단일 행(라벨 + 상세 + 비용). highlight 면 파란 배경·브랜드 컬러 강조.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{ width: 440 }}
        className="flex flex-col rounded-6px overflow-hidden border border-color-var-color-border-default"
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CostTableRow>;

export const Default: Story = {
  args: {
    row: { label: "현행", detail: "A100 GPU 4개 (평균 사용률 32%)", cost: "₩8,322,000/월" },
    isFirst: true,
  },
};

export const Highlight: Story = {
  args: {
    row: { label: "제안", detail: "A100 GPU 1개 + MIG 슬라이스 활용", cost: "₩2,080,500/월", highlight: true },
    isFirst: false,
  },
};

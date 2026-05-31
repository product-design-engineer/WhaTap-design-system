import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCostTable } from "@whatap/design-system/widget";

const meta: Meta<typeof AiCostTable> = {
  title: "WhaTap AI/Cards/AiCostTable",
  component: AiCostTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**비용 비교 표** — 현행 vs 제안 형태로 행 단위 비용 비교. highlight 행 강조.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiCostTable>;

export const Default: Story = {
  args: {
    rows: [
      { label: "현행", detail: "A100 GPU 4개 (평균 사용률 32%)", cost: "₩8,322,000/월" },
      { label: "제안", detail: "A100 GPU 1개 + MIG 슬라이스 활용", cost: "₩2,080,500/월", highlight: true },
    ],
    savingsLabel: "월 절감 예상",
    savingsValue: "₩6,241,500 (75%)",
  },
};

export const ThreeOptions: Story = {
  args: {
    caption: "Migration Options",
    rows: [
      { label: "Option A", detail: "A100 4개 그대로 유지", cost: "₩8,322,000/월" },
      { label: "Option B", detail: "A100 2개 + T4 2개 혼합", cost: "₩5,180,000/월" },
      { label: "Option C", detail: "A100 1개 + MIG", cost: "₩2,080,500/월", highlight: true },
    ],
  },
};

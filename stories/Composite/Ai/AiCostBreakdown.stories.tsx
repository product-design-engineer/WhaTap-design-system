import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCostBreakdown } from "@whatap/design-system/widget";

const meta: Meta<typeof AiCostBreakdown> = {
  title: "Composite/Ai/AiCostBreakdown",
  component: AiCostBreakdown,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**GPU 비용 분해 카드** — tone 배지 + GPU 별 활용/유휴/일비용 행 + 소계/월비용/주석.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiCostBreakdown>;

export const HighUtilization: Story = {
  args: {
    toneLabel: "고활용",
    toneColor: "var(--color-indicator-critical)",
    context: "최근 7일 평균 — Inference 워크로드",
    rows: [
      { gpu: "GPU-0", pod: "inference-prod", avg: "95%", idle: "0%", daily: "₩87,750" },
      { gpu: "GPU-1", pod: "training-batch", avg: "78%", idle: "5%", daily: "₩87,750" },
    ],
    subtotal: "₩175,500/일",
    monthly: "₩5,265,000/월",
    monthlyNote: "(30일 환산)",
  },
};

export const IdleResources: Story = {
  args: {
    toneLabel: "유휴",
    toneColor: "var(--color-text-tertiary)",
    context: "최근 7일 평균 — 미사용 GPU",
    rows: [
      { gpu: "GPU-2", pod: "(none)", avg: "0%", idle: "100%", daily: "₩87,750" },
      { gpu: "GPU-3", pod: "(none)", avg: "0%", idle: "100%", daily: "₩87,750" },
    ],
    subtotal: "₩175,500/일",
    monthly: "₩5,265,000/월",
    monthlyNote: "(낭비 비용)",
  },
};

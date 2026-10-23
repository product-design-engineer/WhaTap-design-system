import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartArc } from "@whatap/design-system";

/**
 * Stories for [[ChartArc]] — 호 트랙 · 채움 · 바깥 임계 띠.
 */
const meta: Meta<typeof ChartArc> = {
  title: "Primitives/Chart/ChartArc",
  component: ChartArc,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**호.** 12시 기준 −120° ~ +120°(240°) · 굵기 10 · 트랙 `--color-surface-100` · 끝 둥글게. 임계는 바깥 3px 얇은 띠. " +
          "가운데는 비어 있고 담는 쪽([[ArcGauge]])이 글자를 얹는다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChartArc>;

/** 기본. */
export const Default: Story = { args: { ratio: 0.72, color: "var(--color-brand-blue)" } };

/** 임계 띠 — 80% · 95%. */
export const WithBands: Story = {
  args: {
    ratio: 0.86,
    color: "var(--color-status-warning)",
    bands: [
      { from: 0.8, to: 0.95, color: "var(--color-status-warning)" },
      { from: 0.95, to: 1, color: "var(--color-status-error)" },
    ],
  },
};

/** 반원(180°) — 각도는 바꿀 수 있지만 게이지는 240° 를 쓴다. */
export const HalfCircle: Story = { args: { ratio: 0.5, color: "var(--color-brand-blue)", start: -90, end: 90 } };

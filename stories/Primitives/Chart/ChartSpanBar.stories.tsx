import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartSpanBar } from "@whatap/design-system";

/**
 * Stories for [[ChartSpanBar]] — 시간 구간 하나를 가로 막대로. Flame · Waterfall 의 낱 막대.
 */
const meta: Meta<typeof ChartSpanBar> = {
  title: "Primitives/Chart/ChartSpanBar",
  component: ChartSpanBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**구간 막대.** 자리(`start` · `end`, 플롯 폭 비율)는 차트가 정하고, 이것은 칠하고 이름을 쓴다. " +
          "이름은 차트가 막대 폭 40px 이상일 때만 준다 — 좁은 막대에 말줄임만 남기지 않는다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative" style={{ width: 420, height: 18 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChartSpanBar>;

/** 이름 있는 막대 — 정상(계열 1). */
export const Labeled: Story = {
  args: { start: 0.1, end: 0.6, color: "var(--color-chart-series-1)", label: "GET /api/orders" },
};

/** 좁은 막대 — 이름 없이 색만. 이름은 툴팁이 말한다. */
export const Narrow: Story = {
  args: { start: 0.4, end: 0.43, color: "var(--color-status-warning)" },
};

/** 강조 — 가리키는 막대(테두리)와 흐린 막대. */
export const Emphasis: Story = {
  render: () => (
    <>
      <ChartSpanBar start={0} end={0.35} color="var(--color-chart-series-1)" label="document" dimmed />
      <ChartSpanBar start={0.37} end={0.8} color="var(--color-status-error)" label="POST /api/pay" active />
    </>
  ),
};

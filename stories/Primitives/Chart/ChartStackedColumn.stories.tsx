import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartStackedColumn } from "@whatap/design-system";

/**
 * Stories for [[ChartStackedColumn]] — 몫과 나머지를 아래에서 위로 쌓는 세로 막대 하나.
 */
const meta: Meta<typeof ChartStackedColumn> = {
  title: "Primitives/Chart/ChartStackedColumn",
  component: ChartStackedColumn,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**구간을 아래에서 위로 쌓는다(`segments[0]` = 바닥).** 높이는 값축과 같은 `max` 를 분모로 한다. 진한 계열 색 구간은 " +
          "글자를 안(`inside`, 고정 흰색), 연한 나머지는 막대 오른쪽 바깥(`side`)에. 나머지는 `--color-surface-200` — 상태색이 아니다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-card" style={{ width: 120, height: 160, padding: "0 8px" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ChartStackedColumn>;

/** 몫 + 나머지 — Allocated 6 · Not Allocated 2. */
export const WithRemainder: Story = {
  args: {
    max: 8,
    segments: [
      { value: 6, label: "6 Allocated", color: "var(--color-chart-series-1)", labelPlacement: "inside" },
      { value: 2, label: "2 Not Allocated", color: "var(--color-surface-200)", labelPlacement: "side" },
    ],
  },
};

/** 몫만 — Total 8. */
export const Single: Story = {
  args: { max: 8, segments: [{ value: 8, label: "8 Total", color: "var(--color-chart-series-1)" }] },
};

/** 0 인 구간은 그리지 않는다. */
export const ZeroSegment: Story = {
  args: {
    max: 8,
    segments: [
      { value: 0, label: "0 Effective", color: "var(--color-chart-series-1)" },
      { value: 5, label: "5 Not Effective", color: "var(--color-surface-200)", labelPlacement: "side" },
    ],
  },
};

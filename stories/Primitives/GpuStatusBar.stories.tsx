import type { Meta, StoryObj } from "@storybook/react-vite";
import { GpuStatusBar } from "@whatap/design-system";

/**
 * Stories for [[GpuStatusBar]] — 범주별 할당/미할당을 위아래로 나눠 보여 주는 막대.
 */
const meta: Meta<typeof GpuStatusBar> = {
  title: "Primitives/GpuStatusBar",
  component: GpuStatusBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  decorators: [(Story) => (<div style={{ width: 560, height: 220 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof GpuStatusBar>;

/** 기본 — positive 만 있는 범주와 positive/negative 가 함께 있는 범주. */
export const Default: Story = {
  args: {
    categories: [
      { label: "Total", positive: { value: 8, label: "8 Total", color: "var(--color-chart-series-1)" } },
      { label: "Allocated", positive: { value: 6, label: "6 Allocated" }, negative: { value: 2, label: "2 Not Allocated" } },
      { label: "Healthy", positive: { value: 7, label: "7 Healthy" }, negative: { value: 1, label: "1 Unhealthy" } },
    ],
    max: 8,
  },
};

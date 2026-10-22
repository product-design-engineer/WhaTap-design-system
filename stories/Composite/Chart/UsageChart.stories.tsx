import type { Meta, StoryObj } from "@storybook/react-vite";
import { UsageChart } from "@whatap/design-system/widget";

const meta: Meta<typeof UsageChart> = {
  title: "Composite/Chart/UsageChart",
  component: UsageChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**시간대별 사용률 막대 차트** — 24 또는 N개 시점의 utilization. `highlightThreshold` 이상 막대는 critical 색.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof UsageChart>;

export const HourlyGpu: Story = {
  args: {
    caption: "Hourly GPU Utilization",
    values: [12, 18, 15, 22, 35, 48, 62, 78, 85, 92, 95, 88, 76, 65, 58, 52, 48, 45, 38, 28, 22, 18, 15, 12],
    highlightThreshold: 80,
  },
};

export const FlatLow: Story = {
  args: {
    caption: "Idle 시간대 사용률",
    values: Array(24).fill(5).map((v, i) => v + (i % 4)),
    highlightThreshold: 50,
  },
};

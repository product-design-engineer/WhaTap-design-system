import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartLegendItem } from "@whatap/design-system";

/**
 * Stories for [[ChartLegendItem]] — 견본 + 이름 + 값 범례 항목.
 */
const meta: Meta<typeof ChartLegendItem> = {
  title: "Primitives/Chart/ChartLegendItem",
  component: ChartLegendItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**범례 항목 하나 — 견본 · 이름 · 값 사이 4px.** 견본은 [[ChartSwatch]] 와 같은 그림이고 마크 모양을 따른다(patterns §26). " +
          "[[WidgetFrame]] `legend` · [[MiniDonutChart]] · [[MiniMultiLineChart]] · [[HexGrid]] · [[ActiveTransactionArc]] 가 이것을 쓴다 — " +
          "종전엔 다섯 곳이 간격 · 글자 크기 · 색을 따로 정했다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ChartLegendItem>;

/** 이름만 — 면 · 막대 · 칸(사각 견본). */
export const Basic: Story = { args: { color: "var(--color-chart-series-1)", label: "Linux" } };

/** 선 계열 — 선 견본. */
export const Line: Story = { args: { color: "var(--color-chart-series-2)", shape: "line", label: "p95" } };

/** 값 — 계열 넷 이하면 지금 값을 이름 뒤에(patterns §25). */
export const WithValue: Story = { args: { color: "var(--color-chart-series-1)", label: "CPU", value: "42%" } };

/** 가로 줄 — WidgetFrame 범례처럼 12px 간격으로 늘어선다. */
export const Row: Story = {
  render: () => (
    <div className="flex items-center" style={{ gap: 12 }}>
      <ChartLegendItem color="var(--color-chart-series-1)" shape="line" label="p50" value="120ms" />
      <ChartLegendItem color="var(--color-chart-series-2)" shape="line" label="p95" value="480ms" />
      <ChartLegendItem color="var(--color-chart-series-3)" shape="line" label="p99" value="1.2s" />
    </div>
  ),
};

/** 세로 목록 — `fill`: 이름이 말줄임되고 값이 오른쪽 끝에 세로로 맞는다(도넛 옆 목록). */
export const FillList: Story = {
  render: () => (
    <div className="flex flex-col" style={{ width: 160, gap: 4 }}>
      <ChartLegendItem color="var(--color-chart-series-1)" label="Linux" value={128} fill />
      <ChartLegendItem color="var(--color-chart-series-2)" label="Windows Server 2022 Datacenter" value={36} fill />
      <ChartLegendItem color="var(--color-chart-series-3)" label="macOS" value={4} fill />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniMultiLineChart, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[MiniMultiLineChart]] — 여러 계열을 겹쳐 그리는 작은 line chart 카드.
 *
 * 계열 색은 `--color-chart-series-1` 부터 순서대로(순환 금지). 같은 계열은 화면이 달라도 같은 번호.
 */
const P50 = [42, 44, 41, 46, 45, 43, 47, 44, 45, 46];
const P95 = [88, 92, 85, 97, 94, 90, 99, 93, 95, 96];
const P99 = [131, 140, 128, 152, 145, 138, 160, 147, 150, 149];
const X = ["13:27", "13:28", "13:29", "13:30", "13:31", "13:32", "13:33", "13:34", "13:35", "13:36"];

const meta: Meta<typeof MiniMultiLineChart> = {
  title: "Primitives/MiniMultiLineChart",
  component: MiniMultiLineChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    aiTriggerReveal: { control: { type: "select" }, options: ["always", "hover"] },
    delay: { control: { type: "number", min: 0, max: 2000, step: 100 } },
  },
  decorators: [(Story) => (<div style={{ width: 420, height: 240 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof MiniMultiLineChart>;

/** 기본 — 백분위 3계열 + 통계값. */
export const Percentiles: Story = {
  args: {
    title: "백분위 TTFT",
    unit: "ms",
    stat: "45.87",
    statUnit: "ms",
    xLabels: X,
    series: [
      { label: "p50", values: P50, color: "var(--color-chart-series-1)" },
      { label: "p95", values: P95, color: "var(--color-chart-series-2)" },
      { label: "p99", values: P99, color: "var(--color-chart-series-3)" },
    ],
  },
};

/** 면 채움 — 단일 계열에 `showArea`. */
export const WithArea: Story = {
  args: {
    title: "처리량",
    unit: "tok/s",
    xLabels: X,
    series: [{ label: "throughput", values: P95, color: "var(--color-chart-series-1)", showArea: true }],
  },
};

/** 빈 계열 — `values: []` 는 legend 에만 남고 선은 그리지 않는다. */
export const EmptySeries: Story = {
  args: {
    title: "백분위 TTFT",
    unit: "ms",
    xLabels: X,
    series: [
      { label: "p50", values: P50, color: "var(--color-chart-series-1)" },
      { label: "p99", values: [], color: "var(--color-chart-series-3)" },
    ],
  },
};

/** AI 트리거 — `onAiTrigger` 를 주면 카드 우상단에 진입점이 생긴다. */
export const WithAiTrigger: Story = {
  args: {
    ...Percentiles.args,
    aiTriggerReveal: "always",
    onAiTrigger: () => {},
  },
};

/** 대시보드 칸 — `frame={false}` 로 껍데기를 끄고 [[WidgetFrame]] 에 담는다. 범례는 WidgetFrame `legend`(본문 오른쪽 위), 통계값은 본문이라 남는다. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 420, height: 240 }}>
      <WidgetFrame
        title="백분위 TTFT"
        meta="최근 10분"
        onFullscreen={() => {}}
        menu={[{ key: "detail", label: "상세로 이동" }]}
        legend={[
          { label: "p50", color: "var(--color-chart-series-1)" },
          { label: "p95", color: "var(--color-chart-series-2)" },
          { label: "p99", color: "var(--color-chart-series-3)" },
        ]}
      >
        <MiniMultiLineChart
          title="백분위 TTFT"
          frame={false}
          unit="ms"
          stat="45.87"
          statUnit="ms"
          xLabels={X}
          series={[
            { label: "p50", values: P50, color: "var(--color-chart-series-1)" },
            { label: "p95", values: P95, color: "var(--color-chart-series-2)" },
            { label: "p99", values: P99, color: "var(--color-chart-series-3)" },
          ]}
        />
      </WidgetFrame>
    </div>
  ),
};

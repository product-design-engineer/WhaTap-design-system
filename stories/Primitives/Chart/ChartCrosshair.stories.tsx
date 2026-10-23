import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartCrosshair, ChartGrid, ChartTimeAxis, ChartValueAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartCrosshair]] — 시간축 차트의 시점 고르기. 플롯을 가리켜 보세요.
 */
const meta: Meta<typeof ChartCrosshair> = {
  title: "Primitives/Chart/ChartCrosshair",
  component: ChartCrosshair,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**시점 고르기.** 플롯 위 포인터 x → 가장 가까운 시점 · 세로 안내선 · 계열마다 점(카드색 고리) · 값 툴팁([[ChartTooltip]]). " +
          "플롯 상자 규칙은 [[ChartGrid]] 와 같다. 막대는 `band`, 고르지 않은 x 는 `positions`, 50 부터인 축은 `min`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChartCrosshair>;

const N = 30;
const A = Array.from({ length: N }, (_, i) => Math.round(60 + 20 * Math.sin(i / 4)));
const B = Array.from({ length: N }, (_, i) => Math.round(30 + 12 * Math.cos(i / 5)));
const T = Array.from({ length: N }, (_, i) => `14:${String(20 + i).padStart(2, "0")}`);

/** 요소 다섯으로 조립한 플롯 — 격자 · 선(예시) · 값축 · 시간축 · 시점 고르기. */
export const OnLinePlot: Story = {
  render: () => (
    <div className="relative" style={{ width: 480, height: 160 }}>
      <ChartGrid max={100} />
      <svg className="absolute" viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{ left: "var(--wds-widget-axis-gutter)", right: 8, top: 4, bottom: 14, width: "calc(100% - var(--wds-widget-axis-gutter) - 8px)", height: "calc(100% - 18px)" }}>
        {[["var(--color-chart-series-1)", A], ["var(--color-chart-series-2)", B]].map(([c, v]) => (
          <polyline key={c as string} points={(v as number[]).map((y, i) => `${(i / (N - 1)) * 1000},${(1 - y / 100) * 1000}`).join(" ")} fill="none" stroke={c as string} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <ChartValueAxis max={100} unit="%" />
      <ChartTimeAxis labels={["14:20", "14:30", "14:40", "14:49"]} />
      <ChartCrosshair
        count={N}
        max={100}
        unit="%"
        labels={T}
        series={[
          { label: "CPU", color: "var(--color-chart-series-1)", values: A },
          { label: "Memory", color: "var(--color-chart-series-2)", values: B },
        ]}
      />
    </div>
  ),
};

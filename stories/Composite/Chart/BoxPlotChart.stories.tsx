import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoxPlotChart, WidgetFrame } from "@whatap/design-system";
import type { BoxPlotBox } from "@whatap/design-system";

/**
 * Stories for [[BoxPlotChart]] — 대상별 값 분포. 상자 = 1~3사분위 · 선 = 중앙값 · 수염 = Tukey 1.5 × IQR · 점 = 이상치.
 */
const meta: Meta<typeof BoxPlotChart> = {
  title: "Composite/Chart/BoxPlotChart",
  component: BoxPlotChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**박스플롯.** [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCategoryAxis]] 를 조합하고 상자 · 수염 · 점만 그린다. " +
          "수염은 Tukey 1.5 × IQR — 원값을 주면 `boxPlotStats` 가 같은 규칙으로 계산한다. 색은 하나(범주는 계열이 아니다).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BoxPlotChart>;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
/* 로그정규에 가까운 지연 분포 — 대부분 빠르고 꼬리가 길다 */
const latency = (seed: number, base: number, tail: number, n = 120) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => Math.round(base * Math.exp((r() + r() + r() - 1.5) * 0.6) + (r() > 0.97 ? tail * r() : 0)));
};
const SERVICES: BoxPlotBox[] = [
  { label: "api-gw", values: latency(3, 120, 900) },
  { label: "order", values: latency(7, 260, 1400) },
  { label: "billing", values: latency(11, 180, 600) },
  { label: "search", values: latency(19, 90, 300) },
  { label: "auth", values: latency(23, 60, 200) },
];
const box = { width: 520, height: 240, border: "1px solid var(--color-border-default)", borderRadius: 4 } as const;

/** 기본 — 서비스별 응답시간(ms) 분포. 평균으로는 안 보이는 꼬리가 이상치 점으로. */
export const Default: Story = {
  args: { boxes: SERVICES, unit: "ms" },
  render: (args) => (
    <div style={box}>
      <BoxPlotChart {...args} />
    </div>
  ),
};

/** 통계를 직접 — 서버가 사분위를 계산해 보낼 때. */
export const PrecomputedStats: Story = {
  args: {
    unit: "ms",
    boxes: [
      { label: "00-06시", stats: { q1: 80, median: 110, q3: 150, low: 40, high: 250, outliers: [420] } },
      { label: "06-12시", stats: { q1: 140, median: 200, q3: 280, low: 60, high: 480, outliers: [720, 910] } },
      { label: "12-18시", stats: { q1: 160, median: 230, q3: 320, low: 70, high: 560, outliers: [1100] } },
      { label: "18-24시", stats: { q1: 100, median: 140, q3: 190, low: 50, high: 320, outliers: [] } },
    ],
  },
  render: (args) => (
    <div style={box}>
      <BoxPlotChart {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` 로 [[WidgetFrame]] 에. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 480, height: 240 }}>
      <WidgetFrame title="서비스별 응답시간 분포" summary="최근 1시간 · ms">
        <BoxPlotChart boxes={SERVICES} unit="ms" frame={false} />
      </WidgetFrame>
    </div>
  ),
};

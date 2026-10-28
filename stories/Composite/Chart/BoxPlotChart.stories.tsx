import type { Meta, StoryObj } from "@storybook/react-vite";
import { BOX_PLOT_LEGEND, BoxPlotChart, WidgetFrame } from "@whatap/design-system";
import type { BoxPlotBox } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[BoxPlotChart]] — 대상별 값 분포를 백분위로. 선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99.
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
          "**백분위 상자 그림.** [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCategoryAxis]] 를 조합하고 상자 · 수염 · 점 · p50 숫자를 그린다. " +
          "마크는 모두 백분위 — 선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99. 경보 · SLO 와 같은 숫자를 말한다. Y 는 p99 까지라 극단값이 상자를 누르지 않는다. " +
          "원값을 주면 `boxPlotStats` 가 계산한다. 색은 하나(범주는 계열이 아니다).",
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

/** 기본 — 서비스별 응답시간(ms) 분포. 범례가 마크의 뜻을 말하고, p50 숫자를 상자마다 적는다. */
export const Default: Story = {
  args: { boxes: SERVICES, unit: "ms" },
  render: (args) => (
    <div style={box}>
      <BoxPlotChart {...args} />
    </div>
  ),
};

/** 백분위를 직접 — 서버(APM)가 p5 ~ p99 를 계산해 보낼 때. */
export const PrecomputedStats: Story = {
  args: {
    unit: "ms",
    boxes: [
      { label: "00-06시", stats: { p5: 40, p25: 80, p50: 110, p75: 150, p95: 250, p99: 420 } },
      { label: "06-12시", stats: { p5: 60, p25: 140, p50: 200, p75: 280, p95: 480, p99: 720 } },
      { label: "12-18시", stats: { p5: 70, p25: 160, p50: 230, p75: 320, p95: 560, p99: 910 } },
      { label: "18-24시", stats: { p5: 50, p25: 100, p50: 140, p75: 190, p95: 320, p99: 380 } },
    ],
  },
  render: (args) => (
    <div style={box}>
      <BoxPlotChart {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` + 범례 문장 `BOX_PLOT_LEGEND` 를 [[WidgetFrame]] `summary` 로. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 480, height: 240 }}>
      <WidgetFrame title="서비스별 응답시간 분포 (ms)" summary={BOX_PLOT_LEGEND}>
        <BoxPlotChart boxes={SERVICES} unit="ms" frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────── */

const EX_BOXES: BoxPlotBox[] = names(EXTREME_N, "svc").map((n, i) => ({ label: n, values: latency(i + 31, 60 + scalar(i, 240), 600, 40) }));

/** 극단 · 100개 — 상자 100개. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 범주는 계열이 아니라 색은 하나다. 상자 100개가 한 줄에 서서 상자는 선 한 줄로 줄고, p50 숫자가 서로 겹치며, 이름 글자는 사라진다.` } } },
  args: { boxes: EX_BOXES, unit: "ms" },
  render: (args) => (
    <div style={{ ...box, width: 720 }}>
      <BoxPlotChart {...args} />
    </div>
  ),
};

/** 극단 · 데이터 없음 — 상자 0개 · 원값 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 원값이 빈 상자는 백분위를 낼 수 없어(\`boxPlotStats\` → null) 이름 칸만 남는다.` } } },
  args: { boxes: [{ label: "api-gw", values: [] }, { label: "order", values: [] }], unit: "ms" },
  render: (args) => (
    <div style={box}>
      <BoxPlotChart {...args} />
    </div>
  ),
};

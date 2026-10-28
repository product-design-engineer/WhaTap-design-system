import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackedAreaChart, WidgetFrame, stackedAreaLegend } from "@whatap/design-system";
import type { StackedAreaSeries } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, names, wave as exWave } from "../../_extremes";

/**
 * Stories for [[StackedAreaChart]] — 계열을 아래에서 위로 쌓은 면. 위 경계 = 합계, 층 두께 = 몫.
 */
const meta: Meta<typeof StackedAreaChart> = {
  title: "Composite/Chart/StackedAreaChart",
  component: StackedAreaChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**누적면.** 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · 시간축 [[ChartTimeAxis]] · 합계 최고점 [[ChartPeakMarker]] 를 조합하고 면만 그린다. " +
          "면은 불투명 + 층 사이 카드색 1px(겹치지 않으므로 투명도가 뜻이 없다). `series[0]` 이 바닥 — 크고 안정적인 계열을 아래에. 계열 8개까지(§22).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StackedAreaChart>;

const N = 30;
const wave = (seed: number, base: number, amp: number) =>
  Array.from({ length: N }, (_, i) => Math.max(0, Math.round(base + amp * Math.sin((i + seed) / 4) + ((i * seed) % 5) * 3)));
const LABELS = ["14:20", "14:30", "14:40", "14:50"];
/* 시점마다 이름 — 30개(1분 간격) · 툴팁 제목 */
const POINTS = Array.from({ length: N }, (_, i) => `14:${String(20 + i).padStart(2, "0")}`);
const GPUS: StackedAreaSeries[] = Array.from({ length: 8 }, (_, k) => ({ label: `A100 ${k}`, values: wave(k + 1, 220 - k * 18, 30 + k * 4) }));
const CODES: StackedAreaSeries[] = [
  { label: "2xx", values: wave(2, 900, 120) },
  { label: "4xx", values: wave(5, 120, 40) },
  { label: "5xx", values: wave(9, 20, 18) },
];
const box = { width: 560, height: 220, border: "1px solid var(--color-border-default)", borderRadius: 4 } as const;

/** 기본 — 상태 코드별 요청 수. 큰 2xx 를 바닥에. */
export const Default: Story = {
  args: { series: CODES, xLabels: LABELS, unit: "", peak: true, pointLabels: POINTS },
  render: (args) => (
    <div style={box}>
      <StackedAreaChart {...args} />
    </div>
  ),
};

/** 8계열 상한 — GPU 장치별 전력(W). 범례는 플롯 위 오른쪽(라이브의 별도 패널 대신). */
export const EightSeries: Story = {
  args: { series: GPUS, xLabels: LABELS, unit: "W", peak: true, pointLabels: POINTS },
  render: (args) => (
    <div style={{ ...box, height: 260 }}>
      <StackedAreaChart {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` + `stackedAreaLegend(series)` 를 [[WidgetFrame]] `legend` 로. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 480, height: 240 }}>
      <WidgetFrame title="Power Usage" summary="Watt" legend={stackedAreaLegend(GPUS.slice(0, 4))} onFullscreen={() => {}}>
        <StackedAreaChart series={GPUS.slice(0, 4)} xLabels={LABELS} unit="W" peak pointLabels={POINTS} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/** 빈 상태 — 축만 남는다. */
export const Empty: Story = {
  args: { series: [{ label: "2xx", values: [] }], xLabels: LABELS },
  render: (args) => (
    <div style={box}>
      <StackedAreaChart {...args} />
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────── */

const EX_SERIES: StackedAreaSeries[] = names(EXTREME_N, "gpu").map((n, i) => ({ label: n, values: exWave(i, N, 20, 6) }));

/** 극단 · 100개 — 100계열 누적면(색은 슬롯 · 상한 8). */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 이 차트는 색을 슬롯으로만 받고 계열을 8개(MAX_SERIES)에서 자른다 — 100개를 넣어도 앞 8개만 그려지고 나머지 92개는 말없이 빠진다. 범례도 8개.` } } },
  render: () => (
    <div style={{ width: 480, height: 260 }}>
      <WidgetFrame title={`GPU 전력 (${EXTREME_N})`} summary="Watt" legend={stackedAreaLegend(EX_SERIES)} onFullscreen={() => {}}>
        <StackedAreaChart series={EX_SERIES} xLabels={LABELS} unit="W" peak pointLabels={POINTS} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/** 극단 · 데이터 없음 — 계열 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 계열 배열이 비면 축만 남는다.` } } },
  args: { series: [], xLabels: LABELS },
  render: (args) => (
    <div style={box}>
      <StackedAreaChart {...args} />
    </div>
  ),
};

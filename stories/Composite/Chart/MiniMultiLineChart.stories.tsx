import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniMultiLineChart, WidgetFrame } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, colorOf, names, timeLabels, wave } from "../../_extremes";

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
  title: "Composite/Chart/MiniMultiLineChart",
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
        onFullscreen={() => {}}
        menu={[{ key: "detail", label: "상세로 이동" }]}
        legend={[
          { label: "p50", color: "var(--color-chart-series-1)", shape: "line" },
          { label: "p95", color: "var(--color-chart-series-2)", shape: "line" },
          { label: "p99", color: "var(--color-chart-series-3)", shape: "line" },
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

/** 지금 값 · 계열 넷 이하: 범례 이름 뒤에 값을 굵게(WidgetFrame `legend[].value`). 플롯은 그대로 둔다(patterns §25). */
export const LegendValues: Story = {
  render: () => (
    <div style={{ width: 420, height: 240 }}>
      <WidgetFrame
        title="백분위 TTFT"
        onFullscreen={() => {}}
        menu={[{ key: "detail", label: "상세로 이동" }]}
        legend={[
          { label: "p50", color: "var(--color-chart-series-1)", shape: "line", value: "46ms" },
          { label: "p95", color: "var(--color-chart-series-2)", shape: "line", value: "96ms" },
          { label: "p99", color: "var(--color-chart-series-3)", shape: "line", value: "149ms" },
        ]}
      >
        <MiniMultiLineChart
          title="백분위 TTFT"
          frame={false}
          unit="ms"
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

/* 서버 20대 CPU: 강조 셋 + 회색 다발(§22). 값은 결정적으로 만든다(스냅샷이 흔들리지 않게). */
const BUNDLE = Array.from({ length: 17 }, (_, k) => X.map((_, i) => Math.round(14 + (k % 6) * 2 + 5 * Math.sin(i * 0.8 + k))));
const HOT = [
  { label: "web-01", values: [78, 80, 83, 81, 84, 86, 85, 87, 85, 86], color: "var(--color-chart-series-1)", endLabel: "86%" },
  { label: "web-02", values: [40, 38, 42, 45, 41, 44, 47, 43, 46, 45], color: "var(--color-chart-series-2)", endLabel: "45%" },
  { label: "batch-03", values: [22, 35, 28, 31, 40, 36, 33, 38, 41, 43], color: "var(--color-chart-series-3)", endLabel: "43%" },
];

/**
 * 선 끝 값 배지 · 강조 계열이 여럿: 회색 다발 위 강조 계열에만 `endLabel`(patterns §25).
 * 배지는 플롯 오른쪽 배지 칸(`--wds-widget-end-gutter`)에 서서 선을 가리지 않고, 가까운 배지(45% · 43%)는 위아래로 밀려 띄워진다.
 * 범례에는 강조 계열 이름만 둔다(값은 배지가 말한다).
 */
export const EndBadges: Story = {
  render: () => (
    <div style={{ width: 420, height: 240 }}>
      <WidgetFrame
        title="CPU 사용률"
        onFullscreen={() => {}}
        menu={[{ key: "detail", label: "상세로 이동" }]}
        legend={HOT.map(({ label, color }) => ({ label, color, shape: "line" as const }))}
      >
        <MiniMultiLineChart
          title="CPU 사용률"
          frame={false}
          unit="%"
          xLabels={X}
          series={[
            ...BUNDLE.map((values) => ({ label: "", values, color: "var(--color-chart-neutral)" })),
            ...HOT,
          ]}
        />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────── */

const EX_X = timeLabels(20);
const EX_NAMES = names();
const EX_SERIES = EX_NAMES.map((n, i) => ({ label: n, values: wave(i, 20), color: colorOf(i) }));

/** 극단 · 100개 — 선 100개 + WidgetFrame 범례 100항목. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 선은 100개가 모두 그려져 회색 다발이 한 덩어리가 되고, WidgetFrame 범례는 한 줄이라 앞 6~7개만 보이고 나머지는 잘린다. 시각 글자 20개는 솎지 않아 양 끝에서 겹친다.` } } },
  render: () => (
    <div style={{ width: 560, height: 280 }}>
      <WidgetFrame
        title={`에이전트별 응답시간 (${EXTREME_N})`}
        onFullscreen={() => {}}
        legend={EX_SERIES.map((s) => ({ label: s.label, color: s.color, shape: "line" as const }))}
      >
        <MiniMultiLineChart title="에이전트별 응답시간" frame={false} unit="ms" xLabels={EX_X} series={EX_SERIES} />
      </WidgetFrame>
    </div>
  ),
};

/** 극단 · 데이터 없음 — 계열 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 계열 배열이 비면 축과 0ms 하나만 남고, 시각 글자 20개가 서로 겹쳐 읽히지 않는다.` } } },
  render: () => (
    <div style={{ width: 420, height: 240 }}>
      <WidgetFrame title="에이전트별 응답시간" onFullscreen={() => {}} legend={[]}>
        <MiniMultiLineChart title="에이전트별 응답시간" frame={false} unit="ms" xLabels={EX_X} series={[]} />
      </WidgetFrame>
    </div>
  ),
};

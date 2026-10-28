import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniLineChart, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE, timeLabels, wave } from "../../_extremes";

/**
 * Stories for [[MiniLineChart]] — DB/APM/GPU 모니터링 카드용 line chart.
 */
const meta: Meta<typeof MiniLineChart> = {
  title: "Composite/Chart/MiniLineChart",
  component: MiniLineChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**작은 line chart 카드.** SVG line/area + HTML overlay 텍스트 결합. " +
          "SVG 는 plot 영역에 absolute 배치되어 카드 폭과 무관하게 peak 라벨이 line max 좌표와 1:1 매칭 " +
          "(feedback-chart-peak-alignment). 모든 SVG 텍스트는 단위 명시 (feedback-svg-text-units).",
      },
    },
  },
  argTypes: {
    title: { description: "카드 헤더 제목.", control: "text" },
    values: { description: "시계열 값 배열 (보통 7개 — 5분 간격).", control: "object" },
    xLabels: { description: "X축 라벨. 기본 13:27~13:36 sample.", control: "object" },
    markerAt: { description: "peak ▼ 마커 위치 (0~1, x축 비율).", control: { type: "range", min: 0, max: 1, step: 0.01 } },
    showTopStat: { description: "헤더 우측 Top Stat 칩 노출.", control: "boolean" },
    color: { description: "line/area 색상. 기본 `--color-brand-blue-soft`.", control: "color" },
    unit: { description: "Y축·peak 라벨 단위 ('%', 'K', 'ms' 등).", control: "text" },
    delay: { description: "stagger 진입 애니메이션 지연 (ms).", control: { type: "number", min: 0, max: 2000, step: 100 } },
  },
  decorators: [(Story) => (<div style={{ width: 320 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof MiniLineChart>;

/** 기본 — CPU 사용률 chart. */
export const CpuUsage: Story = {
  args: {
    title: "CPU Usage",
    values: [12, 18, 25, 38, 52, 47, 35],
    unit: "%",
    showTopStat: true,
  },
};

/** Memory chart — 다른 색·단위. */
export const Memory: Story = {
  args: {
    title: "[XOS] Memory",
    values: [4.2, 4.5, 5.1, 5.8, 6.3, 6.1, 5.9],
    unit: "GB",
    color: "var(--color-whatap-purple)",
  },
};

/** Disk Usage — 적은 변동. */
export const DiskUsage: Story = {
  args: {
    title: "[XOS] Disk Usage",
    values: [62, 62, 63, 63, 64, 64, 65],
    unit: "%",
    color: "var(--color-chart-series-2)",
  },
};

/** Critical 톤 chart — 차트 강조선 critical 컬러. */
export const CriticalTrend: Story = {
  args: {
    title: "Lock Waiting Session Count",
    values: [3, 5, 12, 28, 45, 32, 18],
    color: "var(--color-indicator-critical)",
    showTopStat: true,
  },
};

/** Empty / zero — 모든 값 0. */
export const ZeroValues: Story = {
  args: {
    title: "Long Active Session Count",
    values: [0, 0, 0, 0, 0, 0, 0],
  },
};

/** Stagger delay — 진입 애니메이션 데모. */
export const WithStaggerDelay: Story = {
  args: {
    title: "Active Session (delay 400ms)",
    values: [10, 12, 14, 13, 15, 17, 16],
    delay: 400,
  },
};

/** 대시보드 칸 — `frame={false}` 로 껍데기를 끄고 [[WidgetFrame]] 에 담는다. 제목 · 메뉴는 WidgetFrame 이 맡는다. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 320, height: 180 }}>
      <WidgetFrame title="CPU Usage" legend={[{ label: "사용률", color: "var(--color-chart-series-1)", shape: "line" }]} onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <MiniLineChart title="CPU Usage" values={[12, 18, 25, 38, 52, 47, 35]} unit="%" frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 긴 시계열(100점) 위 스파이크. */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}\n\n관찰: 100점 + 스파이크(평소의 10배+). 값축이 스파이크에 맞춰 늘어나 나머지 선이 바닥에 눌린다. ⚠️ 결함: \`xLabels\` 100개를 솎지 않고 모두 찍어 X축 글자가 겹쳐 한 덩어리가 된다.` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0 — 100점 모두 0</ExtremeLabel>
      <MiniLineChart title="CPU Usage" unit="%" values={Array.from({ length: 100 }, () => 0)} xLabels={timeLabels(100)} />
      <ExtremeLabel>100점 + 스파이크</ExtremeLabel>
      <MiniLineChart title="CPU Usage" unit="%" values={wave(0, 100).map((v, i) => (i === 80 ? 600 : v))} xLabels={timeLabels(100)} showTopStat />
    </div>
  ),
};

/** 데이터 없음 — 빈 배열. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}\n\n관찰: \`values\` 가 number[] 라 수집 공백(null)을 표현할 수 없다. 빈 배열이어도 기본 \`xLabels\`(13:27 …)와 0% 축 · 점선 표지가 그려져, 데이터가 있는 빈 구간처럼 보인다.` } } },
  args: { title: "CPU Usage", unit: "%", values: [] },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { WaterfallChart, WidgetFrame } from "@whatap/design-system";
import type { WaterfallRow } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[WaterfallChart]] — 리소스 하나에 한 줄, 로딩 단계를 이어 붙인 막대. 색 = 단계, 리소스 타입은 글자.
 */
const meta: Meta<typeof WaterfallChart> = {
  title: "Composite/Chart/WaterfallChart",
  component: WaterfallChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**Waterfall.** 색 = 단계(계열 슬롯, 8개 넘으면 «기타») — 리소스 타입 11종을 색으로 나누지 않고 이름 아래 글자로. " +
          "표시선(DOMContentLoaded · load) · 시간축 끌어 확대. [[ChartSpanBar]] · [[ChartBrush]] · [[ChartTimeAxis]] · [[ChartLegendItem]] · [[ChartTooltip]] 조합.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WaterfallChart>;

const PHASES = ["대기", "DNS", "연결", "TTFB", "다운로드"];
const ROWS: WaterfallRow[] = [
  { label: "/checkout", meta: "document", start: 0, segments: [2, 18, 42, 210, 36] },
  { label: "main.4f2a.css", meta: "style", start: 320, segments: [6, 0, 0, 48, 22] },
  { label: "vendor.91bc.js", meta: "script", start: 322, segments: [8, 0, 0, 64, 180] },
  { label: "app.77de.js", meta: "script", start: 330, segments: [10, 0, 0, 70, 96] },
  { label: "Pretendard.woff2", meta: "font", start: 420, segments: [4, 0, 0, 38, 60] },
  { label: "hero.webp", meta: "image", start: 610, segments: [24, 0, 0, 52, 140] },
  { label: "GET /api/cart", meta: "fetch", start: 640, segments: [2, 0, 0, 260, 8] },
  { label: "GET /api/recommend", meta: "xhr", start: 660, segments: [3, 0, 0, 640, 14] },
  { label: "https://cdn.analytics.example/t.js", meta: "script", start: 700, segments: [1, 26, 58, 90, 40] },
  { label: "POST /collect", meta: "beacon", start: 1180, segments: [1, 0, 0, 34, 2] },
  { label: "promo.mp4", meta: "media", start: 1210, segments: [6, 0, 0, 88, 420] },
  { label: "icons.svg", meta: "image", start: 1240, segments: [2, 0, 0, 20, 6] },
];

/** 페이지 로드 — 리소스 12개 · DOMContentLoaded · load 표시선. */
export const PageLoad: Story = {
  args: { phases: PHASES, rows: ROWS, markers: [{ at: 690, label: "DOMContentLoaded" }, { at: 1720, label: "load" }] },
  render: (args) => (
    <div style={{ width: 760, height: 480 }}>
      <WaterfallChart {...args} />
    </div>
  ),
};

/** 대시보드 칸. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 640, height: 340 }}>
      <WidgetFrame title="리소스 로딩" summary="/checkout · 1.7s">
        <WaterfallChart phases={PHASES} rows={ROWS} labelWidth={140} markers={[{ at: 690, label: "DOMContentLoaded" }, { at: 1720, label: "load" }]} />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────────── */

/** 리소스 100개 — 시작은 15ms 간격, 구간 길이는 정해진 식. */
const EXTREME_ROWS: WaterfallRow[] = names(EXTREME_N, "chunk").map((n, i) => ({
  label: `${n}.js`,
  meta: "script",
  start: i * 15,
  segments: [Math.round(scalar(i, 10)), 0, 0, Math.round(20 + scalar(i + 3, 120)), Math.round(10 + scalar(i + 9, 200))],
}));

/** 극단 · 100개 — 리소스 100개. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 행 100개는 본문이 세로 스크롤된다(480px 상자에 13행 보임) — 단계 범례 · 시간축은 고정.` } } },
  args: { phases: PHASES, rows: EXTREME_ROWS },
  render: (args) => (
    <div style={{ width: 760, height: 480 }}>
      <WaterfallChart {...args} />
    </div>
  ),
};

/** 극단 · 데이터 없음 — `rows={[]}`. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 단계 범례와 빈 플롯이 남는데, 범위가 0~1ms 로 잡혀 시간축 글자가 «0ms 0ms 0ms 1ms 1ms 1ms» 로 겹친다(결함).` } } },
  args: { phases: PHASES, rows: [] },
  render: (args) => (
    <div style={{ width: 760, height: 240 }}>
      <WaterfallChart {...args} />
    </div>
  ),
};

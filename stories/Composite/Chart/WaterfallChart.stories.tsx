import type { Meta, StoryObj } from "@storybook/react-vite";
import { WaterfallChart, WidgetFrame } from "@whatap/design-system";
import type { WaterfallRow } from "@whatap/design-system";

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

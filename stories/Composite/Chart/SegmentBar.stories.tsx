import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentBar, WidgetFrame } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, colorOf, names, scalar } from "../../_extremes";

/**
 * Stories for [[SegmentBar]] — 전체 하나를 구간으로 나눈 단일 누적 바. 남는 몫은 이름 붙은 구간, 범례는 한 줄.
 */
const meta: Meta<typeof SegmentBar> = {
  title: "Composite/Chart/SegmentBar",
  component: SegmentBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**단일 누적 바.** 구간만 그리고 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] 를 조합한다. " +
          "`total` 이 구간 합보다 크면 남는 몫을 `restLabel` 구간으로 범례에도 넣는다(범례에 없는 빈 구간 금지). 범례는 한 줄 · 줄바꿈 · 사각 견본.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SegmentBar>;

/** 페이지 로드 구간(ms) — 범례에 없던 대기 시간을 「대기」 구간으로. */
export const PageLoad: Story = {
  args: {
    unit: "ms",
    total: 4700,
    restLabel: "대기",
    segments: [
      { label: "리다이렉트", value: 2, color: "var(--color-chart-series-1)" },
      { label: "DNS", value: 41, color: "var(--color-chart-series-2)" },
      { label: "연결", value: 120, color: "var(--color-chart-series-3)" },
      { label: "요청", value: 498, color: "var(--color-chart-series-4)" },
      { label: "응답", value: 1310, color: "var(--color-chart-series-5)" },
      { label: "DOM", value: 1520, color: "var(--color-chart-series-6)" },
      { label: "렌더링", value: 649, color: "var(--color-chart-series-7)" },
    ],
  },
};

/** 심각도별 서버 수 — 상태 색 · 0 인 구간은 바에서 빠지고 범례에 남는다. */
export const Severity: Story = {
  args: {
    segments: [
      { label: "위험", value: 1, color: "var(--color-status-error)" },
      { label: "경고", value: 0, color: "var(--color-status-warning)" },
      { label: "정보", value: 2, color: "var(--color-status-info)" },
      { label: "정상", value: 17, color: "var(--color-status-success)" },
    ],
  },
};

/** 활용 현황(%) — 범례 값은 비율. 카드 폭이 좁아도 한 줄 · 줄바꿈(2×2 로 바꾸지 않는다). */
export const UtilizationPercent: Story = {
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
  args: {
    legendValue: "percent",
    segments: [
      { label: "Effective", value: 6, color: "var(--color-chart-series-6)" },
      { label: "Active", value: 1, color: "var(--color-chart-series-1)" },
      { label: "Idle", value: 9, color: "var(--color-chart-series-4)" },
      { label: "Unallocated", value: 4, color: "var(--color-surface-200)" },
    ],
  },
};

/** 대시보드 칸 — 요약 숫자는 [[WidgetFrame]] `summary`. */
export const InWidgetFrame: Story = {
  render: () => (
    <WidgetFrame title="A100 · 활용 현황" summary="16 / 20 사용">
      <SegmentBar
        legendValue="both"
        segments={[
          { label: "Effective", value: 6, color: "var(--color-chart-series-6)" },
          { label: "Active", value: 1, color: "var(--color-chart-series-1)" },
          { label: "Idle", value: 9, color: "var(--color-chart-series-4)" },
        ]}
        total={20}
        restLabel="Unallocated"
      />
    </WidgetFrame>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────────── */

/** 극단 · 100개 — 구간 100개. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 구간이 머리카락 굵기로 얇아지고, 범례 100개가 줄바꿈되어 25줄로 늘어난다.` } } },
  args: {
    unit: "ms",
    segments: names().map((label, i) => ({ label, value: scalar(i, 100) + 1, color: colorOf(i) })),
  },
};

/** 극단 · 데이터 없음 — 구간 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 빈 바 트랙만 남는다.` } } },
  args: { unit: "ms", segments: [] },
};

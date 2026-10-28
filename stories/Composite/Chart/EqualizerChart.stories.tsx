import type { Meta, StoryObj } from "@storybook/react-vite";
import { EqualizerChart, SPEED_LEGEND, WidgetFrame } from "@whatap/design-system";
import type { EqualizerBar } from "@whatap/design-system";
import { EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[EqualizerChart]] — 대상마다 칸으로 끊어 쌓는 막대. 칸 하나 = 축 최대 ÷ levels.
 */
const meta: Meta<typeof EqualizerChart> = {
  title: "Composite/Chart/EqualizerChart",
  component: EqualizerChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**이퀄라이저.** 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · 이름 [[ChartCategoryAxis]] 를 조합하고 칸만 그린다. " +
          "칸 하나 = 축 최대의 1/`levels`(기본 10) — 호 형태 [[ChartRadialBars]] 와 같은 규칙. " +
          "색은 구간 누적(`segments`) 또는 임계 2색(`value` + `threshold`) 중 하나 — 한 차트에 섞지 않는다. 임계 슬라이더는 화면이 조합한다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EqualizerChart>;

const AGENTS: EqualizerBar[] = [
  [62, 18, 4], [40, 12, 0], [88, 25, 10], [30, 4, 0], [70, 30, 23], [51, 9, 2], [22, 3, 1], [45, 20, 6],
].map(([n, s, v], i) => ({
  label: `order-svc-${i + 1}`,
  segments: [
    { value: n, color: "var(--color-chart-speed-normal)", label: "Normal" },
    { value: s, color: "var(--color-chart-speed-slow)", label: "Slow" },
    { value: v, color: "var(--color-chart-speed-very-slow)", label: "Very Slow" },
  ],
}));
const SERVERS: EqualizerBar[] = [72, 95, 41, 83, 66, 100, 58, 30, 77, 88, 12, 64].map((v, i) => ({ label: `web-${String(i + 1).padStart(2, "0")}`, value: v }));
const box = { width: 560, height: 220, border: "1px solid var(--color-border-default)", borderRadius: 4 } as const;

/** 구간 누적 — 에이전트별 액티브 트랜잭션을 속도 등급으로. 가장 큰 값만 굵게. */
export const Segments: Story = {
  args: { bars: AGENTS },
  render: (args) => (
    <div style={box}>
      <EqualizerChart {...args} />
    </div>
  ),
};

/** 임계 2색 — 서버별 CPU(%) · 80 이상 경고. 축 최대 100 · 칸 하나 = 10%. */
export const Threshold: Story = {
  args: { bars: SERVERS, max: 100, unit: "%", threshold: 80 },
  render: (args) => (
    <div style={box}>
      <EqualizerChart {...args} />
    </div>
  ),
};

/** 임계를 화면이 바꾼다 — 슬라이더는 차트 밖 컨트롤(차트 계약에 입력을 넣지 않는다). */
export const ThresholdControlledByPage: Story = {
  args: { bars: SERVERS, max: 100, unit: "%", threshold: 60 },
  render: (args) => (
    <div className="flex flex-col gap-8px">
      <label className="flex items-center gap-8px text-sm text-secondary">
        임계(%) — 화면의 입력
        <input type="range" min={0} max={100} defaultValue={60} disabled aria-label="임계" />
        <span style={{ fontFamily: "var(--font-family-numeric)" }}>60</span>
      </label>
      <div style={box}>
        <EqualizerChart {...args} />
      </div>
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` + 속도 등급 범례(`SPEED_LEGEND`)를 [[WidgetFrame]] 에. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 520, height: 240 }}>
      <WidgetFrame title="액티브 트랜잭션" legend={SPEED_LEGEND} onFullscreen={() => {}}>
        <EqualizerChart bars={AGENTS} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────── */

const EX_BARS: EqualizerBar[] = names().map((n, i) => ({ label: n, value: scalar(i, 100) }));

/** 극단 · 100개 — 서버 100대 막대. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 막대 100개가 한 줄에 서서 칸 폭이 2~3px 로 줄고, 막대 위 값 글자가 막대마다 서서 겹치며, 이름 글자는 말줄임으로 사라진다.` } } },
  args: { bars: EX_BARS, max: 100, unit: "%", threshold: 80 },
  render: (args) => (
    <div style={{ ...box, width: 720 }}>
      <EqualizerChart {...args} />
    </div>
  ),
};

/** 극단 · 데이터 없음 — 막대 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 막대가 없으면 격자 · 값축만 남는다.` } } },
  args: { bars: [], max: 100, unit: "%" },
  render: (args) => (
    <div style={box}>
      <EqualizerChart {...args} />
    </div>
  ),
};

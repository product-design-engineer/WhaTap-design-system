import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniBarChart, MiniMultiLineChart, WidgetFrame } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, colorOf, names, scalar, timeLabels, wave } from "../../_extremes";

/**
 * Stories for [[MiniBarChart]] — 구간마다 막대, 계열이 둘 이상이면 누적.
 */
const meta: Meta<typeof MiniBarChart> = {
  title: "Composite/Chart/MiniBarChart",
  component: MiniBarChart,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "surface-muted" } },
  decorators: [(Story) => (<div style={{ width: 360, height: 180 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof MiniBarChart>;

const X = ["16:09", "16:10", "16:11", "16:12", "16:13", "16:14"];
const TPS = [420, 460, 510, 480, 620, 700, 680, 540, 500, 560, 610, 590, 640, 660, 600, 580, 620, 650, 700, 720, 690, 640, 610, 630, 650];
const USR = [22, 24, 25, 23, 28, 31, 30, 27, 26, 29, 33, 32, 34, 35, 31, 30, 32, 34, 36, 38, 35, 33, 31, 32, 34];
const SYS = [8, 9, 9, 8, 10, 12, 11, 10, 9, 11, 12, 12, 13, 13, 12, 11, 12, 13, 14, 15, 13, 12, 12, 12, 13];

/** 단일 계열 — TPS. */
export const Default: Story = {
  args: { xLabels: X, series: [{ label: "TPS", values: TPS, color: "var(--color-chart-series-1)" }] },
};

/** 누적 — 시스템 CPU(usr + sys). `peak` 로 최댓값을 적는다. */
export const Stacked: Story = {
  args: {
    xLabels: X,
    unit: "%",
    yMax: 100,
    peak: true,
    series: [
      { label: "usr", values: USR, color: "var(--color-chart-series-1)" },
      { label: "sys", values: SYS, color: "var(--color-chart-series-2)" },
    ],
  },
};

/** 대시보드 칸 — `frame={false}` 로 [[WidgetFrame]] 에 담는다. 옆 칸의 선 그래프와 Y축 · X축 선이 같은 자리에 선다. */
export const InWidgetFrame: Story = {
  decorators: [(Story) => (<div style={{ width: 740, height: 232 }}><Story /></div>)],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: "100%" }}>
      <WidgetFrame
        title="시스템 CPU"
        legend={[
          { label: "usr", color: "var(--color-chart-series-1)" },
          { label: "sys", color: "var(--color-chart-series-2)" },
        ]}
        onFullscreen={() => {}}
        menu={[{ key: "detail", label: "상세로 이동" }]}
      >
        <MiniBarChart
          frame={false}
          xLabels={X}
          unit="%"
          yMax={100}
          series={[
            { label: "usr", values: USR, color: "var(--color-chart-series-1)" },
            { label: "sys", values: SYS, color: "var(--color-chart-series-2)" },
          ]}
        />
      </WidgetFrame>
      <WidgetFrame title="금일 TPS" legend={[{ label: "TPS", color: "var(--color-chart-series-1)" }]} onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <MiniMultiLineChart title="금일 TPS" frame={false} xLabels={X} series={[{ label: "TPS", values: TPS.slice(0, 12), color: "var(--color-chart-series-1)", showArea: true }]} />
      </WidgetFrame>
    </div>
  ),
};

const SERVERS = ["dev-yard", "dev-dfs-yard-01", "dev-agency-01", "dev-front", "Dev-Modules"];
const IOPS = [502, 177, 148, 96, 64];

/**
 * TOP-N 범주 · 서버 다섯 대의 Disk IOPS. `categories` 가 막대마다 이름을 바로 아래 가운데에 놓고(칸 폭에서 말줄임 · 전체 이름은 title),
 * `valueLabels` 가 모든 막대 위에 값을 적는다. 가장 큰 값만 굵게 · primary.
 */
export const TopN: Story = {
  args: {
    unit: "B",
    valueLabels: true,
    categories: SERVERS,
    series: [{ label: "Disk IOPS", values: IOPS, color: "var(--color-chart-series-1)" }],
  },
};

/** TOP-N 을 대시보드 칸에. `frame={false}` 로 [[WidgetFrame]] 에 담고 범례는 계열 이름 하나. */
export const TopNInWidgetFrame: Story = {
  decorators: [(Story) => (<div style={{ width: 360, height: 232 }}><Story /></div>)],
  render: () => (
    <WidgetFrame
      title="Disk IOPS TOP5"
      legend={[{ label: "Disk IOPS", color: "var(--color-chart-series-1)" }]}
      onFullscreen={() => {}}
      menu={[{ key: "detail", label: "상세로 이동" }]}
    >
      <MiniBarChart
        frame={false}
        unit="B"
        valueLabels
        categories={SERVERS}
        series={[{ label: "Disk IOPS", values: IOPS, color: "var(--color-chart-series-1)" }]}
      />
    </WidgetFrame>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────── */

const EX_X = timeLabels(20);
const EX_SERIES = names().map((n, i) => ({ label: n, values: wave(i, 20, 6, 3), color: colorOf(i) }));

/** 극단 · 100개 — 100계열 누적 막대. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 100계열을 한 막대에 쌓아 강조 5개는 바닥의 1~2px 띠로만 남고 나머지는 회색 한 덩어리가 된다. 범례는 한 줄이라 잘린다.` } } },
  decorators: [(Story) => (<div style={{ width: 560, height: 260 }}><Story /></div>)],
  render: () => (
    <WidgetFrame title={`에이전트별 TPS (${EXTREME_N})`} legend={EX_SERIES.map((s) => ({ label: s.label, color: s.color }))} onFullscreen={() => {}}>
      <MiniBarChart frame={false} xLabels={EX_X} series={EX_SERIES} />
    </WidgetFrame>
  ),
};

/** 극단 · 100개 범주 — TOP-N 막대 100개(`categories`). */
export const Extreme100Categories: Story = {
  name: "극단 · 100개 범주",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 범주 100개를 한 줄에 놓으면 막대 폭이 2~3px 로 줄고, 막대 위 값 글자 100개가 서로 겹치며, 이름 글자는 말줄임으로 사라진다.` } } },
  decorators: [(Story) => (<div style={{ width: 560, height: 220 }}><Story /></div>)],
  args: { unit: "B", valueLabels: true, categories: names(), series: [{ label: "Disk IOPS", values: names().map((_, i) => scalar(i, 500)), color: "var(--color-chart-series-1)" }] },
};

/** 극단 · 데이터 없음 — 계열 0개 · 값 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 값이 빈 계열을 주면 격자 · 축만 남는다.` } } },
  args: { xLabels: EX_X, series: [{ label: "TPS", values: [], color: "var(--color-chart-series-1)" }] },
};

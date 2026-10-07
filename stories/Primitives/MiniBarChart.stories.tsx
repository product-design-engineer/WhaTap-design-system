import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniBarChart, MiniMultiLineChart, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[MiniBarChart]] — 구간마다 막대, 계열이 둘 이상이면 누적.
 */
const meta: Meta<typeof MiniBarChart> = {
  title: "Primitives/MiniBarChart",
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
        meta="최근 5분"
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
      <WidgetFrame title="금일 TPS" meta="오늘" legend={[{ label: "TPS", color: "var(--color-chart-series-1)" }]} onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <MiniMultiLineChart title="금일 TPS" frame={false} xLabels={X} series={[{ label: "TPS", values: TPS.slice(0, 12), color: "var(--color-chart-series-1)", showArea: true }]} />
      </WidgetFrame>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { WidgetFrame, ZoneScatterChart } from "@whatap/design-system";
import type { ZoneScatterPoint } from "@whatap/design-system";

/**
 * Stories for [[ZoneScatterChart]] — 판정 구역 위 대상 점. 구역 = 무채색 면, 점 = 계열색, 축은 선형.
 */
const meta: Meta<typeof ZoneScatterChart> = {
  title: "Composite/Chart/ZoneScatterChart",
  component: ZoneScatterChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**구역 분할 산점도.** [[ChartValueAxis]](`ticks` = 경계) · [[ChartTimeAxis]](`positions` = 경계) 를 조합하고 구역 · 점 · 임계 띠를 그린다. " +
          "축은 선형이고 구역 경계는 실제 값 자리에 — 불균등 눈금으로 넓히지 않는다. 구역 이름 · 개수는 한 줄. 액션은 WidgetFrame 몫.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ZoneScatterChart>;

const GPUS: ZoneScatterPoint[] = [
  [0.3, 82], [0.5, 96], [0.2, 12], [0.6, 40], [0.4, 8], [0.8, 74], [0.1, 98], [0.7, 20], [0.9, 35],
  [32, 55], [78, 88], [64, 62], [91, 97], [58, 41], [86, 76], [71, 18],
].map(([x, y], i) => ({ x, y, label: `GPU ${i}` }));
const ZONES = [
  ["Memory Squatting", "Memory Bound", "Saturated"],
  ["Reserved", "Balanced Active", "Busy"],
  ["Idle", "Light", "Compute Bound"],
];
const box = { width: 600, height: 300, border: "1px solid var(--color-border-default)", borderRadius: 4 } as const;

/** GPU 리소스 맵 — GPU 사용률 × FB 사용률. 0~1% 열은 실제 폭대로 좁다. */
export const Default: Story = {
  args: { points: GPUS, xBreaks: [1, 50], yBreaks: [30, 70], zones: ZONES, columnLabels: ["Idle GPU", "Active GPU", "Effective GPU"], critical: { from: 95, label: "Memory Critical" }, xUnit: "%", yUnit: "%" },
  render: (args) => (
    <div style={box}>
      <ZoneScatterChart {...args} />
    </div>
  ),
};

/** 사분면 — 호출 수 × 에러율(경계 하나씩). */
export const Quadrant: Story = {
  args: {
    points: [[120, 0.2], [800, 0.4], [1500, 3.2], [300, 4.1], [1900, 0.8], [600, 2.6], [1100, 0.3]].map(([x, y]) => ({ x, y })),
    xBreaks: [1000],
    yBreaks: [2],
    xMax: 2000,
    yMax: 5,
    zones: [["드문 실패", "급한 실패"], ["조용함", "바쁨 · 정상"]],
    xUnit: "회",
    yUnit: "%",
  },
  render: (args) => (
    <div style={box}>
      <ZoneScatterChart {...args} />
    </div>
  ),
};

/** 대시보드 칸 — 액션(재배치 분석)은 [[WidgetFrame]] `menu` 에. 차트 안에 버튼을 두지 않는다. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 600, height: 340 }}>
      <WidgetFrame title="GPU Resource Map" menu={[{ key: "rebalance", label: "재배치 분석" }]} onFullscreen={() => {}}>
        <ZoneScatterChart points={GPUS} xBreaks={[1, 50]} yBreaks={[30, 70]} zones={ZONES} columnLabels={["Idle GPU", "Active GPU", "Effective GPU"]} critical={{ from: 95, label: "Memory Critical" }} xUnit="%" yUnit="%" frame={false} />
      </WidgetFrame>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScatterChart, WidgetFrame, scatterLegend } from "@whatap/design-system";
import type { ScatterChartSeries, ScatterChartSeriesList } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[ScatterChart]] — 두 수치(X · Y)의 관계를 점으로. `size` 를 주면 버블.
 */
const meta: Meta<typeof ScatterChart> = {
  title: "Composite/Chart/ScatterChart",
  component: ScatterChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**산점도 / 버블.** 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · X 글자 [[ChartTimeAxis]] 를 조합하고 점만 그린다. " +
          "계열은 3개까지(`--color-chart-series-1..3`, patterns §18) — 넘으면 facet. 겹침은 반투명 0.6 으로 밀도를 보인다(§21). " +
          "버블은 면적이 `size` 에 비례(반지름 3~12px).",
      },
    },
  },
  argTypes: {
    series: { description: "계열 1~3개 — `{ label, points: { x, y, size?, label? }[], slot? }`." },
    xMax: { description: "X 최대. 없으면 데이터 최대를 보기 좋은 값으로 올린다." },
    yMax: { description: "Y 최대. 없으면 데이터 최대를 보기 좋은 값으로 올린다." },
    xUnit: { description: "X 눈금 글자 뒤 단위." },
    yUnit: { description: "Y 눈금 글자 뒤 단위." },
    frame: { description: "자기 좌우 여백 · 범례 줄. `false` 면 플롯만(WidgetFrame 안)." },
  },
};

export default meta;
type Story = StoryObj<typeof ScatterChart>;

/* 결정적 의사 난수 — 스냅샷이 흔들리지 않게. */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
function cloud(seed: number, n: number, cx: number, cy: number, spread: number, withSize = false) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({
    x: Math.max(0, Math.round(cx + (r() - 0.5) * spread * 2)),
    y: Math.max(0, Math.round(cy + (r() - 0.5) * spread * 1.6 + (r() - 0.5) * spread)),
    ...(withSize ? { size: Math.round(1 + r() * 99) } : {}),
  }));
}

const ONE: ScatterChartSeriesList = [{ label: "SQL", points: cloud(7, 80, 240, 320, 160) }];
const THREE: ScatterChartSeriesList = [
  { label: "api-gw", points: cloud(11, 40, 180, 220, 120) },
  { label: "order", points: cloud(23, 40, 420, 520, 140) },
  { label: "billing", points: cloud(37, 40, 640, 300, 120) },
];
const DENSE: ScatterChartSeriesList = [{ label: "SQL", points: cloud(5, 600, 300, 400, 200) }];
const BUBBLE: ScatterChartSeriesList = [
  { label: "api-gw", points: cloud(41, 14, 300, 300, 220, true) },
  { label: "order", points: cloud(53, 14, 600, 600, 220, true) },
];

const box = { width: 480, height: 260, border: "1px solid var(--color-border-default)", borderRadius: 4 } as const;

/** 기본 — 계열 하나. 단독이라 계열 이름 범례를 세우지 않는다. */
export const Default: Story = {
  args: { series: ONE, xUnit: "회", yUnit: "ms" },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

/** 계열 셋 — 상한(§18). 단독(`frame`)이면 플롯 위 오른쪽에 원 견본 범례. */
export const ThreeSeries: Story = {
  args: { series: THREE, xUnit: "회", yUnit: "ms" },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

/** 밀집 600점 — 겹친 곳이 짙어져 밀도가 읽힌다(반투명 0.6, §21 결정). */
export const Dense: Story = {
  args: { series: DENSE, xUnit: "회", yUnit: "ms" },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

/** 버블 — `size` 가 면적. 큰 버블을 먼저 그려 작은 점을 덮지 않는다. */
export const Bubble: Story = {
  args: { series: BUBBLE, xUnit: "회", yUnit: "ms" },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

/** 고정 슬롯 — `order` 만 남겨도 2번 색을 지킨다(§17 색은 엔티티의 것). */
export const FixedSlot: Story = {
  args: { series: [{ ...(THREE[1] as ScatterChartSeries), slot: 2 }], xUnit: "회", yUnit: "ms" },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

/** 빈 상태 — 축만 남는다. */
export const Empty: Story = {
  args: { series: [{ label: "SQL", points: [] }] },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` + `scatterLegend(series)` 를 [[WidgetFrame]] `legend` 로. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 420, height: 260 }}>
      <WidgetFrame title="SQL 수행 분포" summary="호출 수 × 수행 시간" legend={scatterLegend(THREE)} onFullscreen={() => {}}>
        <ScatterChart series={THREE} xUnit="회" yUnit="ms" frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/** 4계열 이상은 facet — 계열마다 작은 칸 하나(§18). 색은 슬롯 1 하나로 같다(칸 제목이 계열을 말한다). */
export const Facet: Story = {
  render: () => {
    const names = ["api-gw", "order", "billing", "search", "auth", "cart"];
    return (
      <div className="grid gap-8px" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: 160, width: 720 }}>
        {names.map((n, i) => (
          <WidgetFrame key={n} title={n}>
            <ScatterChart series={[{ label: n, points: cloud(100 + i, 40, 400, 400, 200), slot: 1 }]} xMax={800} yMax={800} frame={false} />
          </WidgetFrame>
        ))}
      </div>
    );
  },
};

/* ─── 극단 사례 ─────────────────────────────────── */

/* 타입은 1~3계열 튜플이다 — 100개는 런타임에서 어떻게 되는지 보이려고 일부러 넓혀 넘긴다. */
const EX_SERIES = names(EXTREME_N, "svc").map((n, i) => ({ label: n, points: cloud(200 + i, 6, 100 + scalar(i, 700), 100 + scalar(i * 3, 700), 60) })) as unknown as ScatterChartSeriesList;

/** 극단 · 100개 — 100계열(타입 상한 3을 넘겨 넘김). */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 이 차트는 색을 슬롯 1~3 으로만 받고 계열을 3개에서 자른다(§18) — 100개를 넘기면 앞 3개만 그려지고 97개는 말없이 빠진다. 많으면 facet.` } } },
  render: () => (
    <div style={{ width: 420, height: 260 }}>
      <WidgetFrame title={`서비스별 수행 분포 (${EXTREME_N})`} legend={scatterLegend(EX_SERIES)} onFullscreen={() => {}}>
        <ScatterChart series={EX_SERIES} xUnit="회" yUnit="ms" frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/** 극단 · 데이터 없음 — 점 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 점이 없으면 축만 남는다. (알려진 결함: x · y 가 null 인 점에 마우스를 올리면 멈춘다 — 여기서는 넣지 않았다.)` } } },
  args: { series: [{ label: "SQL", points: [] }] },
  render: (args) => (
    <div style={box}>
      <ScatterChart {...args} />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { GpuStatusBar, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[GpuStatusBar]] — 단계별 몫과 나머지를 세로 막대로 쌓는 단계 막대 차트.
 */
const meta: Meta<typeof GpuStatusBar> = {
  title: "Composite/Chart/GpuStatusBar",
  component: GpuStatusBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**요소 조합 — [[ChartGrid]] · [[ChartValueAxis]](`ticks` = 단계 값) · [[ChartStackedColumn]] · [[ChartCategoryAxis]].** " +
          "몫은 한 계열 색, 나머지는 `--color-surface-200`. 단계는 같은 지표(GPU 수)라 색을 돌려 칠하지 않는다(patterns §17).",
      },
    },
  },
  decorators: [(Story) => (<div style={{ width: 560, height: 220 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof GpuStatusBar>;

const FUNNEL = [
  { label: "Total", positive: { value: 8, label: "8 Total" } },
  { label: "Allocated", positive: { value: 6, label: "6 Allocated" }, negative: { value: 2, label: "2 Not Allocated" } },
  { label: "Active", positive: { value: 5, label: "5 Active" }, negative: { value: 1, label: "1 Not Active" } },
  { label: "Effective", positive: { value: 2, label: "2 Effective" }, negative: { value: 3, label: "3 Not Effective" } },
];

/** 기본 — Total 8 → Allocated 6 → Active 5 → Effective 2. 눈금은 단계 값(0 · 2 · 5 · 6 · 8). */
export const Default: Story = { args: { categories: FUNNEL, max: 8 } };

/** 대시보드 칸 — `frame={false}` 로 [[WidgetFrame]] 에 담는다. 제목은 WidgetFrame 이 맡는다. */
export const InWidgetFrame: Story = {
  decorators: [(Story) => (<div style={{ width: 560, height: 248 }}><Story /></div>)],
  render: () => (
    <WidgetFrame title="GPU 상태별 활용 현황" onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
      <GpuStatusBar frame={false} categories={FUNNEL} max={8} />
    </WidgetFrame>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────────── */

/** 극단 · 100개 — 단계 100개. 단계 막대는 한 계열 색이라 colorOf 를 쓰지 않는다. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 이 차트는 단계가 같은 지표라 한 색이다 — 막대가 1~2px 로 얇아지고, 막대 위 값 라벨(«n Idle»)이 서로 겹쳐 읽을 수 없으며 아래 범주 라벨은 눈금만 남는다.` } } },
  args: {
    categories: names(100, "gpu").map((label, i) => {
      const pos = Math.round(scalar(i, 8));
      return { label, positive: { value: pos, label: `${pos} Active` }, negative: { value: 8 - pos, label: `${8 - pos} Idle` } };
    }),
    max: 8,
  },
};

/** 극단 · 데이터 없음 — 단계 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 값축 0 하나와 축선만 남는다.` } } },
  args: { categories: [] },
};

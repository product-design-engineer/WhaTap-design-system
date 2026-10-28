import type { Meta, StoryObj } from "@storybook/react-vite";
import { Treemap, WidgetFrame } from "@whatap/design-system";
import type { TreemapNode } from "@whatap/design-system";
import { EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[Treemap]] — 계층 구성의 크기를 칸 면적으로. 묶음 = 색, 칸 넓이 = 값.
 */
const meta: Meta<typeof Treemap> = {
  title: "Composite/Chart/Treemap",
  component: Treemap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**트리맵.** squarified 배치 · 묶음 색은 계열 슬롯 · 작은 칸(56 × 28 미만)은 라벨 없이 툴팁이 말한다. " +
          "범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] 를 조합한다. 묶음 8개 넘으면 「기타」(§22).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Treemap>;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const r = rng(7);
const NS: TreemapNode[] = ["payments", "orders", "search", "auth", "batch"].map((ns, i) => ({
  label: ns,
  children: Array.from({ length: 4 + ((i * 3) % 6) }, (_, k) => ({ label: `${ns}-${k + 1}`, value: Math.round(80 + r() * 900 / (k + 1)) })),
}));

/** 네임스페이스 › 파드 메모리(MiB) — 묶음 다섯. */
export const Grouped: Story = {
  args: { data: NS, unit: "MiB" },
  render: (args) => (
    <div style={{ width: 600, height: 340 }}>
      <Treemap {...args} />
    </div>
  ),
};

/** 묶음 없음 — 한 색. 크기만. */
export const Flat: Story = {
  args: { data: ["api-gw", "order", "billing", "search", "auth", "cart", "noti", "report"].map((l, i) => ({ label: l, value: [820, 640, 410, 300, 220, 140, 90, 40][i] })), unit: "ms" },
  render: (args) => (
    <div style={{ width: 480, height: 260 }}>
      <Treemap {...args} />
    </div>
  ),
};

/** 대시보드 칸. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 520, height: 320 }}>
      <WidgetFrame title="네임스페이스별 파드 메모리" summary="MiB">
        <Treemap data={NS} unit="MiB" />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────────── */

/** 극단 · 100개 — 묶음 20 × 칸 5 = 칸 100개. 묶음 색은 차트가 정한다(색 prop 없음). */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: {
    docs: {
      description: {
        story: `${EXTREME_NOTE.many} 이 차트는 묶음 색을 스스로 정한다 — 큰 묶음 7개만 색, 나머지 13묶음은 「기타」 로 합친다. 작은 칸은 라벨 없이 툴팁만.`,
      },
    },
  },
  args: {
    data: names(20, "ns").map((ns, g) => ({
      label: ns,
      children: Array.from({ length: 5 }, (_, k) => ({ label: `${ns}-pod-${k + 1}`, value: scalar(g * 5 + k, 900) + 10 })),
    })),
    unit: "MiB",
  },
  render: (args) => (
    <div style={{ width: 600, height: 340 }}>
      <Treemap {...args} />
    </div>
  ),
};

/** 극단 · 데이터 없음 — 노드 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 빈 박스만 남는다.` } } },
  args: { data: [], unit: "MiB" },
  render: (args) => (
    <div style={{ width: 600, height: 340 }}>
      <Treemap {...args} />
    </div>
  ),
};

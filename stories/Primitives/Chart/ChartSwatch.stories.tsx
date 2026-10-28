import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartSwatch } from "@whatap/design-system";

/**
 * Stories for [[ChartSwatch]] — 마크 모양을 따르는 범례 견본.
 */
const meta: Meta<typeof ChartSwatch> = {
  title: "Primitives/Chart/ChartSwatch",
  component: ChartSwatch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**견본은 마크 모양을 따른다**(patterns §26 결정) — 선 계열 `line`(8×2), 면 · 막대 · 조각 · 칸 `square`(8×8, 기본). " +
          "크기는 하나라 차트가 정하지 않는다. 차트마다 그리던 네 모양(8 사각 · 8 원 · 8×2 선 · 10 사각)을 이것 하나로 모았다. " +
          "[[WidgetFrame]] `legend[].shape` 가 이것을 쓴다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ChartSwatch>;

/** 사각 — 면 · 막대 · 조각 · 칸. */
export const Square: Story = { args: { color: "var(--color-chart-series-1)" } };

/** 선 — 선 계열. */
export const Line: Story = { args: { color: "var(--color-chart-series-1)", shape: "line" } };

/** 원 — 점 · 버블([[ScatterChart]]). */
export const Dot: Story = { args: { color: "var(--color-chart-series-1)", shape: "dot" } };

/** 범례 줄에서 — 선 · 막대 · 산점도 칸의 견본이 마크대로 갈린다. */
export const InLegend: Story = {
  render: () => (
    <div className="flex flex-col gap-12px">
      {[
        { title: "선 차트 칸", shape: "line" as const },
        { title: "막대 차트 칸", shape: "square" as const },
        { title: "산점도 칸", shape: "dot" as const },
      ].map((row) => (
        <div key={row.title} className="flex items-center gap-12px">
          <span className="text-sm text-tertiary" style={{ width: 80 }}>{row.title}</span>
          {[
            { label: "p50", color: "var(--color-chart-series-1)" },
            { label: "p95", color: "var(--color-chart-series-2)" },
            { label: "p99", color: "var(--color-chart-series-3)" },
          ].map((s) => (
            <span key={s.label} className="flex items-center gap-4px text-sm text-secondary">
              <ChartSwatch color={s.color} shape={row.shape} />
              {s.label}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};

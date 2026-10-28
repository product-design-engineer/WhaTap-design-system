import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkline } from "@whatap/design-system";

/**
 * Stories for [[Sparkline]] — 축 없는 작은 선. 바닥선 · 끝점으로 «0 에 붙은 평평함» 과 «중간의 평평함» 을 가른다.
 */
const meta: Meta<typeof Sparkline> = {
  title: "Primitives/Chart/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**스파크라인.** 축 없는 선 1.5px · 끝점 4px · 바닥선(`--color-border-soft`). 높이 20(최소 16). " +
          "같은 열 행끼리 견줄 때는 `max` 를 공유한다. [[SparklineCell]] · 추세 타일이 조합한다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 120 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Sparkline>;

/** 기본 — 오르는 중. */
export const Default: Story = { args: { values: [12, 18, 15, 22, 30, 28, 42] } };

/** 0 에 붙은 평평함 vs 중간의 평평함 — `max` 를 공유하면 높이로 갈린다(§21 라이브 결함). */
export const FlatZeroVsMid: Story = {
  render: () => (
    <div className="flex flex-col gap-8px">
      <Sparkline values={[0, 0, 0, 0, 0, 0]} max={100} />
      <Sparkline values={[50, 50, 50, 50, 50, 50]} max={100} />
    </div>
  ),
};

/** 계열 색 — 짝 차트와 같은 토큰. */
export const SeriesColor: Story = { args: { values: [40, 35, 38, 60, 72, 65, 80], color: "var(--color-chart-series-2)" } };

/** 값 하나 · 없음 — 바닥선만. */
export const Empty: Story = { args: { values: [] } };

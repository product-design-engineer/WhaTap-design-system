import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartGrid, ChartValueAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartGrid]] — 값축 눈금마다 긋는 플롯 격자.
 */
const meta: Meta<typeof ChartGrid> = {
  title: "Primitives/Chart · ChartGrid",
  component: ChartGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**눈금(최대 · 절반 · 0)마다 가로 점선.** 색은 `--color-border-soft` 하나 — 차트마다 따로 그리던 4벌이 " +
          "반투명 · 불투명으로 갈려 있던 것을 하나로 모았다(patterns §26). 마크보다 **먼저(아래)** 그리고, " +
          "[[ChartValueAxis]] 와 같은 `max` · 여백을 준다. 높이가 정해진 `relative` 플롯 상자 안에 둔다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative bg-card" style={{ width: 320, height: 120 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ChartGrid>;

/** 기본 — 눈금 셋. */
export const Default: Story = { args: { max: 100 } };

/** 최대가 0 — 바닥 눈금 하나만. 값이 없을 때 빈 격자를 세 줄로 세우지 않는다. */
export const ZeroMax: Story = { args: { max: 0 } };

/** 선 끝 값 배지 칸을 비운 플롯 — 격자도 배지 칸 앞에서 끝난다. */
export const WithEndGutter: Story = { args: { max: 100, right: "var(--wds-widget-end-gutter)" } };

/** [[ChartValueAxis]] 와 짝 — 같은 `max` · 여백이면 눈금 글자와 점선이 같은 높이에 선다. */
export const WithValueAxis: Story = {
  args: { max: 100 },
  render: (args) => (
    <>
      <ChartGrid {...args} />
      <ChartValueAxis max={args.max} unit="%" padTop={args.padTop} padBottom={args.padBottom} right={args.right} />
    </>
  ),
};

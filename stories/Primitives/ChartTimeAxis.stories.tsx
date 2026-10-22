import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartGrid, ChartTimeAxis, ChartValueAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartTimeAxis]] — 플롯 아래 X축 시간 글자.
 */
const meta: Meta<typeof ChartTimeAxis> = {
  title: "Primitives/Chart · ChartTimeAxis",
  component: ChartTimeAxis,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**양 끝은 안쪽으로, 사이는 가운데.** 첫 글자는 왼쪽 정렬, 끝 글자는 오른쪽 정렬이라 Y축 눈금 칸을 침범하지 않고 " +
          "칸 밖으로 잘리지 않는다. 선 · 막대 · 예측 · Apdex 에 5벌로 있던 같은 규칙을 모았다(patterns §26). 같은 간격이면 " +
          "`labels` 만, 도메인 좌표에 놓아야 하면 `positions`(0 ~ 1)를 함께 준다. [[ChartGrid]] · [[ChartValueAxis]] 와 같은 `right`.",
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
type Story = StoryObj<typeof ChartTimeAxis>;

/** 같은 간격 — 양 끝 안쪽 정렬. */
export const Default: Story = { args: { labels: ["13:27", "13:30", "13:33", "13:36"] } };

/** 도메인 좌표에 — 예측 차트의 «지금» 처럼 간격이 고르지 않을 때. */
export const WithPositions: Story = {
  args: { labels: ["-6h", "지금", "+12h", "+24h"], positions: [0, 0.2, 0.6, 1] },
};

/** 값축 · 격자와 한 플롯에 — 같은 `right` 라 X 범위가 맞는다. */
export const WithValueAxis: Story = {
  args: { labels: ["13:27", "13:28", "13:29", "13:30", "13:31", "13:32"] },
  render: (args) => (
    <>
      <ChartGrid max={100} />
      <ChartValueAxis max={100} unit="%" />
      <ChartTimeAxis {...args} />
    </>
  ),
};

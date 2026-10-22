import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartGrid, ChartPeakMarker, ChartValueAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartPeakMarker]] — 최고점 값 말풍선 + ▼.
 */
const meta: Meta<typeof ChartPeakMarker> = {
  title: "Primitives/Chart · ChartPeakMarker",
  component: ChartPeakMarker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**▼ 끝이 받은 점(`left` · `top`)에 정확히 닿는다.** 좌표는 차트가 선을 그린 SVG 와 같은 식으로 계산해 넘긴다" +
          "(patterns §5). 말풍선에 카드 바탕을 깔아 Y축 눈금과 겹쳐도 두 수치가 한 덩어리로 읽히지 않는다. 글자는 text 토큰, " +
          "계열 색은 ▼ 에만. 지금 값(§25 선 끝 배지)과 한 플롯에 함께 두지 않는다.",
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
type Story = StoryObj<typeof ChartPeakMarker>;

/** 기본 — 플롯 가운데 최고점. ▼ 끝이 기준점에 닿는다. */
export const Default: Story = {
  args: { label: "52%", color: "var(--color-chart-series-1)", left: 160, top: 60 },
};

/** 1000 이상 — 「22.06K」. 값은 호출하는 쪽이 포맷한다. */
export const Thousands: Story = {
  args: { label: "22.06K", color: "var(--color-chart-series-3)", left: 200, top: 50 },
};

/**
 * 최고점이 Y축 눈금 가까이 — 말풍선 바탕이 눈금 「100%」 와 겹친 글자를 가린다.
 * 바탕이 없으면 「10098%」 처럼 두 수치가 한 덩어리로 읽힌다.
 */
export const NearAxisLabel: Story = {
  args: { label: "98%", color: "var(--color-chart-series-1)", left: 36, top: 24 },
  render: (args) => (
    <>
      <ChartGrid max={100} />
      <ChartValueAxis max={100} unit="%" />
      <ChartPeakMarker {...args} />
    </>
  ),
};

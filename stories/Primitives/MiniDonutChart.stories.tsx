import type { Meta, StoryObj } from "@storybook/react-vite";
import { MiniDonutChart, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[MiniDonutChart]] — 범주 비율을 보여 주는 작은 도넛 카드.
 *
 * 세그먼트 색은 차트 계열 토큰을 **1번부터 순서대로** 배정한다(순환 금지).
 */
const meta: Meta<typeof MiniDonutChart> = {
  title: "Primitives/MiniDonutChart",
  component: MiniDonutChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    delay: { control: { type: "number", min: 0, max: 2000, step: 100 } },
  },
  decorators: [(Story) => (<div style={{ width: 320, height: 200 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof MiniDonutChart>;

/** 기본 — 2개 범주 + 중앙 합계. */
export const Default: Story = {
  args: {
    title: "GPU 인벤토리",
    segments: [
      { label: "A100", value: 8, color: "var(--color-chart-series-1)" },
      { label: "H100", value: 4, color: "var(--color-chart-series-2)" },
    ],
    centerLabel: "12",
    centerSub: "Total",
  },
};

/** 범주 3개 — 계열 1·2·3. */
export const ThreeSegments: Story = {
  args: {
    title: "모델별 요청 비율",
    segments: [
      { label: "gpt-4o", value: 52, color: "var(--color-chart-series-1)" },
      { label: "claude", value: 31, color: "var(--color-chart-series-2)" },
      { label: "llama", value: 17, color: "var(--color-chart-series-3)" },
    ],
    centerLabel: "100",
    centerSub: "%",
  },
};

/** 대시보드 칸 — `frame={false}` 로 껍데기를 끄고 [[WidgetFrame]] 에 담는다. 범례는 도넛 옆 열 그대로(항목 글이 길어 한 줄 범례로 올리지 않는다). */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 360, height: 232 }}>
      <WidgetFrame title="서버 상태" meta="46대" onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <MiniDonutChart
          title="서버 상태"
          frame={false}
          centerLabel="46"
          centerSub="대"
          segments={[
            { label: "정상", value: 40, color: "var(--color-status-success)" },
            { label: "경고", value: 5, color: "var(--color-status-warning)" },
            { label: "위험", value: 1, color: "var(--color-indicator-critical)" },
          ]}
        />
      </WidgetFrame>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartTooltip } from "@whatap/design-system";

/**
 * Stories for [[ChartTooltip]] — 차트 마크를 가리켰을 때의 값 상자. 위치는 차트가, 모양은 이것이 정한다.
 */
const meta: Meta<typeof ChartTooltip> = {
  title: "Primitives/Chart/ChartTooltip",
  component: ChartTooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**차트 툴팁.** 카드 표면 · 1px 테두리 · 반경 6 · 그림자. 제목 · 값 줄(견본 · 이름 · 값 굵게) · 보조 줄. " +
          "`left` · `top` 은 마크 자리, `flipX` · `flipY` 로 반대쪽에 편다. 브라우저 `title` 대신 모든 차트가 이것을 쓴다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative" style={{ width: 360, height: 160, border: "1px dashed var(--color-border-default)" }}>
        <span className="absolute rounded-full" style={{ left: "40%", top: "40%", width: 6, height: 6, transform: "translate(-50%, -50%)", background: "var(--color-chart-series-1)" }} />
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChartTooltip>;

/** 점 하나 — 이름 · X · Y. */
export const Point: Story = {
  args: { left: "40%", top: "40%", title: "order-svc-3", rows: [{ label: "호출", value: "420회", color: "var(--color-chart-series-1)", shape: "dot" }, { label: "수행 시간", value: "640ms" }] },
};

/** 구간 여럿 + 합계 — 이퀄라이저 · 누적면. */
export const Segments: Story = {
  args: {
    left: "40%",
    top: "40%",
    title: "14:32",
    rows: [
      { label: "Very Slow", value: "6", color: "var(--color-chart-speed-very-slow)" },
      { label: "Slow", value: "20", color: "var(--color-chart-speed-slow)" },
      { label: "Normal", value: "45", color: "var(--color-chart-speed-normal)" },
    ],
    footer: "합계 71",
  },
};

/** 펴는 방향 — 마크가 오른쪽 · 아래 절반이면 반대쪽으로. */
export const Flipped: Story = {
  args: { left: "40%", top: "40%", flipX: true, flipY: true, title: "web-07", rows: [{ label: "CPU", value: "84%" }] },
};

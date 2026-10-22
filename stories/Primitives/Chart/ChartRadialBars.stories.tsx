import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartRadialBars } from "@whatap/design-system";

const SPEED = [
  "var(--color-chart-speed-normal)",
  "var(--color-chart-speed-slow)",
  "var(--color-chart-speed-very-slow)",
];
const sector = (label: string, ...v: number[]) => ({
  label,
  segments: v.map((value, i) => ({ value, color: SPEED[i], label: ["Normal", "Slow", "Very Slow"][i] })),
});

const EIGHT = [
  sector("agent-01", 38, 6, 4),
  sector("agent-02", 52, 4, 2),
  sector("agent-03", 30, 8, 6),
  sector("agent-04", 44, 3, 1),
  sector("agent-05", 61, 5, 3),
  sector("agent-06", 27, 9, 5),
  sector("agent-07", 23, 2, 1),
  sector("agent-08", 0, 0, 0),
];

/**
 * Stories for [[ChartRadialBars]] — 고리형 막대.
 */
const meta: Meta<typeof ChartRadialBars> = {
  title: "Primitives/Chart/ChartRadialBars",
  component: ChartRadialBars,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**칸 하나 = 대상 하나, 안쪽부터 쌓인 줄무늬 = 양과 구성.** 12시부터 시계 방향. 줄 수는 값 ÷ `max` × `levels`(0 보다 큰 구간은 최소 한 줄). " +
          "바탕 · 구분선은 `--color-chart-radial-*` 토큰이라 다크에서 바뀐다. [[ActiveTransactionArc]] 의 고리가 이것이다 — 종전엔 정적 이미지라 값과 무관했다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 220, height: 220 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ChartRadialBars>;

/** 에이전트 8개(마지막은 비활성 — 바탕만 남는다). */
export const Default: Story = { args: { sectors: EIGHT } };

/** 가운데 합계 + 회전 장식(sweep). */
export const WithCenterAndSweep: Story = {
  args: {
    sectors: EIGHT,
    sweep: true,
    children: (
      <span className="text-primary leading-none" style={{ fontFamily: "var(--font-family-numeric)", fontSize: "13cqw", fontWeight: "var(--font-weight-medium)" }}>
        334
      </span>
    ),
  },
};

/** 같은 `max` 로 나란히 — 차트끼리 막대 길이를 비교할 수 있다. 각자 기본 max 면 둘 다 «가득» 으로 보인다. */
export const SharedMax: Story = {
  decorators: [(Story) => <div style={{ width: 460, height: 220 }}><Story /></div>],
  render: () => (
    <div className="flex h-full" style={{ gap: 20 }}>
      <div style={{ width: 220, height: 220 }}>
        <ChartRadialBars max={70} sectors={EIGHT} />
      </div>
      <div style={{ width: 220, height: 220 }}>
        <ChartRadialBars max={70} sectors={[sector("a", 12, 2, 0), sector("b", 8, 1, 1), sector("c", 20, 0, 0), sector("d", 5, 0, 3)]} />
      </div>
    </div>
  ),
};

/** 느림 · 매우 느림이 많은 칸 — 바깥 빨강이 두껍다. */
export const Degraded: Story = {
  args: { sectors: [sector("a", 10, 12, 18), sector("b", 14, 8, 9), sector("c", 30, 4, 2), sector("d", 6, 10, 22), sector("e", 22, 6, 4), sector("f", 9, 9, 9)] },
};

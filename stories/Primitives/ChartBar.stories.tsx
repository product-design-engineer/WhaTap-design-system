import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartBar } from "@whatap/design-system";

/**
 * Stories for [[ChartBar]] — 칸 바닥에서 자라는 세로 막대 하나.
 */
const meta: Meta<typeof ChartBar> = {
  title: "Primitives/Chart · ChartBar",
  component: ChartBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**«0» 과 «모름» 을 다르게 그린다.** 값은 `ratio` × 줄 높이(최소 2px), 모름(`ratio={null}`)은 칸 전체를 " +
          "`--color-surface-100` 으로 비운다 — 막대가 없으면 수집 끊김이 «조용했다» 로 읽힌다. 높이가 정해진 가로 flex 줄 안에 둔다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-end bg-card" style={{ width: 40, height: 96, gap: 2 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ChartBar>;

/** 값 — 82%. */
export const Value: Story = { args: { ratio: 0.82, color: "var(--color-chart-seq-4)", title: "13시 · 82%" } };

/** 0 — 바닥에 붙은 최소 2px. */
export const Zero: Story = { args: { ratio: 0, title: "3시 · 0%" } };

/** 모름 — 칸 전체 옅은 면. */
export const Unknown: Story = { args: { ratio: null, title: "4시 · 데이터 없음" } };

/** 줄 — 값 · 0 · 모름이 한 줄에 섞일 때. */
export const InRow: Story = {
  decorators: [(Story) => (<div className="flex items-end bg-card" style={{ width: 240, height: 96, gap: 2 }}><Story /></div>)],
  render: () => (
    <>
      {[0.3, 0.5, 0, null, 0.82, 0.95, 0.6, null, 0.2, 0.7].map((r, i) => (
        <ChartBar key={i} ratio={r} color={(r ?? 0) >= 0.5 ? "var(--color-chart-seq-4)" : "var(--color-chart-seq-2)"} delay={i * 35} />
      ))}
    </>
  ),
};

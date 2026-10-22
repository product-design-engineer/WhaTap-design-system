import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarListItem } from "@whatap/design-system";

/**
 * Stories for [[BarListItem]] — 가로 막대 목록의 한 줄.
 */
const meta: Meta<typeof BarListItem> = {
  title: "Primitives/Chart/BarListItem",
  component: BarListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**값 · 이름 · 같은 값의 막대 한 줄.** 값 칸 88px 고정이라 줄을 쌓으면 막대 시작선이 같다. 막대 길이는 받은 `ratio`(0~1) — " +
          "분모는 화면이 정한다. [[BarList]] 가 이 줄을 쌓는다. 부모가 높이를 정하는 세로 목록(`ul`) 안에 둔다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="flex flex-col bg-card" style={{ width: 320, height: 40, listStyle: "none", margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof BarListItem>;

/** 기본 — Method(엔티티 슬롯 1). */
export const Default: Story = { args: { label: "Method", value: 210, ratio: 0.88, color: "var(--color-chart-series-1)" } };

/** 짧은 막대 — 비율이 작아도 최소 두께 4px. */
export const Short: Story = { args: { label: "SOCKET", value: 1, ratio: 0.02, color: "var(--color-chart-series-5)" } };

/** 0 — 막대가 사라지고 값 · 이름만 남는다. 0 표현은 결정 필요(patterns §21). */
export const Zero: Story = { args: { label: "DBC", value: 0, ratio: 0, color: "var(--color-chart-series-2)" } };

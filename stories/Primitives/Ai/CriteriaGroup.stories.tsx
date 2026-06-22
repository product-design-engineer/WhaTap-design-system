import type { Meta, StoryObj } from "@storybook/react-vite";
import CriteriaGroup from "../../../src/widget/CriteriaGroup";

const meta: Meta<typeof CriteriaGroup> = {
  title: "Primitives/Ai/CriteriaGroup",
  component: CriteriaGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**분류 기준 그룹 행 (part)** — [[AiCriteriaSelection]] 의 단일 기준 행. tone 배경 + 좌측 도트 + 제목 + 상세.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CriteriaGroup>;

export const High: Story = {
  args: {
    title: "즉시 조치",
    detail: "임계값 초과 — 알림 발송 대상",
    background: "#ffe8e8",
    dotColor: "var(--color-indicator-critical)",
  },
};

export const Mid: Story = {
  args: {
    title: "관찰",
    detail: "경고 구간 — 추세 모니터링",
    background: "#fff7e0",
    dotColor: "var(--color-indicator-warning)",
  },
};

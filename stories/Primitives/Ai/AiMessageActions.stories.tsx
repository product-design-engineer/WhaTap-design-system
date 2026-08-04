import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiMessageActions } from "@whatap/design-system/widget";

const meta: Meta<typeof AiMessageActions> = {
  title: "Primitives/Ai/AiMessageActions",
  component: AiMessageActions,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**AI 응답 하단의 좋아요/싫어요/복사 액션.** 사용자 피드백 수집. divider prop 으로 위쪽 `--color-border-default` 라인 토글.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiMessageActions>;

export const Default: Story = {
  args: { onLike: () => console.log("👍"), onDislike: () => console.log("👎"), onCopy: () => console.log("📋") },
};

export const WithDivider: Story = {
  args: { divider: true, onLike: () => {}, onDislike: () => {}, onCopy: () => {} },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClickCursor } from "@whatap/design-system/widget";

const meta: Meta<typeof ClickCursor> = {
  title: "Primitives/ClickCursor",
  component: ClickCursor,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "**가상 클릭 커서** — 시연 시나리오에서 AI 가 어떤 버튼을 'tap' 하는지 시각화하는 손가락 ripple. 48px 기본.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ClickCursor>;

export const Default: Story = { args: {} };
export const Small: Story = { args: { size: 32 } };
export const Large: Story = { args: { size: 80 } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import CriteriaOptionButton from "../../src/widget/CriteriaOptionButton";

const meta: Meta<typeof CriteriaOptionButton> = {
  title: "Composite/Ai/CriteriaOptionButton",
  component: CriteriaOptionButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**선택 옵션 버튼 (part)** — [[AiCriteriaSelection]] 의 단일 CTA. selected(filled blue) / dimmed / pending(자동 클릭 손) / locked 상태.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-wrap gap-6px" style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CriteriaOptionButton>;

export const Default: Story = {
  args: {
    label: "기본",
    selected: false,
    dimmed: false,
    pending: false,
    locked: false,
  },
};

export const Selected: Story = {
  args: {
    label: "엄격",
    selected: true,
    dimmed: false,
    pending: false,
    locked: true,
  },
};

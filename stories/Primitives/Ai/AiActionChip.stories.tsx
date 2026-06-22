import type { Meta, StoryObj } from "@storybook/react-vite";
import AiActionChip from "../../../src/widget/AiActionChip";

const meta: Meta<typeof AiActionChip> = {
  title: "Primitives/Ai/AiActionChip",
  component: AiActionChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**액션 칩 (part)** — [[WhaTapAiWidget]] 랜딩의 단일 제안 액션 버튼. 라벨 + 진입 스태거 페이드인(400 + index*80 ms).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-wrap gap-6px items-start" style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AiActionChip>;

export const First: Story = {
  args: {
    label: "현재 상태 요약",
    index: 0,
  },
};

export const Staggered: Story = {
  args: {
    label: "이상 징후 진단",
    index: 2,
  },
};

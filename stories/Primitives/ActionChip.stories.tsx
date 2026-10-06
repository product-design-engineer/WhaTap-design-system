import type { Meta, StoryObj } from "@storybook/react-vite";
import ActionChip from "../../src/widget/ActionChip";

const meta: Meta<typeof ActionChip> = {
  title: "Primitives/ActionChip",
  component: ActionChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**액션 칩 (part)** — [[WhaTapAiWidget]] 랜딩의 단일 제안 실행 버튼. 라벨 + 진입 스태거 페이드인(400 + index*80 ms).",
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
type Story = StoryObj<typeof ActionChip>;

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

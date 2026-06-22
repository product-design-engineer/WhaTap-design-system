import type { Meta, StoryObj } from "@storybook/react-vite";
import AiAttachmentChip from "../../src/widget/AiAttachmentChip";

const meta: Meta<typeof AiAttachmentChip> = {
  title: "Primitives/Ai/AiAttachmentChip",
  component: AiAttachmentChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**첨부 파일 칩 (part)** — [[WhaTapAiWidget]] 입력 영역의 단일 첨부 칩. 파일명(truncate) + MIME 배지(미지정 시 CSV 폴백).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex gap-6px items-center" style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AiAttachmentChip>;

export const Csv: Story = {
  args: {
    name: "metrics_2026.csv",
    mime: "CSV",
  },
};

export const LongNameNoMime: Story = {
  args: {
    name: "very-long-attachment-filename-that-truncates.json",
  },
};

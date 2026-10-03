import type { Meta, StoryObj } from "@storybook/react-vite";
import ProposalSection from "../../src/widget/ProposalSection";

const meta: Meta<typeof ProposalSection> = {
  title: "Composite/ProposalSection",
  component: ProposalSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**제안 섹션 (part)** — [[AiDashboardProposal]] 의 단일 섹션. 이모지 헤딩 + 굵은 제목 + bullet 목록.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col" style={{ width: 440 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProposalSection>;

export const Performance: Story = {
  args: {
    emoji: "📈",
    title: "성능",
    bullets: ["CPU 사용률", "Wait Class 분포", "Active Sessions"],
  },
};

export const Capacity: Story = {
  args: {
    emoji: "💾",
    title: "용량",
    bullets: ["테이블스페이스 사용량", "ASM 디스크 그룹"],
  },
};

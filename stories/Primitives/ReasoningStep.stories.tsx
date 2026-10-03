import type { Meta, StoryObj } from "@storybook/react-vite";
import ReasoningStep from "../../src/widget/ReasoningStep";

const meta: Meta<typeof ReasoningStep> = {
  title: "Primitives/ReasoningStep",
  component: ReasoningStep,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**[[AiReasoning]] 카드의 단일 추론 단계 행.** `running: true` 면 회전 spinner + 점 애니메이션(진행 중), " +
          "false 면 brand-blue 체크 원(완료). 보통 AiReasoning 의 `steps.map` 안에서 렌더.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ReasoningStep>;

export const Complete: Story = {
  args: {
    label: "스레드 상태 조회 완료",
    running: false,
  },
};

export const Running: Story = {
  args: {
    label: "원인 가설 도출 중...",
    running: true,
  },
};

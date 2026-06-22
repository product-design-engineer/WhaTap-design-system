import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiLoadingMessage } from "@whatap/design-system/widget";

const meta: Meta<typeof AiLoadingMessage> = {
  title: "Primitives/Ai/AiLoadingMessage",
  component: AiLoadingMessage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**AI 로딩 메시지** — 점 애니메이션 + 텍스트. 도구 호출 시작 / 분석 진행 중 짧은 안내용.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiLoadingMessage>;

export const Default: Story = { args: {} };
export const Custom: Story = { args: { text: "Kubernetes 이벤트 로그를 분석하는 중입니다." } };

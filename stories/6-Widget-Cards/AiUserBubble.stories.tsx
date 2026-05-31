import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiUserBubble } from "@whatap/design-system/widget";

const meta: Meta<typeof AiUserBubble> = {
  title: "WhaTap AI/Cards/AiUserBubble",
  component: AiUserBubble,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**사용자 발화 버블.** 우측 정렬, #f5f5f5 배경, 4px 라운드, 최대 폭 85%. AI 메시지 시퀀스 안에서 사용자 입력 표시.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiUserBubble>;

export const Default: Story = { args: { children: "현재 상태 요약해줘" } };
export const LongText: Story = { args: { children: "지금 프로젝트 전체 서버 디스크 사용량 90% 이상일때 Critical 알림 발생하도록 설정해주세요." } };
export const MultiLine: Story = { args: { children: "다음 두 가지 모두 확인해주세요:\n1. GPU MIG 슬라이스 상태\n2. kube_event FailedScheduling 빈도" } };

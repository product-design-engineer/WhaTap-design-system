import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExecutionResult } from "@whatap/design-system/widget";

const meta: Meta<typeof ExecutionResult> = {
  title: "Primitives/ExecutionResult",
  component: ExecutionResult,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**실행 결과 카드** — success / failure / unknown 3가지 variant. timestamp + body + bullets + details + footer 조합.",
      },
    },
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["success", "failure", "unknown"] },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ExecutionResult>;

export const Success: Story = {
  args: {
    variant: "success",
    timestamp: "2026-05-28 12:34:56",
    body: "알림 규칙이 정상 등록되었습니다.",
    bullets: ["디스크 사용량 ≥ 90% Critical 알림 활성", "Slack #whatap-alerts 채널 수신 확인"],
    footer: "재발 시 즉시 알림이 전송됩니다.",
  },
};

export const Failure: Story = {
  args: {
    variant: "failure",
    timestamp: "2026-05-28 12:35:14",
    body: "알림 규칙 등록에 실패했습니다.",
    bullets: ["오류: 권한 부족 (PROJECT_ADMIN 필요)"],
    footer: "관리자에게 권한 부여 후 재시도하세요.",
  },
};

export const Unknown: Story = {
  args: {
    variant: "unknown",
    timestamp: "2026-05-28 12:36:01",
    body: "결과를 확인할 수 없습니다.",
    details: [
      { label: "Job ID", value: "exec-2026-05-28-abc123" },
      { label: "마지막 응답", value: "타임아웃 (60초)" },
    ],
    footer: "Job 상태는 [관리 > 작업 큐] 에서 확인 가능합니다.",
  },
};

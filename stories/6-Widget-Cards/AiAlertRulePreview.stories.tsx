import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiAlertRulePreview } from "@whatap/design-system/widget";

const meta: Meta<typeof AiAlertRulePreview> = {
  title: "Composite/Ai/AiAlertRulePreview",
  component: AiAlertRulePreview,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**알림 규칙 미리보기 카드** — KV 필드 리스트 + (옵션) 참고 사항. AI 가 작성한 룰을 등록 전 사용자 확인용.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiAlertRulePreview>;

export const Default: Story = {
  args: {
    fields: [
      { label: "이름", value: "[AI] 디스크 사용량 Critical" },
      { label: "심각도", value: "🔴 Critical" },
      { label: "대상", value: "프로젝트 전체 서버 (15대)" },
      { label: "조건", value: "disk_usage_percent >= 90" },
      { label: "주기", value: "60초" },
      { label: "억제", value: "30분 (중복 알림 방지)" },
      { label: "수신 채널", value: "Slack #whatap-alerts" },
    ],
    notes: [
      "동일 룰이 이미 존재하면 덮어쓰지 않고 새 이름으로 추가",
      "주말 야간(22:00–06:00) 은 자동 mute",
    ],
  },
};

export const KubeEventRule: Story = {
  args: {
    title: "GPU Pod 스케쥴링 실패 알림",
    fields: [
      { label: "조건", value: "kube_event $reason == FailedScheduling AND $namespace == gpu" },
      { label: "주기", value: "60초" },
      { label: "심각도", value: "🟡 Warning" },
    ],
  },
};

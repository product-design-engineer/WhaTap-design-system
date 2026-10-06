import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventList } from "@whatap/design-system/widget";

const meta: Meta<typeof EventList> = {
  title: "Composite/EventList",
  component: EventList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**이벤트/알림 목록** — 시간 + severity 배지 + 소스 + 한 줄 메시지. critical/warning/info 톤.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof EventList>;

export const RecentAlerts: Story = {
  args: {
    summary: "최근 24시간 중 critical 3건, warning 7건",
    rows: [
      { time: "14:32", severity: "critical", source: "server-prod-01", message: "디스크 사용량 92% 도달" },
      { time: "13:55", severity: "warning",  source: "oracle_dnx/RAC-1", message: "Long active session ≥ 5분" },
      { time: "12:18", severity: "critical", source: "k8s-gpu-04", message: "Pod 스케줄링 실패 3회 연속" },
      { time: "09:42", severity: "warning",  source: "server-prod-02", message: "CPU avg 78% (5분 평균)" },
      { time: "06:30", severity: "info",     source: "system", message: "주간 보고서 발송 완료" },
    ],
  },
};

export const NoEvents: Story = {
  args: {
    summary: "최근 24시간 동안 알림 없음",
    rows: [],
  },
};

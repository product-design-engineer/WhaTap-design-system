import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiDashboardProposal } from "@whatap/design-system/widget";

const meta: Meta<typeof AiDashboardProposal> = {
  title: "WhaTap AI/Cards/AiDashboardProposal",
  component: AiDashboardProposal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**대시보드 제안 카드** — intro + 위치 안내 + 섹션(이모지+제목+bullets) 다수 + 마무리 질문.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiDashboardProposal>;

export const Default: Story = {
  args: {
    intro: "oracle_dnx 프로젝트에 적용된 RAC 지표를 활용한 통합 모니터링 대시보드를 제안합니다.",
    locationHeading: "구성 위치",
    locationLabel: "DB > 대시보드 > RAC 클러스터 (임시 프리셋)",
    sections: [
      {
        emoji: "📊",
        title: "성능 지표",
        bullets: ["CPU Usage", "Memory", "Disk Usage", "gc cr block receive time"],
      },
      {
        emoji: "⚠️",
        title: "대기/잠금",
        bullets: ["Wait Class", "Long Active Session Count", "Lock Waiting Session Count"],
      },
      {
        emoji: "🚨",
        title: "알림 상태",
        bullets: ["Alarm State", "Contention Wait Count"],
      },
    ],
    closingQuestion: "이대로 적용하고 트렌드를 확인할까요?",
  },
};

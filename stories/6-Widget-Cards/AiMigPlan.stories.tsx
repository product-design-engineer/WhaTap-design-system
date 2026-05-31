import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiMigPlan } from "@whatap/design-system/widget";

const meta: Meta<typeof AiMigPlan> = {
  title: "WhaTap AI/Cards/AiMigPlan",
  component: AiMigPlan,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**MIG 통합 기획 카드** — bullet 항목 + 행 단위 구성/비용 표 + 통합 비용 요약 + 우선순위 액션.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiMigPlan>;

export const Default: Story = {
  args: {
    bullets: [
      "A100 1대를 MIG로 4분할하여 inference / training / 분석 / 백업 워크로드 모두 수용",
      "비용 75% 절감 + 자원 활용률 32% → 78% 상승",
    ],
    rows: [
      { label: "Inference", config: "MIG (3g.40gb × 1)", monthly: "₩520,125" },
      { label: "Training",  config: "MIG (2g.20gb × 1)", monthly: "₩346,750" },
      { label: "분석/EDA",  config: "MIG (1g.10gb × 2)", monthly: "₩268,800" },
      { label: "백업",      config: "MIG (1g.10gb × 1)", monthly: "₩134,400" },
    ],
    total: "₩1,580,000/월",
    totalNote: "기존 대비 81% 절감",
    actions: [
      { step: 1, body: "테스트 환경에 MIG 구성 적용 (1주)" },
      { step: 2, body: "트래픽 가장 적은 시간대(02:00-04:00 KST)에 production 전환" },
      { step: 3, body: "30분 모니터링 후 미회복 시 자동 롤백" },
    ],
  },
};

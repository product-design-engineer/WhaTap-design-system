import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlanProposal } from "@whatap/design-system/widget";

const meta: Meta<typeof PlanProposal> = {
  title: "Composite/PlanProposal",
  component: PlanProposal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**실행 계획 제안 카드** — 요약 불릿 + 항목별 구성 · 비용 비교 표 + 합계 + 우선순위 액션. AI 가 «이렇게 바꾸자» 를 제안할 때 쓴다(구 `MigPlan`).",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PlanProposal>;

/** 범용 예 — 인스턴스 다운사이징 제안. 제목은 제안의 내용을 말한다. */
export const Default: Story = {
  args: {
    heading: "인스턴스 다운사이징 제안 — 야간 유휴 서버",
    bullets: [
      "평균 CPU 12% 인 서버 4대를 한 단계 작은 타입으로 변경",
      "월 비용 38% 절감 · 피크 시간 응답시간 영향 없음(최근 30일 기준)",
    ],
    columns: ["서버", "변경 구성", "월 비용"],
    rows: [
      { label: "현재", detail: "c5.2xlarge × 4", value: "₩1,240,000" },
      { label: "제안", detail: "c5.xlarge × 4", value: "₩768,000", highlight: true },
    ],
    total: "₩472,000",
    totalNote: "/월 절감",
    actions: [
      { step: 1, body: "스테이징에서 1대 먼저 변경해 24시간 관찰" },
      { step: 2, body: "트래픽이 가장 적은 시간대에 나머지 3대 변경" },
      { step: 3, body: "응답시간 임계치 초과 시 이전 타입으로 되돌림" },
    ],
  },
};

/** GPU MIG 분할 제안 — 이 카드가 처음 만들어진 사례(구 `MigPlan` 기본 예시). */
export const GpuSplit: Story = {
  args: {
    heading: "GPU 분할 제안 — A100 활용 전략",
    bullets: [
      "A100 1대를 MIG로 4분할하여 inference / training / 분석 / 백업 워크로드 모두 수용",
      "비용 75% 절감 + 자원 활용률 32% → 78% 상승",
    ],
    columns: ["워크로드", "분할 구성", "월 비용"],
    rows: [
      { label: "Inference", detail: "MIG (3g.40gb × 1)", value: "₩520,125" },
      { label: "Training", detail: "MIG (2g.20gb × 1)", value: "₩346,750" },
      { label: "분석/EDA", detail: "MIG (1g.10gb × 2)", value: "₩268,800" },
      { label: "백업", detail: "MIG (1g.10gb × 1)", value: "₩134,400" },
    ],
    totalLabel: "통합 비용",
    total: "₩1,580,000/월",
    totalNote: "기존 대비 81% 절감",
    actions: [
      { step: 1, body: "테스트 환경에 MIG 구성 적용 (1주)" },
      { step: 2, body: "트래픽 가장 적은 시간대(02:00-04:00 KST)에 production 전환" },
      { step: 3, body: "30분 모니터링 후 미회복 시 자동 롤백" },
    ],
  },
};

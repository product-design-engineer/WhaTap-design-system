import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCard, AiSectionHeading, AiBulletList } from "@whatap/design-system/widget";

/**
 * Stories for [[AiBulletList]] — 위젯 본문의 통일 bullet list.
 */
const meta: Meta<typeof AiBulletList> = {
  title: "WhaTap AI/Primitives/AiBulletList",
  component: AiBulletList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**위젯 본문의 통일 bullet list.** 12px 들여쓰기 + disc bullet + 한국어 폰트. " +
          "AI 응답에서 가장 흔한 'key findings', '권장 조치' 등 표현. 3개 이상 항목 나열에 적합 " +
          "(1-2개면 인라인 텍스트가 자연스러움).",
      },
    },
  },
  argTypes: {
    items: {
      description: "항목 문자열 배열. 마크업 필요하면 컴포넌트 분리 검토.",
      control: "object",
    },
    size: {
      description: "텍스트 크기. sm(12px, 회색, 기본) / md(13px, 진한 회색).",
      control: { type: "radio" },
      options: ["sm", "md"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 440, maxWidth: "100%" }}>
        <AiCard>
          <Story />
        </AiCard>
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AiBulletList>;

/** 기본 — 3 항목, sm 크기 (12px 회색). */
export const Default: Story = {
  args: {
    items: [
      "httpc 응답시간 4,294ms — 압도적 dominant",
      "method/sql/dbc/socket 은 정상 범위",
      "외부 API 의존도 ↑ 가능성 높음",
    ],
  },
};

/** md 크기 — 13px 진한 회색. 카드 헤더 바로 아래 본문에 적합. */
export const MediumSize: Story = {
  args: {
    size: "md",
    items: [
      "GPU MIG 슬라이스 부족",
      "Pod 스케줄링 대기 시간 증가",
      "kube_event FailedScheduling 빈도 ↑",
    ],
  },
};

/** 짧은 항목 — 단어 수준. */
export const ShortItems: Story = {
  args: {
    items: ["조회", "분석", "보고", "조치 제안"],
  },
};

/** 긴 항목 (줄바꿈 처리) — 정책 권고 텍스트 풀버전. */
export const LongItems: Story = {
  args: {
    size: "md",
    items: [
      "현재 critical 알림이 발생한 모든 프로젝트에 대해 GPU MIG 슬라이스 재배치를 수행하면 평균 p99 응답시간이 2.3s 감소할 것으로 예상됩니다.",
      "단, 트래픽이 가장 적은 시간대(02:00-04:00 KST)에 진행할 것을 권장하며, 진행 중에는 약 12분간 일부 inference 요청이 지연될 수 있습니다.",
      "재배치 완료 후 30분간 모니터링이 필요하며, 회복되지 않으면 자동으로 이전 구성으로 롤백됩니다.",
    ],
  },
};

/** 많은 항목 (10+) — 스크롤 없이 카드 안 노출. */
export const ManyItems: Story = {
  args: {
    items: [
      "Step 1 — whatap_thread_state 조회 (3 step 완료)",
      "Step 2 — whatap_visualize_chart 실행",
      "Step 3 — httpc dominant pattern 감지",
      "Step 4 — 분류 결과 도출 (critical 1, warning 2, info 3)",
      "Step 5 — 원인 가설 정리",
      "Step 6 — 권장 조치 작성",
      "Step 7 — follow-up question 준비",
      "Step 8 — message actions 등록 완료",
    ],
  },
};

/** 카드 컨텍스트 안 — heading 과 함께 사용. */
export const InCardWithHeading: Story = {
  args: {
    items: [
      "current p99 1.2s (정상)",
      "Active TX 427 / RPS 12.3",
      "외부 API 지연 없음",
    ],
  },
  render: (args) => (
    <>
      <AiSectionHeading tone="info">정상 동작 — 주요 메트릭</AiSectionHeading>
      <AiBulletList {...args} />
    </>
  ),
};

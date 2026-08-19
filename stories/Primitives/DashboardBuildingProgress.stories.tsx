import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardBuildingProgress } from "@whatap/design-system";

/**
 * Stories for [[DashboardBuildingProgress]] — 대시보드 구성/적용 중 공용 로딩 화면.
 */
const meta: Meta<typeof DashboardBuildingProgress> = {
  title: "Primitives/DashboardBuildingProgress",
  component: DashboardBuildingProgress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**대시보드 구성·적용 중 공용 로딩 화면.** Gradient ring spinner + title + subtitle + " +
          "단계별 ✓ progress 리스트. `card` prop 으로 흰색 카드 chrome 토글, `intervalMs` 로 단계 진행 속도 조정.\n\n" +
          "사용처: `/db` RAC 대시보드 구성 (5s·5steps·card), `/flex-board` 진입 직후 (3.2s·4steps·no-card).",
      },
    },
  },
  argTypes: {
    steps: {
      description: "단계별 라벨. 길이만큼 progress 진행.",
      control: "object",
    },
    title: {
      description: "메인 제목 (굵게).",
      control: "text",
    },
    subtitle: {
      description: "보조 한 줄 (회색). 기본 '잠시만 기다려 주세요'.",
      control: "text",
    },
    intervalMs: {
      description: "단계별 ✓ 전환 간격 (ms). 전체 시간 = steps.length × intervalMs.",
      control: { type: "number", min: 100, max: 2000, step: 50 },
    },
    card: {
      description: "true → 흰 카드 chrome (border + radius). false → 콘텐츠만.",
      control: "boolean",
    },
    background: {
      description: "배경색 (CSS color). card=true 면 카드 배경, false 면 컨테이너 배경.",
      control: "color",
    },
  },
};
export default meta;
type Story = StoryObj<typeof DashboardBuildingProgress>;

/** `/db` RAC 대시보드 구성 — 5s · 5 steps · 카드 chrome. */
export const DbRacBuild: Story = {
  args: {
    card: true,
    title: "RAC 대시보드 구성 중...",
    intervalMs: 1000,
    steps: [
      "Oracle DB 인스턴스 정보 조회",
      "RAC 클러스터 메트릭 정의 생성",
      "Yard API · 차트 데이터 수집",
      "패널 레이아웃 배치",
      "대시보드 프리셋 등록",
    ],
  },
};

/** `/flex-board` 진입 직후 — 3.2s · 4 steps · 카드 chrome 없음 (배경 그대로). */
export const FlexBoardBuild: Story = {
  args: {
    title: "전체 프로젝트 장애 통합 모니터링 보드 구성 중...",
    intervalMs: 760,
    background: "var(--color-surface-100)",
    steps: [
      "프로젝트 알림 데이터 수집",
      "이벤트 타임라인 정렬",
      "위젯 레이아웃 배치",
      "Flex 보드 프리셋 등록",
    ],
  },
};

/** 짧은 진행 — 2 step · 380ms 빠른 진행 (가벼운 작업). */
export const QuickProgress: Story = {
  args: {
    card: true,
    title: "설정 적용 중...",
    intervalMs: 380,
    steps: ["설정 저장", "캐시 갱신"],
  },
};

/** 긴 진행 — 8 step (복잡한 구성). */
export const LongProgress: Story = {
  args: {
    card: true,
    title: "통합 보드 풀-셋업",
    subtitle: "총 8 단계 — 약 8 초 소요",
    intervalMs: 1000,
    steps: [
      "프로젝트 메타 조회",
      "알림 데이터 수집",
      "이벤트 타임라인 정렬",
      "Active TX 메트릭 집계",
      "GPU 사용률 분석",
      "위젯 레이아웃 배치",
      "권한 검사",
      "프리셋 등록 완료",
    ],
  },
};

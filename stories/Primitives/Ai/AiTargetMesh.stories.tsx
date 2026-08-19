import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiTargetMesh } from "@whatap/design-system/widget";

/**
 * Storybook stories for [[AiTargetMesh]] — 대상 군집 메시.
 *
 * 점 하나 = 대상 하나. 확인할 것 3가지:
 *   ① 면적이 곧 개수인가 (반지름 ∝ √개수)
 *   ② 축척이 바뀌면 범례가 «점 하나가 대상 N개» 로 함께 바뀌는가
 *   ③ 수집 실패가 바깥 테두리부터 빈 점으로 헐어 보이는가
 */
const meta: Meta<typeof AiTargetMesh> = {
  title: "Primitives/Ai/AiTargetMesh",
  component: AiTargetMesh,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**대상 판정 결과의 근거 오브제.** 대상 종류마다 군집 하나이고 군집 면적이 그 종류의 대상 수다. " +
          "이상(위험·경고) 점은 군집 가운데부터 채워 「덩어리 중심이 붉다」로 읽히게 하고, 수집이 끊겨 판정하지 " +
          "못한 대상은 바깥 테두리부터 빈 점으로 그린다. 대상 수가 상한(150점)을 넘으면 점 하나가 여러 대상을 " +
          "뜻하도록 축척이 바뀌며, **바뀐 단위는 범례가 말한다** — 조용히 바꾸면 «면적 = 개수» 약속이 거짓이 된다. " +
          "열 폭은 군집 지름이 아니라 1/N 등폭. 자세한 규칙은 컴포넌트 JSDoc 참고.\n\n" +
          "✅ **Do** — 여러 종류를 한 번에 넘겨 축척을 공통으로 잡기(`items` 통째로) · 판정 진행은 " +
          "`revealedCount` 로 표현(스피너 대신 진행률이 곧 데이터) · 판정 중에는 `interactive={false}` · " +
          "분모는 판정된 수(`total - missing`)로 두기 · 종류 식별은 `iconSrc` 로 · 색은 토큰만 · " +
          "군집 클릭은 그 종류를 묻는 질문으로 연결(`onSelect`)\n\n" +
          "❌ **Don't** — `legend={null}` 로 범례 끄기(축척이 1이 아닐 때 «점 하나 = 대상 하나» 가 거짓이 된다) · " +
          "종류마다 따로 [[meshScaleOf]] 호출(면적 비교가 깨진다) · 눈금을 읽히려는 용도로 쓰기" +
          "(정확한 값은 표 — AiClassificationTable) · 시계열 추이에 사용 · 점 모양을 종류별로 바꾸기" +
          "(같은 개수가 다른 크기로 읽혀 «면적 = 개수» 가 깨진다) · 이상 점을 바깥에 배치 / 수집 실패를 " +
          "안쪽에 배치(둘 다 읽는 방향이 뒤집힌다) · 군집에 상시 카드 표면·쉐도우 얹기(AiCard = 답변으로 오독) · " +
          "`targetMeshDots` 를 렌더마다 호출",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AiTargetMesh>;

const TARGETS = [
  { short: "프로젝트", label: "프로젝트", total: 8, warning: 2, critical: 1 },
  { short: "APM", label: "APM 애플리케이션", total: 24, warning: 3, critical: 2 },
  { short: "서버", label: "서버", total: 46, warning: 5, critical: 1 },
  { short: "컨테이너", label: "컨테이너", total: 132, warning: 4, critical: 0 },
  { short: "DB", label: "데이터베이스", total: 6, warning: 1, critical: 1 },
  { short: "URL", label: "URL", total: 12, warning: 0, critical: 0 },
];

/** 기본 — 전체 228개 대상, 축척 1(점 하나 = 대상 하나). */
export const Default: Story = {
  args: { items: TARGETS },
};

/** 판정 중 — 앞에서부터 3종만 켜진 상태(로딩 오브제 역할). */
export const Judging: Story = {
  args: { items: TARGETS, revealedCount: 3, interactive: false },
};

/** 수집 실패 — 서버 12개 · DB 2개가 바깥 테두리부터 빈 점. 범례 문구도 함께 바뀐다. */
export const CollectGaps: Story = {
  args: {
    items: TARGETS.map((t) =>
      t.short === "서버" ? { ...t, missing: 12 } : t.short === "DB" ? { ...t, missing: 2 } : t,
    ),
  },
};

/** 대규모 — 컨테이너 2,000개. 축척이 자동으로 바뀌고 범례가 «점 하나가 대상 20개» 를 말한다. */
export const ScaledUp: Story = {
  args: {
    items: [
      { short: "APM", label: "APM 애플리케이션", total: 240, warning: 12, critical: 5 },
      { short: "서버", label: "서버", total: 320, warning: 9, critical: 2, missing: 40 },
      { short: "컨테이너", label: "컨테이너", total: 2000, warning: 41, critical: 6 },
      { short: "DB", label: "데이터베이스", total: 6, warning: 1, critical: 1 },
    ],
  },
};

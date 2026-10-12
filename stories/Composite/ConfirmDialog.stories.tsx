import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmDialog, KpiField } from "@whatap/design-system";

/**
 * Stories for [[ConfirmDialog]] — 실행 직전에 대상과 결과를 되읽어 주는 확인 모달(P1 「위험한 실행 확인」).
 *
 * 확인 버튼 라벨은 동작 낱말이고, 본문은 «무엇을 · 그래서 무엇이 바뀌나» 다.
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: "Composite/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      // 스토리가 열린 채 시작하므로 문서 페이지에선 각자 iframe 에 가둔다 — 인라인이면 Modal 의
      // body 스크롤 잠금 · 전면 백드롭이 문서 페이지 전체에 걸려 아래로 내려갈 수 없다.
      story: { inline: false, iframeHeight: 480 },
      description: {
        component:
          "**P1 「위험한 실행 확인」 을 굳힌 확인 모달.** `target` 에 대상, `outcomes` 에 결과를 한 줄씩 적고, 확인 버튼은 동작 낱말(`삭제` · `제외`)이다. " +
          "되돌릴 수 없는 실행은 `tone=\"critical\"`(기본), 약정 · 생성처럼 무겁지만 파괴가 아닌 실행은 `tone=\"primary\"` 로 쓰고 `children` 에 방금 정한 값을 되읽는다. " +
          "되돌릴 수 있는 가벼운 실행에는 쓰지 않는다 — 그 자리는 토스트의 되돌리기다.",
      },
    },
  },
  args: { open: true, onConfirm: () => {}, onClose: () => {} },
};
export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

/** 삭제 — 되돌릴 수 없는 실행. */
export const Delete: Story = {
  args: {
    title: "알림 규칙 삭제",
    target: "「CPU 90% 초과」 규칙을 삭제합니다.",
    outcomes: [{ text: "삭제하면 되돌릴 수 없습니다.", tone: "critical" }],
    confirmLabel: "삭제",
  },
};

/** 제외 — 다른 사람의 사용을 끊는 실행. 결과가 상황마다 갈리면 부르는 쪽이 문장을 고른다. */
export const RemoveMember: Story = {
  args: {
    title: "플랜에서 제외",
    target: (
      <>
        <strong className="font-semibold">김서연</strong> <span className="text-tertiary">kim@whatap.io</span> 을 운영팀 플랜에서 제외합니다.
      </>
    ),
    outcomes: [
      { text: "이 계정은 더 이상 AI 를 쓸 수 없습니다. 개인 무료분은 되돌아오지 않습니다.", tone: "critical" },
      { text: "이번 주기에 쓴 4,960 크레딧은 이 플랜 청구서에 그대로 실립니다." },
    ],
    confirmLabel: "제외",
  },
};

/** 생성 확인 — 약정을 만드는 실행. `primary` 로 쓰고 방금 정한 값을 되읽는다. */
export const CreateWithReadback: Story = {
  args: {
    title: "플랜 만들기 확인",
    size: "md",
    tone: "primary",
    confirmLabel: "플랜 만들기",
    outcomes: [
      { text: "기본 크레딧을 넘으면 쓴 만큼 누적 사용 요금이 붙고, 누적 사용액이 500,000원에 닿으면 멈춥니다." },
      { text: "플랜으로 전환하면 남은 개인 무료분은 사라지고 되돌아오지 않습니다." },
    ],
    children: (
      <div className="grid grid-cols-2 gap-12px">
        <KpiField label="플랜 이름">전체 프로젝트</KpiField>
        <KpiField label="과금 범위">전체 프로젝트 7개</KpiField>
        <KpiField label="월 기본요금">100,000원 · 50,000 크레딧</KpiField>
        <KpiField label="사용량 한계">500,000원</KpiField>
      </div>
    ),
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Notice } from "@whatap/design-system";

/**
 * Stories for [[Notice]] — 화면 흐름 안에 서는 상태 알림 카드.
 */
const meta: Meta<typeof Notice> = {
  title: "Primitives/Notice",
  component: Notice,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**본문 자리에서 말하는 상태 알림.** 좌측 3px 색 띠가 성격을 지고, 제목 한 줄 · 설명 한 줄 · " +
          "(선택) 우측 행동 버튼으로 끝난다. 바탕은 톤의 `soft` 토큰 한 겹 — [[Chip]] `variant=\"soft\"` 와 " +
          "같은 토큰 표를 쓴다. 톤 원색으로 면을 채우지 않는다(그건 «막는» 자리의 어법이다). " +
          "흘려보내도 되는 것은 [[Toast]], 진행을 막고 답을 받아야 하는 것은 [[Modal]] 이다.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "모양 — card(테두리를 두른 한 장) / bare(이미 카드 안인 자리, 테두리·라운드 없음).",
      control: { type: "radio" },
      options: ["card", "bare"],
    },
    tone: {
      description: "성격 — 띠 색. 톤 낱말은 [[Chip]] 과 같다.",
      control: { type: "radio" },
      options: ["primary", "warning", "critical", "success", "neutral"],
    },
    title: { description: "사실 한 줄. 부름말이 아니라 무슨 일이 있었는지.", control: "text" },
    description: { description: "보조 한 줄 — 이름 나열 · 다음에 할 일.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Notice>;

/** Warning — 알아야 하지만 지금 막을 일은 아닌 사정. */
export const Warning: Story = {
  args: {
    tone: "warning",
    title: "삭제된 계정 1개가 추가되어 있습니다",
    description: "신동하",
  },
};

/** Critical — 하던 일이 실제로 멈춘 자리. 돌아갈 길을 함께 준다. */
export const Critical: Story = {
  args: {
    tone: "critical",
    title: "결제수단 검증에 실패해 하던 일이 멈췄습니다",
    description: "카드사에서 승인하지 않았습니다. 카드를 갱신하면 하던 일을 이어서 마칩니다.",
    action: (
      <Button variant="outline" size="lg">
        갱신하지 않고 돌아가기
      </Button>
    ),
  },
};

/** Primary — 방금 한 일의 결과와 되돌리는 길. */
export const WithAction: Story = {
  args: {
    tone: "primary",
    title: "플랫폼개발팀 에서 12명을 추가했습니다",
    description: "이미 추가된 3명은 건너뛰었습니다.",
    action: (
      <Button variant="outline" size="lg">
        되돌리기
      </Button>
    ),
  },
};

/** Bare — 이미 카드 «안» 인 자리. 모서리를 둥글리지 않고 테두리도 두르지 않는다 — 담는 카드의 한 구역으로 읽히게. 바탕은 card 와 같이 톤 soft 한 겹이다. */
export const Bare: Story = {
  render: () => (
    <div
      className="bg-card rounded-8px border border-color-var-color-border-default"
      style={{ padding: 16, maxWidth: 560 }}
    >
      <p className="text-lg font-bold text-primary">운영팀</p>
      <p className="text-base text-tertiary mt-4px">종량제 · 이번 주기 사용량 한계 500,000원</p>
      <div style={{ marginTop: 12 }}>
        <Notice
          variant="bare"
          tone="critical"
          title="2026-08-27 까지 결제하지 않으면 중지됩니다"
          description="마감일까지는 그대로 쓸 수 있습니다. 지나면 중지되어 더 쓸 수 없고, 이미 쓴 만큼은 그대로 청구됩니다."
        />
      </div>
    </div>
  ),
};

/** Neutral — 색을 쓸 이유가 없을 때. 기본값이다. */
export const Neutral: Story = {
  args: {
    title: "이번 주기 사용량은 다음 청구서에 실립니다",
    description: "청구일과 결제수단은 그대로입니다.",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { MailTemplate } from "@whatap/design-system";

/**
 * Stories for [[MailTemplate]] — 와탭이 보내는 알림 메일 한 통의 본문.
 */
const meta: Meta<typeof MailTemplate> = {
  title: "Composite/MailTemplate",
  component: MailTemplate,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**제품 밖에 있는 사람을 부르는 메일의 본문.** 회색 바탕 위 흰 카드 한 장에 로고 · 분류 칩 · 판정이 담긴 제목 · " +
          "본문 · 버튼 하나 · 대체 주소 · 바닥글이 선다. 메일 클라이언트의 크롬은 그리지 않는다 — 그건 남의 화면이다. " +
          "버튼은 하나이고, 받는 사람마다 할 일이 다르면 메일을 가른다. 제품 안의 안내는 [[Notice]] 다.",
      },
    },
  },
  argTypes: {
    category: { description: "제목 위 분류 칩.", control: "text" },
    title: { description: "판정이 담긴 제목. 메일 제목 줄과 같은 문장.", control: "text" },
    greeting: { description: "인사 한 줄. 개인 편지함일 때만.", control: "text" },
    action: { description: "할 일 하나. 없으면 알리기만 한다.", control: false },
    footer: { description: "왜 이 메일을 받았는가.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof MailTemplate>;

const SIGN_IN = "https://service.whatap.io/account/sign-in?from=email&next=";

/** 결제권한자에게 — 판정 · 그대로인 것 · 할 일. 버튼은 그 자리로 간다. */
export const Default: Story = {
  args: {
    category: "WhaTap-AI 플랜",
    title: "운영팀 플랜 · 사용량 한계에 닿아 AI 사용이 멈췄습니다",
    greeting: "오경호 님,",
    action: { label: "플랜 보기", href: `${SIGN_IN}%2Faccount%2Fbilling%2Fplan%3Fid%3Dplan-ops` },
    footer: "이 메일은 WhaTap-AI 플랜 알림입니다. 플랜의 결제권한자와 과금 범위 계정에게 보냅니다.",
  },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <MailTemplate {...args}>
        <p style={{ margin: 0 }}>새 질문만 멈췄습니다. 지금까지의 대화와 이미 받은 판정은 그대로 있습니다.</p>
        <p style={{ margin: 0 }}>다음 주기가 시작되면 기본 크레딧이 다시 지급되어 이어서 씁니다.</p>
      </MailTemplate>
    </div>
  ),
};

/** 할 일이 없는 알림 — 버튼도 대체 주소도 없다. 알리기만 한다. */
export const NoticeOnly: Story = {
  args: {
    category: "WhaTap-AI 플랜",
    title: "운영팀 플랜이 8월 31일에 닫힙니다",
    greeting: "이준호 님,",
    footer: "이 메일은 WhaTap-AI 플랜 알림입니다. 플랜의 결제권한자와 과금 범위 계정에게 보냅니다.",
  },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <MailTemplate {...args}>
        <p style={{ margin: 0 }}>결제권한자(오경호)가 해지를 예약해 8월 31일에 플랜이 닫힙니다. 그때까지는 그대로 씁니다.</p>
        <p style={{ margin: 0 }}>닫힌 뒤에는 이 플랜 범위의 프로젝트에서 AI 를 쓸 수 없습니다.</p>
      </MailTemplate>
    </div>
  ),
};

/** 요청 — 받는 사람이 할 일이 정해져 있는 메일. 버튼이 그 절차 자리로 데려간다. */
export const Request: Story = {
  args: {
    category: "WhaTap-AI 플랜",
    title: "윤태호 님이 운영팀 플랜에 추가를 요청했습니다",
    greeting: "오경호 님,",
    action: { label: "계정 추가", href: `${SIGN_IN}%2Faccount%2Fbilling%2Fplan%3Fid%3Dplan-ops%26pick%3Dopen%26add%3Du-yoon` },
    footer: "이 메일은 WhaTap-AI 플랜 알림입니다. 플랜의 결제권한자와 과금 범위 계정에게 보냅니다.",
  },
  render: Default.render,
};

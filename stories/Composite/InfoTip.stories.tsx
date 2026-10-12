import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoTip, KpiField } from "@whatap/design-system";

/**
 * Stories for [[InfoTip]] — 글자 옆 ⓘ 아이콘 버튼 + 툴팁.
 *
 * 툴팁 트리거를 밑줄로 그리지 않는다. 설명이 붙는 글자는 그대로 두고 바로 뒤에 InfoTip 을 둔다.
 */
const meta: Meta<typeof InfoTip> = {
  title: "Composite/InfoTip",
  component: InfoTip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**글자 옆 ⓘ 툴팁 트리거.** 원 안에 영문 i 가 든 16px 버튼. hover · focus 로 [[Tooltip]] 이 열린다. " +
          "툴팁 트리거를 점선 · 실선 밑줄로 표현하지 않는다 — 밑줄은 링크로 읽히고 트리거 경계가 흐리다.",
      },
    },
  },
  argTypes: {
    content: { description: "툴팁 본문 (ReactNode).", control: "text" },
    label: { description: "스크린리더 이름. default 「도움말」.", control: "text" },
    placement: { control: { type: "select" }, options: ["top", "right", "bottom", "left"] },
    open: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InfoTip>;

/** 기본 — 아이콘만. */
export const Default: Story = {
  args: { content: "종량제 사용량 한계는 기본 크레딧이 소진된 후 누적 사용액에 적용됩니다." },
};

/** 값 문장 옆 — 글자는 밑줄 없이, 사이 4px. */
export const BesideText: Story = {
  render: () => (
    <span className="text-base text-primary" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      한계 금액 200,000원
      <InfoTip content="종량제 사용량 한계는 기본 크레딧이 소진된 후 누적 사용액에 적용됩니다." />
    </span>
  ),
};

/** 접어 둔 목록 — 「외 N」 의 나머지를 툴팁으로. */
export const CollapsedList: Story = {
  render: () => (
    <span className="text-base text-primary" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      결제 API · 백오피스 <span className="text-tertiary">외 8</span>
      <InfoTip label="나머지 프로젝트" content="주문 API · 정산 배치 · 회원 서비스 · 검색 API · 알림 발송 · 관리자 콘솔 · 로그 수집기 · 사내 위키" />
    </span>
  ),
};

/** 읽기 칸 안 — KpiField 값 옆. */
export const InKpiField: Story = {
  render: () => (
    <KpiField label="결제수단">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        신한 **** 4412
        <InfoTip content="결제수단은 계정 결제 정보 화면에서 편집할 수 있습니다." />
      </span>
    </KpiField>
  ),
};

/** 강제 표시 — 디자인 확인용. */
export const Pinned: Story = {
  args: { content: "툴팁 본문이 이 자리에 섭니다.", open: true },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiCard, AiCaption } from "@whatap/design-system/widget";

/**
 * Stories for [[AiCaption]] — 위젯 카드 내부 sub-section 라벨.
 *
 * 11px 굵은 회색 대문자 라벨. 카드 안의 sub-section 머리에 붙여 영역 분류 명시.
 */
const meta: Meta<typeof AiCaption> = {
  title: "WhaTap AI/Primitives/AiCaption",
  component: AiCaption,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**카드 sub-section 의 작은 라벨.** 11px 굵은 #757575 색 대문자 텍스트 + 0.3px tracking. " +
          "REASONING, COST ANALYSIS 같은 영문 키 라벨 또는 짧은 한국어 sub-heading 으로 사용. " +
          "카드 메인 헤딩이 필요할 때는 `AiSectionHeading` 사용.",
      },
    },
  },
  argTypes: {
    children: {
      description: "캡션 텍스트 — 짧은 한 줄 권장 (영문 키 또는 한국어 sub-heading).",
      control: "text",
    },
  },
  decorators: [(Story) => (<div style={{ width: 440, maxWidth: "100%" }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof AiCaption>;

/** 영문 키 캡션 — REASONING / COST ANALYSIS 등 시나리오에서 가장 흔한 패턴. */
export const EnglishKey: Story = {
  args: { children: "REASONING" },
};

/** 짧은 한국어 캡션 — 영문 키가 어색한 도메인 단어용. */
export const KoreanShort: Story = {
  args: { children: "최근 5분 스레드 상태" },
};

/** 실제 카드 안 컨텍스트 — 두 sub-section 위에 caption 부착한 패턴. */
export const InCardContext: Story = {
  args: {},
  render: () => (
    <AiCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <AiCaption>REASONING</AiCaption>
        <p style={{ fontSize: 13, color: "#222", lineHeight: 1.5, margin: 0 }}>
          최근 5분 액티브 스레드 5종을 비교한 결과 httpc 가 압도적 dominant 입니다.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
        <AiCaption>분류 결과</AiCaption>
        <p style={{ fontSize: 13, color: "#222", lineHeight: 1.5, margin: 0 }}>
          httpc — 즉시 조치 필요
        </p>
      </div>
    </AiCard>
  ),
};

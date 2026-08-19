import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  WhaTapAiWidget,
  AiCard,
  AiSectionHeading,
  AiBulletList,
} from "@whatap/design-system";
import { AiUserBubble, AiChatExchange } from "@whatap/design-system/widget";

/**
 * Stories for [[WhaTapAiWidget]] — AI 위젯 (480px 우측 패널).
 */
const meta: Meta<typeof WhaTapAiWidget> = {
  title: "Shell/Ai/Widget",
  component: WhaTapAiWidget,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**AI 위젯 — 480px 우측 패널.** 헤더(close/new/fullscreen) + 본문(messages 또는 landing) + 입력창 + 토큰 사용량 pill. " +
          "AI 메시지 시퀀스는 `messages` prop 으로 ReactNode 주입 — 일반적으로 `<AiCard>` + primitive 조합으로 구성. " +
          "`showLanding=true` (기본) 일 때 초기 화면에 사용자/페이지 강조 + 추천 액션 노출.",
      },
    },
  },
  argTypes: {
    open: { description: "위젯 열림 여부.", control: "boolean" },
    user: { description: "헤더 사용자 라벨.", control: "text" },
    pageHighlight: { description: "Landing 의 페이지 강조 텍스트.", control: "text" },
    actions: { description: "Landing 의 추천 액션 (string[]).", control: "object" },
    inputPlaceholder: { description: "입력창 placeholder.", control: "text" },
    showLanding: { description: "Landing 화면 노출 (messages 없을 때).", control: "boolean" },
    tokenInput: { description: "입력 토큰 카운트 — 헤더 옆 pill.", control: "number" },
    tokenOutput: { description: "출력 토큰 카운트.", control: "number" },
  },
  decorators: [
    (Story) => (
      <div style={{ height: 720, position: "relative", background: "var(--color-surface-50)", display: "flex", justifyContent: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof WhaTapAiWidget>;

/** 닫힘 상태 — open=false. */
export const Closed: Story = { args: { open: false } };

/** Landing 상태 — 사용자/페이지/추천 액션 노출. */
export const Landing: Story = {
  args: {
    open: true,
    user: "Wha-tap Kim",
    pageHighlight: "DB / oracle_dnx",
    actions: ["현재 상태 요약", "RAC 클러스터 분석", "느린 SQL Top 5"],
  },
};

/** 메시지 시퀀스 — AI 분석 응답 카드 다수 + 사용자 버블. */
export const WithMessages: Story = {
  args: {
    open: true,
    showLanding: false,
    user: "Wha-tap Kim",
    pageHighlight: "APM",
    messages: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AiUserBubble>실행 중 스레드 상태 분석해주세요.</AiUserBubble>
        <AiCard delay={0}>
          <AiSectionHeading tone="critical">🔴 핵심 이상 징후</AiSectionHeading>
          <AiBulletList items={[
            "httpc 응답시간 4,294ms — 압도적 dominant",
            "method/sql/dbc/socket 은 정상 범위",
          ]}/>
        </AiCard>
        <AiCard delay={360}>
          <AiSectionHeading emoji="🔍">원인 가설</AiSectionHeading>
          <AiBulletList items={["외부 API 의존도 ↑", "재시도 정책 미적용"]} />
        </AiCard>
        <AiCard delay={720}>
          <AiSectionHeading tone="info">💡 권장 조치</AiSectionHeading>
          <AiBulletList items={["Circuit breaker 도입", "Timeout 설정 명확화"]} />
        </AiCard>
      </div>
    ),
  },
};

/** 인터랙티브 — open 토글 + 입력 제출. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      const [input, setInput] = useState("");
      return (
        <>
          {!open && (
            <button
              onClick={() => setOpen(true)}
              style={{
                position: "absolute", top: 12, right: 12, zIndex: 10,
                padding: "6px 12px", border: "1px solid var(--color-brand-blue)", background: "var(--color-card)",
                color: "var(--color-brand-blue)", borderRadius: 4, fontSize: 13, cursor: "pointer",
              }}
            >
              위젯 열기
            </button>
          )}
          <WhaTapAiWidget
            open={open}
            onClose={() => setOpen(false)}
            user="Wha-tap Kim"
            pageHighlight="DB / oracle_dnx"
            inputValue={input}
            onSubmit={(v) => { console.log("submit:", v); setInput(""); }}
          />
        </>
      );
    };
    return <Demo />;
  },
};

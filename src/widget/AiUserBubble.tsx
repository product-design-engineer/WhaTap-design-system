/**
 * AiUserBubble — 채팅 스레드에서 사용자가 입력한 메시지를 담는 우측 정렬 버블 (Figma 27110:53409).
 *
 * ## Purpose
 * AI 대화 스레드의 "사람 발화" 단일 building block. 우측 정렬(`justify-end`)·max-width 85%·
 * surface-50 배경의 4px 라운드 버블로, 사용자 입력의 줄바꿈을 `pre-wrap` 으로 보존.
 * 사용자 메시지를 인라인 `<div>` 로 새로 짜지 말 것 — 정렬·색·폭 일관성은 이 컴포넌트가 보장.
 *
 * ## When to use
 * - 채팅 스레드 안의 사용자 발화 한 줄/한 문단.
 * - [[AiChatExchange]] 등 상위 교환 블록의 질문 슬롯.
 *
 * ## When NOT to use
 * - AI 응답 본문 → 응답 버블/카드 컴포넌트([[AiInsightSection]] · [[AiChatExchange]] 의 응답 슬롯).
 * - 질문+응답을 한 번에 묶을 때 → [[AiChatExchange]] (내부에서 이 버블을 자동 사용).
 * - 새 prompt 입력 → [[AiPromptInput]] · [[AiInlinePrompt]].
 *
 * ## Composition rules
 * - 배경은 surface-50, 라운드 4px(radius_sm), 패딩 8px(spacing_xs) — Figma exact, 인라인 hex 금지.
 * - 텍스트는 `whitespace-pre-wrap` + `word-break: break-word` 로 사용자 입력 줄바꿈/긴 토큰 보존.
 * - 우측 정렬은 루트 `flex justify-end` 가 담당 — 부모에서 정렬을 재정의하지 말 것.
 *
 * @example
 * ```tsx
 * <AiUserBubble>지난 1시간 에러율 추이 알려줘</AiUserBubble>
 * ```
 */
import type { ReactNode } from "react";

export type AiUserBubbleProps = {
  /** 사용자 입력 본문. 줄바꿈은 \n 그대로. */
  children: ReactNode;
  /** 추가 좌측 컨텐츠가 들어갈 wrapper 영역 (예: 첨부 미리보기). 거의 사용 안 함. */
  className?: string;
};

export default function AiUserBubble({ children, className }: AiUserBubbleProps) {
  return (
    <div className={`flex justify-end w-full ${className ?? ""}`} data-node-id="27110:53409">
      <div
        className="rounded-4px px-8px py-8px"
        style={{
          background: "var(--color-surface-50)",
          maxWidth: "85%",
        }}
      >
        <p
          className="text-lg text-primary tracking-default leading-normal whitespace-pre-wrap"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-regular)",
            wordBreak: "break-word",
            margin: 0,
          }}
          data-node-id="27110:53411"
        >
          {children}
        </p>
      </div>
    </div>
  );
}

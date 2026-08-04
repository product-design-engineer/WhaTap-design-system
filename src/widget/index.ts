/**
 * WhaTap Design System — widget barrel.
 *
 * AI 위젯 안에서 사용하는 토큰 / 프리미티브 / 메시지 카드 컴포넌트.
 * 외부 사용:
 *   import { AiCard, AiToneBadge, AiClassificationTable, TONE_DOT } from "@whatap/design-system/widget";
 */

// Tokens — 신규 (의미 기반 단일 출처, AI-friendly description 포함)
export {
  tokens,
  type SemanticIntent,
  type Token,
} from "./_tokens";

// Tokens — backward compat (@deprecated, 점진 마이그레이션)
export {
  TONE_BG,
  TONE_DOT,
  TONE_TEXT,
  TONE_LABEL,
      type Tone,
  type LegacyTone,
} from "./_tokens";

// Primitives
export {
  AiCard,
  AiCaption,
  AiSectionHeading,
  AiToneBadge,
  AiBulletList,
} from "./_primitives";

// AI buttons (위젯 토글 · 송신 등 AI 전용 trigger)
export { default as AiAssistantButton } from "./AiAssistantButton";
export type { AiAssistantButtonProps, AiAssistantButtonSize } from "./AiAssistantButton";
export { default as AiSendButton } from "./AiSendButton";
export type { AiSendButtonProps } from "./AiSendButton";

// AI input (사용자 자연어 입력창 — Figma 27087:3416)
export { default as AiPromptInput } from "./AiPromptInput";
export type { AiPromptInputProps, AiPromptAttachment } from "./AiPromptInput";
// AI input — inline (압축형: 토큰 pill · caption 없음)
export { default as AiInlinePrompt } from "./AiInlinePrompt";
export type {
  AiInlinePromptProps,
  AiInlineAttachment,
  AiPromptSuggestion,
} from "./AiInlinePrompt";

// Message cards
export { default as AiAlertRulePreview } from "./AiAlertRulePreview";
export { default as AiChatExchange } from "./AiChatExchange";
export { default as AiChoiceButtons } from "./AiChoiceButtons";
export { default as AiClassificationTable } from "./AiClassificationTable";
export { default as AiClickCursor } from "./AiClickCursor";
export { default as AiCostBreakdown } from "./AiCostBreakdown";
export { default as AiCostTable } from "./AiCostTable";
export { default as AiCriteriaSelection } from "./AiCriteriaSelection";
export { default as AiDashboardProposal } from "./AiDashboardProposal";
export { default as AiEventList } from "./AiEventList";
export type { EventRow, EventSeverity } from "./AiEventList";
export { default as AiExecutionResult } from "./AiExecutionResult";
export { default as AiInsightSection } from "./AiInsightSection";
export { default as AiLoadingMessage } from "./AiLoadingMessage";
export { default as AiAnswerSkeleton } from "./AiAnswerSkeleton";
export { default as AiUnavailableNotice, AI_UNAVAILABLE_PRESETS } from "./AiUnavailableNotice";
export type { AiUnavailableNoticeProps, AiUnavailableReason } from "./AiUnavailableNotice";
export { default as AiMessageActions } from "./AiMessageActions";
export { default as AiMigPlan } from "./AiMigPlan";
export { default as AiReasoning } from "./AiReasoning";
export { default as AiReceiverChannels } from "./AiReceiverChannels";
export type { ChannelKey, ChannelState } from "./AiReceiverChannels";
export { default as AiStepsTimeline } from "./AiStepsTimeline";
export { default as AiToolCallStep } from "./AiToolCallStep";
export { default as AiUsageChart } from "./AiUsageChart";
export { default as AiUserBubble } from "./AiUserBubble";

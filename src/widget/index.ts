/**
 * WhaTap Design System — widget barrel.
 *
 * 위젯 안에서 사용하는 토큰 / 프리미티브 / 메시지 카드 컴포넌트.
 * 사용:
 *   import { Card, ToneBadge, ClassificationTable, TONE_DOT } from "@whatap/design-system/widget";
 *
 * 구명(deprecated) Ai-접두어 alias 도 유지 — 소비자 코드가 깨지지 않습니다.
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

// Primitives — 새 이름
export {
  AiCard as Card,
  AiCaption as Caption,
  AiSectionHeading as SectionHeading,
  AiToneBadge as ToneBadge,
  AiBulletList as BulletList,
} from "./_primitives";

// Buttons (위젯 토글 · 송신 등 trigger)
export { default as AssistantButton } from "./AssistantButton";
export type { AiAssistantButtonProps, AiAssistantButtonSize } from "./AssistantButton";
export { default as SendButton } from "./SendButton";
export type { AiSendButtonProps } from "./SendButton";

// Input (사용자 자연어 입력창)
export { default as PromptInput } from "./PromptInput";
export type { AiPromptInputProps, AiPromptAttachment } from "./PromptInput";
export { default as InlinePrompt } from "./InlinePrompt";
export type {
  AiInlinePromptProps,
  AiInlineAttachment,
  AiPromptSuggestion,
} from "./InlinePrompt";

// 진행 표시 — 10초 넘는 AI 연산(대기 표현 V2)
export { default as AiProgress } from "./AiProgress";
export type { AiProgressProps, AiProgressItem, AiProgressPhase } from "./AiProgress";
export { default as AiProgressStep } from "./AiProgressStep";
export type { AiProgressStepProps, AiProgressStepStatus, AiProgressCount } from "./AiProgressStep";
export { default as AiProgressCompact } from "./AiProgressCompact";
export type { AiProgressCompactProps, AiProgressCompactItem, AiProgressCompactPhase } from "./AiProgressCompact";
export { default as AiStageMotion } from "./AiStageMotion";
export type { AiStageMotionProps, AiStage } from "./AiStageMotion";

// Message cards
export { default as AlertRulePreview } from "./AlertRulePreview";
export { default as ChatExchange } from "./ChatExchange";
export { default as ChoiceButtons } from "./ChoiceButtons";
export { default as ClassificationTable } from "./ClassificationTable";
export { default as ClickCursor } from "./ClickCursor";
export { default as CostBreakdown } from "./CostBreakdown";
export { default as CostTable } from "./CostTable";
export { default as CriteriaSelection } from "./CriteriaSelection";
export { default as DashboardProposal } from "./DashboardProposal";
export { default as EventList } from "./EventList";
export type { EventRow, EventSeverity } from "./EventList";
export { default as ExecutionResult } from "./ExecutionResult";
export { default as InsightSection } from "./InsightSection";
export { default as LoadingMessage } from "./LoadingMessage";
export { default as AnswerSkeleton } from "./AnswerSkeleton";
export { default as UnavailableNotice, AI_UNAVAILABLE_PRESETS } from "./UnavailableNotice";
export type { AiUnavailableNoticeProps, AiUnavailableReason } from "./UnavailableNotice";
export { default as MessageActions } from "./MessageActions";
export { default as PlanProposal } from "./PlanProposal";
export type { PlanProposalItem, PlanProposalStep } from "./PlanProposal";
export { default as Reasoning } from "./Reasoning";
export { default as ReceiverChannels } from "./ReceiverChannels";
export type { ChannelKey, ChannelState } from "./ReceiverChannels";
export { default as StepsTimeline } from "./StepsTimeline";
export {
  default as TargetMesh,
  targetMeshDots,
  meshScaleOf,
  MESH_DOT_R,
  MESH_CLUSTER_K,
} from "./TargetMesh";
export type { TargetMeshItem, MeshDot, MeshTone } from "./TargetMesh";
export { default as TargetMeshCluster } from "./TargetMeshCluster";
export type { TargetMeshClusterProps } from "./TargetMeshCluster";
export { default as ThreadDivider } from "./ThreadDivider";
export type { ThreadDividerProps } from "./ThreadDivider";
export { default as ToolCallStep } from "./ToolCallStep";
export { default as UsageChart } from "./UsageChart";
export { default as UserBubble } from "./UserBubble";

// ═══════════════════════════════════════════════════════════════════════════
// Deprecated Ai-prefixed aliases — 소비자 코드 호환. 새 코드는 위 이름을 쓰세요.
// ═══════════════════════════════════════════════════════════════════════════
export { AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList } from "./_primitives";
export type { AiCardTone } from "./_primitives";
/** @deprecated Use AssistantButton */ export { default as AiAssistantButton } from "./AssistantButton";
/** @deprecated Use SendButton */ export { default as AiSendButton } from "./SendButton";
/** @deprecated Use PromptInput */ export { default as AiPromptInput } from "./PromptInput";
/** @deprecated Use InlinePrompt */ export { default as AiInlinePrompt } from "./InlinePrompt";
/** @deprecated Use AlertRulePreview */ export { default as AiAlertRulePreview } from "./AlertRulePreview";
/** @deprecated Use ChatExchange */ export { default as AiChatExchange } from "./ChatExchange";
/** @deprecated Use ChoiceButtons */ export { default as AiChoiceButtons } from "./ChoiceButtons";
/** @deprecated Use ClassificationTable */ export { default as AiClassificationTable } from "./ClassificationTable";
/** @deprecated Use ClickCursor */ export { default as AiClickCursor } from "./ClickCursor";
/** @deprecated Use CostBreakdown */ export { default as AiCostBreakdown } from "./CostBreakdown";
/** @deprecated Use CostTable */ export { default as AiCostTable } from "./CostTable";
/** @deprecated Use CriteriaSelection */ export { default as AiCriteriaSelection } from "./CriteriaSelection";
/** @deprecated Use DashboardProposal */ export { default as AiDashboardProposal } from "./DashboardProposal";
/** @deprecated Use EventList */ export { default as AiEventList } from "./EventList";
/** @deprecated Use ExecutionResult */ export { default as AiExecutionResult } from "./ExecutionResult";
/** @deprecated Use InsightSection */ export { default as AiInsightSection } from "./InsightSection";
/** @deprecated Use LoadingMessage */ export { default as AiLoadingMessage } from "./LoadingMessage";
/** @deprecated Use AnswerSkeleton */ export { default as AiAnswerSkeleton } from "./AnswerSkeleton";
/** @deprecated Use UnavailableNotice */ export { default as AiUnavailableNotice } from "./UnavailableNotice";
/** @deprecated Use MessageActions */ export { default as AiMessageActions } from "./MessageActions";
/** @deprecated Use PlanProposal */ export { default as MigPlan } from "./PlanProposal";
/** @deprecated Use PlanProposal */ export { default as AiMigPlan } from "./PlanProposal";
/** @deprecated Use Reasoning */ export { default as AiReasoning } from "./Reasoning";
/** @deprecated Use ReceiverChannels */ export { default as AiReceiverChannels } from "./ReceiverChannels";
/** @deprecated Use StepsTimeline */ export { default as AiStepsTimeline } from "./StepsTimeline";
/** @deprecated Use TargetMesh */ export { default as AiTargetMesh } from "./TargetMesh";
/** @deprecated Use ToolCallStep */ export { default as AiToolCallStep } from "./ToolCallStep";
/** @deprecated Use UsageChart */ export { default as AiUsageChart } from "./UsageChart";
/** @deprecated Use UserBubble */ export { default as AiUserBubble } from "./UserBubble";

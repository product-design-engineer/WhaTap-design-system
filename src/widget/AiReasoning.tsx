/**
 * AiReasoning — AI 추론 과정을 "Reasoning" 라벨 + 단계 목록 카드로 표시.
 *
 * ## Purpose
 * AI 가 답을 도출하기까지의 추론 단계를 흰 카드 안에 세로 목록으로 노출. 완료 단계는
 * brand-blue 체크 원, 진행 중 단계(`running: true`)는 회전 spinner + 점 애니메이션으로 표시.
 * `delay` 로 등장 애니메이션 시점을 메시지 스택 흐름에 맞춰 지연.
 *
 * ## When to use
 * - 답변 전 AI 의 사고 흐름(reasoning chain)을 한 카드에 간단히 보여줄 때.
 * - "지금 생각 중" 상태를 마지막 단계 spinner 로 표현할 때.
 *
 * ## When NOT to use
 * - 접기/펼치기되는 step 진행 타임라인 → [[AiStepsTimeline]].
 * - 실제 tool/function 호출 단위 표시 → [[AiToolCallStep]].
 * - 단순 로딩 표시 → [[AiLoadingMessage]].
 *
 * ## Composition rules
 * - 자체 흰 카드(border-default 1px·8px 라운드)로 렌더되는 독립 블록 — 추가 래퍼 카드로 감싸지 말 것.
 * - 단계 마커 색(완료 brand-blue / 진행 spinner)은 토큰 사용, 인라인 hex 금지.
 * - 진행 중 단계는 목록의 마지막 하나만 `running: true` 로 두는 것을 권장.
 *
 * @example
 * ```tsx
 * <AiReasoning
 *   steps={[
 *     { label: "관련 지표 수집" },
 *     { label: "이상 구간 식별" },
 *     { label: "원인 후보 추론", running: true },
 *   ]}
 * />
 * ```
 */
import ReasoningStep from "./ReasoningStep";

export type ReasoningStep = {
  label: string;
  /** true면 점 애니메이션 진행 중, false면 완료(체크) */
  running?: boolean;
};

export default function AiReasoning({
  steps,
  delay = 0,
}: {
  steps: ReasoningStep[];
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-6px bg-white border border-color-var-color-border-default rounded-8px px-12px py-10px"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
        style={{ fontFamily: "var(--font-family-korean)" }}
      >
        Reasoning
      </div>
      {steps.map((s, i) => (
        <ReasoningStep key={i} index={i} label={s.label} running={s.running} />
      ))}
    </div>
  );
}

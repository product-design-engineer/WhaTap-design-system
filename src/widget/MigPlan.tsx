import MigPlanRowComponent from "./MigPlanRow";

/**
 * AiMigPlan — GPU MIG 통합 기획 제안 카드.
 *
 * ## Purpose
 * AI 가 제안하는 GPU MIG(Multi-Instance GPU) 통합 전략을 읽기 전용으로 보여주는 카드.
 * 섹션 헤딩 + 본문 bullet + 구성/분할/월 환산 요약 테이블 + 통합 비용 요약 + 우선순위
 * 액션(번호 목록)으로 구성됩니다. 모든 영역은 옵션이라 데이터가 있는 블록만 렌더됩니다.
 *
 * ## When to use
 * - GPU MIG 분할·통합 전략을 표 + 비용 요약 + 단계별 액션으로 제안할 때.
 * - 비용 비교(행별 highlight)와 우선순위 액션을 한 카드에 묶어 안내할 때.
 *
 * ## When NOT to use
 * - 실제 MIG 구성 **적용** 액션 → 이 카드는 기획 제안일 뿐, 적용은 별도 흐름/페이지에서.
 * - 일반 KV 요약 표 → [[AiAlertRulePreview]].
 * - 사용자 선택 CTA → [[AiChoiceButtons]].
 *
 * ## Composition rules
 * - 이 카드는 `AiCard` chrome 없이 자체 `flex-col` 레이아웃 (테이블·비용 요약 등 전용 구조).
 * - 색은 토큰 (`--color-brand-blue` · `--color-indicator-critical` · `--color-whatap-blue`) 사용,
 *   비용 요약 그라데이션/highlight 행만 인라인 색 한정.
 * - 액션 버튼을 내부에 넣지 말 것 — 승인/적용 CTA 는 [[AiChoiceButtons]] 로 분리.
 *
 * @example
 * ```tsx
 * <AiMigPlan
 *   bullets={["A100 한 장을 4개 인스턴스로 분할"]}
 *   rows={[{ label: "현재", config: "Full GPU × 1", monthly: "₩560,000" }]}
 *   total="₩134,400"
 *   totalNote="/월"
 *   actions={[{ step: 1, body: "MIG 프로파일 1g.10gb 적용" }]}
 * />
 * ```
 */
export type MigPlanRow = {
  label: string;
  /** "MIG (1g.10gb × 4)" 같은 구성 */
  config: string;
  /** "₩134,400" */
  monthly: string;
  /** 강조 색상 (선택) */
  highlight?: boolean;
};

export type MigAction = {
  step: number;
  body: string;
};

export default function AiMigPlan({
  heading = "MIG 통합 기획 (A100 핵심 활용 전략)",
  bullets,
  rows,
  totalLabel = "통합 비용 요약",
  total,
  totalNote,
  actionsHeading = "우선순위 액션",
  actions,
  delay = 0,
}: {
  heading?: string;
  bullets?: string[];
  rows?: MigPlanRow[];
  totalLabel?: string;
  total?: string;
  totalNote?: string;
  actionsHeading?: string;
  actions?: MigAction[];
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-10px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-6px">
        <span className="size-10px rounded-full" style={{ background: "var(--color-brand-blue)" }} />
        <span
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {heading}
        </span>
      </div>

      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-3px pl-12px">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="text-base text-secondary tracking-default leading-relaxed list-disc list-outside"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      {rows && rows.length > 0 && (
        <div className="rounded-6px overflow-hidden border border-color-var-color-border-default">
          <div
            className="grid items-center px-8px py-6px bg-color-var-color-surface-50 gap-4px"
            style={{ gridTemplateColumns: "1.4fr 1.4fr 1fr" }}
          >
            {["구성", "분할/Pod", "월 환산"].map((h) => (
              <span
                key={h}
                className="text-sm font-bold text-secondary tracking-default leading-none"
                style={{ fontFamily: "var(--font-family-korean)" }}
              >
                {h}
              </span>
            ))}
          </div>
          {rows.map((r, i) => (
            <MigPlanRowComponent key={i} {...r} />
          ))}
        </div>
      )}

      {total && (
        <div
          className="flex items-center justify-between rounded-6px px-10px py-8px"
          style={{
            background:
              "var(--gradient-ai-tint)",
            border: "1px solid var(--color-brand-blue-border-tint)",
          }}
        >
          <span
            className="text-base font-bold tracking-default leading-none"
            style={{ fontFamily: "var(--font-family-korean)", color: "var(--color-whatap-blue)" }}
          >
            {totalLabel}
          </span>
          <span
            className="text-md font-bold tracking-default leading-none"
            style={{ fontFamily: "var(--font-family-numeric)", color: "var(--color-whatap-blue)" }}
          >
            {total}
            {totalNote && <span className="ml-4px text-sm opacity-80">{totalNote}</span>}
          </span>
        </div>
      )}

      {actions && actions.length > 0 && (
        <>
          <div className="flex items-center gap-6px mt-4px">
            <span className="size-10px rounded-full" style={{ background: "var(--color-indicator-critical)" }} />
            <span
              className="text-md font-bold text-primary tracking-default leading-normal"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              {actionsHeading}
            </span>
          </div>
          <ol className="flex flex-col gap-4px pl-18px">
            {actions.map((a) => (
              <li
                key={a.step}
                className="text-base text-primary tracking-default leading-relaxed list-decimal list-outside"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {a.body}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

import CostBreakdownRow from "./CostBreakdownRow";

/**
 * AiCostBreakdown — GPU 단위 낭비 비용 상세 분석 카드.
 *
 * ## Purpose
 * 헤더(컬러 도트 + 라벨) + 1줄 컨텍스트 + 5컬럼 표(GPU / Pod / 평균 사용률 / 유휴 비율 /
 * 일일 낭비) + 소계 행 + 월 환산 라인으로 구성된 상세 비용 breakdown. 어떤 리소스가
 * 얼마나 유휴 상태로 비용을 발생시키는지 행 단위로 분해해 보여줌. 진입 시 `ai-anim-in`.
 *
 * ## When to use
 * - GPU/Pod 등 리소스별로 낭비 비용을 다컬럼 표로 분해해 제시할 때.
 * - 행별 소계 + 월 환산까지 한 카드에서 누적 요약이 필요할 때.
 *
 * ## When NOT to use
 * - 현행/제안 2-안 비교 위주 → [[AiCostTable]].
 * - 활용 분류(고/저활용) 표 → [[AiClassificationTable]].
 * - 시간대별 사용률 추이 → [[AiUsageChart]].
 *
 * ## Composition rules
 * - 자체 레이아웃을 가지며 [[AiCard]] 로 감싸지 않음 (표 자체는 보더, 외곽은 무 chrome).
 * - 헤더 도트 색은 호출처가 `toneColor` 로 직접 주입 — [[Tone]] 토큰값
 *   (`tokens.color.indicator.*`)을 넘기는 것을 권장.
 * - `context`/`subtotal`/`monthly`/`monthlyNote` 는 모두 선택 — 없으면 해당 줄 생략.
 * - 그 외 배경/보더는 토큰 사용. 단, 소계 행 등 일부 인라인 hex(`#f9f9f9`)가 남아 있어
 *   토큰화는 차후 정리 대상.
 * - `delay` 는 부모 메시지 시퀀스의 stagger 지연(ms).
 *
 * @example
 * ```tsx
 * <AiCostBreakdown
 *   toneLabel="저활용 GPU - 낭비 비용 분석"
 *   toneColor="var(--color-brand-blue)"
 *   context="A100 40GB 참고 비용 ₩2,800/hr 기준 일일 환산"
 *   rows={[
 *     { gpu: "#3", pod: "infer-batch-2", avg: "12%", idle: "88%", daily: "₩59,136" },
 *   ]}
 *   subtotal="₩268,600/일"
 *   monthly="약 ₩8,058,000/월"
 *   monthlyNote="(저활용 5개 GPU)"
 * />
 * ```
 */
export type CostBreakdownRow = {
  gpu: string;
  pod: string;
  avg: string;
  idle: string;
  daily: string;
};

export default function AiCostBreakdown({
  toneLabel,
  toneColor,
  context,
  rows,
  subtotal,
  monthly,
  monthlyNote,
  delay = 0,
}: {
  /** "저활용 GPU - 낭비 비용 분석" 같은 헤더 */
  toneLabel: string;
  /** 헤더 좌측 도트 색상 */
  toneColor: string;
  /** "A100 40GB 참고 비용 ₩2,800/hr (온프레미스라 실비는…) 기준 일일 환산" */
  context?: string;
  rows: CostBreakdownRow[];
  /** 소계 (예: "₩268,600/일") */
  subtotal?: string;
  /** "월 환산 — 약 ₩8,058,000/월 (저활용 5개 GPU)" */
  monthly?: string;
  monthlyNote?: string;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-8px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-6px">
        <span className="size-10px rounded-full" style={{ background: toneColor }} />
        <span
          className="text-md font-bold text-primary tracking-default leading-normal"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {toneLabel}
        </span>
      </div>
      {context && (
        <p
          className="text-base text-secondary tracking-default leading-relaxed"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {context}
        </p>
      )}
      <div className="rounded-6px overflow-hidden border border-color-var-color-border-default">
        <div
          className="grid items-center px-8px py-6px bg-color-var-color-surface-50 gap-4px"
          style={{ gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr" }}
        >
          {["GPU", "Pod", "평균 사용률", "유휴 비율", "일일 낭비"].map((h) => (
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
          <CostBreakdownRow key={i} row={r} />
        ))}
        {subtotal && (
          <div
            className="grid items-center px-8px py-6px gap-4px border-t border-color-var-color-border-default bg-cf9f9f9"
            style={{ gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr" }}
          >
            <span
              className="text-base font-bold text-primary tracking-default leading-none col-span-4"
              style={{ fontFamily: "var(--font-family-korean)", gridColumn: "1 / span 4" }}
            >
              소계
            </span>
            <span
              className="text-md font-bold text-primary tracking-default leading-none text-right"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              {subtotal}
            </span>
          </div>
        )}
      </div>
      {monthly && (
        <p
          className="text-base text-primary tracking-default leading-relaxed"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          <span className="font-bold">월 환산</span> — {monthly}
          {monthlyNote && <span className="text-tertiary"> {monthlyNote}</span>}
        </p>
      )}
    </div>
  );
}

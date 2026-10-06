/**
 * CostTable — 현행/제안 비용 비교 테이블 카드.
 *
 * ## Purpose
 * "현행 vs 제안" 비용을 2-row 로 나란히 비교하고, 절감액·절감률을 하단 강조 라인으로
 * 요약하는 비용 분석 카드. 각 row 는 라벨 + 상세 설명 + 비용을 한 줄에 표시하고,
 * `highlight` row 는 파란 배경/브랜드 컬러로 강조. 진입 시 `ai-anim-in` 애니메이션.
 *
 * ## When to use
 * - 최적화 전후 등 2가지 안의 비용을 직접 비교할 때.
 * - 절감 효과(절감액/절감률)를 한 카드 안에서 강조해 보여줄 때.
 *
 * ## When NOT to use
 * - GPU/Pod 단위의 다컬럼 상세 비용 표 → [[CostBreakdown]].
 * - 비용이 아닌 분류 결과 표 → [[ClassificationTable]].
 * - 사용률 시계열 → [[UsageChart]].
 *
 * ## Composition rules
 * - 자체 카드 chrome(흰 배경/보더/라운드/패딩)을 보유 — [[AiCard]] 로 감싸지 않음.
 * - `rows` 는 통상 현행·제안 2개. `highlight` 로 강조 row 지정.
 * - `caption` 은 상단 uppercase 라벨([[AiCaption]] 격). 비우면 라벨 생략.
 * - `savingsLabel`/`savingsValue` 중 하나라도 있으면 하단 강조 라인 노출.
 * - 색상은 토큰(`--color-brand-blue` / `--color-whatap-blue`) 사용. 단, 현 구현은
 *   일부 인라인 hex(`#eef4ff`, `#222`, rgba 그라데이션)도 포함 — 토큰화는 차후 정리 대상.
 * - `delay` 는 부모 메시지 시퀀스의 stagger 지연(ms).
 *
 * @example
 * ```tsx
 * <CostTable
 *   caption="Cost Analysis"
 *   rows={[
 *     { label: "현행", detail: "A100 GPU 4개 (평균 32%)", cost: "₩8,322,000/월" },
 *     { label: "제안", detail: "A100 GPU 2개로 축소", cost: "₩5,820,000/월", highlight: true },
 *   ]}
 *   savingsLabel="약 30.1% 비용 절감"
 *   savingsValue="₩2,502,000 / 월"
 * />
 * ```
 */
import CostTableRow from "./CostTableRow";

export type CostRow = {
  label: string; // "현행" / "제안"
  detail: string; // "A100 GPU 4개 (평균 사용률 32%)"
  cost: string; // "₩8,322,000/월"
  highlight?: boolean;
};

export default function CostTable({
  caption = "Cost Analysis",
  rows,
  savingsLabel,
  savingsValue,
  delay = 0,
}: {
  caption?: string;
  rows: CostRow[];
  /** "약 30.1% 비용 절감" 같은 풋라인 (선택) */
  savingsLabel?: string;
  /** "₩2,502,000 / 월" 같은 보조 라인 (선택) */
  savingsValue?: string;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-8px w-full bg-card border border-color-var-color-border-default rounded-8px p-12px"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {caption}
        </span>
      </div>

      <div className="flex flex-col rounded-6px overflow-hidden border border-color-var-color-border-default">
        {rows.map((r, i) => (
          <CostTableRow key={r.label} row={r} isFirst={i === 0} />
        ))}
      </div>

      {(savingsLabel || savingsValue) && (
        <div
          className="flex items-center justify-between px-10px py-8px rounded-6px"
          style={{
            background: "var(--gradient-ai-tint)",
            border: "1px solid var(--color-brand-blue-border-tint)",
          }}
        >
          {savingsLabel && (
            <span
              className="text-base font-bold tracking-default leading-none"
              style={{
                fontFamily: "var(--font-family-korean)",
                color: "var(--color-whatap-blue)",
              }}
            >
              {savingsLabel}
            </span>
          )}
          {savingsValue && (
            <span
              className="text-md font-bold tracking-default leading-none"
              style={{
                fontFamily: "var(--font-family-numeric)",
                color: "var(--color-whatap-blue)",
              }}
            >
              {savingsValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

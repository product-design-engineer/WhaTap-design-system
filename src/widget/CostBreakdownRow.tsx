import type { CostBreakdownRow as CostBreakdownRowData } from "./AiCostBreakdown";

/**
 * CostBreakdownRow — [[AiCostBreakdown]] 표의 단일 비용 행(row).
 *
 * ## Purpose
 * 5컬럼(GPU / Pod / 평균 사용률 / 유휴 비율 / 일일 낭비) 그리드의 데이터 행 한 건을
 * 렌더. `AiCostBreakdown` 의 `rows.map` 본문에 인라인으로 있던 행 마크업을 그대로
 * 옮겨온 것 — 부모 표의 헤더 행과 동일한 `gridTemplateColumns` 트랙을 공유한다.
 *
 * ## When to use
 * - [[AiCostBreakdown]] 가 `rows.map` 으로 행마다 렌더 (기본 용법). 보통 단독 사용 안 함.
 * - 동일한 5컬럼 비용 표 외형이 필요한 다른 표면.
 *
 * ## When NOT to use
 * - 표 헤더 행(컬럼명 th류) → 부모 인라인 유지 (이 컴포넌트는 데이터 행 전용).
 * - 소계 행 → 부모가 별도 처리 (`subtotal`).
 * - 현행/제안 2-안 비교 행 → [[AiCostTable]].
 *
 * ## Composition rules
 * - 데이터(`CostBreakdownRowData`)만 주입 — 행 외형/그리드 트랙은 이 컴포넌트가 책임.
 * - 부모 표의 헤더 행과 `gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr"` 트랙이
 *   반드시 일치해야 컬럼이 정렬됨.
 * - 보더는 토큰(`border-color-var-color-border-default`) 사용 — 인라인 hex 금지.
 * - `key` 는 호출처(부모 `rows.map`)가 부여 — 이 컴포넌트는 표현용(상태 비보유).
 *
 * @example
 * ```tsx
 * {rows.map((r, i) => (
 *   <CostBreakdownRow key={i} row={r} />
 * ))}
 * ```
 */
export default function CostBreakdownRow({ row }: { row: CostBreakdownRowData }) {
  return (
    <div
      className="grid items-center px-8px py-6px gap-4px border-t border-color-var-color-border-default"
      style={{ gridTemplateColumns: "0.7fr 1.4fr 0.8fr 0.9fr 1fr" }}
    >
      <span
        className="text-base font-bold text-primary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)" }}
      >
        {row.gpu}
      </span>
      <span
        className="text-sm text-secondary tracking-default leading-snug truncate"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        title={row.pod}
      >
        {row.pod}
      </span>
      <span
        className="text-base text-secondary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      >
        {row.avg}
      </span>
      <span
        className="text-base text-secondary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      >
        {row.idle}
      </span>
      <span
        className="text-base font-bold text-primary tracking-default leading-none text-right"
        style={{ fontFamily: "var(--font-family-numeric)" }}
      >
        {row.daily}
      </span>
    </div>
  );
}

import type { CostRow } from "./AiCostTable";

/**
 * CostTableRow — [[AiCostTable]] 본문의 단일 비용 행(라벨 + 상세 + 비용).
 *
 * ## Purpose
 * "현행 vs 제안" 비용 비교 테이블의 한 줄을 렌더. `CostRow` 한 건을 받아 좌측에 라벨+상세,
 * 우측에 비용을 표시하고, `highlight` 면 파란 배경(`#eef4ff`)·브랜드 컬러로 강조한다.
 * [[AiCostTable]] 내부 `rows.map` 에 인라인으로 있던 행 마크업을 한 곳으로 모은 것 —
 * JSX·className 그대로(순수 추출), 외형/동작 무변경.
 *
 * ## When to use
 * - [[AiCostTable]] 가 `rows.map` 으로 행마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 비용 비교 행 외형이 필요한 다른 표면.
 *
 * ## When NOT to use
 * - 카드 chrome·caption·절감 풋라인 전체 → [[AiCostTable]].
 * - GPU/Pod 단위 다컬럼 상세 비용 표 → [[AiCostBreakdown]].
 *
 * ## Composition rules
 * - 데이터(`row`)와 위치(`isFirst`)만 주입 — 행 외형/구분선/강조는 이 컴포넌트가 책임.
 * - 첫 행이 아니면(`isFirst` false) 상단 보더(`border-t`)로 행 구분.
 * - 색·배경은 토큰(`--color-brand-blue`) 및 기존 인라인 hex(`#eef4ff`·`#222`·`#fff`)를
 *   그대로 유지 — 토큰화는 [[AiCostTable]] 와 함께 차후 정리 대상.
 *
 * @example
 * ```tsx
 * {rows.map((r, i) => (
 *   <CostTableRow key={r.label} row={r} isFirst={i === 0} />
 * ))}
 * ```
 */
export default function CostTableRow({
  row,
  isFirst = false,
}: {
  row: CostRow;
  /** 첫 행 여부 — false 면 상단 구분 보더(border-t) 표시 */
  isFirst?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-10px py-8px ${
        !isFirst ? "border-t border-color-var-color-border-default" : ""
      }`}
      style={{
        background: row.highlight ? "#eef4ff" : "#fff",
      }}
    >
      <div className="flex flex-col min-w-0">
        <span
          className="text-sm text-tertiary tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {row.label}
        </span>
        <span
          className="text-base text-primary tracking-default leading-normal mt-3px"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {row.detail}
        </span>
      </div>
      <span
        className="text-lg text-primary font-bold tracking-default leading-none"
        style={{
          fontFamily: "var(--font-family-numeric)",
          color: row.highlight ? "var(--color-brand-blue)" : "#222",
        }}
      >
        {row.cost}
      </span>
    </div>
  );
}

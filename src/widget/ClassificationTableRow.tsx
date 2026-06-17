import type { ClassificationRow } from "./AiClassificationTable";

/**
 * ClassificationTableRow — [[AiClassificationTable]] 표의 단일 데이터 행.
 *
 * ## Purpose
 * GPU# / 모델명 / 평균 / 최대 / 최소 / Pod / 분류(톤 컬러 배지) 7컬럼 그리드 행 1건을 렌더.
 * 부모 `rows.map` 안에 인라인으로 흩어져 있던 행 마크업을 한 곳으로 모은 것 — JSX·className·
 * 그리드 컬럼 정의는 그대로 유지(순수 추출).
 *
 * ## When to use
 * - [[AiClassificationTable]] 가 `rows.map` 으로 행마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 분류 표 행 외형이 필요한 다른 표 표면.
 *
 * ## When NOT to use
 * - 헤더 행 → 부모 [[AiClassificationTable]] 가 인라인으로 직접 처리.
 * - 비용/사용률 등 다른 표 행 → 해당 위젯 사용.
 *
 * ## Composition rules
 * - 데이터(`row`)와 배지 표현(`badgeBg`/`badgeDot`/`badgeLabel`)만 주입 — 행 외형/그리드는 이 컴포넌트가 책임.
 * - 배지 색·배경은 부모의 `TONE_BADGE` 매핑에서 풀어 props 로 전달(인라인 hex 매핑은 부모에 보존).
 * - 그리드 컬럼 템플릿(`28px 1.4fr 0.7fr 0.6fr 0.6fr 1.3fr 0.8fr`)은 부모 헤더와 일치해야 함.
 *
 * @example
 * ```tsx
 * {rows.map((r, i) => {
 *   const badge = TONE_BADGE[r.tone];
 *   return (
 *     <ClassificationTableRow
 *       key={i}
 *       row={r}
 *       badgeBg={badge.bg}
 *       badgeDot={badge.dot}
 *       badgeLabel={badge.label}
 *     />
 *   );
 * })}
 * ```
 */
export default function ClassificationTableRow({
  row,
  badgeBg,
  badgeDot,
  badgeLabel,
}: {
  row: ClassificationRow;
  /** 배지 배경색 (부모 TONE_BADGE 매핑의 bg) */
  badgeBg: string;
  /** 배지 도트/텍스트 색 (부모 TONE_BADGE 매핑의 dot) */
  badgeDot: string;
  /** 배지 기본 라벨 (부모 TONE_BADGE 매핑의 label) */
  badgeLabel: string;
}) {
  const r = row;
  return (
    <div
      className="grid items-center px-6px py-6px gap-4px border-t border-color-var-color-border-default"
      style={{ gridTemplateColumns: "28px 1.4fr 0.7fr 0.6fr 0.6fr 1.3fr 0.8fr" }}
    >
      <span
        className="text-base font-bold text-primary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)" }}
      >
        {r.gpu}
      </span>
      <span
        className="text-sm text-secondary tracking-default leading-snug truncate"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {r.model}
      </span>
      <span
        className="text-base font-bold text-primary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)" }}
      >
        {r.avg}
      </span>
      <span
        className="text-base text-secondary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      >
        {r.max}
      </span>
      <span
        className="text-base text-secondary tracking-default leading-none"
        style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}
      >
        {r.min}
      </span>
      <span
        className="text-sm text-secondary tracking-default leading-snug truncate"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        title={r.pod}
      >
        {r.pod}
      </span>
      <div
        className="flex items-center gap-4px px-6px py-2px rounded-10px self-start whitespace-nowrap"
        style={{ background: badgeBg }}
      >
        <span
          className="size-6px rounded-full shrink-0"
          style={{ background: badgeDot }}
        />
        <span
          className="text-xs tracking-default leading-none"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-medium)",
            color: badgeDot,
          }}
        >
          {r.badge ?? badgeLabel}
        </span>
      </div>
    </div>
  );
}

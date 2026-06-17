/**
 * MigPlanRow — MIG 계획 표의 단일 데이터 행 (구성 / 분할·Pod / 월 환산).
 *
 * ## Purpose
 * [[AiMigPlan]] 의 요약 테이블에서 `rows.map` 으로 흩어져 있던 한 행 마크업을
 * 한 곳으로 모은 것. 3열 그리드(구성 라벨 · 분할/Pod 구성 · 월 환산 금액)로 그리며,
 * `highlight` 면 행 배경을 라이트블루로 강조합니다. 헤더 행은 포함하지 않습니다
 * (부모가 인라인 유지).
 *
 * ## When to use
 * - [[AiMigPlan]] 이 `rows.map` 으로 행마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 MIG 요약 표 행 외형이 필요한 다른 표면.
 *
 * ## When NOT to use
 * - 표 헤더 행 → 부모가 인라인으로 직접 렌더.
 * - 일반 bullet 항목 → [[AiBulletList]] 영역.
 * - 비용 요약/액션 블록 → [[AiMigPlan]] 내부 전용 구조.
 *
 * ## Composition rules
 * - 데이터(label · config · monthly · highlight)만 주입 — 그리드 컬럼/정렬/강조는 이 컴포넌트가 책임.
 * - 그리드 템플릿은 부모 헤더 행과 동일(`1.4fr 1.4fr 1fr`) 유지해 정렬을 맞춤.
 * - 강조 행 배경(`#eef4ff`)/기본 배경(`#fff`)만 인라인 색 한정.
 *
 * @example
 * ```tsx
 * {rows.map((r, i) => <MigPlanRow key={i} {...r} />)}
 * ```
 */
export default function MigPlanRow({
  label,
  config,
  monthly,
  highlight,
}: {
  label: string;
  /** "MIG (1g.10gb × 4)" 같은 구성 */
  config: string;
  /** "₩134,400" */
  monthly: string;
  /** 강조 색상 (선택) */
  highlight?: boolean;
}) {
  return (
    <div
      className="grid items-center px-8px py-6px gap-4px border-t border-color-var-color-border-default"
      style={{
        gridTemplateColumns: "1.4fr 1.4fr 1fr",
        background: highlight ? "#eef4ff" : "#fff",
      }}
    >
      <span
        className="text-base font-bold text-primary tracking-default leading-snug"
        style={{ fontFamily: "var(--font-family-korean)" }}
      >
        {label}
      </span>
      <span
        className="text-sm text-secondary tracking-default leading-snug"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {config}
      </span>
      <span
        className="text-base font-bold text-primary tracking-default leading-none text-right"
        style={{ fontFamily: "var(--font-family-numeric)" }}
      >
        {monthly}
      </span>
    </div>
  );
}

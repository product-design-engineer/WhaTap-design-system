/**
 * PlanProposalRow — 실행 계획 제안 비교 표의 데이터 행 한 건 (항목 / 구성 / 비용).
 *
 * ## Purpose
 * [[PlanProposal]] 의 비교 표에서 `rows.map` 으로 흩어져 있던 한 행 마크업을 한 곳으로 모은 것.
 * 3열 그리드(항목 라벨 · 구성 설명 · 수치)로 그리며, `highlight` 면 행 배경을 옅은 브랜드 틴트로
 * 강조한다. 헤더 행은 포함하지 않는다(부모가 `columns` 로 그린다).
 *
 * 2026-10-19 `MigPlanRow` 에서 이름을 바꿨다 — GPU MIG 분할 전용이 아니라 «항목별 구성 · 비용»
 * 을 나란히 놓는 모든 계획 제안에 쓴다.
 *
 * ## When to use
 * - [[PlanProposal]] 이 `rows.map` 으로 행마다 렌더 (기본 용법). 보통 단독으로 쓰지 않는다.
 * - 같은 비교 표 행 외형(항목 · 구성 · 수치 3열)이 필요한 다른 표면.
 *
 * ## When NOT to use
 * - 표 헤더 행 → 부모 [[PlanProposal]] 의 `columns` 가 그린다.
 * - 일반 bullet 항목 → [[AiBulletList]] 영역.
 * - 열이 셋이 아니거나 정렬 · 페이지가 필요한 표 → [[DataTable]].
 *
 * ## Composition rules
 * - 데이터(label · detail · value · highlight)만 주입 — 그리드 트랙 · 정렬 · 강조는 이 컴포넌트가 책임.
 * - 그리드 템플릿은 부모 헤더 행과 같은 `1.4fr 1.4fr 1fr` 를 유지해 열을 맞춘다. 바꾸지 말 것.
 * - 강조 행 배경은 `--color-brand-blue-tint`, 기본은 `--color-card` — 색 리터럴 금지.
 *
 * @example
 * ```tsx
 * {rows.map((r, i) => <PlanProposalRow key={i} {...r} />)}
 * ```
 */
export default function PlanProposalRow({
  label,
  detail,
  value,
  highlight,
  config,
  monthly,
}: {
  /** 항목 이름 — 첫 열(굵게). 예: "Inference" · "현재" */
  label: string;
  /** 구성 설명 — 둘째 열. 예: "MIG (3g.40gb × 1)" · "c5.xlarge × 4" */
  detail?: string;
  /** 수치 — 셋째 열, 숫자 글꼴 · 오른쪽 정렬. 예: "₩520,125" */
  value?: string;
  /** true 면 행 배경을 옅은 브랜드 틴트로 강조(추천안 등). */
  highlight?: boolean;
  /** @deprecated `detail` 을 쓴다(MigPlanRow 시절 이름). */
  config?: string;
  /** @deprecated `value` 를 쓴다(MigPlanRow 시절 이름). */
  monthly?: string;
}) {
  return (
    <div
      className="grid items-center px-8px py-6px gap-4px border-t border-color-var-color-border-default"
      style={{
        gridTemplateColumns: "1.4fr 1.4fr 1fr",
        background: highlight ? "var(--color-brand-blue-tint)" : "var(--color-card)",
      }}
    >
      <span
        className="text-base font-bold text-primary tracking-default"
        style={{ fontFamily: "var(--font-family-korean)" }}
      >
        {label}
      </span>
      <span
        className="text-sm text-secondary tracking-default"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {detail ?? config}
      </span>
      <span
        className="text-base font-bold text-primary tracking-default text-right"
        style={{ fontFamily: "var(--font-family-numeric)" }}
      >
        {value ?? monthly}
      </span>
    </div>
  );
}

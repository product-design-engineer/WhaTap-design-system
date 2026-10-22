/**
 * BuildingProgressStep — 구성 진행 목록의 한 줄: 상태 표시(완료 ✓ · 진행 회전 · 대기 원) + 단계 이름. Primitives layer.
 *
 * ## Purpose
 * «여러 단계 중 어디까지 왔나» 를 줄마다 같은 모양으로 말한다. 완료는 초록 원 안 체크, 지금 단계는 도는 원, 남은 단계는 빈 원과
 * 흐린 글자. [[DashboardBuildingProgress]] 가 이 줄을 쌓는다.
 *
 * ## When to use
 * - [[DashboardBuildingProgress]] 의 단계 줄.
 * - 짧은 대기 동안 순차 단계를 체크 목록으로 보일 때(단계가 서버 이벤트가 아니라 시간으로 넘어가는 화면).
 *
 * ## When NOT to use
 * - 10초 넘는 AI 연산의 진행 — 실제 처리 수와 중간 발견을 말해야 한다 → [[AiProgressStep]] (patterns §24).
 * - 결과 · 이력 타임라인 → [[TimelineStepItem]].
 *
 * ## Composition rules
 * - `done`: 초록(`--color-status-success`) 원 안 고정 흰색 체크(컬러 위 흰색 — 허용 예외) · 글자 `text-secondary`.
 * - `active`: `--color-brand-blue` 테두리 원이 돈다(동작 줄이기 설정을 따른다) · 글자 `--color-border-divider`.
 * - `pending`: `--color-border-strong` 빈 원 · 글자 `--color-border-divider` · 줄 불투명도 50%.
 * - 상태 표시 14px 칸 · 글자와 사이 8px · `text-base` 한국어 서체. 상태 사이 전환 200ms.
 *
 * ## Spec
 * | 상태 | 표시 | 글자 색 | 줄 불투명도 |
 * |---|---|---|---|
 * | `done` | 14px 원 `status-success` + 흰 체크 1.4px | `text-secondary` | 1 |
 * | `active` | 12px 원 1.5px `brand-blue`(위 투명) · 0.9s 회전 | `border-divider` | 1 |
 * | `pending` | 12px 원 1px `border-strong` | `border-divider` | 0.5 |
 *
 * @example
 * ```tsx
 * <BuildingProgressStep state="done" label="지표 수집" />
 * <BuildingProgressStep state="active" label="위젯 배치" />
 * ```
 */
export type BuildingProgressStepState = "done" | "active" | "pending";

export type BuildingProgressStepProps = {
  /** 단계 이름. */
  label: string;
  /** 완료 · 진행 · 대기. */
  state: BuildingProgressStepState;
};

export default function BuildingProgressStep({ label, state }: BuildingProgressStepProps) {
  return (
    <li
      className="flex items-center gap-8px text-base"
      style={{
        fontFamily: "var(--font-family-korean)",
        color: state === "done" ? "var(--color-text-secondary)" : "var(--color-border-divider)",
        opacity: state === "pending" ? 0.5 : 1,
        transition: "opacity 200ms, color 200ms",
      }}
    >
      {state === "done" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="6.5" fill="var(--color-status-success)" />
          <path
            d="M4 7l2 2 4-4"
            data-ds-policy-ok="status-success 원형 위 체크마크 — 컬러 위 고정 흰색"
            // raw-color-ok: status-success 원형 위 체크마크 — 컬러 위 고정 흰색.
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : state === "active" ? (
        <span
          aria-hidden
          className="size-12px rounded-full border-1_5px border-color-var-color-brand-blue border-t-transparent"
          style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
        />
      ) : (
        <span aria-hidden className="size-12px rounded-full border border-strong" />
      )}
      {label}
    </li>
  );
}

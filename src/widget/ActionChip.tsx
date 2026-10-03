/**
 * AiActionChip — [[WhaTapAiWidget]] 랜딩의 단일 액션 칩 버튼.
 *
 * ## Purpose
 * 랜딩 인사말 아래 제안 액션 한 건을 칩 버튼으로 렌더 — 라벨 텍스트 + 진입 페이드인 애니메이션.
 * `WhaTapAiWidget` 의 `actions.map(...)` 안에 인라인되어 있던 버튼 마크업을 그대로 추출한 것.
 * 진입은 400ms 부터 칩마다 80ms 스태거(`index` 기반)로 페이드인한다.
 *
 * ## When to use
 * - [[WhaTapAiWidget]] 가 `actions.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 브랜드-블루 아웃라인 칩 외형이 필요한 다른 랜딩 표면.
 *
 * ## When NOT to use
 * - 랜딩 카드 chrome / 인사말 문단 → 부모 [[WhaTapAiWidget]] 가 책임.
 * - 액션이 아닌 일반 버튼 → 표준 버튼 컴포넌트 사용.
 *
 * ## Composition rules
 * - 라벨(`label`)·순번(`index`)만 주입 — 외형/스태거 지연은 이 컴포넌트가 책임 (표현용).
 * - 색·배경은 토큰(`color-var-color-brand-blue` · `bg-card` · `hover-bg-color-var-color-brand-blue-bg`) — 인라인 hex 금지.
 * - 스태거 지연은 `400 + index * 80` ms 로 부모 map 순번과 동일하게 계산.
 *
 * @example
 * ```tsx
 * {actions.map((label, i) => (
 *   <AiActionChip key={label} label={label} index={i} />
 * ))}
 * ```
 */
export default function AiActionChip({
  label,
  index,
}: {
  /** 칩에 표시할 액션 라벨. */
  label: string;
  /** 부모 map 의 순번 — 진입 스태거 지연 계산에 사용. */
  index: number;
}) {
  return (
    <button
      className="ai-anim-in ai-landing-action border border-color-var-color-brand-blue flex h-32px items-center justify-center px-16px rounded-4px cursor-pointer text-brand-blue hover-bg-color-var-color-brand-blue-bg hover-border-color-var-color-brand-blue-bg relative overflow-hidden w-fit whitespace-nowrap text-md bg-card"
      style={{
        fontFamily: "var(--font-family-korean)",
        fontWeight: "var(--font-weight-medium)",
        // entrance: 400ms부터 칩마다 80ms 스태거로 페이드인
        animationDelay: `${400 + index * 80}ms`,
      }}
    >
      {label}
    </button>
  );
}

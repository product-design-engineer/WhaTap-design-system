/**
 * EventTimeCell — 요일 × 시간 매트릭스의 칸 하나. 켜짐(수신) · 꺼짐(미수신)을 칠과 테두리로 말한다. Primitives layer.
 *
 * ## Purpose
 * «이 요일 이 시간에 알림을 받는가» 하나를 누를 수 있는 칸으로 보인다. 168칸이 한 화면에 깔리므로 칸은 작고(14px 높이)
 * 상태는 색만으로 갈리지 않게 테두리도 함께 바뀐다. 상태는 `aria-pressed` 와 «월 09시 수신» 같은 이름으로 보조기술에도 말한다.
 *
 * ## When to use
 * - [[EventWeekTimeMatrix]] 의 칸.
 * - 같은 매트릭스의 범례 견본(`legend`) — 칸과 같은 칠 · 테두리라 짝이 바로 읽힌다.
 *
 * ## When NOT to use
 * - 즉시 반영되는 단일 켬/끔 → [[Switch]].
 * - 폼과 함께 제출하는 다중 선택 → [[Checkbox]].
 * - 값의 크기를 칠하는 격자(히트맵) → [[HeatmapCell]].
 *
 * ## Composition rules
 * - 켜짐: 칠 `--color-brand-blue` · 테두리 `--color-brand-blue-deep`. 꺼짐: 칠 `--color-surface-100` · 테두리 `--color-border-strong`.
 * - `onClick` 이 없으면 읽기 전용 — `disabled` 버튼, 커서 기본.
 * - 칸 폭은 부모 격자(24열 트랙)가 정한다. 높이 14px · 모서리 2px.
 * - `legend` 면 버튼이 아니라 12 × 10 견본(`span`)으로 그린다 — 범례 이름 앞에.
 *
 * ## Spec
 * | 항목 | 칸 | 범례 견본 |
 * |---|---|---|
 * | 크기 | 폭 = 격자 트랙 · 높이 14px | 12 × 10px |
 * | 켜짐 | 칠 `brand-blue` · 1px `brand-blue-deep` | 같음 |
 * | 꺼짐 | 칠 `surface-100` · 1px `border-strong` | 같음 |
 * | 접근성 | `button` · `aria-pressed` · `aria-label`(요일 · 시 · 수신 여부) | 장식 |
 *
 * @example
 * ```tsx
 * <EventTimeCell on label="월 09시 수신" onClick={() => toggle(0, 9)} />
 * <EventTimeCell on legend />
 * ```
 */
export type EventTimeCellProps = {
  /** 켜짐(수신) 여부. */
  on: boolean;
  /** 보조기술 이름(「월 09시 수신」). 칸에는 필수, 범례 견본은 없음. */
  label?: string;
  /** 누를 때. 없으면 읽기 전용. */
  onClick?: () => void;
  /** 범례 견본으로(12 × 10, 버튼 아님). */
  legend?: boolean;
};

export default function EventTimeCell({ on, label, onClick, legend = false }: EventTimeCellProps) {
  const paint = {
    background: on ? "var(--color-brand-blue)" : "var(--color-surface-100)",
    border: on ? "1px solid var(--color-brand-blue-deep)" : "1px solid var(--color-border-strong)",
  };
  if (legend) return <span aria-hidden className="inline-block w-12px h-10px rounded-2px" style={paint} />;
  const interactive = !!onClick;
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={`h-14px rounded-2px transition-colors ${interactive ? "cursor-pointer hover-brightness-95" : "cursor-default"}`}
      style={paint}
      aria-label={label}
      aria-pressed={on}
    />
  );
}

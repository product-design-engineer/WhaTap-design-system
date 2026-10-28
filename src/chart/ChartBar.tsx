/**
 * ChartBar — 칸 바닥에서 자라는 세로 막대 하나. 값이 없으면(`null`) 칸 전체를 옅은 면으로 비운다. Primitives layer.
 *
 * ## Purpose
 * 시간 칸마다 값 하나를 막대 높이로 말한다. «0 이다» 와 «모른다(수집 없음)» 는 다른 말이라 다르게 그린다 — 0 은 바닥에
 * 붙은 최소 2px 막대, 모름은 칸 전체 높이의 옅은 면([[HeatmapCell]] 이 모름을 면으로 비우는 것과 같은 방식). 막대가 하나도
 * 없으면 «이 시간은 조용했다» 로 읽혀 수집 끊김이 정상으로 감춰진다(§15 빈 상태).
 *
 * ## When to use
 * - 칸마다 값 하나인 막대 줄 — [[UsageChart]] 의 24시간 칸.
 * - 축 없이 칸 높이 비율로만 읽는 작은 막대 줄(AI 답 안 · 카드 안).
 *
 * ## When NOT to use
 * - 값축 · 시간축이 있는 대시보드 막대 → [[MiniBarChart]].
 * - 몫 + 나머지를 쌓는 막대 → [[ChartStackedColumn]].
 * - 가로 막대 줄 → [[BarListItem]].
 *
 * ## Composition rules
 * - 높이가 정해진 가로 flex 줄 안에 둔다. 막대는 `flex: 1` 로 칸을 나눠 쓰고, 높이는 `ratio`(0~1) × 줄 높이(최소 2px).
 * - 색은 마크 토큰(`--color-chart-seq-*` · `--color-chart-series-*`). 강조 단계는 호출하는 쪽이 색으로 고른다.
 * - 모름(`ratio={null}`)은 `--color-surface-100` 칸 전체 — 색이 아니라 «빈 칸» 으로 읽힌다.
 * - `delay` 를 주면 바닥에서 자라는 진입 애니메이션(`.ai-anim-bar`)을 그 지연으로 건다. 동작 줄이기 설정을 따른다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 높이 | 값: max(2px, `ratio` × 줄 높이) · 모름: 줄 높이 전체 |
 * | 폭 | 칸 등분(`flex: 1`) · 모서리 2px |
 * | 칠 | 값: `color` · 모름: `--color-surface-100` |
 * | 접근성 | `title` 로 칸 설명(「13시 · 82.4%」 · 「13시 · 데이터 없음」) |
 *
 * @example
 * ```tsx
 * <div className="flex items-end gap-2px" style={{ height: 96 }}>
 *   <ChartBar ratio={0.82} color="var(--color-chart-seq-4)" title="13시 · 82%" />
 *   <ChartBar ratio={null} title="14시 · 데이터 없음" />
 * </div>
 * ```
 */
export type ChartBarProps = {
  /** 높이 비율(0~1). `null` = 모름(수집 없음) — 칸 전체를 옅은 면으로. */
  ratio: number | null;
  /** 막대 칠 토큰. hex 금지. 모름이면 쓰지 않는다. */
  color?: string;
  /** 칸 설명(툴팁 · 보조기술). */
  title?: string;
  /** 진입 애니메이션 지연(ms). 없으면 애니메이션 없음. */
  delay?: number;
};

export default function ChartBar({ ratio, color = "var(--color-chart-seq-2)", title, delay }: ChartBarProps) {
  const unknown = ratio === null;
  return (
    <div
      title={title}
      className={`flex-1 min-w-0 rounded-2px${delay !== undefined ? " ai-anim-bar" : ""}`}
      style={{
        height: unknown ? "100%" : `max(2px, ${Math.max(0, Math.min(1, ratio)) * 100}%)`,
        background: unknown ? "var(--color-surface-100)" : color,
        animationDelay: delay !== undefined ? `${delay}ms` : undefined,
      }}
    />
  );
}

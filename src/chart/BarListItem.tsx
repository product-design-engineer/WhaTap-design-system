/**
 * BarListItem — 가로 막대 목록의 한 줄: 값 · 이름 · 같은 값의 막대. Primitives layer.
 *
 * ## Purpose
 * 대상 하나의 «지금 얼마나» 를 숫자와 막대로 함께 말한다. 숫자만 두면 크기를 암산해야 하고, 막대만 두면 정확한 값을 못
 * 읽는다. [[BarList]] 가 이 줄을 쌓아 대상끼리 견주게 한다 — 줄이 같은 모양이어야 막대 시작선이 줄마다 같다.
 *
 * ## When to use
 * - [[BarList]] 의 줄. 대상 종류별 현재 값(Method · SQL · HTTPS …) 한 줄.
 * - 가로 막대 목록이 필요한 새 차트의 줄 — 줄을 다시 그리지 않고 이것을 쌓는다.
 *
 * ## When NOT to use
 * - 표 칸 안 수치 옆 막대 → [[MetricBarCell]].
 * - 사람별 사용량 줄 → [[MemberUsageBar]].
 * - 한계 대비 소비량 막대 하나 → [[UsageGauge]].
 *
 * ## Composition rules
 * - 부모가 높이를 정하는 세로 flex 안에 둔다. 줄은 `flex: 1` 로 부모 높이를 똑같이 나눠 쓰고, 막대 두께는 줄 높이의 60%(최소 4px).
 * - 값 칸 88px 고정(값 36px 오른쪽 정렬 + 이름) — 그래서 줄마다 막대 시작선이 같다.
 * - 막대 길이는 받은 `ratio`(0~1). 분모(전체 · 최댓값 · 한계)는 화면이 정한다. 0 이면 막대가 사라진다(§21 0 표현 결정 필요).
 * - 막대 색은 계열 토큰(`--color-chart-series-N`, 엔티티 슬롯 §21). 줄마다 다른 계열이면 색이 이름표라 범례를 두지 않는다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 값 | `text-lg` 굵게 · `text-primary` · 숫자 서체 · 폭 36px 오른쪽 정렬 |
 * | 이름 | `text-sm` · `text-secondary` · 숫자 서체 · 말줄임 |
 * | 값 칸 | 88px 고정 · 값과 이름 사이 6px · 막대와 사이 8px |
 * | 막대 | 줄 높이 60% · 최소 4px · 반경 2px · 위아래 4px 여백 · 폭 = `ratio` × 남은 폭 |
 *
 * @example
 * ```tsx
 * <BarListItem label="Method" value={210} ratio={0.88} color="var(--color-chart-series-1)" />
 * ```
 */
export type BarListItemProps = {
  /** 대상 이름. */
  label: string;
  /** 값. */
  value: number;
  /** 막대 길이 비율(0~1). */
  ratio: number;
  /** 막대 색 토큰. hex 금지. */
  color: string;
};

export default function BarListItem({ label, value, ratio, color }: BarListItemProps) {
  return (
    <li className="flex items-center flex-1 min-h-0 w-full" style={{ gap: 8 }}>
      <span className="flex items-baseline shrink-0" style={{ width: 88, gap: 6 }}>
        <span
          className="text-lg font-bold text-primary text-right shrink-0"
          style={{ width: 36, fontFamily: "var(--font-family-numeric)" }}
        >
          {value}
        </span>
        <span className="text-sm text-secondary whitespace-nowrap truncate" style={{ fontFamily: "var(--font-family-numeric)" }}>
          {label}
        </span>
      </span>
      <span className="flex-1 min-w-0 flex items-center h-full" style={{ padding: "4px 0" }}>
        <span
          aria-hidden
          className="block rounded-2px"
          style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, height: "60%", minHeight: 4, background: color }}
        />
      </span>
    </li>
  );
}

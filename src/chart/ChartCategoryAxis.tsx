import { AXIS_GUTTER } from "./_axisScale";

/**
 * ChartCategoryAxis — 범주 막대 아래 X축 이름. 칸을 똑같이 나눠 가운데에, 칸 폭에서 말줄임. Primitives layer.
 *
 * ## Purpose
 * X 가 시간이 아니라 대상 · 단계(서버 TOP-N · Total → Allocated → …)인 막대 차트의 이름 줄이다. 시간축([[ChartTimeAxis]])은
 * 양 끝을 안쪽으로 붙이지만, 범주는 막대마다 그 막대 바로 아래 가운데에 서야 짝이 읽힌다. 이름이 칸보다 길면 잘라서 칸 밖으로
 * 넘지 않게 하고 전체 이름은 `title` 로 남긴다(라이브 제품에서는 말줄임 없이 잘려 «DMX-r» 처럼 식별이 안 됐다, patterns §21).
 *
 * ## When to use
 * - 막대마다 이름이 하나인 범주 막대 차트의 X축 — [[GpuStatusBar]] 가 쓴다.
 * - 막대를 플롯 가로로 똑같이 나눠 세우는 차트. 막대 칸 사이 간격(`gap`)을 막대와 같게 준다.
 *
 * ## When NOT to use
 * - 시간축 → [[ChartTimeAxis]].
 * - 가로 막대 목록(이름이 줄 왼쪽) → [[BarList]].
 *
 * ## Composition rules
 * - `position: relative` 이고 높이가 정해진 플롯 상자 안에 둔다. 가로는 `--wds-widget-axis-gutter` 부터 `right` 까지를
 *   이름 수만큼 똑같이 나눈다 — 막대 칸과 같은 `right` · `gap` 을 준다.
 * - 세로는 플롯 바닥(아래 여백 `padBottom` 시작)에서 4px 아래.
 * - 글자는 `text-chart`(9px) · 숫자 서체 · `text-tertiary`(§15) · 가운데 · 칸 폭 말줄임 · 전체 이름 `title`.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 글자 | `text-chart` 9px · `--font-family-numeric` · `text-tertiary` · 가운데 · 말줄임 |
 * | 세로 | 플롯 바닥 + 4px (상자 아래에서 `padBottom` − 4px) |
 * | 가로 | 축 칸(28px) ~ `right`, 이름 수로 등분, 칸 사이 `gap` |
 *
 * @example
 * ```tsx
 * <ChartCategoryAxis labels={["Total", "Allocated", "Active", "Effective"]} padBottom={18} gap={4} />
 * ```
 */
export type ChartCategoryAxisProps = {
  /** 막대 순서대로 이름. */
  labels: string[];
  /** 플롯 아래 여백(px) — 이름 줄 자리. 막대 차트와 같게. 기본 18. */
  padBottom?: number;
  /** 플롯 오른쪽 끝(px 또는 CSS 길이). 기본 8. */
  right?: number | string;
  /** 칸 사이 간격(px). 막대 칸 간격과 같게. 기본 4. */
  gap?: number;
};

export default function ChartCategoryAxis({ labels, padBottom = 18, right = 8, gap = 4 }: ChartCategoryAxisProps) {
  return (
    <div
      className="absolute flex pointer-events-none"
      style={{ left: AXIS_GUTTER, right, bottom: 0, height: padBottom - 4, gap }}
    >
      {labels.map((label, i) => (
        <span
          key={i}
          title={label}
          className="flex-1 min-w-0 text-chart text-tertiary leading-none text-center truncate"
          style={{ fontFamily: "var(--font-family-numeric)" }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

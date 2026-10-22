import { AXIS_GUTTER, axisTicks, plotY } from "./_axisScale";

/**
 * ChartGrid — 값축 눈금마다 가로 점선을 긋는 플롯 격자. Primitives layer.
 *
 * ## Purpose
 * 선 · 막대 · 예측 차트의 «눈금에서 플롯을 가로지르는 점선» 을 한 곳이 그린다. 차트마다 격자를 따로
 * 그리던 시절 4벌이 있었고, 색이 이미 `border-default` 반투명 · `border-default` 불투명으로 갈려 있었다
 * (patterns §26). 격자가 칸마다 다르면 한 줄에 놓인 위젯들이 다른 종류처럼 읽힌다.
 *
 * ## When to use
 * - 값축(Y)이 있는 직교 좌표 차트의 플롯 — [[ChartValueAxis]] 와 짝으로 쓴다. 같은 `max` · 여백을 준다.
 * - 새 차트를 만들 때 격자를 직접 그리지 않고 이것을 놓는다.
 *
 * ## When NOT to use
 * - 값축이 없는 차트(도넛 · 아크 · 헥사 · 히트맵 격자) — 격자가 읽을 눈금이 없다.
 * - 판정 분포 격자([[ScatterHeatmap]] 10칸) — 구조가 다르다. 색만 같다.
 * - 임계선 — 임계는 판정이라 격자가 아니다. [[ForecastLineChart]] `threshold` 처럼 차트가 판정 색으로 긋는다.
 *
 * ## Composition rules
 * - **마크보다 먼저(아래)** 그린다. 위에 그리면 점선이 선 · 막대를 끊는다.
 * - `position: relative` 이고 높이가 정해진 플롯 상자 안에 둔다. 가로는 `--wds-widget-axis-gutter` 에서 시작해
 *   오른쪽 `right` 까지, 세로는 상자 높이에서 `padTop` · `padBottom` 을 뺀 플롯 안에 눈금을 나눈다.
 * - 눈금은 [[ChartValueAxis]] 와 같은 셋(최대 · 절반 · 0). `max` 가 0 이면 바닥 하나.
 * - 색은 `--color-border-soft` 하나. 불투명도로 색을 흉내 내지 않는다(§26 결정).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 선 | 1px dashed `--color-border-soft` |
 * | 가로 범위 | 왼쪽 `--wds-widget-axis-gutter`(28px) ~ 오른쪽 `right`(기본 8px) |
 * | 눈금 위치 | `padTop + (상자 높이 − padTop − padBottom) × (1 − ratio)`, ratio ∈ {1, 0.5, 0} |
 * | 접근성 | 장식 — `aria-hidden` |
 *
 * @example
 * ```tsx
 * <div className="relative" style={{ height: 120 }}>
 *   <ChartGrid max={100} />
 *   {marks}
 *   <ChartValueAxis max={100} unit="%" />
 * </div>
 * ```
 */
export type ChartGridProps = {
  /** 값축 최대(이미 보기 좋은 값으로 올린 것). 0 이면 바닥 눈금 하나만. */
  max: number;
  /** 플롯 위 여백(px). 상자 위 끝에서 최대 눈금까지. 기본 4. */
  padTop?: number;
  /** 플롯 아래 여백(px). 바닥 눈금에서 상자 아래 끝까지 — X축 글자 자리. 기본 14. */
  padBottom?: number;
  /** 플롯 오른쪽 끝(px 또는 CSS 길이). 선 끝 값 배지 칸이 있으면 `var(--wds-widget-end-gutter)`. 기본 8. */
  right?: number | string;
};

export default function ChartGrid({ max, padTop = 4, padBottom = 14, right = 8 }: ChartGridProps) {
  return (
    <>
      {axisTicks(max).map((ratio) => (
        <div
          key={`grid-${ratio}`}
          aria-hidden
          className="absolute"
          style={{
            left: AXIS_GUTTER,
            right,
            top: plotY(padTop, padBottom, 1 - ratio),
            height: 0,
            borderTop: "1px dashed var(--color-border-soft)",
          }}
        />
      ))}
    </>
  );
}

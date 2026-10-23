/**
 * ChartSwatch — 범례 항목 앞에 서는 색 견본. 마크 모양을 따른다. Primitives layer.
 *
 * ## Purpose
 * 범례는 «이 색이 어느 계열인가» 를 말한다. 견본이 마크와 같은 모양이면 «어떤 마크인가» 까지 말해, 범례와 플롯을 오갈 때
 * 짝이 바로 읽힌다. 차트마다 견본을 따로 그리던 시절 DS 안에서만 네 모양(8px 사각 · 8px 원 · 8×2 선 · 10px 사각)으로
 * 갈려 있었고, 라이브 제품도 사각 · 원 · 세로 막대 셋이었다(patterns §26).
 *
 * ## When to use
 * - 이름 없이 견본만 세울 때 — 표 · 툴팁 안의 색 표지, 문장 속 «이 색» 표시.
 * - 이름을 범례가 아닌 자리(표 머리 · 설명 글)가 이미 말하고, 색만 짝지어 주면 될 때.
 *
 * ## When NOT to use
 * - 범례 항목(견본 + 이름 + 값) → [[ChartLegendItem]]. 같은 견본을 그리고 간격 · 글자까지 정한다.
 * - 상태 배지 · 알림 점 → [[Chip]] · tone. 범례 견본은 차트 마크의 짝이지 상태 표지가 아니다.
 * - 색 범례 바(순차 · 강도 스케일) → [[HeatmapLegend]].
 *
 * ## Composition rules
 * - **모양은 마크를 따른다(§26 결정, 2026-10-21).** 선 계열 = `line`, 면 · 막대 · 조각 · 칸 = `square`(기본), 점 · 버블 = `dot`([[ScatterChart]], 2026-10-23).
 * - 크기는 하나(8px). 차트가 크기를 정하지 않는다 — 한 줄의 범례가 칸마다 달라진다.
 * - `color` 는 마크와 같은 토큰(`var(--color-chart-series-N)` · `--color-chart-speed-*` · 상태 토큰). hex 금지.
 * - 이름 글자와 사이 4px 는 [[ChartLegendItem]] 이 정한다. 견본은 색 · 모양만.
 *
 * ## Spec
 * | 항목 | `square` | `line` | `dot` |
 * |---|---|---|---|
 * | 크기 | 8 × 8px | 8 × 2px | 8 × 8px |
 * | 반경 | 2px | 1px | 원(50%) |
 * | 세로 정렬 | 이름 글자 가운데 | 이름 글자 가운데 | 이름 글자 가운데 |
 * | 접근성 | 장식(`aria-hidden`) — 이름은 범례 글자가 말한다 | 같음 | 같음 |
 *
 * @example
 * ```tsx
 * <ChartSwatch color="var(--color-chart-series-1)" shape="line" />
 * <ChartSwatch color="var(--color-status-error)" />
 * ```
 */
import { SwatchMark, type ChartSwatchShape } from "./_swatch";

export type { ChartSwatchShape };

export type ChartSwatchProps = {
  /** 마크와 같은 색 토큰. hex 금지. */
  color: string;
  /** 마크 모양. 선 계열 `line`, 면 · 막대 · 조각 · 칸 `square`, 점 · 버블 `dot`. 기본 `square`. */
  shape?: ChartSwatchShape;
};

export default function ChartSwatch({ color, shape = "square" }: ChartSwatchProps) {
  return <SwatchMark color={color} shape={shape} />;
}

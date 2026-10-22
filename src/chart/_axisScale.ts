/**
 * chart/_axisScale — 값축 계산(순수 함수). 카탈로그 밖 내부 모듈.
 *
 * [[ChartGrid]] · [[ChartValueAxis]] 와 그 둘을 쓰는 차트가 같은 계산을 공유한다. 그리는 부품이 아니라
 * 숫자만 다루므로 계층이 없다(`_tokens.ts` 와 같은 자리). 그리는 쪽은 두 Primitives 가 맡는다.
 */

/** 플롯 왼쪽 Y축 눈금 칸 — 모든 값축 차트가 같은 x 에 Y축 선을 세운다(patterns §15). */
export const AXIS_GUTTER = "var(--wds-widget-axis-gutter)";

/** 1 · 2 · 4 · 5 · 10 × 10ⁿ 중 v 이상인 가장 작은 값. 0 이하면 0. */
export function niceMax(v: number): number {
  if (v <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 4 ? 4 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

/** 눈금 · 값 라벨 숫자. 1000 이상은 `1.2K`, 그 아래는 정수로 반올림. */
export function formatAxisValue(v: number): string {
  if (v >= 1000) return Math.round(v / 100) / 10 + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(0);
}

/** 눈금 위치(최대 대비 비율). 최대가 0 이면 바닥 하나. */
export function axisTicks(max: number): number[] {
  return max > 0 ? [1, 0.5, 0] : [0];
}

/** 플롯 상자 안 세로 위치. ratioFromTop 0 = 플롯 위 끝, 1 = 바닥. 플롯 높이 = 상자 높이 − 위아래 여백. */
export function plotY(padTop: number, padBottom: number, ratioFromTop: number): string {
  return `calc(${padTop}px + (100% - ${padTop + padBottom}px) * ${ratioFromTop})`;
}

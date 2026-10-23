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

/** 최고점 값 글자. 눈금보다 정밀하게 — 1000 이상은 소수 둘째 자리 K, 100 미만은 소수 첫째 자리. */
export function formatPeakValue(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1000) return (v / 1000).toFixed(2) + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** 눈금 위치(최대 대비 비율). 최대가 0 이면 바닥 하나. */
export function axisTicks(max: number): number[] {
  return max > 0 ? [1, 0.5, 0] : [0];
}

/**
 * 눈금 위치와 값. `ticks`(값 목록)를 주면 그 값들에, 없으면 최대 · 절반 · 0 에.
 * 값이 데이터에서 오는 차트(단계 막대의 단계 값 · 판정 경계)가 `ticks` 를 쓴다. 최대 밖 값은 버린다.
 */
export function tickStops(max: number, ticks?: number[]): { ratio: number; value: number }[] {
  if (!ticks) return axisTicks(max).map((ratio) => ({ ratio, value: max * ratio }));
  return ticks.filter((v) => v >= 0 && v <= max).map((value) => ({ ratio: max > 0 ? value / max : 0, value }));
}

/** 플롯 상자 안 세로 위치. ratioFromTop 0 = 플롯 위 끝, 1 = 바닥. 플롯 높이 = 상자 높이 − 위아래 여백. */
export function plotY(padTop: number, padBottom: number, ratioFromTop: number): string {
  return `calc(${padTop}px + (100% - ${padTop + padBottom}px) * ${ratioFromTop})`;
}

/**
 * 시간 구간(ms) 눈금 — 1 · 2 · 5 × 10ⁿ ms 간격 중 눈금이 `target` 개 안팎이 되는 값. Flame · Waterfall 처럼 «경과 시간» 이 X 인 차트.
 * 구간 안쪽 눈금만 돌려준다(양 끝 포함 여부는 간격이 정한다).
 */
export function durationTicks(t0: number, t1: number, target = 6): number[] {
  const span = t1 - t0;
  if (!(span > 0)) return [t0];
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(t0 / step) * step; v <= t1 + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

/** 경과 시간 글자 — 1초 미만 `120ms`, 그 위 `1.5s` · `12s`, 1분 이상 `1m 30s`. */
export function formatDuration(ms: number): string {
  if (Math.abs(ms) < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (Math.abs(s) < 60) return `${+s.toFixed(s < 10 ? 2 : 1)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s - m * 60);
  return r ? `${m}m ${r}s` : `${m}m`;
}

/**
 * chart/_stripes — 막대를 `levels` 칸(줄)으로 끊어 그리는 차트의 칸 수 계산. 카탈로그 밖 내부 모듈.
 *
 * [[ChartRadialBars]](호)와 [[EqualizerChart]](직선)가 같은 규칙을 쓴다 — 칸 하나 = `max ÷ levels`. 두 Primitive/Composite 가 서로
 * import 하지 않도록 계산만 여기 둔다(`_axisScale.ts` 와 같은 자리).
 */

/**
 * 칸 하나의 구간별 줄 수. 칸 전체 줄 수 = 합 ÷ max × levels(반올림, levels 이하)를 먼저 정하고 구간에 최대 나머지로 나눈다 —
 * 구간마다 따로 반올림하면 34 · 33 · 33(합 = max)이 9줄로 모자란다. 0 보다 큰 구간은 최소 1줄.
 */
export function stripeCounts(values: ReadonlyArray<number>, max: number, levels: number): number[] {
  if (max <= 0) return values.map(() => 0);
  const exact = values.map((v) => (v > 0 ? (v / max) * levels : 0));
  const positive = exact.filter((e) => e > 0).length;
  const sum = exact.reduce((a, b) => a + b, 0);
  const target = Math.min(levels, Math.max(positive, Math.round(sum)));
  const out = exact.map((e) => (e > 0 ? Math.max(1, Math.floor(e)) : 0));
  let diff = target - out.reduce((a, b) => a + b, 0);
  // 모자라면 나머지가 큰 구간부터 한 줄씩, 넘치면 줄이 가장 많은 구간부터 한 줄씩(1줄 아래로는 내리지 않는다).
  const order = exact.map((e, i) => ({ i, rem: e - Math.floor(e) })).filter((o) => exact[o.i] > 0).sort((x, y) => y.rem - x.rem);
  for (let k = 0; diff > 0 && order.length; k = (k + 1) % order.length, diff--) out[order[k].i] += 1;
  while (diff < 0) {
    let i = -1;
    out.forEach((n, k) => { if (n > 1 && (i < 0 || n > out[i])) i = k; });
    if (i < 0) break;
    out[i] -= 1;
    diff += 1;
  }
  return out;
}

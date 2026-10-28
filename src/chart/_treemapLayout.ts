/**
 * chart/_treemapLayout — 트리맵 배치(squarified). 카탈로그 밖 내부 모듈 · 순수 함수.
 *
 * Bruls · Huizing · van Wijk(2000) squarified 알고리즘 — 칸이 정사각에 가까워지도록 한 줄씩 채운다. 칸 비율이 납작하면 면적을
 * 눈으로 견주기 어렵다. [[Treemap]] 이 쓴다(`_axisScale.ts` 와 같은 자리).
 */
export type TreemapRect = { x: number; y: number; w: number; h: number };

/** 값(양수) 목록 → 같은 순서의 칸 사각형. 상자(x, y, w, h)를 값 비례 면적으로 나눈다. 0 · 음수는 넓이 0. */
export function squarify(values: ReadonlyArray<number>, box: TreemapRect): TreemapRect[] {
  const out: TreemapRect[] = values.map(() => ({ x: box.x, y: box.y, w: 0, h: 0 }));
  const total = values.reduce((n, v) => n + Math.max(0, v), 0);
  if (total <= 0 || box.w <= 0 || box.h <= 0) return out;
  const scale = (box.w * box.h) / total;
  /* 큰 값부터 배치해야 squarified 가 성립한다 — 원래 순서는 인덱스로 되돌린다 */
  const order = values.map((v, i) => ({ i, a: Math.max(0, v) * scale })).filter((o) => o.a > 0).sort((p, q) => q.a - p.a);
  let { x, y, w, h } = box;
  let row: typeof order = [];
  const worst = (r: typeof order, side: number) => {
    const s = r.reduce((n, o) => n + o.a, 0);
    const mx = Math.max(...r.map((o) => o.a));
    const mn = Math.min(...r.map((o) => o.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  const lay = (r: typeof order) => {
    const s = r.reduce((n, o) => n + o.a, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      for (const o of r) { const ch = o.a / cw; out[o.i] = { x, y: cy, w: cw, h: ch }; cy += ch; }
      x += cw; w -= cw;
    } else {
      const ch = s / w;
      let cx = x;
      for (const o of r) { const cw = o.a / ch; out[o.i] = { x: cx, y, w: cw, h: ch }; cx += cw; }
      y += ch; h -= ch;
    }
  };
  for (const o of order) {
    const side = Math.min(w, h);
    if (row.length === 0 || worst([...row, o], side) <= worst(row, side)) row.push(o);
    else { lay(row); row = [o]; }
  }
  if (row.length) lay(row);
  return out;
}

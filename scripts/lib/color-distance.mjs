/**
 * color-distance — 두 색이 얼마나 구별되는가를 숫자로 잰다.
 *
 * dataviz 스킬의 `validate_palette.js` 와 **같은 식**이다. 둘의 숫자가 다르면
 * 문서(patterns.md §20 · §23)에 적힌 측정값과 tokens.json 이 서로 다른 말을 하게 되므로
 * 식을 바꾸지 않는다.
 *
 * - ΔE: OKLab 유클리드 거리 ×100
 * - 색각 이상: Machado · Oliveira · Fernandes (2009) severity 1.0, 선형 RGB 에서 변환
 *   (임계값 15 · 8 이 이 모델 기준으로 보정돼 있다 — 다른 모델로 바꾸면 경계 쌍이 움직인다)
 */

const MACHADO = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

export const isHex = (v) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim());

const hex2srgb = (h) => {
  const s = h.trim().replace(/^#/, "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};
const s2lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lin = (h) => hex2srgb(h).map(s2lin);

function oklabFromLin([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function simulate(h, kind) {
  const [r, g, b] = lin(h);
  const M = MACHADO[kind];
  const clamp = (c) => Math.max(0, Math.min(1, c));
  return M.map((row) => clamp(row[0] * r + row[1] * g + row[2] * b));
}

/** OKLab ΔE ×100. `kind` 없으면 정상시야, `"protan"` · `"deutan"` 이면 시뮬레이션 후. */
export function deltaE(h1, h2, kind) {
  const a = oklabFromLin(kind ? simulate(h1, kind) : lin(h1));
  const b = oklabFromLin(kind ? simulate(h2, kind) : lin(h2));
  return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

const round1 = (n) => Math.round(n * 10) / 10;

/** 정상시야 · protan · deutan 세 값을 소수 첫째 자리로. */
export function distances(h1, h2) {
  return {
    normal: round1(deltaE(h1, h2)),
    protan: round1(deltaE(h1, h2, "protan")),
    deutan: round1(deltaE(h1, h2, "deutan")),
  };
}

#!/usr/bin/env node
/**
 * build-geo-regions — GeoMap 이 국가를 눌러 들어갈 때 그리는 시·도 도형 `src/chart/_geoRegions.ts` 를 만든다(생성물 · 직접 편집 금지).
 *
 * 원천: Natural Earth 1:10m Admin 1 States, Provinces(퍼블릭 도메인) v5.1.2 GeoJSON — 40MB 라 저장소 · npm 에 두지 않고
 * 고정 주소에서 받아 `node_modules/.cache/` 에 둔다. SHA-256 이 다르면 멈춘다(원천이 몰래 바뀌지 않게).
 * 코드 = ISO 3166-2(`KR-11`) · 이름 = Natural Earth `name_ko`.
 * 투영: 세계 지도와 같은 Equal Earth 를 국가 가운데 경도 기준으로(중앙 경선을 옮겨 가장자리 기울어짐을 줄인다).
 * 줄이기: Douglas–Peucker 0.4px(폭 1000 기준) · 1.5px² 보다 작은 섬은 뺀다(시·도의 유일한 고리는 남긴다).
 *
 *   node scripts/build-geo-regions.mjs          # 다시 만든다
 *   node scripts/build-geo-regions.mjs --check  # 생성물이 원천과 같은지(다르면 exit 1)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "src/chart/_geoRegions.ts");
const SRC_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson";
const SRC_SHA = "22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5";
const cache = join(root, "node_modules/.cache/ne_10m_admin_1_v5.1.2.geojson");

/* 지원 국가 — 경계 상자(경도 · 위도). 상자 밖 고리는 뺀다: 도쿄도의 오가사와라 제도(북위 27°, 본토에서 1000km)가
   일본 전체를 작게 만들지 않게. 독도(동경 131.87°)는 상자 안. */
const COUNTRIES = {
  KR: { lon: [124.5, 132], lat: [33, 38.7] },
  JP: { lon: [122.5, 146.2], lat: [24, 45.8] },
};

async function source() {
  if (!existsSync(cache)) {
    console.log(`· 원천 받는 중 — ${SRC_URL}`);
    const res = await fetch(SRC_URL);
    if (!res.ok) throw new Error(`원천을 받지 못했다: ${res.status}`);
    mkdirSync(dirname(cache), { recursive: true });
    writeFileSync(cache, Buffer.from(await res.arrayBuffer()));
  }
  const buf = readFileSync(cache);
  const sha = createHash("sha256").update(buf).digest("hex");
  if (sha !== SRC_SHA) {
    console.error(`✗ 원천 해시가 다르다(${sha.slice(0, 12)}…) — ${cache} 를 지우고 다시 받거나, 원천을 올렸다면 SRC_SHA 를 고친다`);
    process.exit(1);
  }
  return JSON.parse(buf.toString("utf8"));
}

/* Equal Earth — build-geo-world.mjs 와 같은 식. 중앙 경선 lon0 */
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
const project = (lon, lat, lon0) => {
  const lam = ((lon - lon0) * Math.PI) / 180;
  const th = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const t2 = th * th, t6 = t2 * t2 * t2;
  return [(lam * Math.cos(th)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))), th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))];
};

/* Douglas–Peucker — 닫힌 고리. 첫 점 · 가장 먼 점으로 둘로 나눠 각각 줄인다 */
function simplify(pts, tol) {
  const keep = new Uint8Array(pts.length);
  const stack = [[0, pts.length - 1]];
  keep[0] = keep[pts.length - 1] = 1;
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      const d = len ? Math.abs(dy * px - dx * py + bx * ay - by * ax) / len : Math.hypot(px - ax, py - ay);
      if (d > best) { best = d; bi = i; }
    }
    if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const areaOf = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length - 1; i++) a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return a / 2;
};

/* Natural Earth 5.1.2 이후 바뀐 공식 이름(코드는 그대로) */
const RENAMED = { "KR-42": "강원특별자치도", "KR-45": "전북특별자치도" };

/* 버블 자리 — 가장 큰 고리 안에서 경계(구멍 포함 모든 고리)와 가장 먼 점. 무게중심은 고리 모양 지역에서
   구멍 안으로 떨어진다(경기도의 무게중심은 서울 안이다). 격자로 찾고 둘레를 두 번 좁혀 다듬는다 */
function labelPoint(ring, rings) {
  const inside = ([x, y]) => {
    let c = false;
    for (const r of rings)
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const [xi, yi] = r[i], [xj, yj] = r[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
    return c;
  };
  const edge = ([x, y]) => {
    let m = Infinity;
    for (const r of rings)
      for (let i = 0; i < r.length - 1; i++) {
        const [ax, ay] = r[i], [bx, by] = r[i + 1];
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        const t = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)) : 0;
        m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
      }
    return m;
  };
  let [x0, x1, y0, y1] = [Math.min(...ring.map((p) => p[0])), Math.max(...ring.map((p) => p[0])), Math.min(...ring.map((p) => p[1])), Math.max(...ring.map((p) => p[1]))];
  let best = ring[0], bd = -1;
  for (let round = 0; round < 3; round++) {
    const N = 24;
    for (let i = 0; i <= N; i++)
      for (let j = 0; j <= N; j++) {
        const p = [x0 + ((x1 - x0) * i) / N, y0 + ((y1 - y0) * j) / N];
        if (!inside(p)) continue;
        const d = edge(p);
        if (d > bd) { bd = d; best = p; }
      }
    const sx = (x1 - x0) / N, sy = (y1 - y0) / N;
    [x0, x1, y0, y1] = [best[0] - 2 * sx, best[0] + 2 * sx, best[1] - 2 * sy, best[1] + 2 * sy];
  }
  return best;
}

const W = 1000, TOL = 0.4, MIN_AREA = 1.5;
const geo = await source();
const countries = {};
for (const [cc, box] of Object.entries(COUNTRIES)) {
  const lon0 = (box.lon[0] + box.lon[1]) / 2;
  const feats = geo.features.filter((f) => f.properties.iso_a2 === cc).sort((a, b) => a.properties.iso_3166_2.localeCompare(b.properties.iso_3166_2));
  const inBox = (ring) => {
    const lon = ring.reduce((s, p) => s + p[0], 0) / ring.length, lat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    return lon >= box.lon[0] && lon <= box.lon[1] && lat >= box.lat[0] && lat <= box.lat[1];
  };
  /* 상자 안 바깥 고리 · 구멍을 투영 좌표로 */
  const raw = feats.map((f) => {
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    return { f, rings: polys.filter((p) => inBox(p[0])).flatMap((p) => p.map((r) => r.map(([lon, lat]) => project(lon, lat, lon0)))) };
  });
  const all = raw.flatMap((r) => r.rings.flat());
  const x0 = Math.min(...all.map((p) => p[0])), x1 = Math.max(...all.map((p) => p[0]));
  const y0 = Math.min(...all.map((p) => p[1])), y1 = Math.max(...all.map((p) => p[1]));
  const k = W / (x1 - x0);
  const H = Math.round((y1 - y0) * k);
  const toPx = ([x, y]) => [(x - x0) * k, (y1 - y) * k];

  const shapes = raw.map(({ f, rings }) => {
    const px = rings.map((r) => simplify(r.map(toPx), TOL)).filter((r) => r.length >= 4);
    const biggest = Math.max(...px.map((r) => Math.abs(areaOf(r))));
    let d = "";
    let best = { area: -1, ring: px[0] };
    for (const r of px) {
      const a = Math.abs(areaOf(r));
      if (a < MIN_AREA && a < biggest) continue;
      const pts = r.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]);
      let seg = `M${pts[0][0]},${pts[0][1]}l`;
      let [qx, qy] = pts[0];
      for (const [x, y] of pts.slice(1)) {
        const dx = +(x - qx).toFixed(1), dy = +(y - qy).toFixed(1);
        if (!dx && !dy) continue;
        seg += `${dx},${dy} `.replace(/,-/, "-");
        qx = +(qx + dx).toFixed(1); qy = +(qy + dy).toFixed(1);
      }
      /* 반올림하면 한 점으로 줄어드는 고리는 «M x,y l z» 가 된다 — 브라우저가 path 를 그 자리에서 끊으므로 뺀다 */
      if (seg.endsWith("l")) continue;
      d += seg.trimEnd().replace(/ -/g, "-") + "z";
      if (a > best.area) best = { area: a, ring: r };
    }
    const at = labelPoint(best.ring, px);
    const p = f.properties;
    return { code: p.iso_3166_2, name: RENAMED[p.iso_3166_2] ?? (p.name_ko || p.name), nameEn: p.name_en || p.name, cx: +at[0].toFixed(1), cy: +at[1].toFixed(1), d };
  });
  countries[cc] = { w: W, h: H, shapes };
}

const src = `/* 생성물 — scripts/build-geo-regions.mjs. 직접 편집 금지.
 * 원천: Natural Earth 1:10m Admin 1 시·도 경계(퍼블릭 도메인) v5.1.2. 투영 Equal Earth(중앙 경선 = 국가 가운데) · Douglas–Peucker ${TOL}px.
 * code = ISO 3166-2(\`KR-11\`). cx · cy = 가장 큰 고리 안에서 경계와 가장 먼 점(버블 자리 — 무게중심은 경기처럼 구멍 있는 지역에서 구멍 안으로 떨어진다). 국가마다 좌표계(w × h)가 따로다. */
import type { GeoCountryShape } from "./_geoWorld";

export type GeoRegionSet = { w: number; h: number; shapes: ReadonlyArray<GeoCountryShape> };

/** 시·도 도형이 있는 국가(ISO 3166-1 alpha-2) → 그 나라 시·도. GeoMap 은 이 국가만 눌러 들어갈 수 있다. */
export const GEO_REGIONS: Readonly<Record<string, GeoRegionSet>> = ${JSON.stringify(countries)};
`;

if (process.argv.includes("--check")) {
  const cur = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (cur !== src) {
    console.error("✗ src/chart/_geoRegions.ts 가 원천과 다르다 — node scripts/build-geo-regions.mjs");
    process.exit(1);
  }
  console.log(`✓ _geoRegions.ts 원천과 같음 (${Object.keys(countries).join(" · ")})`);
} else {
  writeFileSync(out, src);
  const sum = Object.entries(countries).map(([c, v]) => `${c} ${v.shapes.length}곳 ${v.w}×${v.h}`).join(" · ");
  console.log(`✓ ${sum} · ${(src.length / 1024).toFixed(0)}KB`);
}

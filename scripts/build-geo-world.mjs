#!/usr/bin/env node
/**
 * build-geo-world — GeoMap 의 국가 도형 `src/chart/_geoWorld.ts` 를 만든다(생성물 · 직접 편집 금지).
 *
 * 원천: Natural Earth 1:110m Admin 0(퍼블릭 도메인) — `world-atlas@2.0.2` 의 TopoJSON 재배포본.
 * 국가 코드 · 한국어 이름: `i18n-iso-countries`(ISO 3166-1 숫자 → alpha-2).
 * 투영: Equal Earth(면적 보존 — 단계 구분도에서 큰 나라가 값보다 크게 보이지 않게). 남극은 뺀다(값이 없고 세로 공간을 먹는다).
 *
 *   node scripts/build-geo-world.mjs          # 다시 만든다
 *   node scripts/build-geo-world.mjs --check  # 생성물이 원천과 같은지(다르면 exit 1)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "src/chart/_geoWorld.ts");

const topo = require("world-atlas/countries-110m.json");
const { feature } = require("topojson-client");
const iso = require("i18n-iso-countries");
iso.registerLocale(require("i18n-iso-countries/langs/ko.json"));
iso.registerLocale(require("i18n-iso-countries/langs/en.json"));

/* Equal Earth — 런타임 `_geo.ts` 의 projectEqualEarth 와 같은 식(격자 · 버블이 도형과 맞는다) */
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
const project = (lon, lat) => {
  const lam = (lon * Math.PI) / 180;
  const th = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const t2 = th * th, t6 = t2 * t2 * t2;
  return [(lam * Math.cos(th)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))), th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))];
};

/* 코드가 없는(-99 · 미지정) 지역 — Natural Earth 이름으로 정한다 */
const FALLBACK = { Kosovo: "XK", "N. Cyprus": "CY", Somaliland: "SO" };

const fc = feature(topo, topo.objects.countries);
const items = fc.features.filter((f) => f.properties.name !== "Antarctica");

/* 화면 좌표: 폭 1000, y 아래로. 경계는 투영 경도 ±180 · 위도 −60~84(남극 제외 범위) */
const [xMax] = project(180, 0);
const yTop = project(0, 84)[1], yBottom = project(0, -60)[1];
const W = 1000;
const k = W / (2 * xMax);
const H = Math.round((yTop - yBottom) * k);
const toPx = ([x, y]) => [+((x + xMax) * k).toFixed(1), +((yTop - y) * k).toFixed(1)];

const rows = items.map((f) => {
  const name = f.properties.name;
  const code = (f.id && iso.numericToAlpha2(f.id)) || FALLBACK[name] || null;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = "";
  let best = { area: -1, cx: 0, cy: 0 };
  for (const poly of polys) {
    poly.forEach((raw, ri) => {
      /* 날짜변경선(±180)을 건너는 고리(러시아 · 피지) — 경도를 이어 붙이고(unwrap) 넘친 쪽을 ∓360 사본으로 한 번 더 그린다.
         지도 밖으로 나간 부분은 컴포넌트가 외곽(GEO_OUTLINE)으로 자른다 */
      const ring = [raw[0]];
      for (const [lon, lat] of raw.slice(1)) {
        let l = lon;
        const prev = ring[ring.length - 1][0];
        while (l - prev > 180) l -= 360;
        while (l - prev < -180) l += 360;
        ring.push([l, lat]);
      }
      const lons = ring.map(([l]) => l);
      const shifts = [0, ...(Math.max(...lons) > 180 ? [-360] : []), ...(Math.min(...lons) < -180 ? [360] : [])];
      for (const sh of shifts) {
      const pts = ring.map(([lon, lat]) => toPx(project(lon + sh, lat)));
      /* 상대 좌표(l) — 크기를 줄인다. 같은 점은 건너뛴다 */
      let seg = `M${pts[0][0]},${pts[0][1]}l`;
      let [px, py] = pts[0];
      for (const [x, y] of pts.slice(1)) {
        const dx = +(x - px).toFixed(1), dy = +(y - py).toFixed(1);
        if (!dx && !dy) continue;
        seg += `${dx},${dy} `.replace(/,-/, "-");
        px = +(px + dx).toFixed(1); py = +(py + dy).toFixed(1);
      }
      /* 반올림하면 한 점으로 줄어드는 고리는 «M x,y l z» 가 된다 — 브라우저가 path 를 그 자리에서 끊으므로 뺀다 */
      if (seg.endsWith("l")) continue;
      d += seg.trimEnd().replace(/ -/g, "-") + "z";
      if (ri || sh) continue;
      /* 가장 큰 바깥 고리의 무게중심 — 버블 자리 */
      let a = 0, cx = 0, cy = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        const c = x0 * y1 - x1 * y0;
        a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
      }
      if (Math.abs(a) > best.area && cx / (3 * a) >= 0 && cx / (3 * a) <= W) best = { area: Math.abs(a), cx: cx / (3 * a), cy: cy / (3 * a) };
      }
    });
  }
  return {
    code,
    name: (code && iso.getName(code, "ko")) || name,
    nameEn: name,
    cx: +best.cx.toFixed(1),
    cy: +best.cy.toFixed(1),
    d,
  };
});

/* 경위도 격자 30° · 외곽(경도 ±180 · 위도 −60 · 84) — 같은 투영. Equal Earth 의 위선은 직선이라 양 끝 두 점 */
const line = (pts) => "M" + pts.map((p) => toPx(project(...p)).join(",")).join("L");
const range = (a, b, step) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);
const graticule = [
  ...range(-150, 150, 30).map((lon) => line(range(-60, 84, 4).concat(84).map((lat) => [lon, lat]))),
  ...[-30, 0, 30, 60].map((lat) => line([-180, 180].map((lon) => [lon, lat]))),
].join("");
const outline =
  line([...range(-60, 84, 4).concat(84).map((lat) => [-180, lat]), ...[-180, 180].map((lon) => [lon, 84]), ...range(-60, 84, 4).concat(84).reverse().map((lat) => [180, lat]), ...[-180, 180].reverse().map((lon) => [lon, -60])]) + "Z";

const src = `/* 생성물 — scripts/build-geo-world.mjs. 직접 편집 금지.
 * 원천: Natural Earth 1:110m Admin 0 국가 경계(퍼블릭 도메인) · world-atlas@2.0.2 재배포본. 투영 Equal Earth · 남극 제외.
 * code = ISO 3166-1 alpha-2(코드 없는 지역은 이름으로 정한 값 · 없으면 null). cx · cy = 가장 큰 고리의 무게중심(버블 자리). */
export type GeoCountryShape = { code: string | null; name: string; nameEn: string; cx: number; cy: number; d: string };

/** 도형 좌표계 — 폭 · 높이(px 단위 viewBox). */
export const GEO_WORLD_SIZE = { w: ${W}, h: ${H} } as const;

/** 경위도 격자 30° · 지도 외곽 — 같은 투영. */
export const GEO_GRATICULE = ${JSON.stringify(graticule)};
export const GEO_OUTLINE = ${JSON.stringify(outline)};

/** ISO alpha-2 → 한국어 이름 — 도형에 없는 작은 나라(지도 밖 줄)도 이름으로 말한다. */
export const GEO_NAMES: Readonly<Record<string, string>> = ${JSON.stringify(Object.fromEntries(Object.entries(iso.getNames("ko", { select: "official" })).sort()))};

export const GEO_WORLD: ReadonlyArray<GeoCountryShape> = ${JSON.stringify(rows)};
`;

if (process.argv.includes("--check")) {
  const cur = readFileSync(out, "utf8");
  if (cur !== src) {
    console.error("✗ src/chart/_geoWorld.ts 가 원천과 다르다 — node scripts/build-geo-world.mjs");
    process.exit(1);
  }
  console.log(`✓ _geoWorld.ts 원천과 같음 (${rows.length}개국)`);
} else {
  writeFileSync(out, src);
  const noCode = rows.filter((r) => !r.code).map((r) => r.nameEn);
  console.log(`✓ ${rows.length}개국 · ${(src.length / 1024).toFixed(0)}KB · ${W}×${H}${noCode.length ? ` · 코드 없음: ${noCode.join(", ")}` : ""}`);
}

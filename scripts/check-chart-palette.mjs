/**
 * check-chart-palette — 차트 계열 팔레트 전용 게이트 (Chart Art).
 *
 * ## 왜 따로 두나
 * 차트 계열 색은 다른 토큰에 없는 조건을 진다 — 계열끼리 구별돼야 하고(색각 이상 포함),
 * 맞닿는 차트에서는 모든 쌍이, 레거시 엔티티 순서로 쌓아도, 그리고 Severity 색과도 구별돼야
 * 한다. 이 조건들은 `patterns.md` §18 · §20 · §21 · §23 에 적혀 있었지만 **사람이 검증기를
 * 돌려야만** 지켜졌다. 2026-10-14 실측: 팔레트가 Severity 변별에서 8슬롯 중 6개 미달인 채로
 * 모든 게이트를 통과하고 있었다. 값은 한 곳(`whatap-ds.css`)에 두고, 차트 규칙은 여기서 집행한다.
 *
 * ## 무엇을 보나 (라이트 · 다크 각각, 실제 런타임 값)
 *   P1 밝기 대역 · 채도 하한 · 카드 표면 대비 ≥ 3:1           (§20, dataviz 검증기와 같은 기준)
 *   P2 인접 슬롯(1-2 … 7-8): 정상시야 ΔE ≥ 15 · 색각 이상 ≥ 8 (6~8 은 경고)
 *   P3 슬롯 1~3 모든 쌍: P2 와 같은 기준                        (§18 맞닿는 차트 3계열)
 *   P4 엔티티 순서(1·3·7·2·5·6) 이웃 쌍: P2 와 같은 기준        (§21)
 *   P5 모든 슬롯 ↔ Severity · info: 정상시야 ΔE ≥ 15           (§23)
 *   S  사본 값 일치 — `tokens.css`(라이트 · 다크) · 루트 `DESIGN.md`(라이트)가 런타임과 같은가.
 *      `token-sync` R2 는 첫 선언(라이트)만 비교해서 다크 사본이 갈라져도 통과했다.
 *
 * 식은 `lib/color-distance.mjs`(= dataviz `validate_palette.js`)와 같다. 문서에 적힌 측정값은
 * 이 스크립트의 출력이 정본이다 — 값을 바꾸면 출력으로 `tokens.md` 검증 표를 갱신한다.
 *
 * 사용: `node scripts/check-chart-palette.mjs`  (pnpm lint:chart-palette)
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deltaE, oklch, contrast } from "./lib/color-distance.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/** CSS 에서 :root(첫 선언)와 `.dark` 블록 값을 나눠 읽는다. */
function readModes(file) {
  const src = read(file).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const darkAt = src.search(/^\.dark\b/m);
  const pick = (text) => {
    const m = new Map();
    for (const x of text.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) if (!m.has(x[1])) m.set(x[1], x[2].trim());
    return m;
  };
  return { light: pick(darkAt >= 0 ? src.slice(0, darkAt) : src), dark: pick(darkAt >= 0 ? src.slice(darkAt) : "") };
}

const RUNTIME = readModes("src/whatap-ds.css");
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `--color-chart-series-${n}`);
const SEVERITY = ["--color-status-success", "--color-status-warning", "--color-status-error", "--color-indicator-critical", "--color-indicator-warning", "--color-status-info"];
const BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const CHROMA_FLOOR = 0.1, NORMAL = 15, CVD = 8, CVD_FLOOR = 6, CONTRAST = 3;
const ENTITY = [1, 3, 7, 2, 5, 6]; // method · sql · httpc · dbc · socket · resultset

const val = (mode, name) => (mode === "dark" ? RUNTIME.dark.get(name) ?? RUNTIME.light.get(name) : RUNTIME.light.get(name));
const fails = [], warns = [], report = {};
const fmt = (n) => n.toFixed(1);

for (const mode of ["light", "dark"]) {
  const pal = SLOTS.map((s) => val(mode, s));
  const surface = val(mode, "--color-card");
  const r = (report[mode] = {});
  pal.forEach((h, i) => {
    const [L, C] = oklch(h);
    if (L < BAND[mode][0] || L > BAND[mode][1]) fails.push(`${mode} series-${i + 1} ${h} 밝기 L ${L.toFixed(3)} — 대역 ${BAND[mode].join("~")} 밖`);
    if (C < CHROMA_FLOOR) fails.push(`${mode} series-${i + 1} ${h} 채도 C ${C.toFixed(3)} < ${CHROMA_FLOOR} (회색으로 읽힌다)`);
    const cr = contrast(h, surface);
    if (cr < CONTRAST) fails.push(`${mode} series-${i + 1} ${h} 대비 ${cr.toFixed(2)}:1 < 3:1 (표면 ${surface})`);
  });
  const pairCheck = (label, pairs) => {
    let wn = { v: 1e9 }, wc = { v: 1e9 };
    for (const [a, b] of pairs) {
      const [x, y] = [pal[a - 1], pal[b - 1]];
      const n = deltaE(x, y), c = Math.min(deltaE(x, y, "protan"), deltaE(x, y, "deutan"));
      if (n < wn.v) wn = { v: n, p: `${a}↔${b}` };
      if (c < wc.v) wc = { v: c, p: `${a}↔${b}` };
      if (n < NORMAL) fails.push(`${mode} ${label} ${a}↔${b} 정상시야 ΔE ${fmt(n)} < ${NORMAL}`);
      if (c < CVD_FLOOR) fails.push(`${mode} ${label} ${a}↔${b} 색각 이상 ΔE ${fmt(c)} < ${CVD_FLOOR}`);
      else if (c < CVD) warns.push(`${mode} ${label} ${a}↔${b} 색각 이상 ΔE ${fmt(c)} (6~8 — 직접 라벨 등 보조 표기 필수)`);
    }
    r[label] = `정상시야 최악 ${fmt(wn.v)} (${wn.p}) · 색각 이상 최악 ${fmt(wc.v)} (${wc.p})`;
  };
  pairCheck("인접", [1, 2, 3, 4, 5, 6, 7].map((i) => [i, i + 1]));
  pairCheck("1~3 전체", [[1, 2], [1, 3], [2, 3]]);
  pairCheck("엔티티 순서", ENTITY.slice(1).map((b, k) => [ENTITY[k], b]));
  let ws = { v: 1e9 };
  pal.forEach((h, i) => {
    for (const s of SEVERITY) {
      const sv = val(mode, s);
      const n = deltaE(h, sv);
      if (n < ws.v) ws = { v: n, p: `series-${i + 1}↔${s.replace("--color-", "")}` };
      if (n < NORMAL) fails.push(`${mode} series-${i + 1} ${h} ↔ ${s} ${sv} 정상시야 ΔE ${fmt(n)} < ${NORMAL} (§23)`);
    }
  });
  r["Severity"] = `정상시야 최악 ${fmt(ws.v)} (${ws.p})`;
  let wa = { v: 1e9 };
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) { const n = deltaE(pal[a], pal[b]); if (n < wa.v) wa = { v: n, p: `${a + 1}↔${b + 1}` }; }
  r["8색 전체 (참고)"] = `정상시야 최악 ${fmt(wa.v)} (${wa.p})`;
}

/* ── S. 사본 값 일치 ─────────────────────────────────────────────────────── */
const REF = readModes("src/tokens.css");
for (const mode of ["light", "dark"])
  for (const s of SLOTS) {
    const a = val(mode, s), b = mode === "dark" ? REF.dark.get(s) : REF.light.get(s);
    if (b && a.toLowerCase() !== b.toLowerCase()) fails.push(`사본 불일치 — src/tokens.css ${mode} ${s} = ${b}, 런타임 = ${a}`);
  }
const design = read("DESIGN.md");
for (const s of SLOTS) {
  const m = design.match(new RegExp(`${s.replace("--color-", "")}:\\s*"(#[0-9A-Fa-f]{6})"`));
  const a = val("light", s);
  if (m && m[1].toLowerCase() !== a.toLowerCase()) fails.push(`사본 불일치 — DESIGN.md ${s} = ${m[1]}, 런타임 = ${a}`);
}

/* ── 결과 ─────────────────────────────────────────────────────────────────── */
for (const mode of ["light", "dark"]) {
  console.log(`  [${mode}]`);
  for (const [k, v] of Object.entries(report[mode])) console.log(`    ${k.padEnd(12)} ${v}`);
}
for (const w of warns) console.log(`  ⚠️  ${w}`);
if (fails.length) {
  console.error(`\n✗ 차트 팔레트 위반 ${fails.length}건 — patterns.md §18 · §20 · §21 · §23`);
  for (const f of fails) console.error(`    ${f}`);
  process.exit(1);
}
console.log("PASS — 차트 계열 팔레트 (대역 · 채도 · 대비 · 인접 · 1~3 전체 · 엔티티 순서 · Severity · 사본 일치)");

#!/usr/bin/env node
/**
 * check-figma-map — Figma 정본 ↔ Storybook 1:1 매핑 원장 게이트 (핵심 정책, 2026-10-22).
 *
 * ## 왜 있나
 * 사용자 정책: «Figma 와 Storybook 은 컴포넌트가 1:1 로 매핑되고, Figma 에서 Storybook 링크를 항상 유지한다».
 * 한쪽에만 있는 컴포넌트는 다른 쪽에서 «없는 것» 으로 다시 만들어진다(세 정본 정책). 2026-10-22 대조에서
 * 카탈로그 184 중 66 이 Figma 에 없었고, Figma 컴포넌트 191 개 중 Storybook 링크가 걸린 것은 0 이었다.
 *
 * ## 무엇을 검사하나 (원장 `docs/figma-map.json` 기준)
 *   ① 카탈로그(components.json 중 title 이 Primitives/Composite/Shell)의 **모든 컴포넌트가 원장에 키로 있다**
 *      — 새 컴포넌트를 만들면 Figma 노드 id(또는 null)를 원장에 적어야 한다.
 *   ② 원장에만 있고 카탈로그에 없는 키는 없다 — 이름을 바꾸거나 지웠으면 원장도 고친다.
 *   ③ `figma: null`(Figma 에 아직 없음)은 동결선(`scripts/figma-map-baseline.json`)에 있는 이름만 허용 —
 *      **늘리는 방향은 거부**. 짝을 만들면 노드 id 를 적고 `--update` 로 동결선을 줄인다.
 *   ④ figmaParts 의 docsOf 는 카탈로그에 있는 컴포넌트여야 한다.
 *
 * ## 검사하지 못하는 것
 * CI 에는 Figma API 접근이 없다. 노드 id 가 실제로 있는지 · Figma 쪽 문서 링크가 원장과 같은지는
 * Figma 플러그인으로 대조한다(memory figma-storybook-1to1 의 절차). 이 게이트는 «원장이 카탈로그를 빠짐없이
 * 덮는가» 와 «빈칸이 늘지 않는가» 를 지킨다.
 *
 * 사용: node scripts/check-figma-map.mjs  ·  동결선 갱신(줄이는 방향만): --update
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAP = join(root, "docs/figma-map.json");
const BASELINE = join(root, "scripts/figma-map-baseline.json");
const COMPONENTS = join(root, "docs/components.json");
const update = process.argv.includes("--update");

// 항상 최신 카탈로그로 검사한다 — 낡은 생성물을 보고 통과하면 게이트가 거짓말을 한다.
execFileSync(process.execPath, [join(root, "scripts/build-components-json.mjs")], { stdio: "pipe" });

const cat = JSON.parse(readFileSync(COMPONENTS, "utf8"));
const list = (Array.isArray(cat) ? cat : cat.components || Object.values(cat)).filter((c) =>
  /^(Primitives|Composite|Shell)\//.test(c.title || ""),
);
const names = new Set(list.map((c) => c.name));
const map = JSON.parse(readFileSync(MAP, "utf8"));
const entries = map.components || {};
const parts = map.figmaParts || {};

const errors = [];
for (const n of names) if (!(n in entries)) errors.push(`원장에 없음: ${n} — docs/figma-map.json components 에 { "figma": "<노드 id>" | null } 로 적는다`);
for (const k of Object.keys(entries)) if (!names.has(k)) errors.push(`카탈로그에 없는 원장 키: ${k} — 이름을 바꿨거나 지웠으면 원장도 고친다`);
for (const [k, v] of Object.entries(entries)) {
  if (v.figma !== null && !/^\d+:\d+$/.test(String(v.figma))) errors.push(`노드 id 형식 오류: ${k} = ${v.figma}`);
}
for (const [k, v] of Object.entries(parts)) {
  if (!names.has(v.docsOf)) errors.push(`figmaParts.${k}.docsOf 가 카탈로그에 없음: ${v.docsOf}`);
}

const missing = Object.entries(entries).filter(([, v]) => v.figma === null).map(([k]) => k).sort();
const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")).missing || [] : [];
const allowed = new Set(baseline);
const newMissing = missing.filter((m) => !allowed.has(m));

if (update) {
  if (newMissing.length) {
    console.error(`✗ --update 거부 — 동결선을 늘리는 방향이다(새 빈칸 ${newMissing.length}): ${newMissing.join(", ")}`);
    process.exit(1);
  }
  writeFileSync(
    BASELINE,
    JSON.stringify(
      {
        _comment:
          "Figma 에 아직 짝이 없는 카탈로그 컴포넌트 동결선(핵심 정책 Figma ↔ Storybook 1:1). 줄일 수만 있다 — 짝을 만들면 docs/figma-map.json 에 노드 id 를 적고 `node scripts/check-figma-map.mjs --update`.",
        missing,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`✓ 동결선 갱신 — Figma 빈칸 ${missing.length}`);
  process.exit(0);
}

for (const m of newMissing) errors.push(`새 Figma 빈칸: ${m} — 새 컴포넌트는 Figma 정본에 함께 넣는다(세 정본 · 1:1 정책)`);

const mapped = names.size - missing.length;
console.log(`  카탈로그 ${names.size} · Figma 짝 ${mapped} · 빈칸 ${missing.length}(동결 ${baseline.length}) · Figma 하위 부품 ${Object.keys(parts).length}`);
if (errors.length) {
  console.error("════════════════════════════════════════════════════════");
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`FAIL — Figma ↔ Storybook 1:1 원장 위반 ${errors.length}건`);
  process.exit(1);
}
const shrunk = baseline.filter((b) => !missing.includes(b));
if (shrunk.length) console.log(`  ↓ 동결선보다 줄었다(${shrunk.join(", ")}) — --update 로 동결선을 내린다`);
console.log("PASS — 카탈로그 전부가 원장에 있고 Figma 빈칸이 늘지 않았다");

/**
 * check-catalog-coverage — 공개 export 는 카탈로그에 있어야 한다.
 *
 * ## 왜 스크립트인가
 * 실측(2026-08-19): `index.ts` 로 공개 export 되는데 스토리(=카탈로그)가 없는 컴포넌트가
 * **10종** 있었다. 이건 문서 누락이 아니라 **집행 범위 누락**이다 — 이 repo 의 게이트는
 * 전부 스토리를 입구로 삼기 때문에, 스토리가 없으면 다음 다섯 곳에서 동시에 빠진다:
 *   audit:runtime(렌더된 DOM 리터럴) · test:visual · lint:docstrings · lint:layers(계층 판정)
 *   · MCP(get_component / search_components)
 * 그중 하나가 실제 사고로 이어졌다: `ToolbarIconButton` 의 높이 토큰 미정의로 폭이 auto 로
 * 퍼졌는데 "story 가 없어 감사 대상도 아니었다"(roster: token-sync).
 *
 * ## 무엇을 카탈로그 등재로 보나
 *   ① `components.json` 의 컴포넌트명과 일치, 또는
 *   ② 어떤 카탈로그 항목의 본문(summary·purpose·do/dont·스토리 노트)이 그 이름을 언급 —
 *      아이콘처럼 **한 장에 묶어 등재**한 경우를 인정한다(개별 스토리를 강요하면 카탈로그가
 *      prop 표면 없는 항목으로 길어진다).
 * 타입 전용 export(`export type`)와 상수(대문자 스네이크)는 대상이 아니다.
 *
 * ## 동결선
 * `catalog-coverage-baseline.json` — 현재 남은 것만 동결하고 신규는 차단. `--update` 는
 * **줄이는 방향만** 허용한다(늘리려면 신규 위반이므로 실패한다).
 *
 * 사용: `node scripts/check-catalog-coverage.mjs`  ·  동결선 갱신: `--update`
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(root, "catalog-coverage-baseline.json");
const update = process.argv.includes("--update");

execFileSync(process.execPath, [join(root, "scripts/build-components-json.mjs")], { stdio: "pipe" });
const { components } = JSON.parse(readFileSync(join(root, "docs/components.json"), "utf8"));

/* ── 공개 export 수집 (값 export 만) ─────────────────────────────────────── */
const exported = new Map(); // name → barrel
for (const b of ["src/index.ts", "src/widget/index.ts"]) {
  const p = join(root, b);
  if (!existsSync(p)) continue;
  const src = readFileSync(p, "utf8");
  for (const m of src.matchAll(/export\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g)) {
    const isTypeBlock = /export\s*type\s*\{/.test(m[0]);
    for (const raw of m[1].split(",")) {
      if (isTypeBlock || /\btype\b/.test(raw)) continue; // 타입은 카탈로그 대상 아님
      const nm = raw.trim().split(/\s+as\s+/).pop();
      if (!nm) continue;
      if (!/^[A-Z]/.test(nm)) continue;        // 소문자 = 함수/유틸
      if (/^[A-Z0-9_]+$/.test(nm)) continue;   // 상수(TONE_BG · K8S_GPU_MENU …)
      if (!exported.has(nm)) exported.set(nm, b);
    }
  }
}

/* ── 등재 판정 ────────────────────────────────────────────────────────────── */
const names = new Set(components.map((c) => c.name.replace(/\s+/g, "")));
/* 묶음 등재는 **명시 선언만** 인정한다 — 스토리 설명의 `@covers A · B · C`.
   본문에 이름이 있으면 등재로 보던 초안은 실측에서 새어 나갔다(다른 컴포넌트 설명이
   `AiWidget` 을 언급한다는 이유로 미등재가 통과했다). */
const covered = new Set(components.flatMap((c) => c.covers ?? []));

const violations = [...exported]
  .filter(([n]) => !names.has(n) && !covered.has(n))
  .map(([n, b]) => ({ name: n, barrel: b }));

const current = violations.map((v) => v.name).sort();

if (update) {
  writeFileSync(BASELINE, JSON.stringify({ frozen: current }, null, 2) + "\n");
  console.log(`catalog-coverage baseline 갱신 — ${current.length}건 동결 (신규만 차단)`);
  process.exit(0);
}

const frozen = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")).frozen : [];
const frozenSet = new Set(frozen);
const fresh = violations.filter((v) => !frozenSet.has(v.name));
const fixed = frozen.filter((n) => !current.includes(n));

console.log(`\n📚 catalog-coverage — 공개 export 의 카탈로그 등재`);
console.log("════════════════════════════════════════════════════════");
console.log(`  공개 컴포넌트 export ${exported.size}개 · 카탈로그 ${components.length}항목 · 미등재 ${violations.length}건(동결 ${frozen.length})`);

if (fresh.length) {
  console.error(`\n✗ 카탈로그에 없는 공개 export ${fresh.length}건 (신규):\n`);
  for (const v of fresh) console.error(`  ${v.name}  ← ${v.barrel}`);
  console.error(
    `\n스토리를 추가하거나(계층 = title prefix), 기존 카탈로그 항목의 설명에서 그 이름을 다루세요.` +
      `\n등재하지 않으면 DOM 리터럴 감사·시각 스냅샷·docstring·계층 판정·MCP 에서 동시에 빠집니다.`,
  );
  process.exit(1);
}
if (fixed.length) {
  console.error(`\n✗ 동결 목록이 낡았습니다 — ${fixed.length}건이 해소됐습니다: ${fixed.join(", ")}`);
  console.error(`  \`node scripts/check-catalog-coverage.mjs --update\` 로 동결선을 줄이세요.`);
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log(`PASS — 신규 미등재 0건`);

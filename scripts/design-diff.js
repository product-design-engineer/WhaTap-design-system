#!/usr/bin/env node
/**
 * design-diff — 두 DESIGN.md 버전 비교, 토큰 단위 변경 + 회귀(regression) 탐지.
 *
 * Usage:
 *   node scripts/design-diff.js <old> <new>          — 파일 두 개 비교
 *   node scripts/design-diff.js <git-ref>            — git ref vs 현재 비교
 *   node scripts/design-diff.js                      — HEAD vs 현재 비교
 *
 * Exit:  0 = no regression, 1 = regression detected
 *
 * Regression 정의:
 *   - Color 토큰 값 변경 (의도치 않은 시각 변경)
 *   - 토큰 삭제 (breaking change)
 *   - 컴포넌트 속성 삭제
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { parseYaml, flattenTokens, DESIGN_PATH } from "./parse-design.js";

/* ── 인자 처리 ─────────────────────────────────────────── */

function extractYamlFromContent(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error("YAML front matter 를 찾을 수 없습니다.");
  return m[1];
}

let oldFlat, newFlat;
const args = process.argv.slice(2);

if (args.length === 2) {
  // 파일 두 개 비교
  const oldContent = readFileSync(resolve(args[0]), "utf-8");
  const newContent = readFileSync(resolve(args[1]), "utf-8");
  oldFlat = flattenTokens(parseYaml(extractYamlFromContent(oldContent)));
  newFlat = flattenTokens(parseYaml(extractYamlFromContent(newContent)));
} else {
  // git ref vs 현재
  const ref = args[0] || "HEAD";
  let oldContent;
  try {
    oldContent = execSync(`git show ${ref}:DESIGN.md`, { encoding: "utf-8" });
  } catch {
    console.log(`⚠️  '${ref}' 에서 DESIGN.md 를 찾을 수 없습니다. (신규 파일이면 정상)`);
    console.log("✅ Diff — 비교 대상 없음, regression 없음.\n");
    process.exit(0);
  }
  const newContent = readFileSync(DESIGN_PATH, "utf-8");
  oldFlat = flattenTokens(parseYaml(extractYamlFromContent(oldContent)));
  newFlat = flattenTokens(parseYaml(extractYamlFromContent(newContent)));
}

/* ── 비교 ──────────────────────────────────────────────── */

const allKeys = new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)]);

const added = [];
const removed = [];
const changed = [];

for (const key of [...allKeys].sort()) {
  const oldVal = oldFlat[key];
  const newVal = newFlat[key];

  if (oldVal === undefined) {
    added.push({ key, value: newVal });
  } else if (newVal === undefined) {
    removed.push({ key, value: oldVal });
  } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
    changed.push({ key, from: oldVal, to: newVal });
  }
}

/* ── Regression 판정 ───────────────────────────────────── */

const regressions = [];

// 1. 토큰 삭제 = breaking change
for (const { key, value } of removed) {
  regressions.push(`REMOVED: '${key}' (was: ${JSON.stringify(value)})`);
}

// 2. Color 토큰 값 변경 (colors.* 경로)
for (const { key, from, to } of changed) {
  if (key.startsWith("colors.")) {
    const isColorChange =
      typeof from === "string" && from.startsWith("#") &&
      typeof to === "string" && to.startsWith("#");
    if (isColorChange) {
      regressions.push(`COLOR CHANGED: '${key}' ${from} → ${to}`);
    }
  }
}

// 3. 컴포넌트 속성 삭제 (changed 에서 object→null 등은 removed 로 잡힘)
for (const { key } of removed) {
  if (key.startsWith("components.")) {
    // 이미 REMOVED 로 등록됨
  }
}

/* ── 출력 ──────────────────────────────────────────────── */

console.log(`\n📊 DESIGN.md Diff Report`);
console.log(`${"─".repeat(50)}`);
console.log(`  Added:    ${added.length}`);
console.log(`  Removed:  ${removed.length}`);
console.log(`  Changed:  ${changed.length}`);
console.log(`${"─".repeat(50)}`);

if (added.length) {
  console.log(`\n🟢 Added (${added.length}):`);
  for (const { key, value } of added) {
    console.log(`  + ${key}: ${JSON.stringify(value)}`);
  }
}

if (removed.length) {
  console.log(`\n🔴 Removed (${removed.length}):`);
  for (const { key, value } of removed) {
    console.log(`  - ${key}: ${JSON.stringify(value)}`);
  }
}

if (changed.length) {
  console.log(`\n🟡 Changed (${changed.length}):`);
  for (const { key, from, to } of changed) {
    console.log(`  ~ ${key}: ${JSON.stringify(from)} → ${JSON.stringify(to)}`);
  }
}

if (regressions.length) {
  console.log(`\n🚨 Regressions (${regressions.length}):`);
  for (const r of regressions) console.log(`  ⛔ ${r}`);
  console.log(`\n❌ Regression detected — exit 1.\n`);
  process.exit(1);
}

console.log(`\n✅ No regressions detected.\n`);

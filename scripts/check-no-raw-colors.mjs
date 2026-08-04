#!/usr/bin/env node
/**
 * check-no-raw-colors — 인라인 색 리터럴 금지 정책의 자동 강제 장치.
 *
 * 가드레일 `raw-color` 의 실행체. 토큰 단일 출처를 우회하는 색 하드코딩을 차단한다.
 *
 * 탐지 대상 (src/ 의 .ts · .tsx):
 *   - hex 리터럴          #fff · #F5F5F5 · #ffffffcc
 *   - rgb()/rgba() 리터럴  rgb(255,255,255) · rgba(0,0,0,.5)
 *   - 색 유틸 클래스       bg-white · bg-black · text-white · border-white
 *
 * 예외 (위반 아님):
 *   1. `src/widget/_tokens.ts`      — 토큰 정의 원본(단일 출처 그 자체)
 *   2. `// raw-color-ok: <이유>`    — 같은 줄 또는 바로 윗줄에 사유를 남긴 경우.
 *                                     정당한 용도는 사실상 "컬러 위 흰색 전경" 하나뿐.
 *   3. 베이스라인에 등록된 기존 위반 — scripts/raw-color-baseline.json
 *   4. `var(--token, #fallback)`     — 토큰이 단일 출처이고 hex 는 CSS 미로드 시 폴백.
 *                                     토큰 우회가 아니므로 위반 아님.
 *   5. 주석 안의 hex                 — 설명·TODO 문구. 런타임 색이 아니다.
 *
 * 베이스라인은 **동결선**이다. 신규 위반은 즉시 error(exit 1), 기존 위반은
 * 줄여나가되 늘릴 수 없다. 파일별 건수만 기록해 리팩터링(줄 이동)에 견딘다.
 *
 * Usage:
 *   node scripts/check-no-raw-colors.mjs            # 검사 (exit 1 on new violation)
 *   node scripts/check-no-raw-colors.mjs --update   # 베이스라인 재기록
 *   node scripts/check-no-raw-colors.mjs --list     # 현재 위반 전체 출력
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const BASELINE_PATH = join(ROOT, "scripts", "raw-color-baseline.json");

/** 토큰 정의 원본 — 여기서만 리터럴이 정당하다. */
const EXEMPT_FILES = new Set(["src/widget/_tokens.ts"]);

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB = /\brgba?\(\s*[\d.]/g;
const UTIL = /\b(?:bg|text|border|fill|stroke)-(?:white|black)\b/g;
const IGNORE = /raw-color-ok:/;

/**
 * 검사 대상만 남긴다 — 토큰 폴백과 주석은 정책 위반이 아니므로 제거.
 *
 * `var(--x, #hex)` 는 토큰이 단일 출처이고 hex 는 CSS 미로드 시 폴백이므로 우회가 아니다.
 * 주석의 hex 는 런타임 색이 아니라 설명 문구다. 둘을 지운 뒤 남은 것만 리터럴로 센다.
 */
/**
 * `var(...)` 전체를 균형 괄호로 잘라낸다.
 *
 * 정규식 `var\([^()]*\)` 로는 폴백 안에 함수가 중첩된 경우
 * (`var(--shadow-sm, 0 1px 3px rgba(0,0,0,.25))`) 를 못 잡는다 — 안쪽 `)` 에서
 * 끊기거나 아예 매칭에 실패해 폴백의 rgba 가 위반으로 잡혔다.
 */
function stripVarCalls(s) {
  for (let i = s.indexOf("var("); i !== -1; i = s.indexOf("var(", i)) {
    let depth = 0;
    let end = -1;
    for (let j = i + 3; j < s.length; j++) {
      if (s[j] === "(") depth++;
      else if (s[j] === ")" && --depth === 0) {
        end = j;
        break;
      }
    }
    if (end === -1) break; // 닫히지 않음(멀티라인) — 남은 부분은 그대로 검사
    s = s.slice(0, i) + s.slice(end + 1);
  }
  return s;
}

function strippable(line) {
  let s = stripVarCalls(line);
  // 줄 주석 · 블록 주석 조각 · JSDoc 본문(` * …`)
  s = s.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "");
  s = s.replace(/\/\/.*$/, "");
  s = s.replace(/^\s*\*.*$/, "");
  s = s.replace(/\/\*.*$/, "");
  return s;
}

/** 위반 1건이 왜 위반인지, 무엇으로 바꿔야 하는지 알려주는 힌트. */
const HINTS = [
  [/^#(fff|ffffff)$/i, "컬러 위 전경이면 `// raw-color-ok:` 로 사유 명시, 표면이면 var(--color-card)"],
  [/^#(f5f5f5)$/i, "페이지 배경 var(--color-bg) / hover·muted 표면 var(--color-surface-50)"],
  [/^#(f1f2f4)$/i, "var(--color-surface-100)"],
  [/^#(eaeaea)$/i, "보더면 var(--color-border-default), 표면이면 var(--color-surface-200)"],
  [/^#(f0f0f0)$/i, "var(--color-border-soft)  (차트 그리드 점선 등)"],
  [/^#(e6e6e6|d3d3d3)$/i, "var(--color-border-strong)  (위젯·컨트롤 보더)"],
  [/^#(222|1e1e1e)$/i, "var(--color-text-primary)"],
  [/^#(4c4c4c)$/i, "var(--color-text-secondary)"],
  [/^#(757575)$/i, "var(--color-text-tertiary)  (무채색 아이콘 fill 포함)"],
  [/^#(adadad)$/i, "var(--color-text-disabled)"],
  [/^#(296cf2)$/i, "var(--color-brand-blue)"],
  [/^bg-white$/i, "bg-card  (위젯 셸·본문·컨트롤 배경)"],
  [/^(bg|text|border)-black$/i, "무채색 토큰 사용 — 순수 검정은 팔레트에 없다"],
];

function hintFor(value) {
  for (const [re, hint] of HINTS) if (re.test(value)) return hint;
  return "토큰이 없으면 리터럴을 적지 말고 src/tokens.css 에 토큰을 먼저 추가";
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

function scan() {
  const violations = [];
  for (const file of walk(SRC)) {
    const rel = relative(ROOT, file);
    if (EXEMPT_FILES.has(rel)) continue;

    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // 같은 줄 또는 바로 윗줄의 사유 주석이면 면제
      if (IGNORE.test(line) || (i > 0 && IGNORE.test(lines[i - 1]))) return;

      const scanned = strippable(line);
      for (const re of [HEX, RGB, UTIL]) {
        re.lastIndex = 0;
        for (const m of scanned.matchAll(re)) {
          const value = m[0].replace(/\(\s*[\d.]$/, "(");
          violations.push({ file: rel, line: i + 1, value, text: line.trim().slice(0, 100) });
        }
      }
    });
  }
  return violations;
}

/** 파일별 건수 맵 — 줄 번호에 의존하지 않아 리팩터링에 견딘다. */
function countByFile(violations) {
  const counts = {};
  for (const v of violations) counts[v.file] = (counts[v.file] ?? 0) + 1;
  return counts;
}

const args = process.argv.slice(2);
const violations = scan();
const counts = countByFile(violations);

if (args.includes("--list")) {
  for (const v of violations) {
    console.log(`${v.file}:${v.line}  ${v.value}\n    → ${hintFor(v.value)}\n    ${v.text}`);
  }
  console.log(`\n총 ${violations.length}건 / ${Object.keys(counts).length}파일`);
  process.exit(0);
}

if (args.includes("--update")) {
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        _comment:
          "인라인 색 리터럴 기존 위반 동결선. 신규 위반은 차단되고, 이 수치는 줄일 수만 있다. " +
          "리터럴을 토큰으로 치환한 뒤 `node scripts/check-no-raw-colors.mjs --update` 로 갱신.",
        total: violations.length,
        files: counts,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`베이스라인 기록: ${violations.length}건 / ${Object.keys(counts).length}파일`);
  process.exit(0);
}

const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")).files ?? {}
  : {};

const regressions = []; // 신규 또는 증가
const improvements = []; // 감소

for (const [file, count] of Object.entries(counts)) {
  const allowed = baseline[file] ?? 0;
  if (count > allowed) regressions.push({ file, count, allowed });
  else if (count < allowed) improvements.push({ file, count, allowed });
}
for (const [file, allowed] of Object.entries(baseline)) {
  if (!(file in counts) && allowed > 0) improvements.push({ file, count: 0, allowed });
}

console.log("\n🎨 raw-color — 인라인 색 리터럴 금지");
console.log("═".repeat(56));

if (regressions.length) {
  console.log(`\n❌ 신규 위반 ${regressions.length}파일 — 토큰 단일 출처 우회는 핵심 정책 위배입니다.\n`);
  for (const r of regressions) {
    console.log(`  ${r.file}  (${r.allowed} → ${r.count})`);
    for (const v of violations.filter((v) => v.file === r.file)) {
      console.log(`    ${r.file}:${v.line}  ${v.value}`);
      console.log(`      → ${hintFor(v.value)}`);
    }
    console.log("");
  }
  console.log("  정당한 예외(컬러 위 흰색 전경)라면 해당 줄 위에 사유를 남기세요:");
  console.log("      // raw-color-ok: 브랜드 그라디언트 위 전경 텍스트\n");
  console.log("  정책 전문: docs/tokens.md → Base Surface — 페이지 vs 카드");
  console.log("═".repeat(56));
  console.log(`FAIL — 신규 위반 ${regressions.reduce((n, r) => n + (r.count - r.allowed), 0)}건`);
  process.exit(1);
}

if (improvements.length) {
  const removed = improvements.reduce((n, i) => n + (i.allowed - i.count), 0);
  console.log(`\n✅ ${removed}건 감소 — \`--update\` 로 베이스라인을 조여주세요.`);
  for (const i of improvements) console.log(`  ${i.file}  (${i.allowed} → ${i.count})`);
}

console.log(
  `\n  ℹ️  동결된 기존 위반 ${violations.length}건 / ${Object.keys(counts).length}파일 (점진 치환 대상)`
);
console.log("═".repeat(56));
console.log("PASS — 신규 위반 0건");

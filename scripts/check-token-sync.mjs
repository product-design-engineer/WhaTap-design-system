// check-token-sync — 토큰 정의/참조 무결성 게이트.
//
// 두 가지를 본다.
//
//   R1. **참조되는 토큰이 런타임에 실재하는가**
//       컴포넌트가 `var(--x)` 로 쓰는 토큰이 `whatap-ds.css`(=런타임에 실제 로드되는 CSS)에
//       정의돼 있어야 한다. `tokens.css` 는 **참조용이라 런타임에 로드되지 않는다** —
//       거기에만 있으면 존재하지 않는 것과 같다.
//
//       실제 사고: `--wds-toolbar-control-h` · `--wds-toolbar-icon` · `--wds-icon-xs` 가
//       tokens.css 에만 있었고, `ToolbarIconButton` 의 `width: var(--wds-toolbar-control-h)`
//       가 무효 선언이 되어 auto(=컨테이너 폭, 실측 1248px)로 퍼졌다. 타입체크·린트·테스트·
//       런타임 감사 전부 통과했다 — **없는 CSS 변수는 아무도 에러를 내지 않는다.**
//       (그 컴포넌트에 story 가 없어서 DOM 감사에도 안 잡혔다.)
//
//   R2. **두 파일이 공유하는 토큰의 값이 같은가**
//       `tokens.css` 는 자기 주석에 "whatap-ds.css 의 :root 블록과 동기화되어야 합니다"
//       라고 적어 두었는데, 그걸 검사하는 것이 없었다. 값이 갈라지면 카탈로그가 가르치는
//       값과 실제 렌더가 달라진다.
//
//   집합 차이(한쪽에만 있는 토큰)는 **R1 에 걸리지 않는 한 통과시킨다** — 두 파일은 범위가
//   다르다(whatap-ds.css 에는 런타임 전용 변수가, tokens.css 에는 소비자 참조용이 있다).
//   여기서 동일 집합을 강제하면 매번 의미 없는 실패가 난다.
//
// 사용: node scripts/check-token-sync.mjs
import fs from "node:fs";
import { execSync } from "node:child_process";

const RUNTIME_CSS = "src/whatap-ds.css";
const REFERENCE_CSS = "src/tokens.css";

/** CSS 텍스트에서 `--x: value;` 선언을 모두 뽑는다(블록 무관 — 정의 존재 여부만 본다). */
function declaredTokens(file) {
  const src = fs.readFileSync(file, "utf8");
  const map = new Map();
  for (const m of src.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (!map.has(m[1])) map.set(m[1], m[2].trim());
  }
  return map;
}

const runtime = declaredTokens(RUNTIME_CSS);
const reference = declaredTokens(REFERENCE_CSS);

/* ── R1. 참조되는데 런타임에 없는 토큰 ─────────────────────────────────── */
const sources = execSync("find src stories -name '*.tsx' -o -name '*.ts'")
  .toString()
  .split("\n")
  .filter(Boolean)
  .filter((f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"));

const missing = new Map(); // 토큰 → 참조 위치[]
let scannedFiles = 0;
let refCount = 0;

/**
 * 주석을 공백으로 치환한다 — **줄 번호와 컬럼을 보존**한다.
 * 줄머리만 보고 건너뛰면 새는 것이 실측으로 확인됐다: JSX 블록 주석
 * `{/* … var(--token) … *\/}` 의 이어지는 줄은 `//`·`/*` 로 시작하지 않는다.
 * 문서·docstring 에 예시로 적은 토큰명이 오탐이 되면 게이트를 못 믿게 된다.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

for (const f of sources) {
  const raw = fs.readFileSync(f, "utf8");
  if (!raw.includes("var(--")) continue;
  scannedFiles++;
  const src = stripComments(raw);
  src.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)/g)) {
      refCount++;
      const name = m[1];
      // 폴백이 있는 참조는 값이 보장되므로 대상이 아니다: var(--x, 12px)
      const after = line.slice(m.index + m[0].length);
      if (/^\s*,/.test(after)) continue;
      if (runtime.has(name)) continue;
      if (!missing.has(name)) missing.set(name, []);
      missing.get(name).push(`${f}:${i + 1}`);
    }
  });
}

/* ── R2. 두 파일이 공유하는 토큰의 값 불일치 ───────────────────────────── */
const mismatched = [];
for (const [name, refVal] of reference) {
  const rtVal = runtime.get(name);
  if (rtVal !== undefined && rtVal !== refVal) mismatched.push({ name, refVal, rtVal });
}

/* ── 리포트 ─────────────────────────────────────────────────────────────── */
const bar = "═".repeat(56);
console.log(`\n🔗 token-sync — 토큰 정의/참조 무결성`);
console.log(bar);
console.log(
  `  런타임 정의 ${runtime.size}개 · 참조용 정의 ${reference.size}개 · ` +
    `${scannedFiles}개 파일에서 var() 참조 ${refCount}건 검사`,
);

let failed = false;

if (missing.size) {
  failed = true;
  console.error(`\n❌ R1 — 런타임에 정의되지 않은 토큰을 참조 ${missing.size}종`);
  for (const [name, where] of missing) {
    const onlyRef = reference.has(name) ? "  (tokens.css 에만 있음 — 런타임 미로드)" : "";
    console.error(`     ${name}${onlyRef}`);
    for (const w of where.slice(0, 4)) console.error(`        ${w}`);
    if (where.length > 4) console.error(`        … 외 ${where.length - 4}건`);
  }
} else {
  console.log(`\n✓ R1 — 참조되는 토큰 전부 런타임에 정의됨`);
}

if (mismatched.length) {
  failed = true;
  console.error(`\n❌ R2 — 두 파일의 값 불일치 ${mismatched.length}건`);
  for (const m of mismatched) {
    console.error(`     ${m.name}`);
    console.error(`        ${REFERENCE_CSS}: ${m.refVal}`);
    console.error(`        ${RUNTIME_CSS}: ${m.rtVal}`);
  }
} else {
  console.log(`✓ R2 — 공유 토큰 값 전부 일치`);
}

console.log(`\n${bar}`);
if (failed) {
  console.error("FAIL\n");
  console.error("  고치는 법:");
  console.error(`   · R1 → ${RUNTIME_CSS} 의 :root 에 토큰을 추가한다.`);
  console.error(`          tokens.css 는 참조용이라 런타임에 로드되지 않는다.`);
  console.error(`   · R2 → 두 파일의 값을 맞춘다(tokens.css 가 의미의 출처).`);
  console.error(`   · 의도적으로 폴백에 기대는 참조라면 var(--x, <기본값>) 형태로 쓴다.\n`);
  process.exit(1);
}
console.log("PASS — 위반 0건\n");

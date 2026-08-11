// check-no-tailwind — Tailwind 재도입 차단.
//
// CLAUDE.md 가 "Tailwind 재도입 금지 — 의존성·빌드·런타임·CSS 산출물 어디에도 없음
// (Storybook Guardrails: no-tailwind-plain-css)" 이라고 가르치는데, **그 주장을 검사하는
// 것이 없었다.** 명부에는 status "자동"으로 올라 있었고 command 칸에는 생성기
// (`detailwind.mjs generate`)가 적혀 있었다 — 생성기는 검사가 아니다.
//
// 재도입은 조용히 일어난다: 누가 `tailwindcss` 를 devDependency 로 넣고 PostCSS 를 붙이면
// 빌드도 테스트도 통과한다. 산출물에 `@layer`·`--tw-*` 가 섞여 들어가야 비로소 눈에 띈다.
//
// 검사 대상 3종:
//   D  의존성        package.json 에 tailwind* 계열이 있는가
//   C  설정 파일     tailwind.config.* · postcss.config.* 에 tailwind 플러그인이 있는가
//   S  CSS 산출물    런타임 CSS 에 프레임워크 흔적이 있는가
//                    (@tailwind · @layer · --tw-* · @property · escape 클래스명 `.foo-\[…\]`)
//
// 사용: node scripts/check-no-tailwind.mjs
import fs from "node:fs";
import path from "node:path";

const RUNTIME_CSS = ["src/whatap-ds.css", "src/tokens.css"];
const errors = [];

/* ── D. 의존성 ──────────────────────────────────────────────────────────── */
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const deps = {
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
  ...(pkg.peerDependencies ?? {}),
};
const tailwindDeps = Object.keys(deps).filter((d) => /tailwind/i.test(d));
if (tailwindDeps.length) {
  errors.push(`D 의존성에 Tailwind 계열이 있습니다: ${tailwindDeps.join(", ")}`);
}

/* ── C. 설정 파일 ───────────────────────────────────────────────────────── */
const configs = fs
  .readdirSync(".")
  .filter((f) => /^tailwind\.config\./.test(f) || /^postcss\.config\./.test(f));
for (const f of configs) {
  if (/^tailwind\.config\./.test(f)) {
    errors.push(`C Tailwind 설정 파일이 있습니다: ${f}`);
    continue;
  }
  const body = fs.readFileSync(f, "utf8");
  if (/tailwind/i.test(body)) errors.push(`C ${f} 가 tailwind 플러그인을 참조합니다.`);
}

/* ── S. CSS 산출물 흔적 ─────────────────────────────────────────────────── */
const SIGNATURES = [
  { name: "@tailwind 디렉티브", re: /@tailwind\b/ },
  { name: "@layer (프레임워크 레이어)", re: /@layer\s+(base|components|utilities)\b/ },
  { name: "--tw-* 변수", re: /--tw-[\w-]+/ },
  { name: "@property (Tailwind v4 산출물)", re: /@property\s+--/ },
  // escape 클래스명: `.h-\[32px\]` 처럼 대괄호를 이스케이프한 선택자
  { name: "escape 클래스명 (.foo-\\[…\\])", re: /\.[\w-]*\\\[/ },
];

let scanned = 0;
let exempted = 0;
for (const file of RUNTIME_CSS) {
  if (!fs.existsSync(file)) continue;
  scanned++;
  const src = fs.readFileSync(file, "utf8");
  const rawLines = src.split("\n");
  // 주석은 **줄 번호를 보존한 채** 제외 — 이 규칙을 설명하는 주석 자체가 오탐이 된다
  // (실제로 CLAUDE.md 문구가 CSS 헤더에 인용돼 있다).
  const body = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

  // 면제는 **파일 단위가 아니라 그 줄 단위**로만 준다. 파일을 통째로 면제하면
  // 이후 들어오는 같은 위반까지 조용히 통과한다.
  const exempt = (lineNo) =>
    /no-tailwind-ok:/.test(rawLines[lineNo - 1] ?? "") ||
    /no-tailwind-ok:/.test(rawLines[lineNo - 2] ?? "");

  for (const { name, re } of SIGNATURES) {
    const g = new RegExp(re.source, "g");
    for (const m of body.matchAll(g)) {
      const line = body.slice(0, m.index).split("\n").length;
      if (exempt(line)) {
        exempted++;
        continue;
      }
      errors.push(`S ${file}:${line} — ${name}  «${m[0].slice(0, 40)}»`);
    }
  }
}

/* ── 리포트 ─────────────────────────────────────────────────────────────── */
const bar = "═".repeat(56);
console.log(`\n🚫 no-tailwind — 외부 CSS 프레임워크 흔적 0`);
console.log(bar);
console.log(
  `  의존성 ${Object.keys(deps).length}개 · 설정 후보 ${configs.length}개 · CSS ${scanned}개 파일 검사` +
    (exempted ? ` · 사유 표기 면제 ${exempted}건` : ""),
);

if (errors.length) {
  console.error(`\n❌ 위반 ${errors.length}건\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n  고치는 법:`);
  console.error(`   · 런타임 스타일은 ${path.basename(RUNTIME_CSS[0])} 에 일반 CSS 로 직접 쓴다.`);
  console.error(`   · 유틸 클래스명은 escape 없는 일반 식별자(gap-4px · hover-opacity-70).`);
  console.error(`   · 동적 색(variant×tone)은 인라인 CSS custom property(--wds-btn-*).\n`);
  console.error(`${bar}\nFAIL\n`);
  process.exit(1);
}
console.log(`\n${bar}\nPASS — 위반 0건\n`);

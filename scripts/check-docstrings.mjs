/**
 * check-docstrings — docstring 4섹션 표준 게이트.
 *
 * ## 왜 스크립트인가
 * 이 규칙은 오래 **policy(사람 검토)** 상태였고, 그동안 26종이 스토리 설명 없이, 여러 종이
 * docstring 없이 들어왔다. 규칙만 있고 집행이 없으면 새는 쪽이 기본값이 된다.
 *
 * ## 무엇을 요구하나 (컴포넌트 1종 = 스토리 1개 기준)
 *   ① 소스 docstring 4섹션 — Purpose / When to use / When NOT to use / Composition rules
 *   ② `@example`
 *   ③ 스토리 `parameters.docs.description.component` (카탈로그에서 사람이 읽는 첫 줄)
 *   ④ Do/Don't 가 **유도 가능**할 것 — When NOT to use 또는 Composition rules 의 금지형 문장이
 *      하나도 없으면 «하지 말 것»이 비게 되므로 실패다. 표기는 SKILL.md 의 단일 규칙을 따른다.
 *   ⑤ **템플릿 밖 `##` 섹션 0** — 생성기는 템플릿 섹션(Purpose · When to use · When NOT to use ·
 *      Composition rules · Spec · Do · Don't)만 읽는다. 그 밖의 `## ARIA` · `## Why this exists` 같은
 *      섹션은 Storybook 에서만 보이고 MCP 로는 **배달되지 않는다**. 실측(2026-10-19) 13파일 18섹션 중
 *      15섹션이 그랬다 — Pagination 「페이지가 하나여도 컨트롤을 세운다」 정책을 AI 는 몰랐다.
 *      동결 없이 0 이다(그때 전부 표준 섹션으로 옮겼다).
 *   ⑧ **차트의 지표** — `Composite/Chart/*` 는 `## Metrics` 에 맞는 지표(`- ✅ …`) 1개 이상 필수,
 *      쓰면 안 되는 지표(`- ❌ …`)는 가능하면(없으면 정보로만 센다). 2026-10-23 사용자 지시 —
 *      «각 Composite 차트에 어떤 지표 유형에 사용하면 좋을지 카탈로그 정보에 필수 기입». 동결 없이 0.
 *
 * ## 깊이 — 있는 것과 충분한 것은 다르다 (래칫)
 * 4섹션이 «있는지» 만 보면 불릿 하나짜리 When to use(→ Do 한 줄)와 설명 없는 prop(→ MCP 에 타입만)이
 * 통과한다. 소스가 있는 컴포넌트에 둘을 더 요구한다:
 *   ⑥ `## When to use` 불릿 2개 이상
 *   ⑦ 설명 없는 prop 0 — 타입 블록 또는 구조 분해 인자 위의 `/** … *\/` 어느 쪽이든 된다
 * 도입 시점의 미달은 `depth` 에 **수치로** 동결했다. 동결 항목은 그 수치보다 나빠지면 실패하고,
 * 나아지면 「동결선이 낡았다」 로 실패해 `--update` 로 줄이게 한다(선이 아래로만 움직인다).
 *
 * 스토리 파일 안에서 정의되는 합성 템플릿(`Shell/Page/*`)과 Tokens 메타 스토리는 소스
 * docstring 이 있을 수 없다 — 이들에겐 ③만 요구한다.
 *
 * 판정은 `docs/components.json`(생성기 산출물)을 읽어서 한다. 파싱을 두 번 구현하면 게이트와
 * 배달물이 서로 다른 것을 보게 된다 — **AI 에게 실제로 배달되는 그 파일**을 검사해야 의미가 있다.
 *
 * 사용: `node scripts/check-docstrings.mjs`  ·  동결선 갱신: `--update`
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(root, "docs/components.json");
const BASELINE = join(root, "docstring-baseline.json");
const update = process.argv.includes("--update");

// 항상 최신 산출물로 검사한다 — 낡은 json 을 보고 통과하면 게이트가 거짓말을 한다.
execFileSync(process.execPath, [join(root, "scripts/build-components-json.mjs")], { stdio: "pipe" });

if (!existsSync(JSON_PATH)) {
  console.error("✗ docs/components.json 이 없습니다. `pnpm build:components-json` 먼저 실행하세요.");
  process.exit(1);
}
const { components } = JSON.parse(readFileSync(JSON_PATH, "utf8"));

/** 지표 섹션이 필수인 차트 — 계층 Composite 의 Chart 하위 그룹. */
const isChart = (c) => c.title.startsWith("Composite/Chart/");
/**
 * 차트가 실제로 칠하는 색 토큰 — 소스 파일 + 그 파일이 import 하는 차트 내부 모듈(`./_*.ts`) · 같은 폴더 Primitive(칠 색을 내보내는 것)의
 * `--color-chart-*` · `--color-status-*`. `## Color` 가 이 토큰을 모두 적어야 한다(문서와 코드가 따로 놀지 않게).
 * 축 · 격자 · 글자 색(`--color-border-*` · `--color-text-*`)은 공통 틀이라 보지 않는다.
 */
function chartColorTokens(file) {
  if (!file) return [];
  const seen = new Set();
  const out = new Set();
  const walk = (f, depth) => {
    if (seen.has(f) || !existsSync(f)) return;
    seen.add(f);
    const src = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const m of src.matchAll(/--color-(?:chart|status)-[a-z0-9-]+/g)) out.add(m[0]);
    if (depth > 0) for (const m of src.matchAll(/from\s+"(\.\/_[\w]+)"/g)) walk(join(dirname(f), m[1] + ".ts"), depth - 1);
    if (depth > 0) for (const m of src.matchAll(/import\s+\w+,\s*\{[^}]*_COLOR[^}]*\}\s+from\s+"(\.\/\w+)"/g)) walk(join(dirname(f), m[1] + ".tsx"), depth - 1);
  };
  walk(join(root, file), 1);
  return [...out].sort();
}

/** Tokens 는 컴포넌트가 아니라 메타 카탈로그 — 검사 대상 아님. */
const targets = components.filter((c) => c.layer !== "Tokens");

const violations = [];
for (const c of targets) {
  const missing = [];
  /* 스토리 설명은 **소스 docstring 이 없을 때만** 필수다. docgen(react-docgen-typescript)이
     docstring 을 autodocs 설명으로 이미 렌더하므로, 있는 컴포넌트에 또 쓰게 하면 같은 말을 두 곳에
     두고 서로 엇갈리게 만든다. 스토리 안에서 정의되는 합성 템플릿에는 이것이 유일한 문서다. */
  if (!c.summary && !c.sourceFile) missing.push("story description");
  /* 스토리 안에서 정의되는 합성 템플릿(`Shell/Page/*` 등)에는 「언제 쓰나」도 요구한다 —
     그것이 **컴포넌트 이름을 모르는 사람이 «하려는 일»로 검색해 도달하는 기준**이고
     (`search_components` 가 whenToUse 를 이름 다음 순위로 본다), 소스 docstring 이 없는
     이들에게는 스토리 설명이 그 기준을 담을 유일한 자리다. 표기는 docstring 과 같은
     `## When to use` 섹션. */
  if (!c.sourceFile && !c.whenToUse.length) missing.push("story ## When to use");
  if (c.sourceFile) {
    if (!c.purpose) missing.push("## Purpose");
    if (!c.whenToUse.length) missing.push("## When to use");
    if (!c.whenNotToUse.length) missing.push("## When NOT to use");
    if (!c.compositionRules.length) missing.push("## Composition rules");
    if (!c.example) missing.push("@example");
    if (!c.dont.length) missing.push("Do/Don't 유도 불가(금지형 문장 0)");
  }
  if (isChart(c) && !c.metrics?.fit?.length) missing.push("## Metrics ✅ 맞는 지표(차트 필수)");
  if (isChart(c) && !c.color?.role?.length) missing.push("## Color 역할(차트 필수)");
  if (isChart(c) && !c.states?.empty?.length) missing.push("## States 빈(차트 필수)");
  if (isChart(c) && !c.limits?.count?.length) missing.push("## Limits 개수(차트 필수)");
  if (isChart(c) && c.color?.role?.length) {
    const used = chartColorTokens(c.sourceFile);
    const gap = used.filter((t) => !c.color.tokens.includes(t));
    if (gap.length) missing.push(`## Color 에 없는 색 토큰(소스가 씀): ${gap.join(" · ")}`);
  }
  if (missing.length) violations.push({ title: c.title, file: c.sourceFile ?? c.storyFile, missing, noFreeze: missing.some((m) => m.startsWith("## Metrics") || m.startsWith("## Color") || m.startsWith("## States") || m.startsWith("## Limits")) });
}

/* ── 깊이(래칫) ───────────────────────────────────────────────────────────── */
const depthNow = {};
for (const c of targets) {
  if (!c.sourceFile) continue;
  const whenToUse = c.whenToUse.length;
  const undocumentedProps = (c.props ?? []).filter((p) => !(p.description ?? "").trim()).length;
  if (whenToUse < 2 || undocumentedProps > 0) depthNow[c.title] = { whenToUse, undocumentedProps, file: c.sourceFile };
}
/* ⑤ 템플릿 밖 섹션 — 동결 없음. */
for (const c of targets) {
  if (c.extraSections?.length) {
    const v = violations.find((x) => x.title === c.title);
    const msg = `템플릿 밖 섹션(배달 안 됨): ${c.extraSections.map((h) => `## ${h}`).join(" · ")}`;
    if (v) v.missing.push(msg);
    else violations.push({ title: c.title, file: c.sourceFile ?? c.storyFile, missing: [msg], noFreeze: true });
  }
}

const key = (v) => `${v.title}`;
const current = violations.filter((v) => !v.noFreeze).map(key).sort();

const base = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
const frozen = base.frozen ?? [];
const frozenDepth = base.depth ?? {};
const frozenSet = new Set(frozen);
const fresh = violations.filter((v) => v.noFreeze || !frozenSet.has(key(v)));
const fixed = frozen.filter((k) => !current.includes(k));

/* 깊이: 동결 수치보다 나빠졌거나(신규 포함) · 나아졌는데 선을 안 줄였거나. */
const depthWorse = [];
const depthBetter = [];
for (const [title, now] of Object.entries(depthNow)) {
  const f = frozenDepth[title];
  const allowW = f ? f.whenToUse : 2;
  const allowP = f ? f.undocumentedProps : 0;
  const bad = [];
  if (now.whenToUse < Math.min(allowW, 2)) bad.push(`When to use 불릿 ${now.whenToUse}개 (2개 이상${f ? ` · 동결 ${f.whenToUse}` : ""})`);
  if (now.undocumentedProps > allowP) bad.push(`설명 없는 prop ${now.undocumentedProps}개 (0${f ? ` · 동결 ${f.undocumentedProps}` : ""})`);
  if (bad.length) depthWorse.push({ title, file: now.file, bad });
  else if (f && (now.whenToUse > f.whenToUse || now.undocumentedProps < f.undocumentedProps)) depthBetter.push(title);
}
for (const title of Object.keys(frozenDepth)) if (!depthNow[title]) depthBetter.push(title);

const depthSnapshot = () =>
  Object.fromEntries(
    Object.entries(depthNow)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([t, v]) => [t, { whenToUse: v.whenToUse, undocumentedProps: v.undocumentedProps }]),
  );

if (update) {
  /* 동결선은 줄이는 방향으로만 움직인다 — 신규 · 악화가 있으면 거부한다(그걸 동결하는 길을 막는다). */
  /* 단 한 번 — 기준선에 `depth` 키가 아직 없을 때(이 래칫 도입 시점)만 현재 미달을 동결한다. */
  const bootstrap = !("depth" in base);
  if (fresh.length || (depthWorse.length && !bootstrap)) {
    console.error(`✗ --update 거부 — 신규 위반 ${fresh.length}건 · 깊이 악화 ${depthWorse.length}건이 있습니다. 먼저 고치세요.`);
    process.exit(1);
  }
  writeFileSync(BASELINE, JSON.stringify({ frozen: current, depth: depthSnapshot() }, null, 2) + "\n");
  console.log(`docstring baseline 갱신 — 구조 ${current.length}건 · 깊이 ${Object.keys(depthNow).length}건 동결 (신규만 차단)`);
  process.exit(0);
}

let failed = false;
if (fresh.length) {
  failed = true;
  console.error(`✗ docstring 표준 위반 ${fresh.length}건 (신규):\n`);
  for (const v of fresh) console.error(`  ${v.title}\n    ${v.file}\n    누락: ${v.missing.join(" · ")}`);
  console.error(
    `\n표준: Purpose / When to use / When NOT to use / Composition rules (+ 차트는 Metrics 필수 · 선택 Spec · Do · Don't) + @example (소스) + 스토리 description.` +
      `\n그 밖의 \`## …\` 섹션은 배달되지 않습니다 — 내용을 위 섹션으로 옮기세요. docs/SKILL.md 「Do / Don't 단일 표기」 참고.`,
  );
}
if (depthWorse.length) {
  failed = true;
  console.error(`\n✗ docstring 깊이 미달 ${depthWorse.length}건:\n`);
  for (const v of depthWorse) console.error(`  ${v.title}\n    ${v.file}\n    ${v.bad.join(" · ")}`);
  console.error(`\nprop 설명은 타입 블록 또는 구조 분해 인자 위에 \`/** … */\` 로 씁니다.`);
}
if (failed) process.exit(1);

if (fixed.length || depthBetter.length) {
  console.error(`✗ 동결선이 낡았습니다 — 구조 ${fixed.length}건 · 깊이 ${depthBetter.length}건이 나아졌습니다:\n  ${[...fixed, ...depthBetter].join("\n  ")}`);
  console.error(`\n\`node scripts/check-docstrings.mjs --update\` 로 동결선을 줄이세요(늘리는 방향은 거부됩니다).`);
  process.exit(1);
}

const charts = targets.filter(isChart);
const noAvoid = charts.filter((c) => !c.metrics?.avoid?.length).map((c) => c.name);
console.log(`  차트 지표: ${charts.length}종 ✅ 전부 · ❌ 적용 금지 지표 ${charts.length - noAvoid.length}/${charts.length}${noAvoid.length ? ` (없음: ${noAvoid.join(" · ")})` : ""}`);
console.log(
  `✓ docstring 표준 OK — 컴포넌트 ${targets.length} (완전 ${targets.length - violations.length} · 동결 ${violations.length}) · 깊이 동결 ${Object.keys(depthNow).length}`,
);

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
 *   ⑨ **차트의 색** — `Composite/Chart/*` 는 `## Colors` 불릿(`- 역할 — 무엇에 · 토큰`) 1개 이상 필수.
 *      역할은 patterns §17 낱말(정체성 · 크기 · 강도 · 판정 등급 · 판정 밖 · 상태) + 바탕만 쓴다. 소스(+ 내부
 *      `./_*` 모듈)가 칠하는 차트 색 토큰 묶음(series · seq · heatmap · apdex · speed · neutral · apm · status ·
 *      indicator)은 전부 Colors 에 이름이 있어야 한다 — 코드가 바뀌었는데 카탈로그가 옛 색을 말하면 실패.
 *      2026-10-27 사용자 지시 «차트 composite 에 컬러 적용 규칙도 카탈로그 정보에». 동결 없이 0.
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

/* ⑨ 색 역할 — patterns §17 표의 낱말 + 바탕(데이터 색이 아닌 트랙 · 값 없음 · 남은 몫). */
const COLOR_ROLES = ["정체성", "크기", "강도", "판정 등급", "판정 밖", "상태", "바탕"];
/** 토큰 이름 → 묶음. 차트 마크 색 묶음만 센다(surface · text · border 는 역할 검사 밖). */
const colorFamily = (t) => t.match(/^--(?:color|gradient)-(?:chart-(series|seq|apdex|speed|neutral|apm)|(heatmap)|(status)|(indicator))/)?.slice(1).find(Boolean) ?? null;
/** 소스와 그 소스가 import 하는 내부 `./_*` 모듈이 실제로 쓰는 묶음. */
function familiesInSource(file) {
  const src = readFileSync(join(root, file), "utf8");
  const helpers = [...src.matchAll(/from\s+"\.\/(_[\w]+)"/g)].map((m) => join(dirname(join(root, file)), m[1]));
  const texts = [src, ...helpers.flatMap((h) => [".ts", ".tsx"].map((x) => h + x).filter(existsSync).map((p) => readFileSync(p, "utf8")))];
  return new Set(texts.flatMap((t) => [...t.matchAll(/--(?:color|gradient)-[\w-]+/g)].map((m) => colorFamily(m[0]))).filter(Boolean));
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
  if (isChart(c)) {
    if (!c.colors?.length) missing.push("## Colors 색 역할(차트 필수)");
    for (const col of c.colors ?? [])
      if (!COLOR_ROLES.includes(col.role)) missing.push(`## Colors 역할 «${col.role ?? col.text}» — ${COLOR_ROLES.join(" · ")} 중 하나`);
    if (c.sourceFile && c.colors?.length) {
      const named = new Set(c.colors.flatMap((col) => col.tokens.map(colorFamily)).filter(Boolean));
      const unnamed = [...familiesInSource(c.sourceFile)].filter((f) => !named.has(f));
      if (unnamed.length) missing.push(`## Colors 에 없는 색 묶음(소스가 칠한다): ${unnamed.join(" · ")}`);
    }
  }
  if (missing.length) violations.push({ title: c.title, file: c.sourceFile ?? c.storyFile, missing, noFreeze: missing.some((m) => m.startsWith("## Metrics") || m.startsWith("## Colors")) });
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
    `\n표준: Purpose / When to use / When NOT to use / Composition rules (+ 차트는 Metrics · Colors 필수 · 선택 Spec · Do · Don't) + @example (소스) + 스토리 description.` +
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
console.log(`  차트 색: ${charts.length}종 Colors 전부 · 소스 색 묶음과 일치`);
console.log(
  `✓ docstring 표준 OK — 컴포넌트 ${targets.length} (완전 ${targets.length - violations.length} · 동결 ${violations.length}) · 깊이 동결 ${Object.keys(depthNow).length}`,
);

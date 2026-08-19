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
     그것이 **컴포넌트 이름을 모르는 사람이 «하려는 일»로 검색해 도달하는 축**이고
     (`search_components` 가 whenToUse 를 이름 다음 순위로 본다), 소스 docstring 이 없는
     이들에게는 스토리 설명이 그 축을 담을 유일한 자리다. 표기는 docstring 과 같은
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
  if (missing.length) violations.push({ title: c.title, file: c.sourceFile ?? c.storyFile, missing });
}

const key = (v) => `${v.title}`;
const current = violations.map(key).sort();

if (update) {
  writeFileSync(BASELINE, JSON.stringify({ frozen: current }, null, 2) + "\n");
  console.log(`docstring baseline 갱신 — ${current.length}건 동결 (신규만 차단)`);
  process.exit(0);
}

const frozen = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")).frozen : [];
const frozenSet = new Set(frozen);
const fresh = violations.filter((v) => !frozenSet.has(key(v)));
const fixed = frozen.filter((k) => !current.includes(k));

if (fresh.length) {
  console.error(`✗ docstring 표준 위반 ${fresh.length}건 (신규):\n`);
  for (const v of fresh) console.error(`  ${v.title}\n    ${v.file}\n    누락: ${v.missing.join(" · ")}`);
  console.error(
    `\n표준: Purpose / When to use / When NOT to use / Composition rules + @example (소스) + 스토리 description.` +
      `\nDo/Don't 는 여기서 유도됩니다 — docs/SKILL.md 「Do / Don't 단일 표기」 참고.`,
  );
  process.exit(1);
}

if (fixed.length) {
  console.error(`✗ 동결 목록이 낡았습니다 — ${fixed.length}건이 해소됐습니다:\n  ${fixed.join("\n  ")}`);
  console.error(`\n\`node scripts/check-docstrings.mjs --update\` 로 동결선을 줄이세요(늘리는 방향은 신규 위반이라 막힙니다).`);
  process.exit(1);
}

console.log(
  `✓ docstring 표준 OK — 컴포넌트 ${targets.length} (완전 ${targets.length - violations.length} · 동결 ${violations.length})`,
);

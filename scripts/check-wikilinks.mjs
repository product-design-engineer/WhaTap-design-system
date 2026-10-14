/**
 * check-wikilinks — `[[참조]]` 가 실제로 가리키는 것이 있는지 검사한다.
 *
 * ## 왜 필요한가
 * docstring · 스토리 설명 · `patterns.md` 는 서로를 `[[Modal]]` 형태로 561곳에서 참조한다.
 * 이 참조는 **AI 배달 경로에 그대로 실린다**(`components.json` → MCP `get_component`).
 * 가리키는 대상이 이름이 바뀌거나 지워지면 참조는 조용히 죽고, 소비 AI 는 존재하지 않는
 * 컴포넌트를 권하게 된다 — 「정보가 있는데 못 여는」 종류의 실패다. 실측으로 1건
 * (`[[IcSearch]]` — 아예 없는 아이콘)이 이 상태로 남아 있었다.
 *
 * ## 무엇을 유효한 참조로 보나
 *   ① `components.json` 의 컴포넌트명 (스토리가 있는 것)
 *   ② `src/index.ts` · `src/widget/index.ts` barrel export 명 (타입 포함)
 *   ③ `src/**` 안의 선언 — `function` · `const` · `type` · `interface` · `class`.
 *      **export 되지 않은 파일 안 부품도 유효하다**(예: `AiPromptInput` 안의 `TokenUsageBadge`).
 *      읽는 사람에게는 "이 파일 안 그것" 이라는 유효한 포인터다.
 *   ④ 파일명(확장자 제외)
 *
 * ## 무엇을 검사하지 않나
 * **소문자로 시작하는 참조**는 컴포넌트가 아니라 함수·토큰·정책 id 의 관례다
 * (`[[layoutTopology]]` · `[[tokens]]` · `[[feedback_widget_readonly_policy]]`).
 * 이들은 이 게이트의 대상이 아니다 — 컴포넌트 이름 공간과 다르게 관리된다.
 *
 * ## 동결선
 * **없다.** 현재 위반 0 이므로 신규는 즉시 차단한다. 동결 목록을 두면 "언젠가 고칠 것" 이
 * 영구히 남고, 이 검사는 고치는 비용이 한 줄이라 동결의 근거가 없다.
 *
 * 사용: `node scripts/check-wikilinks.mjs`
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => p.slice(root.length + 1);

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

/* ── 알려진 이름 수집 ─────────────────────────────────────────────────────── */

const known = new Set();

const jsonPath = join(root, "docs/components.json");
if (existsSync(jsonPath))
  for (const c of JSON.parse(readFileSync(jsonPath, "utf8")).components) known.add(c.name);

for (const b of ["src/index.ts", "src/widget/index.ts", "src/chart/index.ts"]) {
  const p = join(root, b);
  if (!existsSync(p)) continue;
  const t = readFileSync(p, "utf8");
  for (const m of t.matchAll(/export\s*\{([^}]*)\}/g))
    for (const raw of m[1].split(",")) {
      const nm = raw.replace(/\btype\b/, "").trim().split(/\s+as\s+/).pop();
      if (nm) known.add(nm);
    }
}

const srcFiles = walk(join(root, "src")).filter((f) => /\.(ts|tsx)$/.test(f));
for (const f of srcFiles) {
  known.add(basename(f).replace(/\.(ts|tsx)$/, ""));
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(
    /(?:export\s+)?(?:default\s+)?(?:function|const|let|type|interface|class)\s+([A-Za-z_$][\w$]*)/g,
  ))
    known.add(m[1]);
}

/* ── 참조 검사 ────────────────────────────────────────────────────────────── */

const targets = [
  ...srcFiles,
  ...walk(join(root, "stories")).filter((f) => /\.(tsx|mdx)$/.test(f)),
  ...walk(join(root, "docs")).filter((f) => f.endsWith(".md") && basename(f) !== "DESIGN.md"),
  join(root, "CLAUDE.md"),
].filter((f) => existsSync(f));

let total = 0;
const dangling = new Map(); // name → Set<file:line>

for (const f of targets) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(/\[\[([^\]\s|]+)\]\]/g)) {
      total++;
      const name = m[1];
      if (!/^[A-Z]/.test(name)) continue; // 소문자 시작 = 함수·토큰·정책 id 관례
      if (known.has(name)) continue;
      if (!dangling.has(name)) dangling.set(name, new Set());
      dangling.get(name).add(`${rel(f)}:${i + 1}`);
    }
  });
}

if (dangling.size) {
  console.error(`✗ 가리키는 대상이 없는 [[참조]] ${dangling.size}종:\n`);
  for (const [name, where] of dangling)
    console.error(`  [[${name}]]\n    ${[...where].join("\n    ")}`);
  console.error(
    `\n이 참조는 components.json 을 거쳐 MCP 응답에 실립니다 — 소비 AI 가 없는 컴포넌트를 권하게 됩니다.` +
      `\n이름이 바뀌었으면 참조를 고치고, 존재하지 않는 것이면 링크를 지우세요(문장은 남겨도 됩니다).`,
  );
  process.exit(1);
}

console.log(`✓ [[참조]] 무결성 OK — ${total}건 검사 (알려진 이름 ${known.size})`);

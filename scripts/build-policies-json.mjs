/**
 * build-policies-json — 전역 정책의 기계 판독 카탈로그를 유도한다.
 *
 * ## 왜 생성물인가
 * `components.json` 이 소스 docstring 에서, `tokens.json` 이 CSS 선언 위 주석에서 나오는 것과
 * **같은 구조**다. 사람이 쓰는 자리는 `docs/patterns.md` 하나이고 여기서 JSON 을 뽑는다.
 *
 * 손으로 쓰는 JSON 으로 두지 않는 이유는 전역 규칙이 **「왜」가 본문의 절반**이기 때문이다.
 * 「헤더는 불변이다」보다 「요소가 화면마다 달라지면 사람이 헤더를 못 믿는다」가 더 중요한데,
 * 그건 JSON 필드에 잘 들어가지 않는다. 산문을 정본으로 두고 구조만 뽑아 온다.
 *
 * ## 무엇을 읽나 (`docs/patterns.md`)
 *
 * ```markdown
 * ## 1. Page Header Invariant
 * <!-- @policy id=header-invariant | @severity must | @applies chrome -->
 *
 * **When to use.** …
 * **When NOT to use.** …
 * **규칙.** …
 * **Why.** …
 * ✅ …
 * ❌ …
 * ```
 *
 * - `@policy id` 만 필수다. `@severity` 는 기본 `must`, `@applies` 는 기본 `process`.
 * - Part 1(`P1`…)은 `part: "pattern"`, Part 2(`1`…)는 `part: "policy"` 로 갈린다 —
 *   성격이 달라 찾는 방법도 다르다(컴포넌트 횡단 시퀀스 vs 개별 금지).
 * - `✅`/`❌` 는 **줄 형태와 `### Do`/`### Don't` 표 형태 둘 다** 읽는다. 상황이 여럿이면
 *   표가 낫고 금지가 짧으면 줄이 낫다 — 표기를 하나로 강제하면 문서가 나빠진다.
 *
 * ## 무엇을 유도하나
 * - `anchor` — 번호가 아니라 제목에서 만든 링크 조각. 번호는 문서를 고치면 밀린다.
 * - `components` — 본문의 `[[Wikilink]]` 에서. 어느 컴포넌트가 이 정책에 걸리는지 역인덱스가 된다.
 * - `related` — 같은 `@applies` 기준의 다른 정책.
 *
 * 사용: `node scripts/build-policies-json.mjs`
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "docs/patterns.md");
const rel = (p) => relative(root, p);

const md = readFileSync(SRC, "utf8");
const lines = md.split("\n");

/** 정책 머리 — `## P1. …` 또는 `## 1. …`. Part 1/2 는 번호 모양으로 갈린다. */
const HEAD = /^## (P(\d+)|(\d+))\.\s+(.+)$/;

/** `<!-- @policy id=x | @severity y | @applies z -->` → { id, severity, applies } */
function parseMeta(text) {
  const m = text.match(/<!--\s*@policy\s+([\s\S]*?)-->/);
  if (!m) return null;
  const body = m[1];
  const pick = (key) => body.match(new RegExp(`@?${key}\\s*=?\\s*([A-Za-z0-9_-]+)`))?.[1] ?? null;
  return {
    id: pick("id"),
    severity: pick("severity") ?? "must",
    applies: pick("applies") ?? "process",
  };
}

/**
 * `**Label.**` 또는 `**Label —**` 로 시작하는 문단을 거둔다.
 * 다음 굵은 라벨 · 제목 · 구분선 · 판정 줄(✅/❌)에서 끊는다 — 문단이 서로 먹지 않게.
 */
function section(body, label) {
  const re = new RegExp(`\\*\\*${label}[.:]?\\*\\*|\\*\\*${label}\\s*[—-]`, "i");
  const ls = body.split("\n");
  const at = ls.findIndex((l) => re.test(l));
  if (at < 0) return null;
  const out = [ls[at].replace(re, "").replace(/^[\s.:—-]+/, "")];
  for (let i = at + 1; i < ls.length; i += 1) {
    const l = ls[i];
    if (/^#{2,3}\s/.test(l) || /^---\s*$/.test(l)) break;
    if (/^\*\*[A-Za-z가-힣]/.test(l)) break;
    if (/^[✅❌]/.test(l)) break;
    out.push(l);
  }
  return out.join("\n").trim() || null;
}

/** `✅ …` / `❌ …` 줄 + `### Do` / `### Don't` 표의 행을 모두 거둔다. */
function verdicts(body, mark) {
  const found = [];
  for (const l of body.split("\n")) {
    const t = l.trim();
    if (t.startsWith(mark)) {
      // 한 줄에 `❌ a · ❌ b` 로 이어 붙인 경우도 가른다 — 한 줄 = 한 판정이어야 세어진다.
      for (const part of t.split(mark)) {
        const v = part.replace(/^[\s·]+|[\s·]+$/g, "");
        if (v) found.push(v);
      }
    }
  }
  // `### Do` / `### Don't` 표 — 첫 열이 판정, 둘째 열이 있으면 「왜」다.
  const heading = mark === "✅" ? "Do" : "Don't";
  const sec = body.split(new RegExp(`^###\\s+${heading}\\s*$`, "m"))[1];
  if (sec) {
    for (const l of sec.split("\n")) {
      if (!l.trim().startsWith("|")) {
        if (/^#{2,3}\s/.test(l) || /^---\s*$/.test(l)) break;
        continue;
      }
      const cells = l.split("|").slice(1, -1).map((c) => c.trim());
      if (!cells.length || /^-+$/.test(cells[0]) || /^(상황|하지 말 것|이렇게|왜)$/.test(cells[0])) continue;
      found.push(cells.length > 1 && cells[1] ? `${cells[0]} — ${cells[1]}` : cells[0]);
    }
  }
  return found;
}

/* ── 정책 경계로 잘라 읽기 ──────────────────────────────────────────────── */

const heads = [];
lines.forEach((l, i) => {
  const m = l.match(HEAD);
  if (m) heads.push({ i, num: m[2] ? `P${m[2]}` : m[3], part: m[2] ? "pattern" : "policy", title: m[4].trim() });
});
heads.push({ i: lines.length });

const policies = [];
const problems = [];

for (let k = 0; k < heads.length - 1; k += 1) {
  const h = heads[k];
  const body = lines.slice(h.i, heads[k + 1].i).join("\n");
  const meta = parseMeta(body);

  if (!meta?.id) {
    problems.push(`${h.num}. ${h.title} — @policy id 없음`);
    continue;
  }

  const components = [...new Set([...body.matchAll(/\[\[([A-Za-z][\w]*)\]\]/g)].map((m) => m[1]))];

  policies.push({
    id: meta.id,
    number: h.num,
    part: h.part,
    title: h.title,
    severity: meta.severity,
    applies: meta.applies,
    // 번호가 아니라 제목에서 만든다 — 문서를 고치면 번호는 밀린다.
    anchor: `${h.num}-${h.title}`
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    whenToUse: section(body, "When to use"),
    whenNotToUse: section(body, "When NOT to use"),
    rule: section(body, "규칙"),
    why: section(body, "Why") ?? section(body, "왜"),
    do: verdicts(body, "✅"),
    dont: verdicts(body, "❌"),
    components,
    related: [],
  });
}

/* 같은 기준(@applies)의 다른 정책 — Overview 가 기준으로 묶어 보여줄 때 쓴다. */
for (const p of policies) {
  p.related = policies.filter((o) => o.applies === p.applies && o.id !== p.id).map((o) => o.id);
}

/* ── 산출 ────────────────────────────────────────────────────────────────── */

const lacking = policies.filter((p) => !p.whenToUse || !p.whenNotToUse || !p.do.length || !p.dont.length);

const out = {
  $comment:
    "자동 생성 (scripts/build-policies-json.mjs). 직접 편집 금지 — docs/patterns.md 의 정책 절과 " +
    "`<!-- @policy … -->` 메타를 고치고 재생성. anchor·components·related 는 유도된다.",
  generatedFrom: { markdown: rel(SRC), policies: policies.length },
  coverage: {
    total: policies.length,
    complete: policies.length - lacking.length,
    lacking: lacking.map((p) => ({
      id: p.id,
      missing: [
        !p.whenToUse && "whenToUse",
        !p.whenNotToUse && "whenNotToUse",
        !p.do.length && "do",
        !p.dont.length && "dont",
      ].filter(Boolean),
    })),
  },
  policies,
};

writeFileSync(join(root, "docs/policies.json"), JSON.stringify(out, null, 2) + "\n");

if (problems.length) {
  console.error("✗ @policy 메타 누락:");
  for (const p of problems) console.error(`    ${p}`);
  process.exit(1);
}

console.log(
  `policies.json generated — ${policies.length} policies ` +
    `(pattern ${policies.filter((p) => p.part === "pattern").length} · ` +
    `policy ${policies.filter((p) => p.part === "policy").length} · ` +
    `when ${policies.filter((p) => p.whenToUse).length} · whenNot ${policies.filter((p) => p.whenNotToUse).length} · ` +
    `do ${policies.filter((p) => p.do.length).length} · dont ${policies.filter((p) => p.dont.length).length})`,
);

/**
 * build-components-json — `docs/components.json` 생성기 (**AI 배달 경로의 단일 출처**).
 *
 * ## 왜 필요한가
 * 컴포넌트 규칙(Purpose / When to use / When NOT to use / Composition rules)은 이미
 * `src/**` 의 docstring 에 거의 전부 쓰여 있었는데, **AI 가 읽는 세 경로 어디에도 도달하지
 * 않았다** — MCP `get_component` 는 title·import·스토리 URL 만 돌려줬고, `DESIGN.md` 는
 * 손으로 쓴 md 합본이라 120종 중 51종은 이름조차 없었다. 즉 "잘 쓴 규칙"과 "AI 가 보는 것"이
 * 다른 파일이었다. 이 스크립트가 그 둘을 잇는다: docstring + 스토리 메타를 파싱해 하나의
 * 기계 판독 JSON 으로 만든다.
 *
 * ## 무엇을 만드는가
 * `docs/components.json` — `staticDirs` 로 `/design-system/components.json` 에 서빙되어
 * MCP 서버가 런타임에 fetch 한다(재빌드 없이 최신). 컴포넌트당:
 *   name · layer · title · storyId · file · purpose · whenToUse · whenNotToUse
 *   · compositionRules · do[] · dont[] · props[] · stories[] · example · spec
 *   (`spec` = docstring `## Spec` 절 원문. 치수 · 토큰 · 상태 · 데이터 계약처럼 개발자가 그대로 구현하는 값.
 *   목록으로 쪼개지 않고 markdown 그대로 싣는다 — 표가 섞여 있다.)
 *
 * ## Do / Don't 의 출처 — 표기를 하나로
 * 정본은 **docstring 4섹션**이다. `## Do` · `## Don't` 를 명시하면 그대로 쓰고, 없으면 유도한다:
 *   - `do`   ← `When to use` 불릿
 *   - `dont` ← `When NOT to use` 불릿 + `Composition rules` 중 **금지형 문장**(금지·말 것·안 된다…)
 * 유도가 되므로 121개를 손으로 쓸 필요가 없고, 특별히 강조할 컴포넌트만 명시 섹션으로 승격한다.
 * 스토리의 ✅/❌ 블록도 함께 수집한다(`storyDo`/`storyDont`).
 *
 * 사용: `node scripts/build-components-json.mjs` (build:design 이 함께 호출)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const rel = (p) => p.slice(root.length + 1);

/* ── docstring 파싱 ───────────────────────────────────────────────────────── */

/** 파일에서 `## Purpose` 를 포함한 JSDoc 블록 하나를 뽑아 `*` 접두를 제거한 본문으로. */
function docBlockOf(src) {
  const blocks = src.match(/\/\*\*[\s\S]*?\*\//g) ?? [];
  const hit = blocks.find((b) => b.includes("## Purpose"));
  if (!hit) return null;
  return hit
    .replace(/^\/\*\*/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*ㅤ?/, "").replace(/^\s?/, ""))
    .join("\n")
    .trim();
}

/** `## Spec …` 절 원문(제목 뒤 꼬리말 허용 — `## Spec (실 위젯 마크업 1:1)`). 줄 앞 공백만 정리하고 표 · 목록은 그대로 둔다. */
function specOf(doc) {
  const m = doc.match(/^##\s+Spec\b[^\n]*$([\s\S]*?)(?=^##\s+|^@|$(?![\s\S]))/m);
  const body = m ? m[1].replace(/^\n+|\s+$/g, "") : "";
  return body || null;
}

/** `## <name>` 섹션 본문. 없으면 "".
 *  ⚠️ 종결부는 `$(?![\s\S])`(문서 끝) 로 쓴다. JS 정규식에 **`\Z` 는 없다** — 리터럴 `Z` 로
 *  해석되므로 `\Z` 를 쓰면 «마지막 섹션»이 통째로 유실된다. docstring 은 관례상 뒤에
 *  `@example` 이 붙어 `^@` 가 종결해 주는 바람에 이 버그가 오래 가려져 있었다(실측: 스토리
 *  설명에 `## When NOT to use` 를 마지막으로 두자 5종 전부 빈칸으로 나왔다). */
function section(doc, name) {
  const re = new RegExp(`^##\\s+${name}\\s*$([\\s\\S]*?)(?=^##\\s+|^@|$(?![\\s\\S]))`, "im");
  const m = doc.match(re);
  return (m?.[1] ?? "").trim();
}

/** 템플릿이 아는 섹션. 이 밖의 `## …` 는 생성기가 읽지 않으므로 **AI 에게 배달되지 않는다**
 *  (Storybook autodocs 에서만 보인다). 게이트(check-docstrings)가 이 목록으로 차단한다 —
 *  실측(2026-10-19): 13파일 18섹션 중 15섹션이 components.json 에 없었다(Pagination 「표와 한 세트」 정책 등). */
const KNOWN_SECTIONS = [/^Purpose$/i, /^When to use$/i, /^When NOT to use$/i, /^Composition rules$/i, /^Metrics$/i, /^Color$/i, /^States$/i, /^Limits$/i, /^Spec\b/i, /^Do$/i, /^Don't$/i];

/** `## Metrics` — 차트가 맞는 지표(✅)와 쓰면 안 되는 지표(❌). Composite/Chart 는 ✅ 필수(check-docstrings). 2026-10-23 사용자 지시. */
function metricsOf(doc) {
  const items = bullets(section(doc, "Metrics"));
  if (!items.length) return null;
  const strip = (s) => s.replace(/^(✅|❌)\s*/, "").trim();
  return { fit: items.filter((b) => b.startsWith("✅")).map(strip), avoid: items.filter((b) => b.startsWith("❌")).map(strip) };
}
/**
 * `## Color` — 차트가 쓰는 색 규칙. 불릿 머리말 네 가지: `역할:` · `상한:` · `고정:` · `금지:`(2026-10-26 사용자 지시 —
 * 카탈로그 · Storybook · Figma 에 함께). `tokens` 는 본문에 적힌 색 토큰 이름 — 게이트가 소스가 쓰는 토큰과 대조한다.
 */
function colorOf(doc) {
  const items = bullets(section(doc, "Color"));
  if (!items.length) return null;
  const pick = (k) => items.filter((b) => b.startsWith(k + ":")).map((b) => b.slice(k.length + 1).trim());
  const tokens = [...new Set([...section(doc, "Color").matchAll(/--color-[a-z0-9-]+/g)].map((m) => m[0]))].sort();
  return { role: pick("역할"), limit: pick("상한"), fixed: pick("고정"), avoid: pick("금지"), tokens };
}
/** 불릿 머리말(`빈:` 처럼)로 나뉜 섹션 → { 키: [본문…] }. 머리말이 하나도 없으면 null. */
function headedOf(doc, name, heads) {
  const items = bullets(section(doc, name));
  if (!items.length) return null;
  const out = {};
  for (const [key, head] of Object.entries(heads)) out[key] = items.filter((b) => b.startsWith(head + ":")).map((b) => b.slice(head.length + 1).trim());
  return out;
}
/** `## States` — 데이터가 비거나 이상할 때(2026-10-26 사용자 지시). `빈:`(필수) · `빠짐:` · `0:` · `넘침:`. */
const statesOf = (doc) => headedOf(doc, "States", { empty: "빈", missing: "빠짐", zero: "0", overflow: "넘침" });
/** `## Limits` — 개수 · 크기 한계(2026-10-26 사용자 지시). `개수:`(필수) · `크기:` · `라벨:`. */
const limitsOf = (doc) => headedOf(doc, "Limits", { count: "개수", size: "크기", label: "라벨" });
function extraSectionsOf(doc) {
  if (!doc) return [];
  return [...doc.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]).filter((h) => !KNOWN_SECTIONS.some((re) => re.test(h)));
}

/** 섹션 본문 → 불릿 배열. 불릿이 없으면 문단 전체를 1건으로. */
function bullets(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const items = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*[-*]\s+(.*)$/);
    if (m) items.push(m[1].trim());
    else if (items.length && /^\s{2,}\S/.test(ln)) items[items.length - 1] += " " + ln.trim(); // 이어지는 줄
  }
  if (items.length) return items.map((s) => s.replace(/\s+/g, " ").trim());
  const para = text.replace(/\s+/g, " ").trim();
  return para ? [para] : [];
}

/** 같은 문장이 두 경로로 들어오는 경우가 있다(스토리 ❌ 블록 ∩ Composition rules). 앞선 것을 남긴다. */
const dedupe = (arr) => {
  const seen = new Set();
  return arr.filter((s) => {
    const k = s.replace(/^사용하지 말 것 — /, "").replace(/[\s`*]/g, "");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/** Composition rules 중 금지형 문장만 — Don't 로 승격할 것. */
const PROHIBITIVE = /(금지|말 것|말라|하지 말|안 된다|안된다|쓰지|두지 말|넣지 말|바꾸지 말|끄지 말|❌)/;

function exampleOf(doc) {
  const m = doc.match(/@example\s*```tsx\s*([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

/* ── props 파싱 ───────────────────────────────────────────────────────────── */

/**
 * 컴포넌트 props 를 소스에서 뽑는다. react-docgen 을 새로 들이지 않고 두 가지 흔한 형태만 본다:
 *   ① `export type XProps = { ... }`  ② default export 함수 시그니처의 인라인 객체 타입
 * 타입 추론기가 아니므로 **틀리면 비우는 쪽**으로 동작한다(거짓 props 표보다 빈칸이 낫다).
 */
/**
 * 구조 분해 인자에 붙은 prop 주석 — `({ /** 설명 *\/ liveTime, size = "sm" }: {...})`.
 * 타입 블록 대신 여기에 설명을 다는 관례가 넓게 쓰인다(OptionbarPage · AnswerSkeleton 등). 이걸
 * 안 읽던 동안 그 설명들은 소스에만 있고 MCP 에는 «설명 없음» 으로 나갔다.
 */
function destructuredDocsOf(src, name) {
  const docs = new Map();
  const m = src.match(new RegExp(`export\\s+(?:default\\s+)?function\\s+${name}\\s*(?:<[^>]*>)?\\s*\\(\\s*\\{`));
  if (!m) return docs;
  const start = m.index + m[0].length - 1;
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) return docs;
  const body = src.slice(start + 1, end);
  for (const d of body.matchAll(/\/\*\*([\s\S]*?)\*\/\s*([A-Za-z_$][\w$]*)/g)) {
    const text = d[1].split("\n").map((l) => l.replace(/^\s*\*?\s?/, "").trim()).filter(Boolean).join(" ");
    if (text) docs.set(d[2], text);
  }
  return docs;
}

function propsOf(src, name) {
  const fromDestructure = destructuredDocsOf(src, name);
  return propsOfType(src, name).map((p) => (p.description ? p : { ...p, description: fromDestructure.get(p.name) ?? null }));
}

function propsOfType(src, name) {
  // 컴포넌트 시그니처(`export [default] function X(...)`)에서 props 타입 주석을 먼저 본다.
  const sig = src.match(
    new RegExp(`export\\s+(?:default\\s+)?function\\s+${name}\\s*(?:<[^>]*>)?\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*:\\s*([A-Za-z_$][\\w$]*|\\{)`),
  );
  const typeName = sig && sig[1] !== "{" ? sig[1] : null;

  let start = -1;
  if (sig && sig[1] === "{") start = sig.index + sig[0].length - 1; // ① 인라인 객체 타입
  if (start < 0) {
    // ② 이름 붙은 props 타입 — 시그니처가 가리키는 이름 우선, 없으면 `XProps` 관례.
    //    제네릭(`<T>`)·`extends` 를 건너뛰고 선언의 첫 `{` 를 잡는다.
    for (const t of [typeName, `${name}Props`].filter(Boolean)) {
      const m = src.match(new RegExp(`(?:export\\s+)?(?:type|interface)\\s+${t}\\b[^{;]*\\{`));
      if (m) { start = m.index + m[0].length - 1; break; }
    }
  }
  if (start < 0) return [];
  // 중괄호 균형으로 블록 끝 찾기
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) return [];
  const body = src.slice(start + 1, end);

  const out = [];
  const lines = body.split("\n");
  let comment = [];
  let buf = "";
  let d = 0;
  for (const raw of lines) {
    const ln = raw.trim();
    if (!ln) continue;
    if (ln.startsWith("/**") || ln.startsWith("*") || ln.startsWith("//") || ln.startsWith("*/")) {
      const c = ln.replace(/^\/\*\*|^\*\/|^\*|^\/\//g, "").replace(/\*\/$/, "").trim();
      if (c) comment.push(c);
      continue;
    }
    buf = buf ? buf + " " + ln : ln;
    d += (ln.match(/[{([]/g) ?? []).length - (ln.match(/[})\]]/g) ?? []).length;
    if (d > 0) continue; // 여러 줄에 걸친 타입
    const m = buf.match(/^([A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+?);?$/);
    if (m) {
      out.push({
        name: m[1],
        required: !m[2],
        type: m[3].replace(/;$/, "").replace(/\s+/g, " ").trim(),
        description: comment.join(" ") || null,
      });
    }
    buf = "";
    comment = [];
  }
  return out;
}

/* ── 스토리 파싱 ──────────────────────────────────────────────────────────── */

/* Storybook 의 id 규칙(`storybook/internal/csf` 의 `sanitize`)을 **그대로** 옮긴다 — 지정된 기호만
   대시로 바꾸고 나머지(한글 · 가운뎃점 `·`)는 살린다. 「글자 · 숫자가 아니면 대시」 로 근사했던 동안
   `Primitives/Web · Breadcrumb` 를 `primitives-web-breadcrumb` 로 안내했는데 실제 id 는
   `primitives-web-·-breadcrumb` 였다 — MCP 가 돌려준 Web 컴포넌트 미리보기 링크가 전부 404 였다(2026-10-14).
   여기서 어긋나면 링크가 깨지므로 아래에서 index.json 과 대조한다. */
const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
/** export 명 → 스토리 id 조각. Storybook 의 `storyNameFromExport`(= `toStartCaseStr`) 를 그대로 옮기고
 *  `slugify` 를 씌운다. 근사했던 동안 `TopNInWidgetFrame` 을 `top-nin-…` 로 안내했다(실제 `top-n-in-…`). */
const startCase = (str) =>
  str
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\./g, " ")
    .replace(/([^\n])([A-Z])([a-z])/g, (_, a, b, c) => `${a} ${b}${c}`)
    .replace(/([a-z])([A-Z])/g, (_, a, b) => `${a} ${b}`)
    .replace(/([a-z])([0-9])/gi, (_, a, b) => `${a} ${b}`)
    .replace(/([0-9])([a-z])/gi, (_, a, b) => `${a} ${b}`)
    .replace(/(\s|^)(\w)/g, (_, a, b) => `${a}${b.toUpperCase()}`)
    .replace(/ +/g, " ")
    .trim();
const kebab = (s) => slugify(startCase(s));

/** 문자열 리터럴 연결(`"a" + "b"`)을 이어붙인다. 템플릿/변수는 건너뛴다. */
function joinLiterals(chunk) {
  const parts = chunk.match(/"(?:[^"\\]|\\.)*"/g) ?? [];
  return parts
    .map((p) => JSON.parse(p))
    .join("")
    .trim();
}

function parseStoryFile(file) {
  const src = readFileSync(file, "utf8");
  const title = src.match(/title:\s*"([^"]+)"/)?.[1] ?? null;
  const component = src.match(/component:\s*([A-Za-z_$][\w$]*)/)?.[1] ?? null;

  // parameters.docs.description.component — 문자열 연결까지 이어붙임
  let description = null;
  const dm = src.match(/description:\s*\{\s*component:\s*([\s\S]*?)\n\s*\},?/);
  if (dm) description = joinLiterals(dm[1]) || null;

  // 스토리 export + 바로 위 한 줄 JSDoc
  const stories = [];
  // 주석 닫기 기호가 본문에 들어가지 못하게 막는다. 게으른 `[\s\S]*?` 만 쓰면 파일 첫 JSDoc 에서
  // 시작해 meta 전체를 삼킨 뒤 첫 스토리 앞 주석에서 닫혀버린다(실측).
  const re = /(?:\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*)?export const ([A-Za-z_$][\w$]*)\s*:\s*Story\b/g;
  let m;
  while ((m = re.exec(src))) {
    const note = (m[1] ?? "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*?\s?/, "").trim())
      .filter(Boolean)
      .join(" ");
    stories.push({ name: m[2], note: note || null });
  }
  return { file: rel(file), title, component, description, stories };
}

/** 설명·docstring 안의 ✅ Do / ❌ Don't 블록을 항목 배열로. */
function harvestMarkers(text) {
  if (!text) return { do: [], dont: [] };
  const pick = (marker) => {
    const i = text.indexOf(marker);
    if (i < 0) return [];
    const rest = text.slice(i + marker.length);
    const end = rest.search(/[✅❌]/);
    const body = (end < 0 ? rest : rest.slice(0, end))
      .replace(/^\s*\*\*Do(n't)?\*\*\s*—?/i, "")
      .replace(/\s+/g, " ")
      .trim();
    return body
      .split("·")
      .map((s) => s.trim().replace(/^[-—\s]+/, ""))
      .filter((s) => s.length > 1);
  };
  return { do: pick("✅"), dont: pick("❌") };
}

/* ── barrel: 컴포넌트 이름 → 소스 파일 ────────────────────────────────────── */

/**
 * 배럴에서 `이름 → 소스파일` 과 `이름 → 이 이름을 export 한 배럴 집합` 을 함께 만든다.
 *
 * ⚠️ `importFrom` 을 **파일 위치**(`src/widget/` 로 시작하는가)로 계산하면 안 된다.
 * `src/widget/` 에 살지만 widget 배럴이 export 하지 않는 컴포넌트가 13종 있었고,
 * 카탈로그가 `@whatap/design-system/widget` 에서 가져오라고 가르치고 있었다 —
 * 그대로 따라 쓰면 import 가 실패한다. 진실은 파일 위치가 아니라 **배럴이 무엇을 내보내는가** 다.
 */
function barrelMap() {
  const map = new Map();
  const exportedBy = new Map();     // 컴포넌트 이름 → Set<"root"|"widget"|"chart">
  const exportedFile = new Map();   // 소스 파일(절대경로) → Set<"root"|"widget"|"chart">
  const mark = (key, owner, sink) => {
    if (!sink.has(key)) sink.set(key, new Set());
    sink.get(key).add(owner);
  };

  /**
   * 배럴 하나를 훑는다. `export * from "./x"` 는 **한 겹 더 들어간다** —
   * 루트 배럴이 `export * from "./topology"` 로 8종을 재수출하고 있어서,
   * 재귀하지 않으면 그것들이 "어느 배럴에도 없음"으로 잘못 잡힌다.
   * owner 는 바깥 배럴로 유지한다(소비자가 실제로 import 하는 진입점이므로).
   */
  const scan = (file, owner, seen = new Set()) => {
    if (!existsSync(file) || seen.has(file)) return;
    seen.add(file);
    const src = readFileSync(file, "utf8");
    const base = dirname(file);
    const resolve = (spec) => {
      for (const ext of [".tsx", ".ts"]) {
        const f = join(base, spec + ext);
        if (existsSync(f)) return f;
      }
      const idx = join(base, spec, "index.ts");
      return existsSync(idx) ? idx : null;
    };

    // export { default as X } from "./X"
    for (const m of src.matchAll(/export\s*\{\s*default as ([A-Za-z_$][\w$]*)\s*\}\s*from\s*"(\.[^"]+)"/g)) {
      const f = resolve(m[2]);
      mark(m[1], owner, exportedBy);
      if (f) { if (!map.has(m[1])) map.set(m[1], f); mark(f, owner, exportedFile); }
    }
    // export { A, B, type C } from "./X"  (추출 Parts 다수)
    for (const m of src.matchAll(/export\s*\{([^}]+)\}\s*from\s*"(\.[^"]+)"/g)) {
      const f = resolve(m[2]);
      if (f) mark(f, owner, exportedFile);
      for (const raw of m[1].split(",")) {
        const nm = raw.replace(/\btype\b/, "").trim().split(/\s+as\s+/).pop();
        if (!nm || !/^[A-Z]/.test(nm)) continue;
        mark(nm, owner, exportedBy);
        if (f && !map.has(nm)) map.set(nm, f);
      }
    }
    // export * from "./x" — 한 겹 재귀 (owner 유지)
    for (const m of src.matchAll(/export\s*\*\s*from\s*"(\.[^"]+)"/g)) {
      const f = resolve(m[1]);
      if (f) scan(f, owner, seen);
    }
  };

  scan(join(root, "src/index.ts"), "root");
  scan(join(root, "src/widget/index.ts"), "widget");
  scan(join(root, "src/chart/index.ts"), "chart");
  return { map, exportedBy, exportedFile };
}

/** barrel 에 없는 컴포넌트를 위한 폴백 — 파일명이 컴포넌트명인 src 파일. */
function fileByName(name) {
  const hits = walk(join(root, "src")).filter((f) => f.endsWith(".tsx") && basename(f, ".tsx") === name);
  return hits[0] ?? null;
}

/* ── 조립 ─────────────────────────────────────────────────────────────────── */

const storyFiles = walk(join(root, "stories")).filter((f) => f.endsWith(".stories.tsx"));
const { map: barrel, exportedBy, exportedFile } = barrelMap();
/** 이름 → 없으면 소스파일로 되짚어 실제 진입점을 고른다. 어느 배럴도 안 내보내면 null. */
function importEntry(name, srcFile) {
  const owners = exportedBy.get(name) ?? (srcFile ? exportedFile.get(srcFile) : null);
  if (!owners) return null;
  // 위젯 배럴이 실제로 내보내면 그쪽을 가르친다 — `.`(루트) / `./widget` 분리가 의미를 갖는 자리.
  // 루트 배럴이 위젯까지 한 번에 노출하므로 둘 다 유효하지만, AI 위젯 자산은 전용 진입점이 정본.
  if (owners.has("widget")) return "@whatap/design-system/widget";
  // 차트도 같은 이유 — 루트가 재수출하지만 전용 진입점 `./chart`(Chart Art) 가 정본.
  if (owners.has("chart")) return "@whatap/design-system/chart";
  if (owners.has("root")) return "@whatap/design-system";
  return null;
}

const components = [];
const gaps = [];

for (const sf of storyFiles) {
  const s = parseStoryFile(sf);
  if (!s.title) continue;
  const layer = s.title.split("/")[0];
  const name = s.component ?? s.title.split("/").pop();
  /* 소스 찾기 3단: barrel → 파일명 일치 → 스토리 파일명(래퍼 이름이 다른 경우: WhaTapAiContext).
     여기서 못 찾으면 스토리 파일 안에 정의된 합성 템플릿(Shell/Page/*)이다 — docstring 이
     아니라 스토리 설명이 그 컴포넌트의 유일한 문서이므로 게이트가 그쪽을 요구한다. */
  const srcFile =
    (s.component && barrel.get(s.component)) ??
    fileByName(name) ??
    fileByName(basename(sf, ".stories.tsx"));
  const srcText = srcFile ? readFileSync(srcFile, "utf8") : "";
  const doc = srcText ? docBlockOf(srcText) : null;

  /* 스토리 파일 안에서 정의되는 합성 템플릿(`Shell/Page/*` · 브랜드 자산)은 소스 docstring 이
     있을 수 없다 — 그쪽은 **스토리 설명이 유일한 문서**다. 같은 4섹션을 거기서도 읽는다.
     그러지 않으면 「이 페이지는 어떤 동선용인가」(= When to use) 기준이 기계 경로에서 영구히
     빈칸으로 남는다 — 이름을 모르는 사람이 의도로 찾아올 때 검색에 걸리는 기준이 그것이다.
     소스가 있는 컴포넌트는 대상이 아니다(같은 말을 docstring 과 스토리 두 곳에 두게 된다). */
  const docText = doc ?? s.description ?? "";
  /* 스토리 설명이 섹션을 담게 되면 첫 `##` 앞까지가 사람이 읽는 한 줄 요약이다. */
  const descIntro = (s.description ?? "").split(/^##\s+/m)[0].trim() || null;

  const whenToUse = section(docText, "When to use");
  const whenNotToUse = section(docText, "When NOT to use");
  const compositionRules = section(docText, "Composition rules");
  const explicitDo = bullets(section(docText, "Do"));
  const explicitDont = bullets(section(docText, "Don't"));
  const fromStory = harvestMarkers(s.description);

  const metrics = metricsOf(docText);
  const color = colorOf(docText);
  const states = statesOf(docText);
  const limits = limitsOf(docText);
  const derivedDont = [
    ...bullets(whenNotToUse).map((b) => `사용하지 말 것 — ${b}`),
    ...(metrics?.avoid ?? []).map((b) => `이 지표에 쓰지 말 것 — ${b}`),
    ...(color?.avoid ?? []).map((b) => `색 — ${b}`),
    ...bullets(compositionRules).filter((b) => PROHIBITIVE.test(b)),
  ];

  const entry = {
    name,
    layer,
    title: s.title,
    storyId: `${slugify(s.title)}--docs`,
    docsUrl: `/?path=/docs/${slugify(s.title)}--docs`,
    sourceFile: srcFile ? rel(srcFile) : null,
    storyFile: s.file,
    // 배럴이 실제로 export 하는 진입점. 둘 다면 루트(= 위젯까지 한 번에 노출하는 배럴)를 쓴다.
    // 이름으로 못 찾으면 **소스 파일**로 되짚는다 — 표시명과 export 이름이 다른 경우가 있다
    // (`Primitives/Ai/Context` 의 export 는 WhaTapAiProvider·useWhaTapAi).
    importFrom: importEntry(name, srcFile),
    // 스토리 설명이 없으면 docstring Purpose 로 채운다 — 소비 AI 에게 한 줄 요약이 늘 있게.
    summary: descIntro ?? (doc ? section(doc, "Purpose").split(/(?<=[.。])\s|\n\n/)[0].replace(/\s+/g, " ").trim() : null),
    // 소스 docstring 이 없는 합성 템플릿은 스토리 설명의 도입부가 Purpose 를 겸한다.
    purpose: section(docText, "Purpose").replace(/\s+/g, " ").trim() || (doc ? null : descIntro),
    whenToUse: bullets(whenToUse),
    whenNotToUse: bullets(whenNotToUse),
    compositionRules: bullets(compositionRules),
    spec: specOf(docText),
    /* 차트가 맞는 지표 · 쓰면 안 되는 지표(`## Metrics` ✅ / ❌). 차트 아니면 null. */
    metrics,
    /* 차트 색 규칙(`## Color` 역할 · 상한 · 고정 · 금지 + 적힌 토큰). 차트 아니면 null. */
    color,
    /* 데이터가 비거나 이상할 때(`## States` 빈 · 빠짐 · 0 · 넘침). 차트 아니면 null. */
    states,
    /* 개수 · 크기 · 라벨 한계(`## Limits`). 차트 아니면 null. */
    limits,
    /* 템플릿 밖 섹션 이름 — 배달되지 않는 문서. 게이트가 0 을 요구한다. */
    extraSections: extraSectionsOf(docText),
    // 스토리 블록과 docstring 유도가 같은 말을 하는 경우가 있어 중복 제거.
    do: dedupe(explicitDo.length ? explicitDo : [...fromStory.do, ...bullets(whenToUse)]),
    dont: dedupe(explicitDont.length ? explicitDont : [...fromStory.dont, ...derivedDont]),
    doDontSource: explicitDo.length || explicitDont.length ? "explicit" : fromStory.dont.length ? "story" : "derived",
    /* 이 항목이 «대신 등재해 주는» 이름들. 아이콘처럼 prop 표면이 없는 것을 한 장에 묶을 때
       스토리 설명에 `@covers A · B · C` 로 **명시**한다. 추론(본문에 이름이 있으면 등재로
       인정)으로 두면 다른 컴포넌트 설명에 이름만 스쳐도 통과한다 — 실측으로 AiWidget 이
       그렇게 새어 나갔다. */
    covers: ((s.description ?? "").match(/@covers\s+([^\n]+)/)?.[1] ?? (docText.match(/@covers\s+([^\n]+)/)?.[1] ?? ""))
      .split(/[·,]/)
      .map((x) => x.trim())
      .filter((x) => /^[A-Z][\w]*$/.test(x)),
    example: doc ? exampleOf(doc) : null,
    // meta 에 `component:` 가 없는 스토리(DataTable 등)도 있으므로 제목에서 유도한 이름으로 폴백.
    props: srcText ? propsOf(srcText, s.component ?? name) : [],
    stories: s.stories.map((st) => ({
      name: st.name,
      id: `${slugify(s.title)}--${kebab(st.name)}`,
      note: st.note,
    })),
  };
  components.push(entry);

  const missing = [];
  /* 소스가 있는데 docstring 이 없는 것만 «누락»이다. 스토리 정의 템플릿은 docstring 을 가질
     수 없으므로 그걸 누락으로 세면 영구히 해소되지 않는 gap 이 남아 신호가 죽는다 —
     그쪽에 요구할 것은 스토리 설명의 `## When to use` 다. */
  if (!doc && srcFile) missing.push("docstring");
  // Tokens 는 컴포넌트가 아니라 메타 카탈로그 — 「언제 쓰나」를 물을 대상이 아니다.
  if (!doc && !srcFile && layer !== "Tokens" && !whenToUse) missing.push("story ## When to use");
  if (!entry.summary) missing.push("story description");
  if (!entry.dont.length) missing.push("dont");
  if (missing.length) gaps.push({ title: s.title, missing });
}

components.sort((a, b) => a.title.localeCompare(b.title));

const out = {
  $comment:
    "자동 생성 (scripts/build-components-json.mjs). 직접 편집 금지 — src docstring · stories 를 고치고 재생성. " +
    "do/dont 는 docstring 의 ## Do / ## Don't 가 있으면 그대로, 없으면 When to use / When NOT to use / Composition rules(금지형) 에서 유도한다.",
  generatedFrom: { stories: storyFiles.length, components: components.length },
  gaps,
  components,
};

/* id 규칙 검산 — 빌드된 index.json 이 있으면 대조한다. 여기서 어긋난 id 는 MCP 가 돌려주는
   링크가 404 라는 뜻이고, 그건 "정보가 있는데 못 여는" 가장 나쁜 실패다. 정적 빌드는 이 생성기
   *뒤*에 돌므로 없거나 낡을 수 있어 경고까지만 한다(차단은 catalog 게이트의 몫). */
const idx = join(root, "storybook-static/index.json");
if (existsSync(idx)) {
  const known = new Set(Object.keys(JSON.parse(readFileSync(idx, "utf8")).entries));
  const miss = components
    .flatMap((c) => [c.storyId, ...c.stories.map((s) => s.id)])
    .filter((id) => !known.has(id));
  if (miss.length) console.warn(`  ⚠ index.json 에 없는 id ${miss.length}건 (스토리 신규 추가면 정상): ${miss.slice(0, 5).join(", ")}`);
}

writeFileSync(join(root, "docs/components.json"), JSON.stringify(out, null, 2) + "\n");
console.log(
  `components.json generated — ${components.length} components ` +
    `(docstring ${components.filter((c) => c.purpose).length} · dont ${components.filter((c) => c.dont.length).length} · gaps ${gaps.length})`,
);

/**
 * build-tokens-json — `docs/tokens.json` 생성기 (**토큰의 AI 배달 경로**).
 *
 * ## 왜 필요한가
 * 컴포넌트 규칙은 `components.json` 으로 기계 판독이 되는데 **토큰은 산문뿐이었다** —
 * MCP `get_tokens` 는 `tokens.md` 를 그대로 돌려줬고, 런타임 토큰 197개 중 그 문서에
 * 이름이라도 등장하는 것은 55개(28%)였다. 즉 컴포넌트는 고를 수 있는데 그 안을 채우는
 * **원자(색·타이포·간격·그림자)를 고를 근거가 없었다.** 「경고 배경에 무엇을 쓰나」에
 * 답할 수단이 파이프라인에 없었다는 뜻이다.
 *
 * ## 단일 출처 — CSS 가 값을, 그 위 주석이 의미를 갖는다
 * 값과 의미를 다른 파일에 두면 반드시 갈라진다(`DESIGN.md` 가 그렇게 51종을 놓쳤다).
 * 그래서 의미는 **토큰 선언 바로 위 주석**에 쓴다:
 *
 *   ```css
 *   /* @role 경고 상태의 원색 | @use 경고 배지·도트·보더 | @avoid 본문 텍스트(대비 미달) *​/
 *   --color-status-warning: #F0B400;
 *   ```
 *
 * `@role` 만 필수다. `@use`/`@avoid` 는 있으면 싣는다. 여러 토큰이 의미를 공유하면
 * 그룹 헤더 주석(`/* @group-role … *​/`)을 한 번 쓰고 그 아래 토큰들이 상속한다 —
 * 24개 차트 색에 같은 문장을 24번 적게 만들면 아무도 유지하지 않는다.
 *
 * ## 유도되는 것 (손으로 쓰지 않는다)
 *   - `tier`      Global(값이 이름) / Semantic(용도가 이름) / Component(`--wds-*`)
 *   - `group`     이름 두 번째 마디
 *   - `dark`      `.dark` 블록의 재매핑 값 (없으면 null = 테마 불변)
 *   - `utilities` 이 토큰을 `var()` 로 쓰는 유틸 클래스명
 *   - `usedBy`    `src/**` 에서 이 토큰을 참조하는 컴포넌트 파일
 *   - `aliasOf`   값이 `var(--other)` 인 경우의 대상
 *   - `distinctFrom` `@distinct <집합>` 을 선언한 토큰만. 그 집합의 색과 **실제 값으로 잰**
 *                 ΔE(정상시야 · protan · deutan, 라이트 · 다크)와 판정. 숫자를 주석에 손으로
 *                 쓰면 값을 바꾸는 순간 낡는다 — 주석은 «무엇과 구별돼야 하는가» 만 선언한다.
 *
 * 사용: `node scripts/build-tokens-json.mjs`  (build:design 이 함께 호출)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { isHex, distances } from "./lib/color-distance.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS = join(root, "src/whatap-ds.css");
const rel = (p) => p.slice(root.length + 1);

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const css = readFileSync(CSS, "utf8");
const lines = css.split("\n");

/* ── 블록 경계 ────────────────────────────────────────────────────────────── */

/** 선언이 `.dark` 블록 안인지 — 다크 재매핑은 별도 필드로 싣는다. */
const darkStart = lines.findIndex((l) => /^\.dark\b|^\.dark,/.test(l));

/* ── 주석에서 의미 뽑기 ───────────────────────────────────────────────────── */

const FIELDS = ["role", "use", "avoid", "distinct"];

/** `@role x | @use y | @avoid z` → { role, use, avoid }. 없는 건 undefined. */
function parseAnnotation(text) {
  if (!text || !text.includes("@")) return null;
  const out = {};
  for (const f of FIELDS) {
    // 다음 `@필드` 또는 문자열 끝까지
    const re = new RegExp(`@${f}\\s+([\\s\\S]*?)(?=\\s*[|·]?\\s*@(?:${FIELDS.join("|")})\\b|$)`);
    const m = text.match(re);
    if (m) {
      const v = m[1].replace(/\*\/\s*$/, "").replace(/\s*\|\s*$/, "").replace(/\s+/g, " ").trim();
      if (v) out[f] = v;
    }
  }
  return Object.keys(out).length ? out : null;
}

/** 주석 줄만 모아 하나의 문자열로(여러 줄 주석 대응). */
function commentAbove(i) {
  const buf = [];
  for (let k = i - 1; k >= 0; k--) {
    const ln = lines[k].trim();
    if (!ln) break;
    if (ln.startsWith("/*") || ln.startsWith("*") || ln.endsWith("*/")) {
      buf.unshift(ln.replace(/^\/\*+|\*+\/$|^\*/g, "").trim());
      if (ln.startsWith("/*")) break; // 블록 시작까지 올라갔다
      continue;
    }
    break; // 주석이 아닌 줄(다른 선언 등)을 만나면 중단
  }
  return buf.join(" ").trim();
}

/* ── tier 판정 ────────────────────────────────────────────────────────────── */

/** 값 자체가 이름인 것은 Global, 용도가 이름인 것은 Semantic, `--wds-*` 는 Component. */
function tierOf(name) {
  if (name.startsWith("--wds-")) return "Component";
  // 팔레트·스케일: 이름 끝이 숫자거나 원시 스케일 계열
  if (/^--color-(gray|logo)-/.test(name)) return "Global";
  if (/^--(text|leading|tracking|spacing|radius|default)-/.test(name)) return "Global";
  if (/^--font-(family|weight)-/.test(name)) return "Global";
  return "Semantic";
}

const groupOf = (name) => name.replace(/^--/, "").split("-").slice(0, 2).join("-");

/* ── 수집 ─────────────────────────────────────────────────────────────────── */

const tokens = new Map(); // name → entry
const darkValues = new Map();
/** 그룹 단위 상속 주석 — `@group-role` 로 선언하면 아래 토큰들이 물려받는다. */
let inherited = null;

lines.forEach((ln, i) => {
  const gm = ln.match(/@group-role\s+([\s\S]*?)(?:\*\/|$)/);
  if (gm) {
    inherited = parseAnnotation("@role " + gm[1]) ?? null;
    // 같은 줄에 @use/@avoid 가 더 있으면 함께
    const extra = parseAnnotation(ln.replace("@group-role", "@role"));
    if (extra) inherited = { ...inherited, ...extra };
    return;
  }
  if (/^\s*\}/.test(ln)) inherited = null; // 블록이 끝나면 상속 종료

  /* 값이 여러 줄에 걸친 선언(`--font-mono` 의 폰트 스택)도 잡는다 — 한 줄만 보면
     조용히 누락되고, 누락된 토큰은 「없는 토큰」으로 배달된다. */
  const head = ln.match(/^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]*)$/);
  if (!head) return;
  const [, name] = head;
  let raw = head[2];
  for (let k = i + 1; !raw.includes(";") && k < lines.length && k < i + 6; k++) raw += " " + lines[k].trim();
  const value = raw.slice(0, raw.indexOf(";") >= 0 ? raw.indexOf(";") : undefined).replace(/\s+/g, " ").trim();
  if (!value) return;

  if (darkStart >= 0 && i > darkStart) {
    if (!darkValues.has(name)) darkValues.set(name, value);
    return;
  }
  if (tokens.has(name)) return; // 첫 선언만

  const own = parseAnnotation(commentAbove(i)) ?? parseAnnotation(ln.split(";")[1] ?? "");
  const meta = own ?? inherited ?? null;

  tokens.set(name, {
    name,
    tier: tierOf(name),
    group: groupOf(name),
    value,
    dark: null,
    aliasOf: value.match(/^var\((--[a-z0-9-]+)/)?.[1] ?? null,
    role: meta?.role ?? null,
    use: meta?.use ?? null,
    avoid: meta?.avoid ?? null,
    distinct: meta?.distinct ?? null,
    inheritedFrom: own ? null : inherited ? "group" : null,
    utilities: [],
    usedBy: [],
  });
});

for (const [name, v] of darkValues) if (tokens.has(name)) tokens.get(name).dark = v;

/* ── 변별 측정 (`@distinct <집합>`) ──────────────────────────────────────── */

/**
 * 「이 색은 저 색들과 구별돼야 한다」 는 선언을 숫자로 바꾼다. 정책 본문(patterns.md)과
 * 같은 식(`lib/color-distance.mjs` = dataviz 검증기)으로 재므로 문서의 표와 숫자가 같다.
 *
 * 판정은 정상시야 ΔE ≥ threshold 만 본다. 색각 이상(protan · deutan)은 싣기만 한다 —
 * Severity 가 빨강 · 초록이라 색으로는 원리적으로 보장할 수 없고, 그 몫은 구조 규칙
 * (한 위젯에 섞지 않음 · 아이콘 + 라벨)이 맡는다(§23). 값이 같은 쌍은 `sameValue` 로 표시.
 */
const DISTINCT_SETS = {
  severity: {
    policy: "chart-series-vs-severity",
    threshold: 15,
    against: [
      "--color-status-success",
      "--color-status-warning",
      "--color-status-error",
      "--color-indicator-critical",
      "--color-indicator-warning",
    ],
    // info 는 Severity 가 아니다. ΔE 판정 대상이 아니라 «같은 값 금지» 만 본다(§23).
    sameValueOnly: ["--color-status-info"],
  },
};

const modeValue = (t, mode) => (mode === "dark" ? t.dark ?? t.value : t.value);

for (const t of tokens.values()) {
  if (!t.distinct) continue;
  const key = t.distinct.trim().split(/\s+/)[0];
  const set = DISTINCT_SETS[key];
  if (!set) {
    console.error(`✗ ${t.name} — @distinct ${key} 는 알 수 없는 집합입니다 (${Object.keys(DISTINCT_SETS).join(", ")})`);
    process.exit(1);
  }
  const pairs = [];
  const nearest = {};
  for (const mode of ["light", "dark"]) {
    const mine = modeValue(t, mode);
    if (!isHex(mine)) continue;
    for (const other of [...set.against, ...(set.sameValueOnly ?? [])]) {
      const o = tokens.get(other);
      if (!o || !isHex(modeValue(o, mode))) continue;
      const d = distances(mine, modeValue(o, mode));
      let row = pairs.find((p) => p.token === other);
      if (!row) pairs.push((row = { token: other }));
      const judged = set.against.includes(other);
      row.judged = judged ? "deltaE" : "sameValue";
      row[mode] = { ...d, sameValue: mine.toLowerCase() === modeValue(o, mode).toLowerCase() };
      if (judged && (!nearest[mode] || d.normal < nearest[mode].normal)) nearest[mode] = { token: other, normal: d.normal };
    }
  }
  const passMode = (m) => (nearest[m] ? nearest[m].normal >= set.threshold : null);
  t.distinctFrom = {
    set: key,
    policy: set.policy,
    criterion: `정상시야 OKLab ΔE×100 ≥ ${set.threshold} (라이트 · 다크 각각) · 같은 값 금지`,
    pass: passMode("light") === true && passMode("dark") === true && !pairs.some((p) => p.light?.sameValue || p.dark?.sameValue),
    light: nearest.light ? { nearest: nearest.light, pass: passMode("light") } : null,
    dark: nearest.dark ? { nearest: nearest.dark, pass: passMode("dark") } : null,
    pairs,
  };
}

/* ── 유틸 클래스 역인덱스 ─────────────────────────────────────────────────── */

/* `.bg-status-warning { background-color: var(--color-status-warning) }` 같은 규칙에서
   토큰 → 유틸 클래스명을 뽑는다. 소비자가 실제로 쓰는 표면은 클래스이므로, 토큰만
   알려주고 클래스를 알려주지 않으면 인라인 style 로 새는 길을 남긴다. */
/* 주석을 먼저 제거한다 — 주석 안 문장이 셀렉터로 오인되면 `css` 같은 가짜 유틸명이
   섞인다(실측: `whatap-ds.css` 를 언급한 주석에서 `.css` 가 클래스로 잡혔다). */
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, " ");
const ruleRe = /(^|\})\s*([^{}@]+?)\{([^{}]*)\}/g;
let rm;
while ((rm = ruleRe.exec(cssNoComments))) {
  const selectors = rm[2];
  const body = rm[3];
  if (!body.includes("var(--")) continue;
  const classes = [...selectors.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1]);
  if (!classes.length) continue;
  for (const v of body.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const t = tokens.get(v[1]);
    if (!t) continue;
    for (const c of classes) if (!t.utilities.includes(c)) t.utilities.push(c);
  }
}

/* ── 컴포넌트 사용처 ──────────────────────────────────────────────────────── */

for (const f of walk(join(root, "src")).filter((f) => /\.(tsx|ts)$/.test(f))) {
  if (f.endsWith(".css")) continue;
  const src = readFileSync(f, "utf8");
  const name = basename(f).replace(/\.(tsx|ts)$/, "");
  for (const v of new Set([...src.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))) {
    const t = tokens.get(v);
    if (t && !t.usedBy.includes(name)) t.usedBy.push(name);
  }
}

/* ── 관련 토큰 (같은 그룹) ────────────────────────────────────────────────── */

const byGroup = new Map();
for (const t of tokens.values()) {
  if (!byGroup.has(t.group)) byGroup.set(t.group, []);
  byGroup.get(t.group).push(t.name);
}
for (const t of tokens.values())
  t.related = (byGroup.get(t.group) ?? []).filter((n) => n !== t.name).slice(0, 8);

/* ── 산출 ─────────────────────────────────────────────────────────────────── */

const list = [...tokens.values()].sort((a, b) => a.name.localeCompare(b.name));
const undocumented = list.filter((t) => !t.role).map((t) => t.name);

const out = {
  $comment:
    "자동 생성 (scripts/build-tokens-json.mjs). 직접 편집 금지 — src/whatap-ds.css 의 토큰 선언과 " +
    "그 위 `@role / @use / @avoid / @distinct` 주석을 고치고 재생성. tier·group·dark·utilities·usedBy·distinctFrom 은 유도된다.",
  generatedFrom: { css: rel(CSS), tokens: list.length, dark: darkValues.size },
  coverage: { documented: list.length - undocumented.length, total: list.length, undocumented },
  tokens: list,
};

writeFileSync(join(root, "docs/tokens.json"), JSON.stringify(out, null, 2) + "\n");
console.log(
  `tokens.json generated — ${list.length} tokens ` +
    `(role ${list.length - undocumented.length} · 다크 재매핑 ${darkValues.size} · ` +
    `유틸 연결 ${list.filter((t) => t.utilities.length).length} · ` +
    `변별 측정 ${list.filter((t) => t.distinctFrom).length}(미달 ${list.filter((t) => t.distinctFrom && !t.distinctFrom.pass).length}))`,
);

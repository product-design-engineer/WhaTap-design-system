/**
 * check-dead-leading — 지는 `leading-*` 클래스를 막는다.
 *
 * ## 왜 필요한가
 * `whatap-ds.css` 에서 `.leading-*` 는 `.text-xs` · `.text-sm` · `.text-base` · `.text-lg` · `.text-2xl` 보다
 * **앞에** 선언돼 있다. 둘 다 `line-height` 를 정하고 우선순위가 같으므로, 같은 요소에 함께 주면 뒤의
 * `text-*` 가 이기고 `leading-*` 는 아무 일도 하지 않는다. 이 순서는 일부러 둔 것이다. 소비 앱 화면이
 * 그 순서에 기대고 있어 옮기면 화면이 움직인다(whatap-ds.css 의 `.text-xl` 위 주석).
 *
 * 그래서 고치는 쪽은 CSS 가 아니라 쓰는 쪽이다. 지는 클래스는 읽는 사람에게 «줄 높이 1» 이라고 말하지만
 * 화면은 1.5 다. 2026-10-22 사이드바 프로젝트 스위처에서 그 차이로 두 줄 글자가 1.5px 처졌다.
 *
 * ## 무엇을 막나
 * 같은 클래스 문자열 조각 안에 «`leading-*` 보다 뒤에 선언된 줄 높이 있는 `text-*`» 와 `leading-*` 가
 * 함께 있는 것. 어느 `text-*` 가 해당하는지는 CSS 에서 읽는다(손으로 적지 않는다).
 * 템플릿 문자열은 `${…}` 로 갈라 정적 조각마다 본다 — 조건으로 붙는 클래스는 판정하지 않는다.
 *
 * ## 대신 쓸 것
 * 줄 높이를 바꿔야 하면 `style={{ lineHeight: "var(--leading-none)" }}` 처럼 style 로 준다.
 * 지금 줄 높이가 맞으면 `leading-*` 를 지운다(화면은 그대로다).
 *
 * 사용: `node scripts/check-dead-leading.mjs`
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/whatap-ds.css"), "utf8").split("\n");

/* CSS 에서 첫 `.leading-*` 줄과, 그보다 뒤에 있는 줄 높이 있는 `.text-*` 를 읽는다. */
const firstLeading = css.findIndex((l) => /^\.leading-[\w-]+\s*\{/.test(l));
if (firstLeading < 0) {
  console.error("✗ whatap-ds.css 에서 .leading-* 를 찾지 못했습니다.");
  process.exit(1);
}
const losing = new Set();
css.forEach((l, i) => {
  const m = l.match(/^\.(text-[\w-]+)\s*\{[^}]*line-height/);
  if (m && i > firstLeading) losing.add(m[1]);
});

const TEXT = new RegExp(`(?<![\\w-])(${[...losing].join("|")})(?![\\w-])`);
const LEAD = /(?<![\w:-])leading-[\w-]+(?![\w-])/;

function* segments(src) {
  for (const m of src.matchAll(/"([^"\n]*)"|'([^'\n]*)'/g)) {
    const g = m[1] !== undefined ? m[1] : m[2];
    yield { text: g, at: m.index };
  }
  for (const m of src.matchAll(/`([^`]*)`/gs)) {
    for (const part of m[1].split(/\$\{[^}]*\}/)) yield { text: part, at: m.index };
  }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of [...walk(join(root, "src")), ...walk(join(root, "stories"))]) {
  const src = readFileSync(file, "utf8");
  const seen = new Set();
  for (const { text, at } of segments(src)) {
    if (!TEXT.test(text) || !LEAD.test(text)) continue;
    const line = src.slice(0, at).split("\n").length;
    const key = `${line}:${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    violations.push(`${relative(root, file)}:${line}  ${text.trim().slice(0, 100)}`);
  }
}

if (violations.length) {
  console.error(`✗ 지는 leading-* ${violations.length}곳 — ${[...losing].join(" · ")} 와 같은 요소에 쓰면 적용되지 않는다.`);
  for (const v of violations) console.error("  " + v);
  console.error("\n  줄 높이를 바꿔야 하면 style={{ lineHeight: \"var(--leading-none)\" }} 로, 지금이 맞으면 leading-* 를 지운다.");
  process.exit(1);
}
console.log(`✓ 지는 leading-* 0곳 (판정 대상 text-*: ${[...losing].join(" · ")})`);

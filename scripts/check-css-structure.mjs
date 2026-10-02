// check-css-structure — 런타임 CSS 의 «구조»가 깨지지 않았는가.
//
// 다른 CSS 게이트(raw-color · token-sync · no-tailwind)는 **무엇을 썼는가**를 본다. 이 게이트는
// **쓴 규칙이 브라우저에 규칙으로 도달하는가**를 본다. CSS 는 구조가 깨져도 에러를 내지 않는다 —
// 파서가 조용히 복구하거나 통째로 버린다. 그래서 문법상 유효한 파일이 빌드·테스트·런타임 감사를
// 전부 통과한 채 규칙 수백 개가 죽어 있을 수 있다. 실제로 세 번 그랬다:
//
//   R1·R2 (2026-10-01) PR #13 충돌 해결에서 `@keyframes aiGlowSpin` 의 닫는 `}` 가 사라져
//         뒤따르는 마케팅 CSS 931줄 · 155규칙(.wds-web-cta · -section · .wds-hero-banner …)이
//         keyframes 안에 갇혔다. Storybook · tgz 소비처에서 전부 무스타일. 게이트 0건.
//         www 는 자체 CSS 파이프라인이 복구해 읽어서 아무도 못 봤다.
//   R3    (2026-09-11) 주석 안 `h-*/w-*` 의 `*/` 가 주석을 그 자리에서 닫았다 — 남은 문장이
//         CSS 로 파싱됐다.
//   R4    (2026-09-11) `.top-calc-100pct+4px` 의 `+` 가 형제 결합자로 읽혀 규칙이 죽었다.
//
// 규칙:
//   R1  중괄호 균형 — 주석·문자열을 뺀 뒤 `{` 와 `}` 의 수가 같고, 도중에 음수가 되지 않는다.
//   R2  `@keyframes` 블록 안에는 keyframe 선택자(from · to · N%)만 — 일반 선택자가 있으면
//       그 규칙은 keyframes 에 갇힌 것이다.
//   R3  주석 밖에 `*/` 가 남지 않는다 — 남아 있다면 주석이 일찍 닫혔다는 뜻이다.
//   R4  선택자 안에 `+ 숫자` 가 없다 — 결합자 뒤에 숫자가 오는 선택자는 존재할 수 없다.
//       (클래스명 안의 `+` 를 escape 없이 썼다는 뜻.)
//
// 외부 파서를 쓰지 않는다 — 의존성 0 인 다른 게이트들과 같다. 브라우저 파서는 관대해서
// 깨진 구조도 «그럴듯하게» 읽으므로, 여기서는 관대하지 않게 센다.
//
// 사용: node scripts/check-css-structure.mjs [파일 …]   (기본: 런타임 CSS 2종)
import fs from "node:fs";

const FILES = process.argv.slice(2).length ? process.argv.slice(2) : ["src/whatap-ds.css", "src/tokens.css"];
const KEYFRAME_SELECTOR = /^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*$/;

/**
 * 주석과 문자열을 같은 길이의 공백으로 지운다 — 줄 번호를 보존한다.
 * CSS 주석은 중첩되지 않고 **첫 `*` `/` 에서 닫힌다**(그래서 R3 함정이 생긴다).
 */
function blank(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1).replace(/[^\n]/g, " ");
      i = j + 1;
    } else if (c === "\\") {
      // escape 된 한 글자(예: `.top-calc-100pct\+4px`, `\--small`)는 구조 문자가 아니다.
      out += "  ";
      i += 2;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

const lineOf = (s, idx) => s.slice(0, idx).split("\n").length;

function check(file) {
  const raw = fs.readFileSync(file, "utf8");
  const s = blank(raw);
  const errs = [];

  // R3 — 주석 밖에 남은 별표-슬래시. (이 줄을 블록 주석으로 쓰면 바로 이 함정에 걸린다 — 실제로 걸렸다.)
  for (const m of s.matchAll(/\*\//g)) {
    errs.push({ rule: "R3", line: lineOf(s, m.index), msg: "주석 밖에 `*/` 가 있다 — 그 위 주석이 일찍 닫혔다(주석 안 `*/` 조합)" });
  }

  /* R1 · R2 — 블록 스택을 따라가며 센다 */
  const stack = []; // { prelude, line, keyframes }
  let prelude = "";
  let preludeStart = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "{") {
      const p = prelude.trim();
      const parent = stack[stack.length - 1];
      if (parent?.keyframes && !KEYFRAME_SELECTOR.test(p)) {
        errs.push({
          rule: "R2",
          line: lineOf(s, preludeStart),
          msg: `@keyframes ${parent.name} 안에 keyframe 이 아닌 선택자 \`${p.slice(0, 60)}\` — 이 규칙은 keyframes 에 갇혀 무시된다(닫는 \`}\` 누락 의심 · 블록 시작 ${parent.line}행)`,
        });
      }
      const kf = /^@(-webkit-)?keyframes\s+(\S+)/.exec(p);
      stack.push({ prelude: p, line: lineOf(s, preludeStart), keyframes: !!kf, name: kf?.[2] });
      prelude = "";
    } else if (c === "}") {
      if (!stack.length) {
        errs.push({ rule: "R1", line: lineOf(s, i), msg: "짝 없는 `}` — 여는 괄호보다 닫는 괄호가 많다" });
      } else {
        stack.pop();
      }
      prelude = "";
    } else if (c === ";") {
      prelude = "";
    } else {
      if (!prelude.trim()) preludeStart = i;
      prelude += c;
    }
  }
  for (const open of stack) {
    errs.push({ rule: "R1", line: open.line, msg: `닫히지 않은 블록 \`${open.prelude.slice(0, 60)}\` — 파일 끝까지 \`}\` 가 없다` });
  }

  /* R4 — 선택자 안 `+ 숫자` (선택자 = `{` 앞 prelude 중 @ 로 시작하지 않는 것) */
  for (const m of s.matchAll(/(^|[}\n;])([^{}@;]*?)\{/g)) {
    const sel = m[2];
    const hit = /\+\s*\d/.exec(sel);
    if (hit && /[.#\[]/.test(sel)) {
      errs.push({
        rule: "R4",
        line: lineOf(s, m.index + m[1].length),
        msg: `선택자 \`${sel.trim().slice(0, 60)}\` 안의 \`+${sel.slice(hit.index + 1).trim()[0]}…\` — 결합자 뒤 숫자는 선택자가 아니다(클래스명 안 \`+\` 는 escape 하거나 이름을 바꾼다)`,
      });
    }
  }
  return errs;
}

const bar = "═".repeat(56);
console.log(`\n🧱 css-structure — 런타임 CSS 구조 무결성`);
console.log(bar);
let total = 0;
for (const f of FILES) {
  const errs = check(f);
  total += errs.length;
  const lines = fs.readFileSync(f, "utf8").split("\n").length;
  console.log(`  ${f} — ${lines}줄 · 위반 ${errs.length}건`);
  for (const e of errs.slice(0, 20)) console.error(`     ${e.rule}  ${f}:${e.line}  ${e.msg}`);
  if (errs.length > 20) console.error(`     … 외 ${errs.length - 20}건`);
}
console.log(bar);
if (total) {
  console.error(`FAIL — 위반 ${total}건\n`);
  console.error("  CSS 는 구조가 깨져도 에러를 내지 않는다 — 브라우저는 조용히 규칙을 버린다.");
  console.error("  R1 괄호를 맞춘다 · R2 keyframes 를 닫는다 · R3 주석 안 `*` 바로 뒤 `/` 를 피한다(`h-* · w-*`)");
  console.error("  R4 클래스명에 `+` 를 쓰지 않는다(역할 이름으로 · 예: `.top-full-4px`)\n");
  process.exit(1);
}
console.log("PASS — 위반 0건\n");

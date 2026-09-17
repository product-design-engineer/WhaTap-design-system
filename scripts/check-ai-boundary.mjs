// check-ai-boundary — AI 위젯 자산의 **트리 경계**와 **진입점 안내**를 검산한다.
//
// `check-catalog-folders` 는 `stories/` 안만 본다(폴더 === title prefix). 그래서
// "카탈로그는 `Primitives/Ai/` 로 분류하는데 소스는 `src/` 루트에 있다"는 드리프트를
// **어느 게이트도 보지 못했다.** 실제로 4종(AiSymbol · AiTriggerButton ·
// AiQuickActionChip · WhaTapAiContext)이 그 상태로 있었다.
//
// 규칙의 출처는 CLAUDE.md 의 카탈로그 표다:
//   Primitives/Ai/ · Composite/Ai/ → 소스 `src/widget/`
//   Shell/                        → 소스 `src/` · `src/widget/` 둘 다 허용
//                                   (WhaTapAiWidget 은 루트에 있는 것이 정상)
//
// R3 은 다른 축이지만 같은 병이다 — **카탈로그가 말하는 위치와 실제가 다른 것**.
// `importFrom` 이 파일 위치(`src/widget/` 로 시작하는가)로 계산되던 동안,
// widget 배럴이 export 하지 않는 13종이 `@whatap/design-system/widget` 에서
// 가져오라고 안내되고 있었다 — 소비 AI 가 그대로 쓰면 import 가 실패한다.
//
// 사용: node scripts/check-ai-boundary.mjs   (위반 시 exit 1)
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const rel = (p) => path.relative(ROOT, p);

const storyFiles = execSync(`find stories -name '*.stories.tsx'`).toString().split("\n").filter(Boolean);
const TITLE_RE = /title:\s*"((?:Tokens|Primitives|Composite|Shell)\/[^"]*)"/;

/** 파일명이 컴포넌트명인 소스를 src 아래에서 찾는다(스토리 파일명 === 컴포넌트명 규약). */
const walk = (dir, out = []) => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const srcFiles = walk(path.join(ROOT, "src")).filter((f) => f.endsWith(".tsx"));
const byName = new Map();
for (const f of srcFiles) byName.set(path.basename(f, ".tsx"), f);

const errors = [];

/* ── R1. 카탈로그가 Ai 하위그룹이면 소스는 src/widget/ 아래여야 한다 ────────── */
/*        (Shell 은 예외 — CLAUDE.md 가 두 트리를 모두 허용한다.)              */
let aiChecked = 0;
for (const sf of storyFiles) {
  const m = fs.readFileSync(sf, "utf8").match(TITLE_RE);
  if (!m) continue;                                   // 형식 위반은 catalog-folders 가 잡는다
  const title = m[1];
  if (!/^(Primitives|Composite)\/Ai\//.test(title)) continue;
  const name = path.basename(sf, ".stories.tsx");
  const src = byName.get(name);
  if (!src) continue;                                 // 소스 없는 합성 스토리는 대상 아님
  aiChecked += 1;
  if (!rel(src).startsWith("src/widget/")) {
    errors.push(
      `${rel(src)}\n    title "${title}" 는 Ai 하위그룹인데 소스가 위젯 트리 밖입니다 → src/widget/${name}.tsx 로 옮기세요.`,
    );
  }
}

/* ── R2. 역방향 — src/widget/ 에 사는데 카탈로그가 Ai 로 분류하지 않는다 ────── */
let widgetChecked = 0;
for (const f of srcFiles.filter((f) => rel(f).startsWith("src/widget/"))) {
  const name = path.basename(f, ".tsx");
  if (name.startsWith("_")) continue;                 // _primitives 등 내부 모듈
  const sf = storyFiles.find((s) => path.basename(s, ".stories.tsx") === name);
  if (!sf) continue;                                  // 스토리 없음 → 커버리지 게이트 소관
  const m = fs.readFileSync(sf, "utf8").match(TITLE_RE);
  if (!m) continue;
  widgetChecked += 1;
  if (!m[1].includes("/Ai/")) {
    errors.push(
      `${rel(f)}\n    위젯 트리에 있는데 title "${m[1]}" 이 Ai 하위그룹이 아닙니다 — 분류를 고치거나 src/ 루트로 옮기세요.`,
    );
  }
}

/* ── R3. components.json 의 importFrom 이 실제 배럴 export 와 일치하는가 ───── */
const CATALOG = path.join(ROOT, "docs/components.json");
let importChecked = 0;
let importSkipped = false;
if (!fs.existsSync(CATALOG)) {
  importSkipped = true;                               // 생성물 — build:design 전이면 건너뛴다
} else {
  const raw = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const entries = Array.isArray(raw) ? raw : raw.components ?? Object.values(raw);
  const barrelText = {
    "@whatap/design-system": read("src/index.ts") + read("src/topology/index.ts"),
    "@whatap/design-system/widget": read("src/widget/index.ts"),
  };
  for (const e of entries) {
    if (!e || !e.importFrom || !e.sourceFile) continue;
    const text = barrelText[e.importFrom];
    if (text === undefined) {
      errors.push(`docs/components.json\n    ${e.name} 의 importFrom "${e.importFrom}" 은 알 수 없는 진입점입니다.`);
      continue;
    }
    importChecked += 1;
    // 이름으로든(export { X }) 경로로든(export { default as Y } from "./X") 배럴에 닿아야 한다.
    const stem = e.sourceFile.replace(/^src\//, "").replace(/\.tsx?$/, "");
    const reachable =
      new RegExp(`\\b${e.name}\\b`).test(text) ||
      text.includes(`/${path.basename(stem)}"`) ||
      text.includes(`"./${path.basename(stem)}"`);
    if (!reachable) {
      errors.push(
        `docs/components.json\n    ${e.name} 은 ${e.importFrom} 에서 import 하라고 안내되는데 그 배럴이 내보내지 않습니다 (소스 ${e.sourceFile}).\n    → 배럴에 export 를 추가하거나 build-components-json 의 진입점 유도를 고치세요.`,
      );
    }
  }
}
function read(p) {
  const f = path.join(ROOT, p);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
}

/* ── 결과 ─────────────────────────────────────────────────────────────────── */
if (errors.length) {
  console.error(`✗ AI 위젯 경계 ${errors.length}건 위반:\n\n${errors.join("\n\n")}\n`);
  console.error("Ai 하위그룹 = src/widget/ 트리 (Shell 은 두 트리 모두 허용). 진입점 안내는 배럴이 실제로 내보내는 것만.");
  process.exit(1);
}
console.log("════════════════════════════════════════════════════════");
console.log(
  `  Ai 분류 ↔ 위젯 트리 ${aiChecked}건 · 역방향 ${widgetChecked}건 · 진입점 안내 ${
    importSkipped ? "건너뜀(components.json 미생성)" : `${importChecked}건`
  }`,
);
console.log("════════════════════════════════════════════════════════");
console.log("PASS — 위반 0건");

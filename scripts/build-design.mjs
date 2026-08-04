/**
 * docs/DESIGN.md 합본 생성기.
 *
 * Introduction 이 광고하는 "AI 에이전트 컨텍스트 주입용 단일 파일"을 개별 카탈로그에서
 * 빌드 시 자동 생성한다. `build-storybook` 직전에 실행되어 staticDirs(docs → /design-system)
 * 로 서빙됨. DESIGN.md 는 직접 편집 금지 — 개별 .md 를 고치고 재생성.
 */
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");
const src = join(root, "src");

// Introduction 이 명시한 논리 순서.
const ORDER = [
  "SKILL.md",
  "tokens.md",
  "primitives.md",
  "chrome-components.md",
  "ai-entry.md",
  "widget-components.md",
  "patterns.md",
];

const header =
  "# WhaTap Design System — DESIGN.md\n\n" +
  "> **자동 생성** (`scripts/build-design.mjs`). 직접 편집 금지 — 개별 카탈로그(.md)를 수정하고 재생성하세요.\n" +
  `> 합본 순서: ${ORDER.join(" → ")}\n\n` +
  "이 파일은 AI 에이전트 컨텍스트 주입 / 오프라인 공유 / 시점 freeze 용 단일 카탈로그입니다.\n\n" +
  "---\n\n";

const body = ORDER.map((f) => {
  const content = readFileSync(join(docs, f), "utf8").trim();
  return `<!-- ===== ${f} ===== -->\n\n${content}`;
}).join("\n\n---\n\n");

writeFileSync(join(docs, "DESIGN.md"), header + body + "\n");
console.log(`DESIGN.md generated from ${ORDER.length} files`);

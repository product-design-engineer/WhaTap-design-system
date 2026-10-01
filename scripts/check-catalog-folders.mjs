// check-catalog-folders — 카탈로그 폴더 ↔ story title 정합성 가드.
//
// 3-Layer 카탈로그는 폴더 경로 = story title 의 prefix(컴포넌트 표시명 제외) 로 미러링한다.
// 이 단언이 깨지면(= 재분류 시 title 만 고치고 파일을 안 옮겼거나 그 반대) 즉시 fail.
// → title 단일 진실원 + 폴더 미러링의 "이중 유지비"를 자동 차단.
//
// 사용: node scripts/check-catalog-folders.mjs   (drift 시 exit 1)
import fs from "node:fs";
import { execSync } from "node:child_process";

const files = execSync(`find stories -name '*.stories.tsx'`).toString().split("\n").filter(Boolean);
const TITLE_RE = /title:\s*"((?:Tokens|Primitives|Composite|Shell)\/[^"]*)"/;

/**
 * 계층에 속하지 않는 **메타 문서** — 트리 최상위에 한 장으로 서는 것들.
 *
 * 계층 prefix 를 요구하는 이유는 「폴더와 분류가 같이 움직이게」 하기 위해서인데, 이들은
 * 애초에 분류 대상이 아니다(Introduction 이 `.mdx` 라 이 게이트를 비켜 갔던 것과 같은 성격).
 * 목록을 여기 두어 **새 파일이 슬쩍 최상위로 오는 것은 여전히 막는다** — 예외는 이름으로만 난다.
 */
const META_STORIES = new Set(["stories/Overview.stories.tsx"]);

const errors = [];

for (const f of files) {
  if (META_STORIES.has(f)) continue;
  const src = fs.readFileSync(f, "utf8");
  const m = src.match(TITLE_RE);
  if (!m) {
    errors.push(`${f}\n    title 누락/비표준 — 카탈로그 prefix(Tokens|Primitives|Composite|Shell)로 시작하는 title 이 필요.`);
    continue;
  }
  const title = m[1];
  const expectedDir = `stories/${title.split("/").slice(0, -1).join("/")}`; // 마지막 segment=표시명 제외
  const actualDir = f.split("/").slice(0, -1).join("/");
  if (actualDir !== expectedDir) {
    errors.push(`${f}\n    title "${title}" → 기대 폴더 ${expectedDir}/ · 실제 ${actualDir}/`);
  }
}

if (errors.length) {
  console.error(`✗ 카탈로그 폴더 정합성 ${errors.length}건 불일치:\n\n${errors.join("\n")}\n`);
  console.error("폴더 경로는 story title prefix 와 1:1 이어야 합니다. 파일을 옮기거나 title 을 맞추세요.");
  process.exit(1);
}
console.log(
  `✓ 카탈로그 폴더 정합성 OK — ${files.length} stories ` +
    `(폴더 === title prefix · 메타 문서 ${META_STORIES.size}건 면제)`,
);

#!/usr/bin/env node
/**
 * audit-runtime-policy — 정책 위반 **런타임** 감사. `devPolicyGuard` 를 전 스토리에 태운다.
 *
 * ## 왜 별도 게이트가 필요한가
 * `check-no-raw-colors` 는 소스를 본다. 그런데 리터럴은 소스에 안 보이면서 DOM 에는
 * 나타날 수 있다 — 실제로 그런 경로가 있었다:
 *
 *   `src/widget/_tokens.ts` 는 게이트 면제(토큰 정의 원본)다. 그 안의 hex 를
 *   `TONE_DOT[tone]` 처럼 참조해 인라인 주입하면 소스에는 리터럴이 없지만 DOM 에는
 *   `background: rgb(229,57,53)` 이 박힌다. → 44건이 이렇게 숨어 있었고, 다크에서
 *   뒤집히지 않았다. 소스 스캔만으로는 원리적으로 볼 수 없는 종류다.
 *
 * 소스 게이트 통과 후에도 이 감사가 0 이어야 "리터럴 없음" 이 성립한다.
 *
 * ## 사용
 *   node scripts/audit-runtime-policy.mjs                  # light (Storybook 이 떠 있어야 함)
 *   node scripts/audit-runtime-policy.mjs --theme dark
 *   node scripts/audit-runtime-policy.mjs --json out.json   # 상세 결과 저장
 *   node scripts/audit-runtime-policy.mjs --changed         # PR: 변경된 스토리만 검사
 *   WORKERS=4 BASE_URL=http://localhost:5181                # 워커 수 · 기본 URL
 *
 * ## 병렬화 (2026-10)
 * N 워커가 각자 브라우저 컨텍스트를 열고 스토리 목록을 청크로 나눠 동시 처리.
 * CI runner 2코어 기준 4워커로 ~4배 단축. `--changed` 와 결합하면 PR CI ~5초.
 *
 * ## 허용 예외
 * 요소(또는 조상)에 `data-ds-policy-ok="<이유>"` 가 있으면 면제된다. 소스의
 * `// raw-color-ok:` 와 **짝을 맞춰야 한다** — 소스에만 달면 런타임 가드는 모른다.
 *
 * 의도적으로 위반을 렌더하는 시연 스토리는 ALLOWED_STORIES 에 사유와 함께 등록한다.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import { execSync } from "node:child_process";

const BASE = process.env.BASE_URL || "http://localhost:5181";
const WORKER_COUNT = parseInt(process.env.WORKERS || "4", 10);
const args = process.argv.slice(2);
const themeArg = args.indexOf("--theme");
const THEME = themeArg !== -1 ? args[themeArg + 1] : "light";
const jsonArg = args.indexOf("--json");
const JSON_OUT = jsonArg !== -1 ? args[jsonArg + 1] : null;
const CHANGED_ONLY = args.includes("--changed");

/** 정책 위반을 *교재로* 보여주는 스토리 — 위반이 있어야 정상. */
const ALLOWED_STORIES = new Map([
  [
    "tokens-policy-guard--violation-demo",
    "가드 배지가 어떻게 보이는지 보여주는 시연 — 위반이 콘텐츠다",
  ],
]);

/** 검사에서 완전히 건너뛰는 스토리 — iframe 다수 로드로 CI timeout 유발 등. */
const SKIP_STORIES = new Set([
  "gallery--dark-mode-compare",  // iframe 14개 동시 로드 → CI timeout
]);

const index = await fetch(`${BASE}/index.json`)
  .then((r) => r.json())
  .catch(() => null);
if (!index) {
  console.error(
    `✗ Storybook 에 접근할 수 없습니다: ${BASE}\n  → npm run storybook 후 다시 실행하세요.`
  );
  process.exit(1);
}

let ids = Object.keys(index.entries).filter((k) => index.entries[k].type === "story" && !SKIP_STORIES.has(k));

/* ── --changed: 변경된 스토리만 필터 ─────────────────────────────────────── */
if (CHANGED_ONLY) {
  try {
    const diff = execSync("git diff --name-only origin/main -- stories/ src/", {
      encoding: "utf8",
    }).trim();
    if (diff) {
      // 변경된 스토리 파일명에서 storyId 패턴 추출
      const changedFiles = new Set(diff.split("\n"));
      const changedStoryBases = new Set();
      for (const f of changedFiles) {
        if (f.startsWith("stories/") && f.endsWith(".stories.tsx")) {
          // stories/Primitives/Button.stories.tsx → 파일명 "Button"
          changedStoryBases.add(f);
        }
        if (f.startsWith("src/")) {
          // src/Button.tsx → 소스 변경 시 관련 스토리도 포함
          const base = f.replace(/^src\//, "").replace(/^widget\//, "").replace(/\.tsx?$/, "");
          changedStoryBases.add(base);
        }
      }
      // 변경된 소스에 해당하는 스토리만 필터 (매칭 못하면 전체 검사)
      const filtered = ids.filter((id) => {
        const entry = index.entries[id];
        const title = entry?.title ?? "";
        // storyId 에 파일명 조각이 포함되면 매칭
        for (const base of changedStoryBases) {
          const name = base.split("/").pop().replace(".stories.tsx", "").toLowerCase();
          if (id.toLowerCase().includes(name)) return true;
        }
        return false;
      });
      if (filtered.length > 0) {
        ids = filtered;
        console.log(`  --changed: ${filtered.length}개 스토리만 검사 (변경 파일 ${changedFiles.size}개)`);
      }
    }
  } catch {
    // git diff 실패 시 전체 검사
  }
}

/* ── 병렬 워커로 스토리 검사 ─────────────────────────────────────────────── */
async function auditChunk(storyIds, browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const results = [];

  for (const id of storyIds) {
    try {
      await page.goto(`${BASE}/iframe.html?id=${id}&globals=theme:${THEME}`, {
        waitUntil: "networkidle",
        timeout: 15000,
      });
      await page.waitForTimeout(80);
      const hits = await page.$$eval("[data-ds-violation]", (els) =>
        els.map((el) => ({
          rule: el.getAttribute("data-ds-violation"),
          tag: el.tagName.toLowerCase(),
          cls: (typeof el.className === "string" ? el.className : "").slice(0, 80),
          style: (el.getAttribute("style") ?? "").slice(0, 80),
        }))
      );
      if (hits.length && !ALLOWED_STORIES.has(id)) results.push({ id, hits });
    } catch (e) {
      results.push({ id, error: String(e).split("\n")[0].slice(0, 100) });
    }
  }

  await ctx.close();
  return results;
}

// 스토리 목록을 N 청크로 분할
const chunks = Array.from({ length: WORKER_COUNT }, () => []);
ids.forEach((id, i) => chunks[i % WORKER_COUNT].push(id));

const browser = await chromium.launch();
const workerResults = await Promise.all(
  chunks.filter((c) => c.length > 0).map((chunk) => auditChunk(chunk, browser))
);
await browser.close();

const findings = workerResults.flat();

if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(findings, null, 2));

const total = findings.reduce((n, f) => n + (f.hits?.length ?? 0), 0);
console.log(`\n🔍 runtime-policy — 렌더된 DOM 의 정책 위반 (${THEME})`);
console.log("═".repeat(56));
console.log(`  스토리 ${ids.length}개 검사 · 워커 ${Math.min(WORKER_COUNT, ids.length)}개 · 면제 시연 ${ALLOWED_STORIES.size}개`);

if (!findings.length) {
  console.log("═".repeat(56));
  console.log("PASS — 런타임 위반 0건");
  process.exit(0);
}

console.log(`\n❌ 위반 ${total}건 / ${findings.length}스토리\n`);
for (const f of findings) {
  if (f.error) {
    console.log(`  ⚠ ${f.id} — ${f.error}`);
    continue;
  }
  console.log(`  ${f.id}`);
  for (const h of f.hits.slice(0, 4)) {
    console.log(`    ${h.rule}  <${h.tag}>`);
    if (h.style) console.log(`      style: ${h.style}`);
    if (h.cls) console.log(`      class: ${h.cls}`);
  }
  if (f.hits.length > 4) console.log(`    … 외 ${f.hits.length - 4}건`);
}
console.log(
  "\n  고치는 법: 토큰(var(--…))으로 바꾸거나, 정당한 예외면 요소에\n" +
    '  data-ds-policy-ok="<이유>" 를 달아 소스의 // raw-color-ok 와 짝을 맞추세요.\n' +
    "  TS 토큰을 인라인 주입할 때는 .value(hex) 가 아니라 .cssVar 를 씁니다."
);
console.log("═".repeat(56));
process.exit(1);

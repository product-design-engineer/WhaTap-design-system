// visual-snap — 시각 회귀 스냅샷 (Playwright + pixelmatch).
//
// 큐레이션된 핵심 스토리를 캡처해 baseline 과 픽셀 비교. 토큰/CSS/컴포넌트 변경이
// 의도치 않은 시각 변화를 일으켰는지 검출(렌더 테스트가 못 잡는 부분).
//
// 사용:
//   node scripts/visual-snap.mjs            # 비교 (실패 시 exit 1, diff PNG 생성)
//   node scripts/visual-snap.mjs --update   # baseline 갱신
//   BASE_URL=http://localhost:5181 ...       # dev 서버 URL (기본)
//
// ⚠️ baseline 은 캡처 머신의 폰트/렌더에 민감 — 머신 간 미세 차이 가능. 같은 환경에서
//    갱신하거나, 크로스-env 가 필요하면 Chromatic 등 도입. (threshold 로 소폭 흡수)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BASE = process.env.BASE_URL || "http://localhost:5181";
const UPDATE = process.argv.includes("--update");
const THRESHOLD = 0.005; // 허용 mismatch 비율 (0.5%) — antialiasing 흡수
const BASELINE_DIR = "tests/visual/baseline";
const DIFF_DIR = "tests/visual/diff";

// 큐레이션: 핵심 컴포넌트·토큰 (light) + 다크 커버리지. {id, theme}
const SHOTS = [
  { id: "tokens-color--surface", theme: "light" },
  { id: "tokens-color--brand", theme: "light" },
  { id: "tokens-color--text-hierarchy", theme: "light" },
  { id: "primitives-button--default", theme: "light" },
  { id: "primitives-switch--sizes", theme: "light" },
  { id: "primitives-switch--states", theme: "light" },
  { id: "composite-themetoggle--scoped-demo", theme: "light" },
  { id: "composite-pageheader--default", theme: "light" },
  { id: "composite-pageheaderaiinline--default", theme: "light" },
  { id: "composite-sidebar--default", theme: "light" },
  { id: "composite-datatable--default-density", theme: "light" },
  { id: "primitives-toast--success", theme: "light" },
  // 다크 커버리지
  { id: "composite-sidebar--default", theme: "dark" },
  { id: "composite-pageheaderaiinline--default", theme: "dark" },
  { id: "composite-datatable--default-density", theme: "dark" },
  // 위젯 tone/표면 — 라이트만 보고 넘어가면 다크에서 "밝은 배경 위 밝은 글자" 가 된다.
  // 실제로 이 커버리지 부재로 강조 행·인라인 프롬프트의 다크 판독 불가를 두 번 놓쳤다.
  { id: "primitives-ai-aitonebadge--all-tones", theme: "light" },
  { id: "primitives-ai-aitonebadge--all-tones", theme: "dark" },
  { id: "primitives-ai-costtablerow--highlight", theme: "dark" },
  { id: "primitives-toast--warning", theme: "dark" },
  // 차트 — series(정체성)·seq(크기) 램프. 라이트만 보면 다크 anchor 반전을 놓친다.
  { id: "tokens-color--chart-series", theme: "light" },
  { id: "tokens-color--chart-series", theme: "dark" },
  { id: "primitives-ai-aiusagechart--hourly-gpu", theme: "light" },
  { id: "primitives-ai-aiusagechart--hourly-gpu", theme: "dark" },
  { id: "primitives-minilinechart--cpu-usage", theme: "light" },
];

// 애니메이션·캐럿·transition 비활성화 (스냅샷 안정화)
const STABILIZE = `*,*::before,*::after{animation:none !important;transition:none !important;
  caret-color:transparent !important;scroll-behavior:auto !important}`;

fs.mkdirSync(BASELINE_DIR, { recursive: true });
fs.mkdirSync(DIFF_DIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 720 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

let failed = 0, updated = 0, passed = 0;
for (const { id, theme } of SHOTS) {
  const name = `${id}__${theme}`;
  // dsGuard=off — 정책 가드의 빨간 outline·배지가 스냅샷에 찍히지 않게 끈다.
  const url = `${BASE}/iframe.html?id=${id}&globals=theme:${theme}&dsGuard=off`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.addStyleTag({ content: STABILIZE });
    await page.waitForTimeout(500);
    const target = (await page.$("#storybook-root")) || (await page.$("body"));
    const buf = await target.screenshot();
    const shot = PNG.sync.read(buf);
    const baselinePath = path.join(BASELINE_DIR, `${name}.png`);

    if (UPDATE || !fs.existsSync(baselinePath)) {
      fs.writeFileSync(baselinePath, PNG.sync.write(shot));
      console.log(`  ⬆ baseline  ${name}`);
      updated++;
      continue;
    }
    const base = PNG.sync.read(fs.readFileSync(baselinePath));
    if (base.width !== shot.width || base.height !== shot.height) {
      console.log(`  ✗ SIZE      ${name}  baseline ${base.width}x${base.height} vs ${shot.width}x${shot.height}`);
      fs.writeFileSync(path.join(DIFF_DIR, `${name}.png`), PNG.sync.write(shot));
      failed++;
      continue;
    }
    const { width, height } = base;
    const diff = new PNG({ width, height });
    const mismatch = pixelmatch(base.data, shot.data, diff.data, width, height, { threshold: 0.1 });
    const ratio = mismatch / (width * height);
    if (ratio > THRESHOLD) {
      console.log(`  ✗ DIFF      ${name}  ${(ratio * 100).toFixed(2)}% (${mismatch}px)`);
      fs.writeFileSync(path.join(DIFF_DIR, `${name}.png`), PNG.sync.write(diff));
      failed++;
    } else {
      console.log(`  ✓ ok        ${name}  ${(ratio * 100).toFixed(3)}%`);
      passed++;
    }
  } catch (e) {
    console.log(`  ✗ ERROR     ${name}  ${e.message}`);
    failed++;
  }
}
await browser.close();

console.log(`\n${UPDATE ? "baseline" : "compare"}: ${passed} ok · ${failed} fail · ${updated} updated (총 ${SHOTS.length})`);
if (!UPDATE && failed > 0) {
  console.error(`✗ 시각 회귀 ${failed}건 — tests/visual/diff/ 확인. 의도된 변경이면 --update 로 baseline 갱신.`);
  process.exit(1);
}

/**
 * check-token-docs — 토큰에 «무엇에 쓰는 것인가»가 없으면 실패.
 *
 * ## 왜 스크립트인가
 * 컴포넌트는 docstring 게이트가 있어 규칙 없는 컴포넌트가 못 들어오는데, **토큰은
 * 아무 설명 없이 추가할 수 있었다.** 실측: 런타임 토큰 197개 중 `tokens.md` 에 이름이라도
 * 있는 것이 55개(28%)였고 인접 주석이 있는 것은 17개(9%)였다. 그 상태에서는
 * 「경고 배경에 무엇을 쓰나」에 도구가 답할 수 없고, 답할 수 없으면 소비자는 hex 를 적는다.
 * 즉 이 게이트가 없으면 리터럴 0 정책이 토큰 부재를 통해 새어 나간다.
 *
 * ## 무엇을 요구하나
 *   - `src/whatap-ds.css` 의 모든 토큰 선언은 위 줄에 `@role <의미>` 주석을 가질 것
 *     (`@use` / `@avoid` 는 선택. 그룹 공통은 `@group-role` 로 상속).
 *   - 판정 대상은 **생성 산출물 `docs/tokens.json`** 이다 — 파싱을 두 번 구현하면
 *     게이트와 배달물이 서로 다른 것을 본다(check-docstrings 와 같은 원칙).
 *
 * ## 동결선
 * **없다. 현재 197/197 이므로 신규 미문서화 토큰은 즉시 차단한다.** 동결을 두면
 * "일단 넣고 나중에" 가 기본값이 되고, 토큰은 한 번 퍼지면 회수 비용이 크다.
 *
 * 사용: `node scripts/check-token-docs.mjs`
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(root, "docs/tokens.json");

// 항상 최신 산출물로 검사한다 — 낡은 json 을 보고 통과하면 게이트가 거짓말을 한다.
execFileSync(process.execPath, [join(root, "scripts/build-tokens-json.mjs")], { stdio: "pipe" });

if (!existsSync(JSON_PATH)) {
  console.error("✗ docs/tokens.json 이 없습니다. `pnpm build:tokens-json` 먼저 실행하세요.");
  process.exit(1);
}

const { tokens, coverage } = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const missing = tokens.filter((t) => !t.role);

console.log(`\n🎨 token-docs — 토큰 의미 커버리지`);
console.log("════════════════════════════════════════════════════════");
console.log(
  `  토큰 ${tokens.length}개 (Semantic ${tokens.filter((t) => t.tier === "Semantic").length} · ` +
    `Global ${tokens.filter((t) => t.tier === "Global").length} · ` +
    `Component ${tokens.filter((t) => t.tier === "Component").length}) · ` +
    `다크 재매핑 ${tokens.filter((t) => t.dark).length}`,
);

if (missing.length) {
  console.error(`\n✗ @role 이 없는 토큰 ${missing.length}건:\n`);
  for (const t of missing.slice(0, 30)) console.error(`  ${t.name}  (${t.tier} · ${t.group})`);
  console.error(
    `\n토큰 선언 **위 줄**에 이렇게 적으세요(값이 아니라 역할로):\n` +
      `  /* @role 경고 상태의 원색 | @use 경고 배지·도트·보더 | @avoid 본문 텍스트(대비 미달) */\n` +
      `그룹이 의미를 공유하면 \`@group-role\` 을 한 번 쓰면 아래 토큰이 상속합니다.\n` +
      `⚠️ 문구 안에 색 리터럴을 쓰지 마세요 — raw-color 게이트가 주석 안 리터럴도 잡습니다.`,
  );
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log(`PASS — 전 토큰이 역할을 갖는다 (${coverage.documented}/${coverage.total})`);

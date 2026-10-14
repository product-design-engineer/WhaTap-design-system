/**
 * check-policy-docs — 전역 정책의 「언제 / 판정」 표준 게이트.
 *
 * ## 왜 스크립트인가
 * 컴포넌트는 `check-docstrings` 가 4섹션을 강제해 **135/135** 가 완결이다. 전역 정책에는 그
 * 게이트가 없어서, 2026-09-18 기준 **When to use 0/16 · Do 3/16** 인 채로 몇 달을 지났다.
 * 규칙과 근거는 쌓이는데 「언제 걸리는가」가 비어 있어서, 사람이 정책을 찾는 방식(「내가 지금
 * 만드는 것에 이게 걸리나」)으로는 답이 안 나왔다.
 *
 * 실제로 `PageHeader` 에 `hideDocs`·`hideSupport` 를 열 때 **판단 근거가 문서에 없어**
 * 컴포넌트 docstring 에만 적혔다. 「헤더는 불변」과 「끌 수 있다」가 공존하는데 그 경계가
 * 어디에도 없었다. 규칙만 있고 집행이 없으면 새는 쪽이 기본값이 된다.
 *
 * ## 무엇을 요구하나 (정책 1개 기준)
 *   ① `<!-- @policy id=… -->` — id 는 전역 유일. 번호(`1`·`P2`)는 문서를 고치면 밀린다.
 *   ② `@severity` 가 must · should · context 중 하나
 *   ③ `@applies` 가 알려진 기준 중 하나
 *   ④ `**When to use**` · `**When NOT to use**`
 *   ⑤ `✅` 1개 이상 · `❌` 1개 이상
 *
 * 판정은 `docs/policies.json`(생성기 산출물)을 읽어서 한다. 파싱을 두 번 구현하면 게이트와
 * 배달물이 서로 다른 것을 보게 된다 — **AI 에게 실제로 배달되는 그 파일**을 검사해야 의미가 있다.
 *
 * ## 동결선
 * 지금은 16/16 이 완전해 동결선이 비어 있다. 비워 둔 채로 두는 것이 요점이다 —
 * 새 정책이 미달로 들어오면 그 자리에서 막힌다. 되돌리는 `--update` 는 **늘리는 방향을 거부**한다.
 *
 * 사용: `node scripts/check-policy-docs.mjs`  ·  동결선 갱신: `--update`
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(root, "docs/policies.json");
const BASELINE = join(root, "scripts/policy-docs-baseline.json");
const update = process.argv.includes("--update");

/** 알려진 기준. 새 기준이 필요하면 여기에 더하고 Overview 의 `AXES` 에도 라벨을 준다. */
const APPLIES = new Set(["chrome", "widget", "table", "chart", "token", "type", "layer", "process"]);
const SEVERITY = new Set(["must", "should", "context"]);

// 항상 최신 산출물로 검사한다 — 낡은 json 을 보고 통과하면 게이트가 거짓말을 한다.
execFileSync(process.execPath, [join(root, "scripts/build-policies-json.mjs")], { stdio: "pipe" });

if (!existsSync(JSON_PATH)) {
  console.error("✗ docs/policies.json 이 없습니다. `pnpm build:policies-json` 먼저 실행하세요.");
  process.exit(1);
}
const { policies } = JSON.parse(readFileSync(JSON_PATH, "utf8"));

const violations = [];
const seen = new Map();

for (const p of policies) {
  const missing = [];
  if (!p.whenToUse) missing.push("**When to use**");
  if (!p.whenNotToUse) missing.push("**When NOT to use**");
  if (!p.do.length) missing.push("✅ Do (1개 이상)");
  if (!p.dont.length) missing.push("❌ Don't (1개 이상)");
  if (!SEVERITY.has(p.severity)) missing.push(`@severity 가 must|should|context 아님 (${p.severity})`);
  if (!APPLIES.has(p.applies)) missing.push(`@applies 가 알려진 기준 아님 (${p.applies})`);

  // id 중복 — 링크와 게이트가 id 를 물으므로 겹치면 조용히 한쪽을 가린다.
  if (seen.has(p.id)) missing.push(`@policy id 중복 — ${seen.get(p.id)} 와 같다`);
  else seen.set(p.id, `${p.number}. ${p.title}`);

  if (missing.length) violations.push({ id: p.id, label: `${p.number}. ${p.title}`, missing });
}

const key = (v) => v.id;
const current = violations.map(key).sort();
const frozen = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")).frozen ?? [] : [];

if (update) {
  const grew = current.filter((k) => !frozen.includes(k));
  if (grew.length) {
    console.error("✗ --update 거부 — 동결선을 늘리려 합니다:");
    for (const g of grew) console.error(`    ${g}`);
    console.error("\n  신규 위반을 먼저 해소하세요. 동결선은 줄이는 방향으로만 갱신됩니다.");
    process.exit(1);
  }
  writeFileSync(
    BASELINE,
    JSON.stringify(
      {
        _comment:
          "전역 정책 표준 미달 동결선. 신규는 차단되고 이 목록은 줄일 수만 있다. " +
          "해소 후 `node scripts/check-policy-docs.mjs --update` 로 갱신.",
        frozen: current,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`✓ 동결선 갱신 — ${current.length}건`);
  process.exit(0);
}

const fresh = violations.filter((v) => !frozen.includes(key(v)));

console.log("📐 policy-docs — 전역 정책의 「언제 / 판정」 표준");
console.log("════════════════════════════════════════════════════════");
console.log(
  `  정책 ${policies.length}개 (pattern ${policies.filter((p) => p.part === "pattern").length} · ` +
    `policy ${policies.filter((p) => p.part === "policy").length}) · 동결 ${frozen.length}건`,
);

if (fresh.length) {
  console.error(`\n✗ 표준 미달 ${fresh.length}건 (신규):\n`);
  for (const v of fresh) {
    console.error(`  ${v.label}  [${v.id}]`);
    for (const m of v.missing) console.error(`      누락: ${m}`);
  }
  console.error(
    "\n표준: @policy(id · severity · applies) + When to use / When NOT to use + ✅ 1개 + ❌ 1개.",
  );
  console.error("정본은 docs/patterns.md 다 — policies.json 은 생성물이므로 직접 고치지 않는다.");
  console.error("════════════════════════════════════════════════════════");
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log(`PASS — 전 정책이 「언제」와 「판정」을 갖는다 (${policies.length}/${policies.length})`);

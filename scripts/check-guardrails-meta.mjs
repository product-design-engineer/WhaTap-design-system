// check-guardrails-meta — 가드레일 **명부 자체**를 검사하고 카탈로그용 projection 을 만든다.
//
// 게이트가 여럿이 되면 명부가 필요하고, 명부가 있으면 명부의 정확성을 검사해야 한다.
// 검사하지 않으면 명부는 "그렇다고 적혀 있는 것"일 뿐이다 — 이 repo 가 실제로 그 상태였다:
// CLAUDE.md 가 색 정책을 "3중 게이트"로 가르치는데 그중 둘을 어느 워크플로도 부르지 않았다.
//
// ## 검사 (M1~M6)
//   M1  디스크의 `check-*`/`validate-*` 스크립트가 전부 roster 에 있는가  → 새 게이트 누락 차단
//   M2  roster 가 가리키는 스크립트 파일이 실존하는가                     → 이름 변경 차단
//   M3  status "auto" + script 는 pnpm 스크립트에 배선돼 있는가          → 부르는 곳 없는 게이트 차단
//   M4  status "auto" 는 **PR 워크플로에서 도달 가능**한가               → "CI 가 지킨다" 주장 검산
//   M5  script·pipeline 없는 auto 는 justification 이 있는가            → 근거 없는 자동 주장 차단
//   M6  projection(docs/guardrails.json)이 최신인가                     → 명부를 고치고 재생성을 잊는 것 차단
//
// ## 왜 projection 인가
// 카탈로그 페이지가 목록을 **하드코딩 리터럴**로 들고 있으면, 재생성이 늘 같은 값을 만들어
// `git diff` 가 낡음을 구조적으로 볼 수 없다. 페이지는 이 파일이 만든 JSON 만 읽는다.
//
// 사용:
//   node scripts/check-guardrails-meta.mjs            # 검사 (위반 시 exit 1)
//   node scripts/check-guardrails-meta.mjs --update   # projection 재생성
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { GATE_ROSTER } from "./gate-roster.mjs";

const UPDATE = process.argv.includes("--update");
const PROJECTION = path.join("docs", "guardrails.json");
const SCRIPT_DIRS_SKIP = new Set(["lib", "fixtures", "node_modules", "test", "tests", "__tests__"]);

/* ── 디스크 스캔: 게이트 자동 발견 ──────────────────────────────────────── */
// 디렉터리를 고정하지 않는다 — 새 위치에 만든 게이트가 조용히 빠져나가지 않게.
function discoverGates(dir = "scripts", found = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SCRIPT_DIRS_SKIP.has(e.name)) discoverGates(p, found);
      continue;
    }
    if (!/^(check|validate)-.+\.(mjs|js|ts)$/.test(e.name)) continue;
    if (/\.(test|spec)\.(mjs|js|ts)$/.test(e.name)) continue;
    found.push(p);
  }
  return found;
}

/* ── package.json: 어느 pnpm 스크립트가 이 게이트를 부르는가 ───────────── */
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const npmScripts = pkg.scripts ?? {};

function callersOf(scriptPath) {
  const needle = scriptPath.replace(/\\/g, "/");
  return Object.entries(npmScripts)
    .filter(([, body]) => body.includes(needle))
    .map(([name]) => name);
}

/* ── 워크플로: PR 에서 실제로 실행되는 명령 ─────────────────────────────── */
// 주석 처리된 step 과 `echo` 안의 문구는 제거한다. 그것까지 세면 배선을 지워도
// "CI 에서 돈다"가 참으로 남는다.
function prWorkflowCommands() {
  const dir = ".github/workflows";
  if (!fs.existsSync(dir)) return [];
  const cmds = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/\.ya?ml$/.test(f)) continue;
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    if (!/^on:[\s\S]*?pull_request:/m.test(raw)) continue; // PR 트리거만
    const lines = raw.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*#/.test(line)) continue; // 주석 step
      const inline = line.match(/^\s*run:\s*(?!\|)(.+)$/);
      if (inline) {
        cmds.push(inline[1]);
        continue;
      }
      if (/^\s*run:\s*\|/.test(line)) {
        const indent = (lines[i + 1] ?? "").match(/^(\s*)/)?.[1].length ?? 0;
        for (let j = i + 1; j < lines.length; j++) {
          const b = lines[j];
          if (b.trim() === "") continue;
          if ((b.match(/^(\s*)/)?.[1].length ?? 0) < indent) break;
          if (/^\s*#/.test(b)) continue;
          cmds.push(b);
        }
      }
    }
  }
  // echo 안의 문구는 실행이 아니다
  return cmds.map((c) => c.replace(/echo\s+(".*?"|'.*?'|\S+)/g, " "));
}

/* ── 도달성 닫힘: PR 명령 → pnpm 위임 → pre/post 훅 ─────────────────────── */
function reachableScripts() {
  const seeds = new Set();
  for (const cmd of prWorkflowCommands()) {
    for (const m of cmd.matchAll(/\b(?:pnpm|npm run|npm|yarn)\s+(?:run\s+)?([\w:-]+)/g)) {
      if (npmScripts[m[1]] !== undefined) seeds.add(m[1]);
    }
  }
  const seen = new Set();
  const queue = [...seeds];
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    for (const hook of [`pre${name}`, `post${name}`]) {
      if (npmScripts[hook] !== undefined) queue.push(hook);
    }
    const body = npmScripts[name] ?? "";
    for (const m of body.matchAll(/\b(?:pnpm|npm run|npm)\s+(?:run\s+)?([\w:-]+)/g)) {
      if (npmScripts[m[1]] !== undefined) queue.push(m[1]);
    }
  }
  return seen;
}

const reachable = reachableScripts();
const prCommands = prWorkflowCommands().join("\n");

/** 이 게이트가 CI 에서 도는가 — 호출자 중 하나라도 도달 닫힘에 있으면 참. */
function isInCI(gate) {
  if (gate.pipeline) return reachable.has(gate.pipeline);
  if (!gate.script) return false;
  const callers = callersOf(gate.script);
  if (callers.some((c) => reachable.has(c))) return true;
  // 워크플로가 스크립트를 직접 부르는 경우도 인정한다
  return prCommands.includes(gate.script);
}

/* ── 검사 ───────────────────────────────────────────────────────────────── */
const errors = [];
const rosterById = new Map(GATE_ROSTER.map((g) => [g.id, g]));
if (rosterById.size !== GATE_ROSTER.length) errors.push("roster 에 중복 id 가 있습니다.");

const rosterScripts = new Set(GATE_ROSTER.map((g) => g.script).filter(Boolean));

// M1
for (const found of discoverGates()) {
  if (found === "scripts/check-guardrails-meta.mjs") continue; // 자기 자신
  if (!rosterScripts.has(found)) {
    errors.push(`M1 새 게이트가 roster 에 없습니다: ${found}\n     → scripts/gate-roster.mjs 에 등재하세요.`);
  }
}

// M2 ~ M5
for (const g of GATE_ROSTER) {
  if (g.script && !fs.existsSync(g.script)) {
    errors.push(`M2 roster 가 가리키는 파일이 없습니다: ${g.id} → ${g.script}`);
    continue;
  }
  if (g.status !== "auto") continue;

  if (!g.script && !g.pipeline) {
    if (!g.justification?.trim()) {
      errors.push(
        `M5 "${g.id}" 는 status=auto 인데 script·pipeline 이 없고 justification 도 비어 있습니다.\n     → 무엇이 이것을 보장하는지 적거나 status 를 policy 로 내리세요.`,
      );
    }
    continue;
  }

  if (g.script) {
    const callers = callersOf(g.script);
    if (!callers.length) {
      errors.push(
        `M3 "${g.id}" 를 부르는 pnpm 스크립트가 없습니다: ${g.script}\n     → package.json 의 묶음 스크립트에 배선하세요.`,
      );
    }
  }

  if (!isInCI(g)) {
    errors.push(
      `M4 "${g.id}" 는 status=auto 인데 PR 워크플로에서 도달할 수 없습니다.\n     → .github/workflows 의 pull_request 잡에서 실행되는 스크립트에 넣으세요.`,
    );
  }
}

/* ── projection 생성 ────────────────────────────────────────────────────── */
const projection = {
  _comment:
    "자동 생성 — scripts/check-guardrails-meta.mjs. 직접 편집 금지. roster 는 scripts/gate-roster.mjs.",
  gates: GATE_ROSTER.map((g) => ({
    id: g.id,
    name: g.name,
    status: g.status,
    invariant: g.invariant,
    prevents: g.prevents,
    // ↓ 유도된 값 — roster 에 적지 않는다
    command: g.script
      ? (callersOf(g.script)[0] ? `${callersOf(g.script)[0]} (${g.script})` : g.script)
      : g.pipeline
        ? `${g.pipeline} (pnpm)`
        : "구조/정책",
    inCI: g.status === "auto" ? isInCI(g) : false,
  })),
};
const rendered = JSON.stringify(projection, null, 2) + "\n";

const bar = "═".repeat(56);
console.log(`\n🗂  guardrails-meta — 가드레일 명부 검사`);
console.log(bar);
console.log(
  `  roster ${GATE_ROSTER.length}개 (자동 ${GATE_ROSTER.filter((g) => g.status === "auto").length} · ` +
    `정책 ${GATE_ROSTER.filter((g) => g.status === "policy").length} · ` +
    `계획 ${GATE_ROSTER.filter((g) => g.status === "planned").length}) · ` +
    `디스크 발견 ${discoverGates().length}개 · CI 도달 pnpm 스크립트 ${reachable.size}개`,
);

if (UPDATE) {
  if (errors.length) {
    console.error(`\n✗ --update 거부 — 검사 위반 ${errors.length}건을 먼저 해소하세요.\n`);
    for (const e of errors) console.error(`  ❌ ${e}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(PROJECTION), { recursive: true });
  fs.writeFileSync(PROJECTION, rendered);
  console.log(`\n✓ projection 갱신 — ${PROJECTION}\n`);
  process.exit(0);
}

// M6 — projection 최신 여부
const existing = fs.existsSync(PROJECTION) ? fs.readFileSync(PROJECTION, "utf8") : null;
if (existing === null) {
  errors.push(`M6 projection 이 없습니다: ${PROJECTION}\n     → node scripts/check-guardrails-meta.mjs --update`);
} else if (existing !== rendered) {
  errors.push(
    `M6 projection 이 roster 와 다릅니다: ${PROJECTION}\n     → node scripts/check-guardrails-meta.mjs --update 후 커밋하세요.`,
  );
}

if (errors.length) {
  console.error(`\n❌ 위반 ${errors.length}건\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n${bar}\nFAIL\n`);
  process.exit(1);
}
console.log(`\n${bar}\nPASS — 명부·배선·CI 도달성·projection 전부 일치\n`);

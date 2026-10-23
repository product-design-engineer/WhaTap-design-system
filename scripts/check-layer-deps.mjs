// check-layer-deps — 3-Layer 의존 방향 가드.
//
//   Tokens  ←  Primitives  ←  Composite  ←  Shell
//
// Primitives 는 Tokens 만, Composite 는 Primitives+Tokens 만, Shell 은 전 계층을 import 한다.
// 역방향(하위가 상위를 import)과 Composite↔Composite 는 금지.
//
// ## 계층은 어디서 오는가
// **story title prefix 가 단일 출처**다(`check-catalog-folders.mjs` 와 같은 규약).
// 컴포넌트 파일명 = story 표시명 이라는 관례로 파일에 계층을 붙인다. 카탈로그에 없는
// 내부 모듈(_tokens.ts · index.ts · devPolicyGuard.ts 등)은 계층이 없으므로 검사 대상 밖.
//
// ## 값 import vs 타입 전용 import
// `import type { X } from "./Parent"` 는 컴파일 후 사라져 **런타임 의존 그래프를 만들지 않는다.**
// 둘을 같은 무게로 세면 실제 구조 문제(값 의존)가 타입 잡음에 묻힌다. 그래서 분리해 센다.
//
// ## Primitives 의 리프 1개 예외 (2026-10-23 사용자 결정)
// Primitive 는 **리프 Primitive 를 최대 1개** 값 import 할 수 있다(SidebarMenuItem → Tooltip ·
// ReceiverChannelItem → Switch 형태). "리프" = 스스로는 DS 컴포넌트를 하나도 값 import 하지 않는
// Primitive. 규칙대로 Composite 로 올리면 소비 부모가 *Composite 끼리 import 금지* 에 걸려 Shell
// 까지 연쇄 승격되기 때문에 둔 예외다. 말로 남긴 예외가 아니라 여기서 검산한다 —
// 대상이 리프가 아니거나(2단 합성) 2개 이상을 합성하면 error. 그때는 Composite 로 올린다.
//
// 사용:
//   node scripts/check-layer-deps.mjs            # 검사 (신규 위반 시 exit 1)
//   node scripts/check-layer-deps.mjs --update   # 동결선 갱신 (늘리는 방향은 거부)
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const UPDATE = process.argv.includes("--update");
const BASELINE_PATH = path.join("scripts", "layer-deps-baseline.json");
const RANK = { Tokens: 0, Primitives: 1, Composite: 2, Shell: 3 };

/* ── 1) 계층 맵 (story title = 단일 출처) ────────────────────────────────── */
const layerOf = new Map();
for (const f of sh("find stories -name '*.stories.tsx'")) {
  const m = fs.readFileSync(f, "utf8").match(/title:\s*"((?:Tokens|Primitives|Composite|Shell)\/[^"]*)"/);
  if (!m) continue;
  const segs = m[1].split("/");
  layerOf.set(segs[segs.length - 1], segs[0]);
}

/* ── 2) src 스캔 ────────────────────────────────────────────────────────── */
const srcFiles = sh("find src \\( -name '*.tsx' -o -name '*.ts' \\)").filter(
  (f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"),
);
const fileLayer = (f) => layerOf.get(path.basename(f).replace(/\.(tsx|ts)$/, ""));

const findings = [];
for (const f of srcFiles) {
  const from = fileLayer(f);
  if (!from) continue;
  const src = fs.readFileSync(f, "utf8");
  // `[^;]*?` — 세미콜론을 넘지 않는다. `[\s\S]*?` 로 두면 앞 import 문을 건너뛰어 매칭해
  // `import type` 을 값 import 로 오판한다(실제로 겪었다).
  for (const m of src.matchAll(/^import\s+(type\s+)?([^;]*?)\s+from\s+"(\.[^"]+)";/gm)) {
    const [, typeKw, clause, spec] = m;
    const target = resolve(path.resolve(path.dirname(f), spec));
    if (!target) continue;
    const rel = path.relative(process.cwd(), target);
    const to = fileLayer(rel);
    if (!to || rel === f) continue;

    const names = clause.replace(/[{}]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
    const typeOnly = !!typeKw || (names.length > 0 && names.every((n) => n.startsWith("type ")));

    const kind = classify(from, to, typeOnly);
    if (kind) findings.push({ key: `${path.relative(process.cwd(), f)} -> ${rel}`, kind, from, to });
  }
}

function classify(from, to, typeOnly) {
  if (RANK[to] > RANK[from]) return typeOnly ? "reverse-type" : "reverse-value";
  if (RANK[to] !== RANK[from]) return null; // 정방향 — 정상
  if (typeOnly) return null; // 같은 계층 타입 참조는 구조 의존이 아니다
  if (from === "Composite") return "composite-composite";
  if (from === "Primitives") return "primitives-primitives";
  return null; // Shell↔Shell 은 규칙에 없음
}

/* ── 2.5) Primitives → Primitives — 리프 1개 예외 판정 ─────────────────── */
// 값 import 로 DS 컴포넌트를 쓰는 Primitive 는 리프가 아니다.
const pp = findings.filter((v) => v.kind === "primitives-primitives");
const srcOf = (v) => v.key.split(" -> ")[0];
const dstOf = (v) => v.key.split(" -> ")[1];
const nonLeaf = new Set(pp.map(srcOf));
const ppCount = new Map();
for (const v of pp) ppCount.set(srcOf(v), (ppCount.get(srcOf(v)) ?? 0) + 1);
for (const v of pp) if (ppCount.get(srcOf(v)) === 1 && !nonLeaf.has(dstOf(v))) v.kind = "primitives-leaf";

/* ── 3) 분류별 집계 · 베이스라인 비교 ───────────────────────────────────── */
const SEVERITY = {
  "reverse-value": { level: "error", label: "역방향 값 import (하위 → 상위)" },
  "composite-composite": { level: "error", label: "Composite → Composite" },
  "primitives-primitives": {
    level: "error",
    label: "Primitives → Primitives (리프 1개 예외 밖 — 2개 이상 또는 리프 아님)",
  },
  "primitives-leaf": { level: "warn", label: "Primitives → 리프 Primitive 1개 (허용 예외)" },
  "reverse-type": { level: "warn", label: "역방향 타입 전용 (런타임 의존 아님)" },
};

const current = {};
for (const v of findings) (current[v.kind] ??= []).push(v.key);
for (const k of Object.keys(current)) current[k].sort();

if (UPDATE) {
  const prev = readBaseline();
  // 최초 시딩(베이스라인 파일 없음)은 허용한다 — 없으면 동결선을 만들 방법이 없다.
  const seeding = !fs.existsSync(BASELINE_PATH);
  // 그 이후 동결선은 **줄일 수만 있다** — 늘리는 --update 는 거부한다(0으로 가는 길을 되돌리지 않기 위해).
  const grown = seeding
    ? []
    : Object.entries(current).filter(
        ([k, list]) => SEVERITY[k].level === "error" && list.length > (prev[k]?.length ?? 0),
      );
  if (grown.length) {
    console.error("✗ --update 거부 — 동결선을 늘리려 합니다:");
    for (const [k, list] of grown)
      console.error(`   ${SEVERITY[k].label}: ${prev[k]?.length ?? 0} → ${list.length}`);
    console.error("\n  신규 위반을 먼저 해소하세요. 동결선은 줄이는 방향으로만 갱신됩니다.");
    process.exit(1);
  }
  fs.writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        _comment:
          "3-Layer 의존 방향 기존 위반 동결선. 신규는 차단되고 이 목록은 줄일 수만 있다. 해소 후 `node scripts/check-layer-deps.mjs --update` 로 갱신.",
        ...current,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`✓ 동결선 갱신 — ${BASELINE_PATH}`);
  process.exit(0);
}

const baseline = readBaseline();
const bar = "═".repeat(56);
console.log(`\n🧭 layer-deps — 3-Layer 의존 방향 (Tokens ← Primitives ← Composite ← Shell)`);
console.log(bar);
console.log(`  카탈로그 등재 ${layerOf.size}개 · 계층 매핑된 소스 ${srcFiles.filter(fileLayer).length}/${srcFiles.length}개`);

let newErrors = 0;
for (const kind of Object.keys(SEVERITY)) {
  const list = current[kind] ?? [];
  const frozen = new Set(baseline[kind] ?? []);
  const fresh = list.filter((k) => !frozen.has(k));
  const { level, label } = SEVERITY[kind];
  const mark = level === "error" ? (fresh.length ? "❌" : "✓") : "⚠️ ";
  console.log(`\n${mark} ${label} — ${list.length}건${frozen.size ? ` (동결 ${frozen.size})` : ""}`);
  for (const k of list) console.log(`     ${level === "error" && !frozen.has(k) ? "＋" : "·"} ${k}`);
  if (level === "error" && fresh.length) newErrors += fresh.length;
}

console.log(`\n${bar}`);
if (newErrors) {
  console.error(`FAIL — 신규 위반 ${newErrors}건 (＋ 표시)\n`);
  console.error("  고치는 법:");
  console.error("   · Composite 가 Composite 를 쓰면 → Shell 로 승격하거나 구조 분리");
  console.error("   · 하위가 상위를 쓰면 → 공유 타입/상수를 하위(또는 별도 모듈)로 내린다");
  console.error("   · Primitive 가 리프 아닌 Primitive 나 2개 이상을 쓰면 → Composite 로 승격");
  console.error("   · 의도된 구조 변경이면 → --update 로 동결선 갱신(줄이는 방향만 허용)\n");
  process.exit(1);
}
console.log("PASS — 신규 위반 0건 (⚠️ 는 허용 · 정보성, 차단하지 않음)\n");

/* ── helpers ────────────────────────────────────────────────────────────── */
function sh(cmd) {
  return execSync(cmd).toString().split("\n").filter(Boolean);
}
function resolve(base) {
  for (const e of [".tsx", ".ts"]) if (fs.existsSync(base + e)) return base + e;
  for (const e of ["index.tsx", "index.ts"]) if (fs.existsSync(path.join(base, e))) return path.join(base, e);
  return null;
}
function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return {};
  const { _comment, ...rest } = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  return rest;
}

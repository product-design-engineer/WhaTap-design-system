#!/usr/bin/env node
// scripts/pack-release.mjs
// Vercel tarball 배포: 라이브러리를 빌드 → 시크릿 스캔 게이트 → npm pack → static/public/releases/ 에 배치.
// 다음 `pnpm build-storybook`(Vercel buildCommand) 가 storybook-static 에 포함시켜
//   https://whatap-design-system-storybook.vercel.app/releases/<file>.tgz 로 서빙된다.
//
// 사용(유지보수자):
//   1) package.json version 올림  (예: 0.1.0)
//   2) node scripts/pack-release.mjs        # --skip-scan 으로 게이트 우회(권장 안 함)
//   3) git add static/public/releases && git commit && git push   → Vercel 자동 배포
//
// 산출물:
//   static/public/releases/whatap-design-system-<version>.tgz   (버전 고정용)
//   static/public/releases/whatap-design-system-latest.tgz       (빠른 시작용, 매 릴리스 덮어씀)
//   static/public/releases/index.json                            (버전 목록·메타)

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version;
const RELEASES = join(root, "static", "public", "releases");
const BASE = "https://whatap-design-system-storybook.vercel.app/releases";
const SKIP_SCAN = process.argv.includes("--skip-scan");

if (pkg.private === true) {
  console.error('✖ package.json 의 "private": true 면 pack 산출물이 의도와 달라집니다. false 로 두세요.');
  process.exit(1);
}

// ────────────────────────────────────────────────────────────────────────────
// 시크릿 스캔 게이트 — npm 이 실제로 동봉할 파일만 검사.
// 구조적 자격증명·private key·.env 동봉 = 하드 차단(오탐 거의 0).
// "secret/token" 같은 일반 키워드는 디자인 토큰 오탐이라 리뷰 경고만(차단 X).
// ────────────────────────────────────────────────────────────────────────────

// 하드 차단: 구조가 명확해 오탐이 거의 없는 자격증명 포맷.
const HARD_RULES = [
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["AWS secret key", /\baws_secret_access_key\b\s*[:=]\s*["'][A-Za-z0-9/+]{40}["']/i],
  ["GitHub PAT (classic)", /\bghp_[A-Za-z0-9]{36}\b/],
  ["GitHub PAT (fine-grained)", /\bgithub_pat_[A-Za-z0-9_]{22,}\b/],
  ["GitHub OAuth/refresh", /\bgh[osru]_[A-Za-z0-9]{36}\b/],
  ["OpenAI key", /\bsk-[A-Za-z0-9]{20}[A-Za-z0-9]{20,}\b/],
  ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Stripe live key", /\bsk_live_[A-Za-z0-9]{20,}\b/],
  ["Private key block", /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/],
  ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
];

// 리뷰 경고: 일반 키워드. 차단하지 않고 출력만(디자인 토큰 등 오탐 다수).
const SOFT_RULES = [
  ["generic secret assignment", /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|passwd|password)\b\s*[:=]\s*["'][^"'\s]{8,}["']/i],
];

const SOFT_ALLOW = /--color|tokenInput|tokenOutput|SemanticToken|design[_-]?token|placeholder|example|<svg|d="M/i;

const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md", ".mdx", ".txt", ".html", ".svg", ".yml", ".yaml", ".env"]);

function packFileList() {
  const out = execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: root }).toString();
  return JSON.parse(out)[0].files.map((f) => f.path);
}

function scanSecrets() {
  console.log("· 시크릿 스캔 (동봉 파일 대상) …");
  const files = packFileList();
  const hard = [];
  const soft = [];

  for (const rel of files) {
    if (/(^|\/)\.env(\.|$)/.test(rel)) {
      hard.push(`${rel}: .env 파일이 패키지에 동봉됨`);
      continue;
    }
    if (!TEXT_EXT.has(extname(rel))) continue;
    let text;
    try {
      text = readFileSync(join(root, rel), "utf8");
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const [name, re] of HARD_RULES) {
        if (re.test(line)) hard.push(`${rel}:${i + 1}  [${name}]  ${line.trim().slice(0, 100)}`);
      }
      for (const [name, re] of SOFT_RULES) {
        if (re.test(line) && !SOFT_ALLOW.test(line)) soft.push(`${rel}:${i + 1}  [${name}]  ${line.trim().slice(0, 100)}`);
      }
    });
  }

  // gitleaks 가 설치돼 있으면 추가 실행(src/dist 대상).
  let gitleaksRan = false;
  try {
    execFileSync("gitleaks", ["version"], { stdio: "ignore" });
    gitleaksRan = true;
    for (const dir of ["src", "dist"]) {
      try {
        execFileSync("gitleaks", ["dir", join(root, dir), "--no-banner", "--redact"], { stdio: "inherit" });
      } catch {
        hard.push(`gitleaks: ${dir}/ 에서 시크릿 탐지 (위 출력 참고)`);
      }
    }
  } catch {
    /* gitleaks 미설치 — 내장 스캔만 */
  }

  if (soft.length) {
    console.log(`\n⚠ 리뷰 권고 ${soft.length}건 (차단 안 함 — 오탐일 수 있음):`);
    for (const s of soft) console.log(`  - ${s}`);
  }
  if (hard.length) {
    console.error(`\n✖ 시크릿 스캔 차단 — ${hard.length}건:`);
    for (const h of hard) console.error(`  - ${h}`);
    console.error(`\n공개 tarball 로 배포되면 무인증 노출됩니다. 제거 후 다시 실행하거나, 오탐이면 --skip-scan.`);
    process.exit(1);
  }
  console.log(`  ✔ 하드 룰 통과 (gitleaks ${gitleaksRan ? "실행됨" : "미설치 — 내장 스캔만"})`);
}

// ────────────────────────────────────────────────────────────────────────────

mkdirSync(RELEASES, { recursive: true });

// 1) lib 빌드 (dist + 타입 + 합본 카탈로그) — 스캔 전에 dist 가 최신이어야 함
console.log("· build:js + build:design …");
execFileSync("pnpm", ["build:js"], { cwd: root, stdio: "inherit" });
execFileSync("pnpm", ["build:design"], { cwd: root, stdio: "inherit" });

// 2) 시크릿 스캔 게이트
if (SKIP_SCAN) console.log("· ⚠ --skip-scan: 시크릿 스캔 우회됨");
else scanSecrets();

// 3) npm pack → tarball 파일명 회수
console.log("· npm pack …");
const out = execFileSync("npm", ["pack", "--json"], { cwd: root }).toString();
const tarName = JSON.parse(out)[0].filename; // 예: whatap-design-system-0.1.0.tgz
const versioned = `whatap-design-system-${version}.tgz`;

// 4) releases/ 로 배치 (버전 고정본 + latest)
copyFileSync(join(root, tarName), join(RELEASES, versioned));
copyFileSync(join(root, tarName), join(RELEASES, "whatap-design-system-latest.tgz"));

// 5) index.json 갱신
const tgz = readdirSync(RELEASES).filter((f) => /^whatap-design-system-\d/.test(f)).sort();
writeFileSync(
  join(RELEASES, "index.json"),
  JSON.stringify({ latest: version, base: BASE, versions: tgz }, null, 2) + "\n",
);

console.log(`\n✔ released ${version}`);
console.log(`  pin   : npm i ${BASE}/${versioned}`);
console.log(`  latest: npm i ${BASE}/whatap-design-system-latest.tgz`);
console.log(`\n다음: git add static/public/releases && git commit && git push (Vercel 자동 배포)`);

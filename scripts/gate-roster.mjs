/**
 * gate-roster — 가드레일 명부의 **단일 원천**.
 *
 * ## 여기에 적는 것 (유도할 수 없는 것만)
 *   id · name · status · invariant · prevents · 집행 수단(script | pipeline | justification)
 *
 * ## 여기에 적지 않는 것 (유도되는 것)
 *   - 어느 pnpm 스크립트가 부르는지 → `package.json` 에서 읽어 대조한다
 *   - CI 에서 실제로 도는지        → 워크플로에서 읽어 도달성을 계산한다
 *   두 가지를 손으로 적으면 **배선을 지워도 "CI 에서 돈다"가 참으로 남는다.**
 *   실제로 이 repo 가 그 상태였다: CLAUDE.md 가 "3중 게이트"라고 가르치는데
 *   그중 둘(`audit:runtime` · `test:visual`)을 어느 워크플로도 부르지 않았다.
 *
 * ## 집행 수단 세 가지 — status "auto" 는 반드시 하나를 대야 한다
 *   - `script`        검사 스크립트 경로. pnpm 배선 + CI 도달성이 검산된다.
 *   - `pipeline`      스크립트는 아니지만 CI 에서 도는 pnpm 스크립트(생성기 등). 도달성만 검산.
 *   - `justification` 위 둘 다 없을 때 **왜 구조적으로 보장되는지**를 적는다. 빈칸이면 실패.
 *
 * 갱신: `node scripts/check-guardrails-meta.mjs --update` 로 projection(docs/guardrails.json) 재생성.
 */

/** @typedef {"auto"|"policy"|"planned"} Status */

export const GATE_ROSTER = [
  {
    id: "token-single-source",
    name: "토큰 단일 출처",
    status: "auto",
    script: null,
    pipeline: null,
    justification:
      "구조적 보장 — `:root` 는 CSS 파일 자체이므로 tree-shake 대상이 아니고, 로드되면 전 토큰이 항상 선언된다. 값이 실제로 참조 가능한지는 `token-sync` 게이트가 별도로 검산한다.",
    invariant:
      "`tokens.css` 의 `:root` 가 모든 토큰을 항상 선언(순수 CSS). 런타임은 `whatap-ds.css` 의 :root 가 제공. 토큰 1값 변경 = 전 컴포넌트 반영.",
    prevents: "토큰 분산/누락 · 보더·색이 사라지는 tree-shake",
  },
  {
    id: "no-tailwind-plain-css",
    name: "Tailwind 미사용 · 일반 CSS",
    status: "auto",
    script: "scripts/check-no-tailwind.mjs",
    pipeline: null,
    invariant:
      "런타임 스타일은 외부 CSS 프레임워크 의존 없는 일반 CSS(`whatap-ds.css`). 의존성·CSS 산출물 어디에도 Tailwind 흔적이 없어야 한다 — `@layer` · `--tw-*` · `@property` · escape 클래스명(`.foo-\\[…\\]`) · `tailwind*` 의존성. 유틸 클래스명은 escape 없는 일반 식별자.",
    prevents: "Tailwind 재도입 · CSS 내 프레임워크 흔적",
  },
  {
    id: "catalog-build",
    name: "카탈로그 합본 생성",
    status: "auto",
    script: null,
    pipeline: "build:design",
    invariant:
      "`build:design` 가 ① docs 7종을 `DESIGN.md` 로 합본하고 ② src docstring + 스토리에서 **`components.json`**(컴포넌트별 Purpose·Do·Don't·props·스토리 id)을 생성한다. `build-storybook`/`storybook` 직전 자동 실행되고 `/design-system/*` 로 서빙되어 MCP 가 런타임에 fetch 한다 — 즉 **AI 가 읽는 규칙은 손으로 쓰는 문서가 아니라 소스에서 유도된 산출물**이다.",
    prevents:
      "오래된/손편집 합본 · AI 컨텍스트 stale · **소스에 쓴 규칙이 MCP 응답에 없는 상태**(get_component 가 title·import·스토리 URL 만 돌려주던 기간이 실제로 있었다)",
  },
  {
    id: "raw-color",
    name: "인라인 색 리터럴 금지",
    status: "auto",
    script: "scripts/check-no-raw-colors.mjs",
    pipeline: null,
    invariant:
      "**`src/` · `stories/` · `.storybook/` 전 범위**를 검사한다 — 카탈로그가 리터럴을 쓰면 \"디자인 시스템이 가르치는 예시\" 자체가 위반이 되므로. hex · rgb() · `bg-white`/`bg-black` · **값이 이름에 박힌 유틸**을 스캔해 신규 위반은 exit 1 로 차단한다. 동결선은 **0건이며 되돌리지 않는다** — 위반이 남아 있으면 `--update` 가 **거부**한다. 정당한 예외는 `// raw-color-ok: <이유>`.",
    prevents: "토큰 우회 raw color · 단일 출처 약화 · 다크에서만 깨지는 컴포넌트",
  },
  {
    id: "token-sync",
    name: "토큰 정의/참조 무결성",
    status: "auto",
    script: "scripts/check-token-sync.mjs",
    pipeline: null,
    invariant:
      "**R1 — `var(--x)` 로 참조되는 토큰은 `whatap-ds.css`(런타임에 실제 로드되는 CSS)에 정의돼 있어야 한다.** `tokens.css` 는 참조용이라 런타임에 로드되지 않으므로 거기에만 있으면 존재하지 않는 것과 같다. **R2 — 두 파일이 공유하는 토큰은 값이 같아야 한다.** 집합 차이는 통과시킨다(두 파일은 범위가 다르다). 주석은 줄 번호를 보존한 채 제거하고 검사한다. 폴백이 있는 참조(`var(--x, 12px)`)는 대상이 아니다.",
    prevents:
      "없는 CSS 변수를 참조해 선언이 통째로 무효가 되는 것 — 실측: `--wds-toolbar-control-h` 미정의로 `ToolbarIconButton` 의 width 가 auto(1248px)로 퍼졌는데 타입체크·린트·테스트·DOM 감사가 전부 통과했다(story 가 없어 감사 대상도 아니었다)",
  },
  {
    id: "layer-deps",
    name: "3-Layer 의존 방향",
    status: "auto",
    script: "scripts/check-layer-deps.mjs",
    pipeline: null,
    invariant:
      "**Tokens ← Primitives ← Composite ← Shell.** 역방향과 **Composite ↔ Composite** 를 금지한다. 계층의 단일 출처는 **story title prefix**(`check-catalog-folders` 와 같은 규약). **값 import 와 타입 전용 import 를 나눠 센다** — `import type` 은 런타임 의존 그래프를 만들지 않으므로 같은 무게로 세면 실제 구조 문제가 타입 잡음에 묻힌다. 역방향 값 import 동결선은 **0**, Composite↔Composite 5건은 동결 후 신규만 차단. `--update` 는 줄이는 방향만 허용. Primitives↔Primitives 는 **warning** — CLAUDE.md 가 \"결정 필요\"로 남긴 사안을 게이트가 대신 결정하지 않는다.",
    prevents: "순환 참조 · Composite 간 결합으로 인한 연쇄 승격 · 계층 규칙이 문서에만 있고 코드가 갈라지는 상태",
  },
  {
    id: "no-cycle",
    name: "순환 참조 금지",
    status: "auto",
    script: null,
    pipeline: "lint:cycles",
    invariant:
      "`src/` 의 **런타임** import 그래프에 순환이 없어야 한다(ESLint `import-x/no-cycle`). `layer-deps` 가 볼 수 없는 축이다 — 그쪽은 계층 *방향*만 보므로 같은 계층 안의 A→B→A 는 통과한다. ⚠️ **false green 주의**: `import-x/parsers` 로 `.ts`/`.tsx` 파서를 등록하지 않으면 그래프가 1-hop 에서 끊겨 순환이 있어도 조용히 통과한다 — 실측으로 확인했다. 규칙을 손보면 일부러 2파일 순환을 넣어 발화를 다시 확인할 것. ESLint 표면은 **의도적으로 이 규칙만** 둔다(포맷팅·네이밍·hooks·a11y 는 린트하지 않는다 — 넓게 켜면 상시 red 가 되고 팀이 red 를 무시하기 시작한다).",
    prevents: "초기화 순서에 따라 undefined 가 되는 순환 import · 번들 분할 실패",
  },
  {
    id: "catalog-folders",
    name: "카탈로그 폴더 정합성",
    status: "auto",
    script: "scripts/check-catalog-folders.mjs",
    pipeline: null,
    invariant:
      "스토리 파일의 폴더 경로 = story title 의 prefix. 재분류 시 title 만 고치고 파일을 안 옮기는(또는 그 반대) 드리프트를 즉시 fail 한다. 이 규약은 `layer-deps` 가 계층을 읽는 근거이기도 하다.",
    prevents: "카탈로그 트리와 파일 배치의 이중 유지비 · 계층 판정 근거 붕괴",
  },
  {
    id: "runtime-policy-audit",
    name: "런타임 리터럴 감사",
    status: "auto",
    script: "scripts/audit-runtime-policy.mjs",
    pipeline: null,
    invariant:
      "Storybook 전 스토리에 가드를 태워 **렌더된 DOM** 의 위반을 센다. 소스 스캔으로는 원리적으로 볼 수 없는 경로가 있다 — `_tokens.ts`(게이트 면제)의 hex 를 인라인 주입하면 소스엔 리터럴이 없지만 DOM 엔 `rgb(...)` 이 박힌다(실측 44건). CI 는 dev 서버가 아니라 **빌드된 정적 Storybook** 을 서빙해 검사한다 — 검사 대상이 배포물과 같아진다. 라이트/다크 각각 돈다.",
    prevents: "소스에는 없고 DOM 에만 있는 리터럴 · TS 토큰 value(hex) 인라인 주입 · 다크 미반영",
  },
  {
    id: "visual-snapshot",
    name: "시각 스냅샷",
    status: "planned",
    script: "scripts/visual-snap.mjs",
    pipeline: null,
    invariant:
      "라이트/다크 기준 스냅샷 비교(허용 0.5%). **현재 CI 에서 비차단(continue-on-error)** — 기준선 PNG 가 macOS 에서 생성돼 ubuntu 폰트 렌더링과 허용치를 넘긴다. 흔들리는 신호를 차단 게이트로 만들면 팀이 red 자체를 무시하게 된다. **차단 승격 조건**: 기준선을 리눅스에서 재생성해 커밋하고 `continue-on-error` 제거.",
    prevents: "색·표면 변경이 만든 시각 회귀 (현재는 diff 아티팩트로 인지만)",
  },
  {
    id: "typecheck",
    name: "타입 체크",
    status: "auto",
    script: null,
    pipeline: "typecheck",
    invariant:
      "`tsc --noEmit` 이 CI 에서 돈다. **빌드가 타입 오류를 잡아주지 않는다** — 실측: tsc 오류 21건이 있는 상태에서 `tsup` 의 DTS 빌드가 성공했다. 그 21건은 전부 `exports` 맵에 없는 서브패스 import 4건에서 파생된 것이었고(소비자에게도 깨지는 import), 고친 뒤 0이 됐다.",
    prevents: "빌드는 통과하는 타입 오류 · exports 맵에 없는 import 경로",
  },
  {
    id: "guardrails-meta",
    name: "가드레일 명부 메타 게이트",
    status: "auto",
    script: "scripts/check-guardrails-meta.mjs",
    pipeline: null,
    invariant:
      "명부 자체를 검사한다. ① 디스크의 `check-*`/`validate-*` 스크립트가 전부 roster 에 있는가(새 게이트 누락 차단) ② roster 가 가리키는 파일이 실존하는가(이름 변경 차단) ③ status `auto` 인 게이트가 **실제로 pnpm 스크립트에 배선돼 있는가** ④ **PR 워크플로에서 도달 가능한가**(위임과 pre/post 훅을 따라 닫힘 계산) ⑤ script·pipeline 이 없는 auto 는 `justification` 필수. 카탈로그 페이지는 이 게이트가 만든 projection(`docs/guardrails.json`)만 읽는다 — **하드코딩 리터럴이면 낡아도 `git diff` 가 볼 수 없다.**",
    prevents: '배선 없이 "자동"이라고 주장하는 게이트 · 새 게이트 누락 · 카탈로그와 실제 배선의 드리프트',
  },
  {
    id: "ds-policy-guard",
    name: "런타임 정책 가드",
    status: "policy",
    script: null,
    pipeline: null,
    invariant:
      "CI 게이트가 잡지 못하는 **런타임 상태**를 화면에서 드러낸다 — 카드 없이 회색 바닥에 놓인 본문 블록 · `--color-bg`/`--color-card` 동일색 · 3층 이상 중첩 카드 · 인라인 색 리터럴. Storybook 은 자동 적용, 소비 앱은 dev 모드에서 `enableDsPolicyGuard()` 한 줄. 예외는 `data-ds-policy-ok=\"<이유>\"`.",
    prevents: "정적 스캔으로 볼 수 없는 층/표면 위반 · 라이트에서만 확인하고 넘어간 다크 깨짐",
  },
  {
    id: "docstring-standard",
    name: "docstring 4섹션 표준",
    status: "auto",
    script: "scripts/check-docstrings.mjs",
    pipeline: null,
    invariant:
      "컴포넌트 docstring = Purpose / When to use / When NOT to use / Composition rules + `@example`. **Do/Don't 는 여기서 유도되므로**(`## Don't` 명시가 없으면 When NOT to use + Composition rules 의 금지형 문장) 금지형 문장이 하나도 없으면 실패한다 — 유도 결과가 빈 컴포넌트는 «하지 말 것»이 없는 컴포넌트로 배달된다. 스토리 안에서 정의되는 합성 템플릿(`Shell/Page/*`)은 docstring 이 있을 수 없으므로 스토리 description 을 대신 요구한다. 검사 대상은 파싱을 두 번 구현하지 않고 **AI 에게 실제로 배달되는 산출물**(`docs/components.json`)이다.",
    prevents:
      "컴포넌트 오선택 · 사용 가이드 부재 · **규칙이 소스에만 있고 소비 AI 에는 도달하지 않는 상태** — 실측: 108종 중 26종이 스토리 설명 없이 들어와 있었고, policy(사람 검토) 상태로 오래 방치돼 있었다",
  },
  {
    id: "wikilink-refs",
    name: "[[참조]] 무결성",
    status: "auto",
    script: "scripts/check-wikilinks.mjs",
    pipeline: null,
    invariant:
      "docstring · 스토리 설명 · `patterns.md` 의 `[[Name]]` 참조 559건이 실제로 가리키는 대상이 있어야 한다 — `components.json` 컴포넌트명 · barrel export · `src/**` 선언(파일 안 비공개 부품 포함) · 파일명 중 하나. **소문자로 시작하는 참조는 대상이 아니다**(`[[layoutTopology]]` · `[[feedback_widget_readonly_policy]]` 처럼 함수·정책 id 관례). 동결선 **0** — 고치는 비용이 한 줄이라 동결의 근거가 없다.",
    prevents:
      "이름이 바뀌거나 지워진 컴포넌트를 가리키는 죽은 참조가 **MCP 응답에 그대로 실려** 소비 AI 가 없는 컴포넌트를 권하는 것 — 실측: `[[IcSearch]]`(아예 존재하지 않는 아이콘)가 docstring 에 남아 있었다",
  },
  {
    id: "catalog-sync",
    name: "카탈로그 드리프트 방지",
    status: "planned",
    script: null,
    pipeline: null,
    invariant:
      "Introduction/docs 의 컴포넌트 수·목록이 실제 export(`src/index.ts`)·Storybook `index.json` 과 1:1 일치.",
    prevents: "카탈로그 수/목록 드리프트",
  },
  {
    id: "ai-card-composition",
    name: "AI 카드 = AiCard 합성",
    status: "policy",
    script: null,
    pipeline: null,
    invariant:
      "WhaTap AI 메시지 카드는 `AiCard` + Tone 토큰을 composition (인라인 카드 chrome·색 리터럴 금지).",
    prevents: "톤/외형 어긋남 · 카드 재구현",
  },
  {
    id: "consumer-react-dedupe",
    name: "소비 React 단일화",
    status: "policy",
    script: null,
    pipeline: null,
    invariant:
      "`link:` 심링크 소비 앱은 vite `resolve.dedupe: ['react','react-dom']` 로 React 단일 인스턴스 강제.",
    prevents: '"invalid hook call" (React 중복 로드)',
  },
  {
    id: "chart-text-unit",
    name: "차트 텍스트 단위",
    status: "policy",
    script: null,
    pipeline: null,
    invariant: "SVG `<text fontSize>` 는 `\"9px\"` 처럼 단위 명시(단위 없는 값은 viewBox 좌표로 계산).",
    prevents: "화면별 차트 텍스트 크기 변동",
  },
];

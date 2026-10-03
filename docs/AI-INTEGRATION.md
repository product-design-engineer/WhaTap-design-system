# AI 연동 가이드 — 본인 AI 작업 환경에 WhaTap 디자인 시스템 연결

프론트엔드 엔지니어가 **자기 AI 코딩 환경(Cursor · Claude Code · VS Code · Windsurf 등)** 에서
WhaTap 디자인 시스템을 그대로 사용해 인터페이스를 만들 수 있도록 하는 두 채널을 제공합니다.

| 채널 | 무엇을 주나 | 셋업 |
|---|---|---|
| **①-A 호스팅 MCP** (권장) | DS 컴포넌트·토큰·코드·프리뷰 URL 도구 | **dev 서버 불필요** — 공개 URL로 바로 연결 |
| **①-B 로컬 dev MCP** (`@storybook/addon-mcp`) | 위 + **라이브 preview·story 작성·테스트 실행** | 로컬 `storybook dev` 실행 중에만 |
| **② 카탈로그 주입** (`DESIGN.md`) | 컴포넌트·토큰·패턴 **지식** 한 번에 주입 | 배포본에서 항상 (정적) |

권장: 평소엔 **①-A 호스팅 MCP + ② 카탈로그**(셋업 0). 스토리 작성·라이브 테스트가 필요할 때만 **①-B 로컬 dev MCP**.

---

## ①-A 호스팅 MCP (dev 서버 불필요 — 권장)

엔드포인트: **`https://whatap-ds-mcp.vercel.app/mcp`** (transport: streamable HTTP, 공개)
배포된 카탈로그를 런타임에 읽어 항상 최신. 클론·설치·dev 서버 **모두 불필요**.

**Claude Code**
```bash
claude mcp add --transport http whatap-ds https://whatap-ds-mcp.vercel.app/mcp
```
**Cursor** — `.cursor/mcp.json`
```json
{ "mcpServers": { "whatap-ds": { "url": "https://whatap-ds-mcp.vercel.app/mcp" } } }
```
**VS Code (Copilot)** — `.vscode/mcp.json`
```json
{ "servers": { "whatap-ds": { "type": "http", "url": "https://whatap-ds-mcp.vercel.app/mcp" } } }
```

**도구:** `get_design_catalog`(DESIGN.md 합본) · `list_components` · **`search_components`**(의도·키워드 검색 — 이름뿐 아니라 **규칙 본문**(Purpose · When to use · When NOT to use · Do/Don't · props · 스토리)까지 훑고, 관련 **패턴·정책**(`patterns.md`)을 함께 돌려준다. 컴포넌트 이름을 모를 때 여기서 시작: `"삭제 확인"` → Modal + 「P1 위험한 실행 확인」) · **`get_component`**(그 컴포넌트의 Purpose · ✅Do · ❌Don't · Composition rules · props · @example · 스토리 — **쓰기 전에 먼저 호출**) · **`get_do_dont`**(전 컴포넌트의 Do/Don't 요약, `layer` 로 필터 — 작업 시작 시 한 번에 주입) · **`get_tokens`**(토큰 카탈로그 — tier(Global/Semantic/Component)·group 필터, 값 + **다크 값** + 역할 + 유틸 클래스 + 쓰는 컴포넌트) · **`search_tokens`**(의도로 원자를 찾는다: `"경고 배경"` → `--color-status-warning-soft`(+유틸 `bg-status-warning-soft`·다크 값·금지 용도)) · `get_preview_url`(배포 Storybook iframe/문서 URL).

> `get_component` 는 배포된 [`/design-system/components.json`](https://whatap-design-system-storybook.vercel.app/design-system/components.json) 을 읽습니다. 이 파일은 `pnpm build:design` 이 **소스 docstring + 스토리에서 생성**하므로 손으로 관리하는 문서가 아닙니다 — 규칙을 고치는 곳은 컴포넌트 docstring 하나입니다. (Storybook 이 재배포돼야 MCP 응답에 반영됩니다.)

> 한계: 호스팅 MCP는 **지식·문서·프리뷰 URL** 제공. **라이브 렌더 프리뷰·스토리 작성·테스트 실행**은 ①-B 로컬 dev MCP 전용.

---

## ①-B 로컬 dev MCP (라이브 preview·story 작성·테스트)

### 1. 디자인 시스템 dev 서버 실행

```bash
git clone https://github.com/interfacedesigner/WhaTap-design-system.git
cd WhaTap-design-system
pnpm install
pnpm storybook          # http://localhost:5181 — MCP 엔드포인트: http://localhost:5181/mcp
```

> MCP 서버는 **dev 서버에만** 존재합니다. 배포된 정적 Storybook(`whatap-design-system-storybook.vercel.app`)에는 MCP 엔드포인트가 없습니다(② 카탈로그만 제공).

### 2. AI 클라이언트에 MCP 등록

엔드포인트: **`http://localhost:5181/mcp`** (transport: streamable HTTP)

**Claude Code**
```bash
claude mcp add --transport http whatap-ds http://localhost:5181/mcp
```

**Cursor** — 프로젝트 루트 `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "whatap-ds": { "url": "http://localhost:5181/mcp" }
  }
}
```

**VS Code (Copilot)** — `.vscode/mcp.json`
```json
{
  "servers": {
    "whatap-ds": { "type": "http", "url": "http://localhost:5181/mcp" }
  }
}
```

**Windsurf / 기타 MCP 클라이언트** — HTTP MCP 서버로 `http://localhost:5181/mcp` 등록.

### 3. AI가 받는 도구 (tools)

연결되면 AI는 이 DS 기준의 도구를 사용합니다(예):
- `get-storybook-story-instructions` — 프레임워크별 import·스토리 패턴·테스트 규약(이 DS 기준 source of truth)
- `preview` / 컴포넌트·스토리 조회 — 변경 후 렌더 확인

> 작업 규칙: 컴포넌트/스토리 생성·수정 **전** `get-storybook-story-instructions` 를 호출해 규약을 먼저 따르도록 안내됩니다.

### ⚠️ 4. 포트 함정 — config의 5181 대신 "실제 URL" 사용

`pnpm storybook` 은 5181 을 쓰지만, **이미 5181 이 점유돼 있으면 5182 등 다른 포트로 뜨고 MCP URL 도 함께 바뀝니다.** 시작 시 **콘솔에 출력되는 실제 MCP URL 을 그대로** 클라이언트 config 에 넣으세요.

```
# storybook dev 콘솔 예:
#   MCP server enabled at http://localhost:5181/mcp   ← 이 URL 을 등록
```

포트를 고정하고 싶으면 `pnpm storybook` (스크립트가 `-p 5181 --no-open` 고정) 실행 전에 5181 점유 프로세스를 정리하세요.

### 5. 연결 확인 (verification)

등록 후 AI에게 이렇게 물어 툴이 호출되면 성공:

- "스토리북 스토리 목록을 보여줘" / "list storybook stories"
- "WhaTap DS 의 DataTable 스토리를 프리뷰해줘"

→ AI 응답에 `get-storybook-story-instructions` / `preview` 같은 **툴 호출**이 보이면 연결 정상. 안 보이면 아래 트러블슈팅.

### 6. stdio-only 클라이언트 (HTTP 미지원 시)

일부 MCP 클라이언트는 streamable-HTTP 를 직접 지원하지 않고 stdio 만 지원합니다. 이때 `mcp-remote` 브리지를 사용:

```jsonc
// 예: .cursor/mcp.json (stdio 브리지)
{
  "mcpServers": {
    "whatap-ds": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:5181/mcp"]
    }
  }
}
```

### 7. 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `/mcp` 404 · 툴 안 보임 | dev 서버 미실행 → `pnpm storybook` 실행 확인. 배포 정적본엔 MCP 없음(로컬만). |
| 연결은 됐는데 URL 안 맞음 | 포트 변동(위 ⚠️4) — 콘솔의 실제 URL 사용. |
| 클라이언트가 http 거부 | stdio-only — 위 6의 `mcp-remote` 브리지. |
| 툴은 뜨는데 컴포넌트 지식이 약함 | ② 카탈로그(DESIGN.md) 를 함께 주입. MCP(도구) + DESIGN.md(지식) 병행이 정석. |

---

## ② 카탈로그 주입 (DESIGN.md)

MCP 없이도(또는 병행) AI 컨텍스트에 디자인 시스템 전체 지식을 한 번에 넣습니다.

```bash
# 합본 카탈로그(약 88KB) 한 번에 주입
curl https://whatap-design-system-storybook.vercel.app/design-system/DESIGN.md > whatap-ds.md
# → AI의 컨텍스트/시스템 프롬프트에 첨부
```

개별 카탈로그(필요 부분만):

| 파일 | 내용 |
|---|---|
| [`/design-system/SKILL.md`](https://whatap-design-system-storybook.vercel.app/design-system/SKILL.md) | 진입점 · 5 핵심 규칙 · 빠른 시작 |
| [`/design-system/tokens.md`](https://whatap-design-system-storybook.vercel.app/design-system/tokens.md) | 색·타입·톤 토큰 |
| [`/design-system/primitives.md`](https://whatap-design-system-storybook.vercel.app/design-system/primitives.md) | 일반 폼/표시 Primitives 9 (트리 `Primitives/`) |
| [`/design-system/chrome-components.md`](https://whatap-design-system-storybook.vercel.app/design-system/chrome-components.md) | Chrome 골격 20 (트리 `Composite/`·`Primitives/`·`Shell/`) |
| [`/design-system/ai-entry.md`](https://whatap-design-system-storybook.vercel.app/design-system/ai-entry.md) | AI 진입 컴포넌트 |
| [`/design-system/widget-components.md`](https://whatap-design-system-storybook.vercel.app/design-system/widget-components.md) | AI 위젯 카드 |
| [`/design-system/patterns.md`](https://whatap-design-system-storybook.vercel.app/design-system/patterns.md) | 합성 패턴 + Do/Don't |

---

## 컴포넌트 사용 (소비 측)

```bash
# package.json — 로컬 clone 을 심링크로 소비(자동 반영). 모노레포 내부 경로 기준.
"@whatap/design-system": "link:<상대경로>/WhaTap-design-system"
```
```tsx
import { DashboardLayout, PageHeaderAiInline, DataTable } from "@whatap/design-system";
import "@whatap/design-system/style.css";   // 일반 CSS — 토큰+유틸+전역 (Tailwind 불필요)
```

- **단일 출처:** 인라인 색 리터럴·카드 재구현 금지. 토큰·컴포넌트 prop 으로 조합. 정책 전문: 루트 `CLAUDE.md`.
- 모든 컴포넌트 docstring 은 Purpose / When to use / When NOT to use / Composition rules 4섹션 + `@example` 표준(autodocs prop 표와 함께 AI가 참조).

---

## 신규 엔지니어 온보딩 체크리스트 (코드 레벨 통합)

> **두 가지 수준을 구분하세요.**
> - **① AI 지식 안내** (JSX/스타일/규약 가이드) — **사전 조건 0.** 호스팅 MCP + `DESIGN.md` 만으로 누구나 가능. 접근 권한·설치 불필요.
> - **② 실제 컴포넌트 import·빌드·HMR** — 아래 사전 조건 필요.

### ② 실제 통합 사전 조건

1. **저장소 접근 (private)** — `interfacedesigner/WhaTap-design-system` 은 private. 엔지니어 GitHub 계정이 **협업자로 초대**되어야 clone 가능.
   - 관리자(초대): `gh api -X PUT repos/interfacedesigner/WhaTap-design-system/collaborators/<github-login> -f permission=pull`
   - 엔지니어: 메일/알림의 초대 수락 → `git clone https://github.com/interfacedesigner/WhaTap-design-system.git`
2. **npm 미등록** — `npm install @whatap/design-system` 으로는 못 받습니다(공개 레지스트리 아님). **로컬 clone 을 `link:`(또는 `file:`)** 로 소비하거나 워크스페이스(`workspace:*`) 멤버로 둡니다.
3. **소비 환경 호환** — 이 패키지는 빌드 산출물(dist) 없이 **`.ts` 소스를 직접 export**합니다. 소비 측이 **Vite + TypeScript + React 19 + Tailwind 4** 여야 무설정 동작. 다른 번들러(webpack 등)는 TS/JSX 트랜스파일·CSS 처리 추가 설정이 필요하며, 이 경우 별도 빌드 산출물 배포 방식([아래 zero-friction 옵션](#zero-friction-설치-검토중)) 검토.

### 설치 (사전 조건 충족 후)

```bash
git clone https://github.com/interfacedesigner/WhaTap-design-system.git   # 협업자 권한 필요
# 소비 앱 package.json: "@whatap/design-system": "link:<상대경로>/WhaTap-design-system"
pnpm install        # 심링크 구성 → DS 수정 자동 반영(HMR)
# vite.config: resolve.dedupe ['react','react-dom']  (DS 자체 react 중복 방지)
```

### 체크리스트

- [ ] GitHub 계정이 repo 협업자로 초대·수락됨
- [ ] 소비 앱이 Vite + TS + React 19 (Tailwind 불필요)
- [ ] `link:` 의존 + `pnpm install` 로 심링크 구성
- [ ] `import "@whatap/design-system/tokens.css"` (토큰 보장)
- [ ] vite `resolve.dedupe: ['react','react-dom']`
- [ ] (선택) 본인 AI 를 호스팅 MCP `https://whatap-ds-mcp.vercel.app/mcp` 에 연결

### zero-friction 설치 (검토중)

**dist 빌드는 준비됨** — `pnpm build:lib` 가 `dist/index.js` · `dist/widget.js` · `*.d.ts` 산출(tsup). CSS 는 `whatap-ds.css`(일반 CSS) 를 그대로 사용. 비-Vite 번들러도:
```ts
import { DashboardLayout } from "@whatap/design-system";   // dist JS (publish 후 또는 build:lib 후)
import "@whatap/design-system/style.css";                  // 컴파일 CSS — Tailwind 없이도 스타일 적용 (③ 해소)
```
- 현재 exports `.` 기본값은 **source(`src/*.ts`)** — Vite/워크스페이스 소비자의 HMR 유지(프로토타입 무회귀). `./style.css` 만 dist 를 가리킴.
- `npm install` 만으로 받는 경로(#1/#2 해소)는 **사설 레지스트리 publish** 필요(조직 결정): **GitHub Packages** 는 스코프(`@whatap`)=소유 org 일치 필요 → repo 를 `whatap` org 로 이전 + publish 권한. 패키지명 변경은 모든 import 영향이라 비권장.
- publish 시점에 `.` 기본값을 dist 로 전환(`source` 조건은 src 유지)하면 bare import 가 모든 번들러에서 동작.

---

## 사용 예시 (프롬프트)

MCP(도구) + DESIGN.md(지식) 연결 후 AI에게:

- "WhaTap DS 로 DB 인스턴스 목록 페이지를 만들어줘 — DashboardLayout + PageHeaderAiInline + DataTable."
- "이 컴포넌트에 맞는 스토리를 작성해줘." → AI가 `get-storybook-story-instructions` 로 규약을 먼저 읽고 작성.
- "AiCard 톤별 변형을 프리뷰로 확인해줘." → `preview` 도구로 렌더 확인.

**MCP 의 역할 범위 (정직하게):** addon-mcp 는 *Storybook 안에서* 스토리 작성·프리뷰·규약 조회를 돕는 도구입니다. "엔지니어 앱에서 DS 로 제품 페이지를 직접 빌드"하려면 **MCP(작성 규약/프리뷰) + DESIGN.md(컴포넌트·토큰 지식) + 실제 패키지 import(`@whatap/design-system`)** 를 함께 써야 합니다. MCP 단독으로 임의 앱 코드를 생성해주는 것은 아닙니다.

## 요약 — 가장 빠른 시작

1. `pnpm storybook` (dev, 5181)
2. AI 클라이언트에 `http://localhost:5181/mcp` 등록
3. `DESIGN.md` 를 AI 컨텍스트에 주입
4. AI에게 "WhaTap DS로 ○○ 페이지 만들어줘" — DS 컴포넌트·토큰·규약 기준으로 작업

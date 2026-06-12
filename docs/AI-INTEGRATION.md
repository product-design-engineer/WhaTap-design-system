# AI 연동 가이드 — 본인 AI 작업 환경에 WhaTap 디자인 시스템 연결

프론트엔드 엔지니어가 **자기 AI 코딩 환경(Cursor · Claude Code · VS Code · Windsurf 등)** 에서
WhaTap 디자인 시스템을 그대로 사용해 인터페이스를 만들 수 있도록 하는 두 채널을 제공합니다.

| 채널 | 무엇을 주나 | 라이브? |
|---|---|---|
| **① MCP 서버** (`@storybook/addon-mcp`) | AI가 이 DS 기준으로 **스토리 작성·컴포넌트 프리뷰·규약 조회** 하는 도구(tool) | 로컬 `storybook dev` 실행 중에만 |
| **② 카탈로그 주입** (`DESIGN.md`) | 컴포넌트·토큰·패턴 **지식**을 AI 컨텍스트에 한 번에 주입 | 배포본에서 항상 (정적) |

권장: **둘 다** 사용. ①로 "쓰기/프리뷰" 도구를, ②로 "무엇이 있고 어떻게 조합하는지" 지식을.

---

## ① MCP 서버 연결

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
| [`/design-system/primitives.md`](https://whatap-design-system-storybook.vercel.app/design-system/primitives.md) | Primitives 14 |
| [`/design-system/chrome-components.md`](https://whatap-design-system-storybook.vercel.app/design-system/chrome-components.md) | Chrome 20 |
| [`/design-system/ai-entry.md`](https://whatap-design-system-storybook.vercel.app/design-system/ai-entry.md) | AI 진입 컴포넌트 |
| [`/design-system/widget-components.md`](https://whatap-design-system-storybook.vercel.app/design-system/widget-components.md) | AI 위젯 카드 |
| [`/design-system/patterns.md`](https://whatap-design-system-storybook.vercel.app/design-system/patterns.md) | 합성 패턴 + Do/Don't |

---

## 컴포넌트 사용 (소비 측)

```bash
# package.json 에 추가 (모노레포 file: 또는 git 의존)
"@whatap/design-system": "file:<상대경로>/WhaTap-design-system"
```
```tsx
import { DashboardLayout, PageHeaderAiInline, DataTable } from "@whatap/design-system";
import "@whatap/design-system/tokens.css";   // 토큰(@theme static) — import 만으로 전 토큰 보장
```

- **단일 출처:** 인라인 색 리터럴·카드 재구현 금지. 토큰·컴포넌트 prop 으로 조합. 정책 전문: 루트 `CLAUDE.md`.
- 모든 컴포넌트 docstring 은 Purpose / When to use / When NOT to use / Composition rules 4섹션 + `@example` 표준(autodocs prop 표와 함께 AI가 참조).

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

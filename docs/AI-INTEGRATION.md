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

## 요약 — 가장 빠른 시작

1. `pnpm storybook` (dev, 5181)
2. AI 클라이언트에 `http://localhost:5181/mcp` 등록
3. `DESIGN.md` 를 AI 컨텍스트에 주입
4. AI에게 "WhaTap DS로 ○○ 페이지 만들어줘" — DS 컴포넌트·토큰·규약 기준으로 작업

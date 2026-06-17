# @whatap/design-system

WhaTap SaaS 의 단일 컴포넌트·토큰 출처. **Primitives · Chrome · AI Widget 카드 + 토큰(`tokens.css` 의 `:root`)** 을 Storybook 카탈로그로 제공하며, 프론트엔드 엔지니어가 **자기 AI 작업 환경에서 인터페이스 작업에 그대로 사용**하도록 설계됨.

- 라이브 Storybook: https://whatap-design-system-storybook.vercel.app
- 정책 전문: [`CLAUDE.md`](./CLAUDE.md) · 카탈로그: [`docs/`](./docs)

## 설치 / 실행

```bash
pnpm install
pnpm storybook          # http://localhost:5181 (dev) — MCP 엔드포인트 포함
pnpm build-storybook    # 정적 빌드 (DESIGN.md 합본 자동 생성)
```

## 소비 (다른 앱/프로토타입에서 사용)

```jsonc
// package.json
"@whatap/design-system": "file:<상대경로>/WhaTap-design-system"
```
```tsx
import { DashboardLayout, PageHeaderAiInline, DataTable } from "@whatap/design-system";
import "@whatap/design-system/tokens.css";   // import 만으로 전 토큰 :root 보장
```

단일 출처 원칙: 인라인 색 리터럴 금지(토큰 사용), 컴포넌트 inline 재구현 금지(prop 조합). 자세한 정책은 `CLAUDE.md`.

## 🤖 AI 연동 — 본인 AI에 디자인 시스템 연결

엔지니어가 Cursor · Claude Code · VS Code · Windsurf 등에서 이 DS 기준으로 작업하도록 두 채널 제공:

1. **호스팅 MCP** (권장, dev 서버 불필요) — 공개 URL로 바로 연결, DS 컴포넌트·토큰·코드·프리뷰 도구
   - 엔드포인트: `https://whatap-ds-mcp.vercel.app/mcp`
   - Claude Code: `claude mcp add --transport http whatap-ds https://whatap-ds-mcp.vercel.app/mcp`
   - Cursor `.cursor/mcp.json`: `{ "mcpServers": { "whatap-ds": { "url": "https://whatap-ds-mcp.vercel.app/mcp" } } }`
   - 라이브 preview·story 작성·테스트가 필요하면 로컬 `pnpm storybook` 의 `http://localhost:5181/mcp` (addon-mcp)
2. **카탈로그 주입** — AI 컨텍스트에 지식 한 번에 주입
   - `curl https://whatap-design-system-storybook.vercel.app/design-system/DESIGN.md > whatap-ds.md`

**전체 절차·설명: [`docs/AI-INTEGRATION.md`](./docs/AI-INTEGRATION.md)** (라이브: `/design-system/AI-INTEGRATION.md`, 진입 인덱스: `/llms.txt` · `/mcp.txt`)

## 기술 스택

React 19 · Vite 6 · Storybook 10 · TypeScript 5 (strict) · `react-docgen-typescript` autodocs. (스타일은 자체 일반 CSS `whatap-ds.css` — Tailwind 의존·흔적 없음.)

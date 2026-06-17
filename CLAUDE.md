# @whatap/design-system — 컴포넌트·디자인 시스템 정책

본 패키지는 WhaTap-AI-Assistant 의 단일 컴포넌트 출처. Storybook 카탈로그 + tokens.css 단일 출처 + `exports` 로 `.` (Chrome) · `./widget` (AI 위젯) 분리.

## 디렉토리 구성

- `src/` — 컴포넌트 소스 + `tokens.css` + `widget/` (AI 카테고리)
- `stories/` — Storybook 카탈로그 (Tokens / Primitives / Chrome / WhaTap AI 카테고리)
- `docs/` — markdown 카탈로그 (단일 출처 문서)
  - `SKILL.md` — 본 디자인 시스템 사용 절차
  - `primitives.md` / `chrome-components.md` / `widget-components.md` — 컴포넌트 카탈로그 (텍스트 형태)
  - `tokens.md` — 토큰 정의 (CSS 변수 ↔ 디자인 의미)
  - `patterns.md` — 합성 패턴 (페이지 레벨 컴포지션)
  - `STORIES_ROADMAP.md` — Storybook 카탈로그 추가 작업 목록

## 카테고리 분리 — Primitives · Chrome · WhaTap AI

| 카테고리 | 폴더 | 예 |
|---|---|---|
| Primitives | `src/` 루트 | Button, TextField, Select, Chip, FilterChip, Tabs, Modal, Tooltip, Checkbox |
| Chrome | `src/` 루트 | DashboardLayout, PageHeader, PageHeaderAiInline, Sidebar, FilterBar, DataTable, FilterDropdown |
| WhaTap AI | `src/widget/` | **모든 AI 컴포넌트의 집** — 빌딩 블록(AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList) · 진입(AiInlinePrompt, AiPromptInput, AiSendButton, AiAssistantButton) · 위젯 셸(WhaTapAiWidget, WhaTapAiContext, AiSymbol) · 메시지 카드(AiReasoning, AiChatExchange …). Storybook 트리 `WhaTap AI/` 로 통일. (단 `PageHeaderAiInline` 은 헤더 레이아웃이라 Chrome 유지) |
| Tokens | `src/tokens.css` | `:root` 컬러·폰트·spacing 변수 (참조용; 런타임은 whatap-ds.css) |

**AI 영역 ↔ 일반 영역 분리 원칙**

- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** 사용 (AiInlinePrompt / AiSendButton / AiAssistantButton)
- 일반 폼/검색은 TextField·Button
- 페이지의 AI 진입점은 **버튼 대신 AiInlinePrompt 직접 주입 (2-step → 1-step)**

## 아키텍처 — 2-Tier Token + 3-Layer Component

### 토큰 2계층

| Tier | 역할 | 명명 규칙 | 예 |
|---|---|---|---|
| **Global** | 원시 팔레트 · 스케일 · 시스템 값 | 값 자체가 이름 | `--color-gray-50`, `--text-xs`, `--spacing`, `--radius-md` |
| **Semantic** | 의미 · 역할 · 의도 | 용도가 이름 | `--color-brand-blue`, `--color-text-primary`, `--color-status-error`, `--color-bg` |

- UI 컴포넌트는 **Semantic 토큰만 참조**. Global 직접 참조 금지.
- Component 토큰(3계층)은 variant×tone 조합이 복잡한 것만 선택 도입 (`--wds-btn-*`).
- `--color-palette-*` (hex suffix) 는 차트 시리즈 전용 Global. 컴포넌트에서 직접 참조 가능 (차트 한정).

### 컴포넌트 3계층 — Foundation · Composite · Shell

| Layer | 역할 | 조합 규칙 | 수량 |
|---|---|---|---|
| **Foundation** | 단독 렌더. 다른 DS 컴포넌트를 import 하지 않음 | — | 39 |
| **Composite** | Foundation 을 1단계 조합 | Foundation 만 import. **Composite 끼리 import 금지** | 12 |
| **Shell** | Composite + Foundation 을 최종 조립하는 진입점 | 모든 계층 import 가능 | 2 |

**Foundation** — Checkbox, Chip, TextField, Select, Tabs, Modal, Tooltip, Toast, Button, DataTable, MiniLineChart, LiveTimerCompact, AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList, AiUserBubble, AiAssistantButton, AiClickCursor 등 (39개)

**Composite** — FilterBar(=FilterChip+FilterDropdown), PageHeader(=AiAssistantButton), OptionbarPage(=LiveTimerCompact+PresetSelect), AiInlinePrompt(=AiSendButton), AiChatExchange(=AiUserBubble) 등 (12개)

**Shell** — DashboardLayout(=Sidebar), WhaTapAiWidget (2개)

**신규 컴포넌트 추가 시 반드시 계층을 명시.** Composite 가 다른 Composite 를 import 하면 Shell 로 승격하거나 구조 분리.

## 스타일 — 일반 CSS (Tailwind 미사용 · 흔적 0)

런타임 스타일은 외부 CSS 프레임워크 흔적이 0인 **자체 소유 일반 CSS** `src/whatap-ds.css` (= export `./style.css`·`./whatap-ds.css`). 내부에 `@layer`·`--tw-*`·`@property`·`.foo-\[…\]`(escape 클래스명) 없음. 유틸 클래스명은 escape 없는 일반 식별자(`gap-4px`·`hover-opacity-70` 등).

- **소비자:** 진입점에서 `import "@whatap/design-system/style.css"` 한 줄. Tailwind·`@source`·PostCSS 불필요. 토큰만 필요하면 `tokens.css`(참조용 `:root`).
- **`whatap-ds.css` 는 생성물 — 손으로 늘리지 말 것.** 컴포넌트 className/토큰 변경 시 `node scripts/detailwind.mjs generate` 로 **(1) whatap-ds.css 재생성 + (2) tsx className 코드모드(escape 토큰→일반 식별자)**. 진실 원본 `scripts/frozen-whatap-ds.css`(구 빌드 1회 스냅샷, 미배포). self-contained(:root 토큰 + preflight + utilities + 전역/keyframes/.dark 포함).
- **동적 색**(variant×tone)은 정적 유틸로 불가 → Button 처럼 inline CSS custom property(`--wds-btn-*`).
- **다크 대응 (테마 적응 표면 유틸):** 페이지/패널 배경에 `bg-white`·인라인 `#fff` **금지** — 테마 토큰으로:
  `bg-bg`(앱 셸 = `--color-bg`) · `bg-card`(헤더/사이드바/카드/입력/드롭다운 = `--color-card`) · `bg-surface-50/100/200` · `hover-bg-surface-100/200`. `.dark` 가 토큰만 재매핑하므로 라이트/다크 자동 전환. **흰색 전경**(컬러 위 텍스트·아이콘: `--wds-btn-fg`, `stroke/fill "#fff"`)은 그대로 유지.
- **⚠️ `detailwind generate` 는 원본(escaped className) tsx 에서만 실행** — 이미 codemod된 트리에서 재실행하면 유틸이 누락됨(가드가 중단시킴). 증분 변경은 `src/whatap-ds.css` 직접 편집(+ EXTRAS 유틸은 스크립트에도 반영).
- **Tailwind 재도입 금지** — 의존성·빌드·런타임·CSS 산출물 어디에도 없음. (Storybook Guardrails: `no-tailwind-plain-css`)

## 타이포그래피 위계 — `font-weight` 평탄화 금지

| 사이즈 | weight 기준 | 용도 |
|---|---|---|
| `text-lg+` (14px+) | `font-bold` | 페이지 타이틀·섹션 헤더 |
| `text-md` (13px) | `font-bold` / 강조 시 medium | 카드 헤더·테이블 row 강조 |
| `text-base` (12px) | `font-medium` | 라벨·메타·dropdown 항목 |
| `text-sm` (11px) | `font-medium` 또는 regular | 보조 메타·캡션 |
| `text-xs` (10px) | regular | 마이크로 캡션·인디케이터 |

본문 (running text) 만 regular. 같은 사이즈에서 weight 만 평탄화하면 위계 손실 — 사이즈 + weight 둘 다 조합.

## DataTable 종합 정책

### Density — 기본 `default`

- **`default`** (모든 새 페이지 채택) — header `text-base` 12px bold · row `text-md` 13px regular · padding 12/10
- **`compact`** — header `text-xs` 10px bold · row `text-sm` 11px regular · padding 8/6. 100+ 행 raw log 등 극단적 dense 데이터 전용. 채택 시 별도 근거 필요.

### 정렬 (alignment)

- 문자 → **left**
- 숫자 (`numeric: true`) → **right** (자릿수 세로 정렬)
- header `"No"` 컬럼 → **center** (별도 align 없이 자동)
- 명시 `align` prop 이 최우선 override.

### 너비 (width)

- 정형 컬럼 (No 52 · 시각 150 · 상태 96 · 액션) → **`width`(px 고정)**
- 가변 컬럼 (이름 · 메시지) → **`flex`(fr)**, 정보량 많은 쪽에 더 큰 비율

### 셀 내 inline 폰트 — DataTable tokens 와 정합

DataTable wrapping span 이 `tokens.rowText` 자동 적용. 셀 안 `<span>` override 시:

| 컨텐츠 | className |
|---|---|
| 주 텍스트 (강조 없음) | **override 안 함** (자동 `text-md text-primary`) |
| 메인 식별자 강조 | `text-md font-medium text-primary` 또는 `font-bold` |
| 보조/부 텍스트 (이메일·라벨) | `text-base text-tertiary` |
| 수치 | `text-md font-numeric tabular-nums` |

**금지:** default density 셀 안에 `text-sm`/`text-xs` — compact 시절 잔재. 한 단계 작은 부 텍스트는 `text-base` (12px).

### 셀 내 컴포넌트 사이즈

row height ≈ 33-36px 기준:

| 컴포넌트 | size |
|---|---|
| `<Chip>` | `md` (20px) |
| `<FilterChip>` | `md` (24px) |
| `<Button>` | `sm` (~24px) |
| inline pill (span) | `text-sm h-[20-24px] px-[8px]` |
| status dot | 6-8px |
| `<Checkbox>` | `sm` (14-16px) |

lg(28-32px) 는 row 를 압도하므로 금지.

## Widget primitives + Tone 토큰

AI 위젯 영역의 모든 컴포넌트는 다음 primitive 를 **반드시 composition**:

- `<AiCard>` / `<AiCaption>` / `<AiSectionHeading>` / `<AiToneBadge>` / `<AiBulletList>`
- `Tone` 토큰 (`_tokens.ts`, `_primitives.tsx`) — info / success / warning / critical / neutral

**금지:** inline 색 리터럴 (`#FF...`, `style={{ background: ... }}`), inline card 스타일링. 모두 primitive 의 `tone` prop 으로 표현.

## 공통 컴포넌트 카탈로그

- Chrome·Widget·Primitives **재사용 가능 컴포넌트는 본 패키지에만 거주**
- 새 페이지는 prop 으로 조합. inline 복사·재정의 금지.
- 페이지 dogfooding 중 발견된 gap 은 본 패키지에 새 컴포넌트로 추가 (페이지 안에서 해결 X)

### 🔒 불변 정책 — 소비자(엔지니어)의 역방향 수정 금지

> **이 정책은 불변(immutable)입니다. 예외 없음.**

소비자(엔지니어)는 UI 작업 레이어에서 **토큰 · 컴포넌트 · Atom · 위젯을 역으로 수정할 수 없다.**

- 본 패키지는 **단일 출처(single source of truth)**.
- 소비 측 — 프로토타입 · 시나리오 · 제품 코드 (`WhaTap-AI-Assistant/prototypes/*`, `WhaTap_Scenarios/`, 기타 소비 앱) — 은 등록된 토큰·컴포넌트·Atom·위젯을 **prop 조합으로만 소비**한다.
- 소비 레이어에서의 **override · 재정의 · monkey-patch · CSS 덮어쓰기 · 토큰 값 변경** 모두 금지.
- 토큰 · 컴포넌트 · Atom · 위젯의 추가 · 변경 · 삭제는 **본 repo 작업으로만** 수행.
- 소비 측 CLAUDE.md 에도 동일 명시.

## Sidebar — 프로젝트 스위처 노출 규칙

상단 프로젝트/조직 스위처(`productIcon` + `groupLabel` + `projectLabel` + chevron)는 **프로젝트 컨텍스트가 있을 때만 노출**한다.

- 컨텍스트가 없는 화면(엔터프라이즈 활성화 전 — 표시 이름 미설정, 계정/관리 영역 등)은 `hideProjectSwitcher`(프로젝트 스위처)·`org={null}`(조직 스위처)로 숨긴다.
- **빈 라벨/기본값(default 프로젝트·조직명) 노출 금지** — 잘못된 정보 노출 방지.
- 비파괴 원칙: 기본값 `hideProjectSwitcher=false` / `org=DEFAULT_ORG` 이므로 기존 호출처 동작 불변. `DashboardLayout` 이 두 prop 을 Sidebar 로 passthrough.

## SVG 텍스트 — font-size 단위 필수

`<text fontSize="9">` (unitless = user-space units, viewBox 와 함께 scale) **금지**.

→ 항상 `fontSize="9px"` 또는 `fontSize="9pt"` 명시. 일관된 렌더링 보장.

## 차트 peak / ▼ 라벨 — line max 픽셀 1:1 매칭

SVG 차트의 peak 라벨/마커는 **plot 영역 absolute 배치 + HTML overlay 가 같은 plot 좌표계 사용**. line max 픽셀 좌표와 1:1 매칭되도록 좌표 계산.

→ 별개 좌표계로 그리면 시각 위치 어긋남.

## 라이브 디자인시스템 CSS 소스

`.ai-assistant-btn` 등 라이브 디자인시스템 클래스를 dogfooding 할 때:

1. `curl https://service.whatap.io/.../design-system.css` 로 live 번들 fetch
2. 해당 규칙 grep
3. **그대로 paste**. 즉흥 작성 금지.

라이브와의 픽셀 일치 보장이 본 정책의 핵심.

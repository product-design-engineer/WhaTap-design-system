# @whatap/design-system — 컴포넌트·디자인 시스템 정책

본 패키지는 WhaTap-AI-Assistant 의 단일 컴포넌트 출처. Storybook 카탈로그 + tokens.css 단일 출처 + `exports` 로 `.` (루트 컴포넌트) · `./widget` (AI 위젯) 분리.

## 디렉토리 구성

- `src/` — 컴포넌트 소스 + `tokens.css` + `widget/` (AI 카테고리)
- `stories/` — Storybook 카탈로그 (Tokens 메타 + Primitives / Composite / Shell 3-Layer, AI 는 각 계층 `Ai/` 하위그룹)
- `docs/` — markdown 카탈로그 (단일 출처 문서)
  - `SKILL.md` — 본 디자인 시스템 사용 절차
  - `primitives.md` / `chrome-components.md` / `widget-components.md` — 컴포넌트 카탈로그 (텍스트 형태)
  - `tokens.md` — 토큰 정의 (CSS 변수 ↔ 디자인 의미)
  - `patterns.md` — 합성 패턴 (페이지 레벨 컴포지션)
  - `STORIES_ROADMAP.md` — Storybook 카탈로그 추가 작업 목록

## 카탈로그 — 단일 3-Layer 체계 (Primitives · Composite · Shell)

Storybook 좌측 트리는 **컴포넌트 3계층과 동일한 축**으로 분류한다. (구 `Chrome` / `WhaTap AI` / `Foundation` / `Page` 카테고리는 폐지 → 계층으로 흡수.) AI 전용 에셋은 폐지하지 않고 **각 계층 안 `Ai/` 접두 하위그룹**으로 묶어 발견성을 유지한다.

| 카탈로그 그룹 | 의미 | 소스 | 예 |
|---|---|---|---|
| **Primitives/** | 자체 렌더 리프. 다른 DS 컴포넌트 import 0 | `src/` 루트 · `src/widget/`(리프) | Button, TextField, Select, Chip, Tabs, Modal, Tooltip, Toast, Checkbox, Switch, DataTableRow, SidebarMenuItem … |
| **Primitives/Ai/** | AI 위젯 리프 프리미티브 | `src/widget/` | AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList, AiSymbol, AiUserBubble, ReasoningStep … |
| **Composite/** | 프리미티브를 1단계 조합 | `src/` 루트 | PageHeader, PageHeaderAiInline, Sidebar, FilterBar, DataTable, FilterDropdown, Tabs, ThemeToggle … |
| **Composite/Ai/** | AI 진입·응답 합성 위젯 | `src/widget/` | AiChatExchange, AiReasoning, AiDashboardProposal, AiCostTable, InlinePrompt, PromptInput, SendButton … |
| **Shell/** | 최종 조립 진입점 | `src/` · `src/widget/` | DashboardLayout, Ai/Widget(WhaTapAiWidget), Page/(A~D 페이지 합성 템플릿) |
| **Tokens** (메타) | `:root` 컬러·폰트·spacing 변수 (참조용; 런타임은 whatap-ds.css) | `src/tokens.css` | Color, Type Scale, Tones … |

> 카탈로그 그룹명과 아키텍처 계층명은 **동일 용어**(Primitives/Composite/Shell)로 통일한다. `PageHeaderAiInline` 은 헤더 레이아웃(프리미티브 조합)이므로 `Ai/` 가 아닌 `Composite/` 에 둔다.

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

**🔒 페이지 좌·우 거터 — 단일 토큰 규칙 (`--wds-page-px`)**
- 페이지의 좌·우 거터는 **단 하나의 토큰 `--wds-page-px`(24px)** 이 소유한다. 헤더(`--wds-header-px`)·옵션바·본문(`--wds-content-px`)은 모두 이 값을 **alias 로 참조** → 한 곳만 바꾸면 헤더·옵션바·테이블 가장자리가 함께 정렬된다.
- 본문 콘텐츠 블록 패딩은 인라인 `padding:16` 같은 **매직넘버 금지**. 등록된 유틸 클래스 **`.wds-page-content`**(`padding-block: --wds-content-py(16px)` + `padding-inline: --wds-content-px`)를 쓴다.
- 헤더류는 `style={{ paddingInline: "var(--wds-header-px)" }}` 패턴(PageHeader · SubHeaderBar · PageHeaderAiInline · OptionbarPage 동일).

### 컴포넌트 3계층 — Primitives · Composite · Shell

카탈로그 그룹명과 **동일 용어**. (구 명칭 `Foundation` → `Primitives` 로 통일.)

| Layer | 역할 | 조합 규칙 | 수량(카탈로그) |
|---|---|---|---|
| **Primitives** | 단독 렌더. 다른 DS 컴포넌트를 import 하지 않음 | — | 65 (Ai/ 포함) |
| **Composite** | Primitives 를 1단계 조합 | Primitives 만 import. **Composite 끼리 import 금지** | 29 (Ai/ 포함) |
| **Shell** | Composite + Primitives 를 최종 조립하는 진입점 | 모든 계층 import 가능 | 5 (DashboardLayout · Ai/Widget · Page A·B·D) |

**Primitives** — Checkbox, Chip, TextField, Select, Tabs, Modal, Tooltip, Toast, Button, Switch, DataTable, MiniLineChart, LiveTimerCompact, AiCard, AiCaption … + **인라인 추출 Parts**(SidebarMenuItem · PageHeaderNotificationItem · PageHeaderProfileMenuItem · ProductRailItem · BottomRailItem · TabButton · CostBreakdownRow · ClassificationTableRow · CostTableRow · MigPlanRow · EventListItem · ReasoningStep · TimelineStepItem · CriteriaGroup · AiActionChip · AiAttachmentChip · AiQuickActionChip)

**Composite** — FilterBar · PageHeader · PageHeaderAiInline · OptionbarPage · Sidebar(=SidebarMenuItem) · ThemeToggle · AiChatExchange · AiReasoning · InlinePrompt … + **추출 Parts**(DataTableRow · FilterDropdownOptionItem · FilterChipItem · CriteriaOptionButton · ReceiverChannelItem · ProposalSection · AiAlertRulePreview)

**Shell** — DashboardLayout(=Sidebar) · WhaTapAiWidget(`Shell/Ai/Widget`) · Page 합성 템플릿(A 기본 대시보드 · B AI 전용 · D 상세)

**신규 컴포넌트 추가 시 반드시 계층을 명시.** Composite 가 다른 Composite 를 import 하면 Shell 로 승격하거나 구조 분리. AI 전용이면 카탈로그 title 을 `<Layer>/Ai/<Name>` 으로 둔다.

### 🔒 글로벌 정책 — 구조는 인라인 금지 (컴포넌트로 추출)

**모든 컴포넌트/위젯의 구조는 인라인 JSX 로 흩어 두지 않는다.** 반복되거나 의미 단위가 분명한 구조(목록 행·카드·셀·항목 등)는 `map` 내부에 인라인으로 펼치지 말고 **독립 컴포넌트로 추출**한다. (예: Sidebar 의 메뉴 행 → [[SidebarMenuItem]] Primitives 로 분리.)

- 새 구조 단위를 인라인으로 만들기 전에 **컴포넌트로 추출 가능한지 먼저 검토** — 추출이 기본.
- 추출된 컴포넌트는 계층 명시 + docstring(4섹션) + story + `index.ts` export + 카탈로그 동기.
- 인라인 허용은 **재사용 없는 1회성 레이아웃 래퍼**(flex 컨테이너 등)에 한함.
- **적용 현황(2026-06-17):** 위젯·chrome 의 반복 인라인 구조 23종을 컴포넌트로 추출 완료 — 추출 Parts 는 각자 계층에 맞춰 `Primitives/*`(리프 행·칩·항목) 또는 `Composite/*`(조합 단위)에 등록(`index.ts` export + story). 테이블 행·스텝·칩·메뉴 항목 등.

## 스타일 — 일반 CSS (Tailwind 미사용 · 흔적 0)

런타임 스타일은 외부 CSS 프레임워크 흔적이 0인 **자체 소유 일반 CSS** `src/whatap-ds.css` (= export `./style.css`·`./whatap-ds.css`). 내부에 `@layer`·`--tw-*`·`@property`·`.foo-\[…\]`(escape 클래스명) 없음. 유틸 클래스명은 escape 없는 일반 식별자(`gap-4px`·`hover-opacity-70` 등).

- **소비자:** 진입점에서 `import "@whatap/design-system/style.css"` 한 줄. Tailwind·`@source`·PostCSS 불필요. 토큰만 필요하면 `tokens.css`(참조용 `:root`).
- **`whatap-ds.css` 는 이제 hand-maintained 다.** `scripts/detailwind.mjs generate` 는 **최초 1회**(원본 escaped tsx → 일반 CSS) 변환용이었고, 그 이후 토큰·전역 규칙·신규 유틸은 **`whatap-ds.css` 를 직접 편집**한다. self-contained(:root 토큰 + preflight + utilities + 전역/keyframes/.dark). 진실 스냅샷 `scripts/frozen-whatap-ds.css`(미배포).
- **동적 색**(variant×tone)은 정적 유틸로 불가 → Button 처럼 inline CSS custom property(`--wds-btn-*`).
- **다크 대응 (테마 적응 표면 유틸):** 페이지/패널 배경에 `bg-white`·인라인 `#fff` **금지** — 테마 토큰으로:
  `bg-bg`(앱 셸 = `--color-bg`) · `bg-card`(헤더/사이드바/카드/입력/드롭다운 = `--color-card`) · `bg-surface-50/100/200` · `hover-bg-surface-100/200`. `.dark` 가 토큰만 재매핑하므로 라이트/다크 자동 전환. **흰색 전경**(컬러 위 텍스트·아이콘: `--wds-btn-fg`, `stroke/fill "#fff"`)은 그대로 유지.
- **🔒 Base surface 2단 레이어 (page → card).** `--color-bg`(바닥, 라이트 `#F5F5F5`) 위에 `--color-card`(흰색)가 **쌓인다**. 페이지 본문의 의미 단위(테이블·차트·폼 섹션)는 각각 `bg-card` 블록으로 감싼다 — 회색 바닥에 맨몸 배치 금지. **두 토큰을 같은 값으로 만들지 말 것**(카드가 보더만 남아 층이 사라짐). 페이지 배경에 `--color-surface-50` 대용 금지(값이 같아도 용도가 hover/muted). `--color-bg` 를 **전경색으로 쓰지 말 것**.
- **🔒 컴포넌트 표면도 동일 규칙.** 카드 *안쪽*(위젯 셸·툴바 컨트롤·차트 그리드)에서 `bg-white`·`#fff`·`#d3d3d3`·`#f0f0f0`·`fill="#757575"` 하드코딩 금지 → `--color-card` · `--color-border-strong` · `--color-border-soft` · `--color-text-tertiary`. 보더 4종 모두 `.dark` 오버라이드가 있으므로 토큰만 쓰면 다크는 자동. **색 리터럴을 prop 기본값으로 굳히지 말 것**(`bodyBg = "#fff"` 형태 → 호출부로 위반 번식). 토큰 부재는 리터럴의 근거가 아니라 토큰 추가의 근거. 예외는 컬러 위 흰색 전경뿐. 전문·매핑표: `docs/tokens.md` → *Base Surface — 페이지 vs 카드*.
- **⚠️ `detailwind generate` 재실행 금지.** whatap-ds.css 는 frozen 과 분기된 hand-maintained 상태라, 재실행 시 (a) codemod된 tsx 미스매치로 유틸 누락 (b) 수동 추가(토큰·전역·포커스 규칙) 손실. **가드가 자동 거부**한다(manual 마커/codemod 감지 → exit 1). 의도적 재생성만 `DETAILWIND_FORCE=1`. 평소엔 `whatap-ds.css` 직접 편집.
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

### 타이포 Role Catalog — 의도 → utility 조합

크기를 직접 고르지 말고 **역할(role)** 로 선택. 같은 역할은 같은 조합을 쓴다 (위계 일관성).

| Role | 의도 | utility 조합 |
|---|---|---|
| `heading.page` | 페이지 타이틀 | `text-2xl font-medium` (PageHeader) |
| `heading.section` | 섹션/카드 헤더 | `text-lg font-bold` |
| `heading.subsection` | 강조 부제·테이블 row 강조 | `text-md font-bold` |
| `body` | 본문 running text | `text-base` (regular) |
| `body.label` | 폼/항목 라벨 | `text-base font-medium` |
| `meta.primary` | 보조 정보·캡션 | `text-sm` |
| `meta.secondary` | 마이크로 정보·인디케이터 | `text-xs` |
| `numeric.metric` | 지표·카운트 강조 | `text-md font-numeric tabular-nums` |
| `numeric.compact` | 표 안 수치 | `text-base font-numeric tabular-nums` |

## Border vs Ring — 경계 vs 상태

- **`border-*`** = **상시 경계** (`--color-border-*`). Card/Sidebar/Header 구분선, Input 평상 테두리.
- **focus 등 상태** = 상황에 맞게:
  - **버튼·토글류**: `:focus-visible` **ring/outline** 사용 (예: `.wds-switch:focus-visible` → `outline: 2px var(--color-brand-blue)`). border 로 focus 표현 금지.
  - **입력 필드(TextField·Select)**: focus 시 **border 색 전환**(`--color-brand-blue`)이 *의도된 관례* — 허용. (focus=ring 규칙의 예외)
- 즉 "focus엔 무조건 ring"이 아니라 — **컨트롤은 ring, 입력 필드는 focus-border** 로 구분.

## 컴포넌트 선택 가이드 — 같은 효과도 의도로 구분

| 의도 | 컴포넌트 | 특징 |
|---|---|---|
| **즉시 반영 설정** (다크모드·알림 on/off) | `Switch` / `ThemeToggle` | 1-step, 토글 즉시 적용 |
| **폼 제출 시 함께 보냄** (약관 동의·다중 선택) | `Checkbox` | form 일부, submit 필요 |
| 일시적 누름 상태 (텍스트 Bold 등) | *(미보유 — 필요 시 `Toggle` 신설)* | press/unpress |

❌ 약관 동의에 `Switch`, 즉시-적용 설정에 `Checkbox` 처럼 의도와 어긋난 선택 금지.

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

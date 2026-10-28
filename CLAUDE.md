# @whatap/design-system — 컴포넌트·디자인 시스템 정책

본 패키지는 WhaTap-AI-Assistant 의 단일 컴포넌트 출처. Storybook 카탈로그 + tokens.css 단일 출처 + `exports` 로 `.` (루트 컴포넌트) · `./widget` (AI 위젯) · `./chart` (데이터 시각화 — Chart Art) 분리.

## 디렉토리 구성

- `src/` — 컴포넌트 소스 + `tokens.css` + `widget/` (AI 카테고리) + `chart/` (데이터 시각화 — 차트·게이지·히트맵, `./chart` 진입점. 루트 배럴도 재수출) + `topology/` (노드-엣지 그래프)
- `stories/` — Storybook 카탈로그 (Tokens 메타 + Primitives / Composite / Shell 3-Layer, AI 는 각 계층 `Ai/` 하위그룹)
- `docs/` — markdown 카탈로그 (단일 출처 문서)
  - `SKILL.md` — 본 디자인 시스템 사용 절차
  - `primitives.md` / `chrome-components.md` / `widget-components.md` — 컴포넌트 카탈로그 (텍스트 형태)
  - `tokens.md` — 토큰 정의 (CSS 변수 ↔ 디자인 의미)
  - `patterns.md` — **Part 1 인터랙션 패턴**(`P1`… 컴포넌트 횡단 시퀀스 — 파괴적 액션 확인 · 완료 통보 · 즉시반영 vs 폼제출 · 기본/선택 항목 그룹) + **Part 2 구현 정책**(`1`… 기존 번호 유지). MCP `search_components` 가 이 파일을 함께 검색한다.
  - `components.json` — **기계 판독 규칙 카탈로그(자동 생성 · 직접 편집 금지).** 컴포넌트별 Purpose · ✅Do · ❌Don't · Composition rules · props · 스토리 id. `scripts/build-components-json.mjs` 가 **소스 docstring + 스토리**에서 유도하고 MCP `get_component`·`get_do_dont` 가 이걸 읽는다 — Do/Don't 를 따로 손으로 쓰지 않는다(표기 단일화 규칙은 `docs/SKILL.md`). **템플릿 섹션(Purpose · When to use · When NOT to use · Composition rules · 차트 필수 Metrics · 선택 Spec · Do · Don't) 밖의 `## …` 는 배달되지 않는다** — 쓰지 않는다. **`Composite/Chart/*` 는 `## Metrics` 에 맞는 지표(`- ✅`) 필수 · 쓰면 안 되는 지표(`- ❌`) 가능하면**(2026-10-23 사용자 지시, `metrics` 필드 → MCP). 강제: `pnpm lint:docstrings`(템플릿 밖 섹션 0 · 차트 Metrics ✅ 0 차단 · 깊이 래칫 `docstring-baseline.json`).
  - `tokens.json` — **기계 판독 토큰 카탈로그(자동 생성 · 직접 편집 금지).** 토큰별 tier·값·다크값·`@role`/`@use`/`@avoid`·유틸 클래스·사용 컴포넌트 · `@distinct <집합>` 을 선언한 토큰은 그 집합과의 **측정된 변별**(`distinctFrom`, 차트 계열 ↔ Severity). `scripts/build-tokens-json.mjs` 가 **`whatap-ds.css` 의 선언 + 그 위 주석**에서 유도하고 MCP `get_tokens`·`search_tokens` 가 이걸 읽는다 — 의미를 다른 파일에 두지 않는다. 강제: `pnpm lint:token-docs`(전 토큰 `@role` 필수, 동결선 0).
  - `STORIES_ROADMAP.md` — Storybook 카탈로그 추가 작업 목록

## 카탈로그 — 단일 3-Layer 체계 (Primitives · Composite · Shell)

Storybook 좌측 트리는 **컴포넌트 3계층과 동일한 기준**으로 분류한다. (구 `Chrome` / `WhaTap AI` / `Foundation` / `Page` 카테고리는 폐지 → 계층으로 흡수.) AI 전용 에셋은 폐지하지 않고 **각 계층 안 `Ai/` 접두 하위그룹**으로 묶어 발견성을 유지한다.

| 카탈로그 그룹 | 의미 | 소스 | 예 |
|---|---|---|---|
| **Primitives/** | 자체 렌더 리프. 다른 DS 컴포넌트 import 0 | `src/` 루트 · `src/widget/`(리프) | Button, TextField, Select, Chip, Tabs, Modal, Tooltip, Toast, Checkbox, Switch, DataTableRow, SidebarMenuItem … |
| **Primitives/Ai/** | AI 위젯 리프 프리미티브 | `src/widget/` | AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList, AiSymbol, AiUserBubble, ReasoningStep … |
| **Composite/** | 프리미티브를 1단계 조합 | `src/` 루트 | PageHeader, PageHeaderAiInline, Sidebar, FilterBar, DataTable, FilterDropdown, Tabs, ThemeToggle … |
| **Composite/Ai/** | AI 진입·응답 합성 위젯 | `src/widget/` | AiChatExchange, AiReasoning, AiDashboardProposal, AiCostTable, InlinePrompt, PromptInput, SendButton … |
| **`Chart/` 하위 그룹** (Primitives · Composite 안) | 데이터 시각화(차트 · 게이지 · 히트맵). 계층 안 하위 폴더 — `Ai/` 와 같은 방식. Primitives/Chart = 차트를 이루는 요소, Composite/Chart = 요소를 조합한 차트(26유형 모두 여기, patterns §21 계획표) | `src/chart/`(`./chart` 진입점) · `src/widget/UsageChart` | Primitives/Chart/ChartGrid · ChartValueAxis · ChartBar …, Composite/Chart/MiniLineChart · Heatmap · ScatterHeatmap … |
| **Shell/** | 최종 조립 진입점 | `src/` · `src/widget/` | DashboardLayout, Ai/Widget(WhaTapAiWidget), Page/(A~D 페이지 합성 템플릿) |
| **Tokens** (메타) | `:root` 컬러·폰트·spacing 변수 (참조용; 런타임은 whatap-ds.css) | `src/tokens.css` | Color, Type Scale, Tones … |

> 카탈로그 그룹명과 아키텍처 계층명은 **동일 용어**(Primitives/Composite/Shell)로 통일한다. `PageHeaderAiInline` 은 헤더 레이아웃(프리미티브 조합)이므로 `Ai/` 가 아닌 `Composite/` 에 둔다.

**AI 영역 ↔ 일반 영역 분리 원칙**

- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** 사용 (AiInlinePrompt / AiSendButton / AiAssistantButton)
- 일반 폼/검색은 TextField·Button
- 페이지의 AI 진입점은 **버튼 대신 AiInlinePrompt 직접 주입 (2-step → 1-step)**
- **카탈로그 분류와 소스 트리는 같이 움직인다** — `Primitives/Ai/`·`Composite/Ai/` 로 분류했으면 소스도 `src/widget/` 에 둔다(Shell 은 위 표대로 두 트리 허용). 강제: `pnpm lint:ai-boundary`. `check-catalog-folders` 는 `stories/` 안만 보므로 이 기준을 볼 수 없다 — 실제로 4종이 카탈로그는 `Ai/`, 소스는 루트인 상태로 있었다. 같은 게이트가 `components.json` 의 `importFrom` 이 **배럴이 실제로 export 하는 진입점**인지도 검산한다.

## 아키텍처 — 2-Tier Token + 3-Layer Component

### 🔒 도메인 접두어 — 3-Prefix 네이밍 컨벤션

> **이 정책은 불변(immutable)입니다. 신규 CSS 클래스 · 토큰 · 컴포넌트 추가 시 반드시 준수.**

모든 DS 에셋(CSS 클래스 · 토큰 · TSX 컴포넌트)은 **소비 도메인**에 따라 3개 접두어 중 하나를 쓴다. 사람과 AI 모두 클래스명만 보고 도메인 경계를 즉시 판별할 수 있어야 한다.

| Prefix | 도메인 | 의미 | 토큰 예 | 클래스 예 | TSX 예 |
|---|---|---|---|---|---|
| **`wds-web-`** | 마케팅 (www) | 로그인 전 · 공개 페이지 | `--color-web-*`, `--text-web-*`, `--radius-web-*` | `wds-web-mega-menu`, `wds-web-hero-banner`, `wds-web-cta` | `WebCtaButton`, `LandingHeader` |
| **`wds-chart-`** | 데이터 시각화 | 차트 · 그래프 · 게이지 · 히트맵 | `--color-chart-series-*`, `--color-chart-seq-*` | `wds-chart-mini-line`, `wds-chart-heatmap`, `wds-chart-arc` | `MiniLineChart`, `Heatmap`, `ScatterHeatmap` |
| **`wds-`** | SaaS (app) | 로그인 후 · 제품 UI (기본값) | `--color-*`, `--wds-btn-*` | `wds-sidebar`, `wds-page-header` | `Sidebar`, `PageHeader`, `Button` |

**규칙:**

1. **접두어는 소비 도메인이 결정한다.** 컴포넌트의 기술 특성(CSS-only vs TSX, Primitives vs Composite)이 아니라 **어디서 쓰이는가**가 기준이다.
2. **기본값은 `wds-`(SaaS).** 130+ 기존 컴포넌트는 변경하지 않는다. 마케팅과 차트가 소수이므로 소수 쪽에 표식을 붙인다.
3. **토큰과 클래스 접두어가 정렬돼야 한다.** `wds-web-*` 클래스 안에서는 `--color-web-*` · `--*-web-*` 토큰을 쓴다. `wds-chart-*` 클래스 안에서는 `--color-chart-*` 토큰을 쓴다. 교차 참조는 lint 위반이다.
4. **경계 위반 lint.** 정규식 한 줄로 잡는다:
   - 마케팅 컴포넌트가 SaaS 전용 레이아웃 토큰(`--wds-page-px` 등)을 참조 → 위반
   - SaaS 컴포넌트가 `--color-web-*` 를 참조 → 위반
   - 일반 UI 에서 `--color-chart-series-*` 를 끌어다 씀 → 위반
5. **Storybook 카탈로그 그룹.** 마케팅 컴포넌트는 `Shell/Web · *` 또는 `Primitives/Web · *` 로, 차트(데이터 시각화)는 **하위 그룹 `Primitives/Chart/*` · `Composite/Chart/*`** 로 묶는다 — 요소는 Primitives/Chart, 요소를 조합한 차트는 Composite/Chart(2026-10-22 개정, 사용자 결정. 이전 `Chart ·` 메뉴명 접두는 `Ai/` 하위 그룹과 규칙이 둘이었고 폴더로 접히지 않았다). 계층은 첫 세그먼트 그대로이고, 스토리 파일은 `stories/<계층>/Chart/` 에 둔다(`check-catalog-folders`). `component:` 이름은 바뀌지 않는다. 스토리 id 는 `primitives-chart-chartgrid` · `composite-chart-minilinechart`. 일반(공통) 컴포넌트는 계층 바로 아래 — `Common` 같은 별도 그룹을 두지 않는다.

**현재 이름 → 정책 정렬 대상 (마이그레이션):**

| 현재 | → 정책 정렬 | 비고 |
|---|---|---|
| `wds-mega-menu` | `wds-web-mega-menu` | 마케팅 GNB 메가 메뉴 |
| `wds-hero-banner` | `wds-web-hero-banner` | 마케팅 히어로 배너 |
| `wds-landing-header` | `wds-web-landing-header` | 마케팅 공개 페이지 헤더 |
| `wds-web-cta` | 그대로 | 이미 정렬됨 |
| `MiniLineChart` 등 차트 | CSS 클래스에 `wds-chart-` 적용 | TSX 컴포넌트명은 유지 |

> 마이그레이션은 **별도 PR** 로 진행한다. 이 문서에 정책을 명문화하는 것과 실제 리네이밍은 분리한다.

### 토큰 2계층

| Tier | 역할 | 명명 규칙 | 예 |
|---|---|---|---|
| **Global** | 원시 팔레트 · 스케일 · 시스템 값 | 값 자체가 이름 | `--color-gray-50`, `--text-xs`, `--spacing`, `--radius-md` |
| **Semantic** | 의미 · 역할 · 의도 | 용도가 이름 | `--color-brand-blue`, `--color-text-primary`, `--color-status-error`, `--color-bg` |

- UI 컴포넌트는 **Semantic 토큰만 참조**. Global 직접 참조 금지.
- Component 토큰(3계층)은 variant×tone 조합이 복잡한 것만 선택 도입 (`--wds-btn-*`).
- 차트 색은 **역할 토큰**으로 고른다 — `--color-chart-series-1..8`(계열 정체성, 고정 순서·순환 금지) · `--color-chart-seq-1..4`(크기/강도). 구 `--color-palette-{hex}` 36색은 폐지(값이 이름이라 선택 규칙이 없고 다크가 없었다). all-pairs 상한 3슬롯 — scatter/bubble/map/small-multiples 는 3계열까지, 그 이상은 facet. 계열 색은 Severity · info 와도 정상시야 ΔE ≥ 15 (§23). 팔레트 조건은 **`pnpm lint:chart-palette`**(`pnpm test` 포함)가 런타임 값으로 집행한다 — 대역 · 채도 · 대비 · 인접 · 1~3 전체 · 엔티티 순서 · Severity · 사본(`tokens.css` 라이트 · 다크, `DESIGN.md`) 일치. 측정값은 문서에 옮겨 적지 않는다(정본: 게이트 출력 · `tokens.json` `distinctFrom`). 새 후보를 고를 때도 눈으로 판단 금지. 전문: `docs/tokens.md` → Chart · 규칙 정본: `docs/patterns.md` §17~23(색 역할 · 3계열 상한 · 이중 축 · 검증기 · 레거시 흡수 · 많은 계열 · Severity 변별).

**🔒 페이지 좌·우 거터 — 단일 토큰 규칙 (`--wds-page-px`)**
- 페이지의 좌·우 거터는 **단 하나의 토큰 `--wds-page-px`(24px)** 이 소유한다. 헤더(`--wds-header-px`)·옵션바·본문(`--wds-content-px`)은 모두 이 값을 **alias 로 참조** → 한 곳만 바꾸면 헤더·옵션바·테이블 가장자리가 함께 정렬된다.
- 본문 콘텐츠 블록 패딩은 인라인 `padding:16` 같은 **매직넘버 금지**. 등록된 유틸 클래스 **`.wds-page-content`**(`padding-block: --wds-content-py(16px)` + `padding-inline: --wds-content-px`)를 쓴다.
- 헤더류는 `style={{ paddingInline: "var(--wds-header-px)" }}` 패턴(PageHeader · SubHeaderBar · PageHeaderAiInline · OptionbarPage 동일).

### 컴포넌트 3계층 — Primitives · Composite · Shell

카탈로그 그룹명과 **동일 용어**. (구 명칭 `Foundation` → `Primitives` 로 통일.)

| Layer | 역할 | 조합 규칙 | 수량(카탈로그) |
|---|---|---|---|
| **Primitives** | 단독 렌더. 다른 DS 컴포넌트를 import 하지 않음 — 단 **리프 Primitive 1개** 합성은 허용(아래 예외) | — | 75 (Ai/ 포함) |
| **Composite** | Primitives 를 1단계 조합 | Primitives 만 import. **Composite 끼리 import 금지** | 34 (Ai/ 포함) |
| **Shell** | Composite + Primitives 를 최종 조립하는 진입점 | 모든 계층 import 가능 | 6 (DashboardLayout · Ai/Widget · Page A·B·D · TopologyOverview) |

**Primitives** — Checkbox, Chip, TextField, Select, Tabs, Modal, Tooltip, Toast, Button, Switch, DataTable, ChartGrid, ChartValueAxis, LiveTimerCompact, AiCard, AiCaption … + **인라인 추출 Parts**(SidebarMenuItem · PageHeaderNotificationItem · PageHeaderProfileMenuItem · ProductRailItem · BottomRailItem · TabButton · CostBreakdownRow · ClassificationTableRow · CostTableRow · PlanProposalRow · EventListItem · ReasoningStep · TimelineStepItem · CriteriaGroup · ReceiverChannelItem · DataTableRow · AiActionChip · AiAttachmentChip · AiQuickActionChip)

**Composite** — FilterBar · PageHeader · PageHeaderAiInline · OptionbarPage · Sidebar(=SidebarMenuItem) · ThemeToggle · AiChatExchange · AiReasoning · InlinePrompt · 값축 차트 4종(MiniLineChart · MiniMultiLineChart · MiniBarChart · ForecastLineChart = ChartGrid + ChartValueAxis) … + **추출 Parts**(FilterDropdownOptionItem · FilterChipItem · CriteriaOptionButton · ProposalSection · AiAlertRulePreview)

**Shell** — DashboardLayout(=Sidebar) · WhaTapAiWidget(`Shell/Ai/Widget`) · Page 합성 템플릿(A 기본 대시보드 · B AI 전용 · D 상세)

**리프 1개 예외 (2026-10-23 사용자 결정).** Primitive 는 **리프 Primitive 를 최대 1개** 런타임 import 할 수 있다. "리프" = 스스로는 DS 컴포넌트를 하나도 값 import 하지 않는 Primitive(Tooltip · Switch · Chip 등). 예: `SidebarMenuItem`·`ProductRailItem`·`BottomRailItem`·`DataTableRow`·`AiTriggerButton` → [[Tooltip]], `ReceiverChannelItem` → [[Switch]].
- **왜:** 규칙대로 Composite 로 올리면 소비 부모(`Sidebar`·`AiReceiverChannels` 등 Composite)가 *Composite 끼리 import 금지* 에 걸려 Shell 까지 연쇄 승격된다 — 위젯 카드가 Shell 이 되는 것은 의미상 틀리다. 부모가 컨트롤을 슬롯으로 주입하는 대안은 상태를 두 경로가 서술하고 `ReactNode` 슬롯이 가짜 컨트롤도 받아 기각했다.
- **넘으면 Composite:** 리프가 아닌 Primitive 를 쓰거나(2단 합성) 2개 이상을 쓰면 예외 밖이다. `import type` 은 세지 않는다.
- **강제:** `pnpm lint:layers`(`check-layer-deps`, `pnpm test` 포함) — 예외 안은 정보, 밖은 error.

**신규 컴포넌트 추가 시 반드시 계층을 명시.** Composite 가 다른 Composite 를 import 하면 Shell 로 승격하거나 구조 분리. AI 전용이면 카탈로그 title 을 `<Layer>/Ai/<Name>` 으로 둔다.

### 🔒 글로벌 정책 — 구조는 인라인 금지 (컴포넌트로 추출)

**모든 컴포넌트/위젯의 구조는 인라인 JSX 로 흩어 두지 않는다.** 반복되거나 의미 단위가 분명한 구조(목록 행·카드·셀·항목 등)는 `map` 내부에 인라인으로 펼치지 말고 **독립 컴포넌트로 추출**한다. (예: Sidebar 의 메뉴 행 → [[SidebarMenuItem]] Primitives 로 분리.)

- 새 구조 단위를 인라인으로 만들기 전에 **컴포넌트로 추출 가능한지 먼저 검토** — 추출이 기본.
- 추출된 컴포넌트는 계층 명시 + docstring(4섹션) + story + `index.ts` export + 카탈로그 동기.
- 인라인 허용은 **재사용 없는 1회성 레이아웃 래퍼**(flex 컨테이너 등)에 한함.
- **적용 현황(2026-06-17):** 위젯·chrome 의 반복 인라인 구조 23종을 컴포넌트로 추출 완료 — 추출 Parts 는 각자 계층에 맞춰 `Primitives/*`(리프 행·칩·항목) 또는 `Composite/*`(조합 단위)에 등록(`index.ts` export + story). 테이블 행·스텝·칩·메뉴 항목 등.

### 🔒 불변 정책 — 색 리터럴 0 (Zero Literal)

> **이 정책은 불변(immutable)입니다. 동결선은 0이며 되돌리지 않습니다.**

`src/` · `stories/` · `.storybook/` **전 범위**에 색 리터럴이 존재하지 않는다. 카탈로그도 예외가 아니다 — 디자인 시스템이 가르치는 예시가 위반이면 정책은 이미 죽은 것이다.

**금지 대상 (4종)** — 이름이 다를 뿐 전부 같은 위반이다.

| # | 형태 | 예 |
|---|---|---|
| 1 | hex 리터럴 | `#fff` · `#F5F5F5` · `#ffffffcc` |
| 2 | rgb()/rgba() 리터럴 | `rgba(0,0,0,.5)` |
| 3 | 고정색 유틸 클래스 | `bg-white` · `text-black` · `border-white` |
| 4 | **값이 이름에 박힌 유틸** | `bg-ce5484d` · `border-cd3d3d3` · `bg-rgba-0-0-0-0_05` · `shadow-0_4px_16px_rgba-...` |

**3중 게이트** — 하나만으로는 막히지 않는다는 것이 실측으로 드러났다.

1. **`npm run lint:tokens`** (소스) — 위 4종을 스캔. 신규 위반은 `exit 1`.
   **`--update` 는 위반이 있으면 거부한다** — 동결선 0을 되돌리는 길 자체를 막는다.
2. **`npm run audit:runtime`** (렌더된 DOM) — Storybook 전 스토리에 `devPolicyGuard` 를 태운다.
   소스에 리터럴이 없는데 DOM 에는 박히는 경로가 실제로 있었다: `_tokens.ts`(게이트 면제)의
   hex 를 `TONE_DOT[tone]` 로 참조해 인라인 주입 → DOM 에 `rgb(229,57,53)`. **44건이 이렇게
   숨어 있었고 다크에서 뒤집히지 않았다.** 소스 스캔으로는 원리적으로 볼 수 없다.
3. **`npm run test:visual`** — 라이트/다크 스냅샷. 위젯 tone/표면을 포함해야 한다.
   위젯 커버리지가 없어서 "밝은 배경 위 밝은 글자" 판독 불가를 **두 번** 놓쳤다.

> ⚠️ **"게이트가 있다"와 "CI 가 그걸 부른다"는 다른 말이다.** 2026-08-11 이전까지 위 2·3번은
> **어느 워크플로도 부르지 않았고**, 이 문서만 "3중 게이트"라고 가르치고 있었다. 지금은 셋 다
> PR CI 에 배선돼 있다 — 단 `test:visual` 은 **비차단**이다(기준선 PNG 가 macOS 산이라 ubuntu
> 폰트와 허용치 0.5% 를 넘긴다. 차단 승격 조건은 기준선을 리눅스에서 재생성하는 것).
> 이 부류의 재발은 **`guardrails-meta` 게이트**가 막는다 — 명부에서 `status: "auto"` 인 게이트가
> PR 워크플로에서 도달 불가하면 빌드를 멈춘다. 명부는 `scripts/gate-roster.mjs`.

**허용 예외는 2종뿐.** 그 외에 예외는 없다.

- **컬러 배경 위 고정 흰색 전경** — contained 버튼 · solid chip · 그라데이션 헤더/아바타 · 원형 배지 안 체크 · switch knob. 테마와 무관하게 흰색이어야 하므로 유지한다.
- **`mask` 의 알파 지정** — 색이 아니라 불투명/투명을 뜻한다.

**예외는 두 채널에 동시에 표기한다.** 하나만 달면 다른 게이트가 잡는다.

```tsx
<button
  data-ds-policy-ok="컬러 위 고정 흰색 전경"   // ← 런타임 가드용
  // raw-color-ok: contained 버튼 — tone 원색 배경 위 고정 흰색 전경.   ← 소스 게이트용
  style={{ "--wds-btn-fg": "#fff" }}
/>
```

⚠️ 사유 주석은 **리터럴 줄 바로 위**여야 한다(게이트는 같은 줄/윗줄만 본다). 사이에 다른 속성을 끼우면 면제가 깨진다. 사유 문구 안에 hex 를 쓰지 말 것 — 그것도 리터럴로 잡힌다.

**TS 토큰을 인라인 주입할 때는 `.value` 가 아니라 `.cssVar`.** `.dark` 는 CSS 변수만 재매핑하므로 hex 를 박으면 다크가 따라오지 않는다. `TONE_BG` · `TONE_DOT` · `TONE_TEXT` 는 이미 `cssVar` 기반이다.

```tsx
style={{ background: tokens.color.surface.critical.cssVar }}   // ✅ 다크 따라옴
style={{ background: tokens.color.surface.critical.value }}     // ❌ 라이트 hex 가 박힘
```

**카탈로그는 값을 복제하지 않는다.** 토큰 스토리는 `stories/_useTokens.ts` 로 `:root` 를 런타임 열거해 계산값을 읽는다 → 토큰을 추가하면 자동 등장, 값을 바꾸면 자동 반영, 다크는 다크 값 표시. 카탈로그가 소유하는 것은 **값이 아니라 의미(용도 설명)** 뿐이다.

**토큰이 없어서 리터럴을 쓴다는 것은 성립하지 않는다.** 토큰 부재는 리터럴의 근거가 아니라 **토큰 추가의 근거**다. 새 색이 필요하면:
`tokens.css` → `whatap-ds.css`(:root + `.dark`, **선언 위에 `@role` 주석 필수** — 없으면 `lint:token-docs` 가 차단한다) → `DESIGN.md` → 필요시 `_tokens.ts`(`value` + `cssVar`) 순으로 **먼저** 추가하고, 그 다음 컴포넌트가 참조한다. **값이 아니라 역할로 명명**한다(`--shadow-md` ⭕ / `--shadow-0-8-24` ❌).

## 스타일 — 일반 CSS (Tailwind 미사용 · 흔적 0)

런타임 스타일은 외부 CSS 프레임워크 흔적이 0인 **자체 소유 일반 CSS** `src/whatap-ds.css` (= export `./style.css`·`./whatap-ds.css`). 내부에 `--tw-*`·`.foo-\[…\]`(escape 클래스명) 없음. `@property` 는 각도 보간용 네이티브 1곳(`--glow-angle`)만 있고 `@layer base` 와 같은 방식으로 줄 단위 면제된다 — 프레임워크 산출물이 아니다. 유틸 클래스명은 escape 없는 일반 식별자(`gap-4px`·`hover-opacity-70` 등).

**`@layer base` 는 한 곳에 의도적으로 있다** — preflight 전역 reset 전용이다. 이 파일은 unlayered 로 import 되는데 reset 까지 unlayered 면 **소비자 쪽** utility 를 cascade 에서 이겨 소비 페이지 스타일을 무력화한다. 그래서 preflight 만 base 레이어로 내렸다(아래 utilities 섹션은 unlayered 유지). 프레임워크 산출물이 아니라 네이티브 cascade layer 다. `npm run lint:no-tailwind` 가 이 한 줄만 `/* no-tailwind-ok: … */` 로 면제하고 나머지 `@layer`·Tailwind 의존성·설정 파일·`--tw-*` 는 전부 차단한다(면제는 **줄 단위**라 새 `@layer` 는 그대로 잡힌다).

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
| `text-base` (12px) | `font-medium` | 항목 라벨·메타·dropdown 항목 |
| `text-sm` (11px) | `font-medium` 또는 regular | 폼 필드 라벨(medium)·보조 메타·캡션 |
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
| `body.label` | 목록·dropdown 항목 라벨 | `text-base font-medium` |
| `field.label` | 폼 라벨 — 입력칸·셀렉트·라디오/체크박스 **묶음** 모두 한 벌 (patterns §27) | `text-sm font-medium text-primary` (비활성 `text-tertiary`) |
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

> 근거·경계(실패 시 되돌리기, 저장 버튼 금지)는 `docs/patterns.md` → **P3. 즉시 반영 vs 폼 제출** 이 정본. 표만 여기 둔다.

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

### 🔒 불변 정책 — 신규 컴포넌트는 세 정본에 함께 (코드 · Storybook · Figma)

> **이 정책은 불변(immutable)입니다. 예외 없음.** (2026-10-07 사용자 지시)

신규 컴포넌트(그리고 그 컴포넌트가 새로 요구하는 토큰 · 텍스트 스타일 · 아이콘)는 **세 정본에 같은 모양으로, 카탈로그 정보와 함께** 들어간다. 하나라도 빠지면 «추가» 가 끝난 것이 아니다.

| 정본 | 들어가야 하는 것 |
|---|---|
| **코드** | `src/` 컴포넌트 · docstring 4섹션(Purpose · When to use · When NOT to use · Composition rules) · 차트면 `## Metrics`(맞는 지표 ✅ 필수 · 금지 지표 ❌) · 개발자가 그대로 구현할 값이 있으면 `## Spec`(치수 · 토큰 · 상태 · 데이터 계약. `components.json` `spec` → MCP `get_component` · 스토리는 `stories/_spec.ts` `withSpec` 로 Docs 탭에) · `index.ts` export · 필요한 CSS · 토큰 |
| **Storybook** | 계층 title 의 스토리(변형 · 상태마다) · autodocs 설명 |
| **Figma 정본** (`2LktjSjKZDnCuWo5CQ6828`) | 컴포넌트 페이지 · 세트(코드 prop 과 같은 기준의 variant · property · slot) · 색 · 여백 · 반경 · 글자는 WDS 변수 · 스타일 연결(미연결 0) · 설명(출처 · 코드 경로 · Figma 구현 노트) · 📄 문서 프레임 · 라이브러리 게시 · **차트면 설명과 📄 문서 프레임 둘 다에 «📈 사용 지표 · 🚫 사용 제한 지표»**(docstring `## Metrics` 와 같은 문장, 2026-10-23 사용자 지시) |
| **카탈로그** (AI 가 읽고 실행하는 자리) | `docs/*-components.md` 또는 `primitives.md` 등재 · 정책이 걸리면 `patterns.md` · 필요하면 `SKILL.md` · `GUIDE.md` · `static/public/llms.txt` · 생성물(`components.json` · `policies.json` · `DESIGN.md`)은 `pnpm build:design` 으로 확인 |

- 세 정본은 **같은 PR 흐름**에서 맞춘다. 코드만 먼저 병합하고 Figma 를 나중에 두지 않는다 — AI 는 카탈로그를 읽고 그대로 실행하므로, 한쪽에만 있는 컴포넌트는 다른 쪽에서 «없는 것» 으로 다시 만들어진다.
- 한쪽 정본에 **없는 의존**(Figma 에 없는 하위 컴포넌트 · 텍스트 스타일 · 아이콘)을 만나면 근사하지 말고 그 의존부터 세 정본에 넣는다.
- 의존을 넣다가 **다른 정책과 부딪히면**(예: 타이포 위계 §10) 의존을 그대로 옮기지 말고 어느 쪽을 고칠지 먼저 정한다.
- Figma 게시는 플러그인 API 로 할 수 없다. 사람이 게시해야 하므로 PR 본문에 「게시 필요」 를 적는다.

### 🔒 핵심 정책 — Figma ↔ Storybook 1:1 매핑과 링크를 항상 유지

> **이 정책은 불변(immutable)입니다.** (2026-10-22 사용자 지시 — «항상 유지 · 핵심 정책»)

정본 Figma 의 컴포넌트와 Storybook 문서 페이지는 **1:1** 로 짝지어지고, Figma 컴포넌트의 **문서 링크(`documentationLinks`)에 그 Storybook 주소**가 들어 있다. 한쪽에만 있는 컴포넌트 · 이름이 다른 짝 · 링크 없는 컴포넌트는 결함이다.

- **원장:** `docs/figma-map.json` — 카탈로그 컴포넌트마다 Figma 노드 id(아직 없으면 `null`). Figma 에만 있는 하위 부품(셀 · 옵션 행 등)은 `figmaParts` 에 부모 문서와 함께.
- **게이트:** `pnpm lint:figma-map`(`pnpm test` 포함) — 카탈로그 전부가 원장에 있는지 · 원장에만 있는 키가 없는지 · `null` 이 동결선(`scripts/figma-map-baseline.json`)보다 늘지 않는지. CI 에는 Figma 접근이 없으므로 노드 존재와 링크 값은 Figma 플러그인으로 대조한다.
- **링크 주소:** `https://whatap-design-system-storybook.vercel.app` + `components.json` 의 `docsUrl`.
- **언제 갱신하나:** 컴포넌트 신설 · 이름 변경 · 계층 이동(스토리 id 변경) 때 같은 흐름에서 원장과 Figma 링크를 고친다. 스토리 id 가 바뀌는 PR 은 **병합 · 배포 뒤** 링크를 다시 건다 — 배포 전 주소를 걸면 링크가 깨진다.
- 아이콘 · 에셋 · `_` 접두 내부 컴포넌트 · deprecated 페이지 · 시안 주석 장치(FlowNote)는 짝 대상이 아니다.
- **Figma 페이지 목록 = Storybook 좌측 트리**(2026-10-26 사용자 결정 — 학습 비용 0). 구분선 `——— TOKENS / PRIMITIVES / COMPOSITE / SHELL ———` 아래에 Storybook 과 같은 순서(메뉴명 알파벳순)로, 페이지 이름은 **Storybook 메뉴명**(`Card` — 컴포넌트 이름 `AiCard` 은 그대로). 하위 폴더(`Chart/`)는 `▾ Chart` 페이지 아래 들여쓴 페이지들. 컴포넌트 하나 = 페이지 하나 — 부품(행 · 항목)도 부모 페이지에 함께 두지 않는다. Storybook 밖 페이지(Code Connect · 예시 · 템플릿 · 아이콘 · deprecated · FlowNote)는 맨 끝 `——— 참고 · Storybook 밖 ———`. 새 컴포넌트 페이지는 만들 때 그 자리에 끼운다.

### 🔒 정책 — «§» 절 참조: 저장소는 유지 · Figma 는 쓰지 않는다

> (2026-10-26 사용자 결정 — «저장소(코드 · 문서)에는 유지 정책»)

| 자리 | «§N» 참조 | 이유 |
|---|---|---|
| **저장소** — docstring · `docs/*.md` · `static/public/llms.txt` · 스토리 · 검사 출력 | **유지한다.** 지우는 정리를 하지 않는다 | 규칙 → `patterns.md` 근거 절로 가는 링크다. docstring 은 MCP(`get_component` · `search_components`)로 AI 에 그대로 배달되고, 번호는 «기존 번호 유지» 고정 식별자라 깨지지 않는다 |
| **Figma** — 컴포넌트 설명 · 📄 문서 프레임 · 레이어 이름 | **쓰지 않는다**(2026-10-26 일괄 삭제, 0개) | 디자이너는 `patterns.md` 를 열지 않는다 — Figma 에서 «(§21)» 은 뜻 없는 기호다 |

- docstring 문장을 Figma 설명으로 옮길 때는 «§» 를 빼고 **규칙 문장만** 옮긴다. 빼서 문장이 깨지면 절 이름을 낱말로 쓴다(«patterns §10 과 어긋난다» → «타이포 위계와 어긋난다»).

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

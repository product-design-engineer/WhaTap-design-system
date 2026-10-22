# Chrome (페이지 골격) Components — 31 컴포넌트

> 원본: `src/` (interfacedesigner/WhaTap-design-system)

페이지 단위 레이아웃·도구·표시 컴포넌트. 위젯(AI Assistant) 외부의 모든 SaaS 화면 골격이 이 카탈로그 안에 있습니다.

> **카탈로그 위치:** "Chrome" 은 *페이지 골격*을 가리키는 개념 묶음일 뿐, 별도 Storybook 카테고리가 아니다. 3-Layer 트리에서는 조합 단위(`PageHeader` · `Sidebar` · `DataTable` · `FilterBar` · `FilterDropdown` · `OptionbarPage`)는 **`Composite/`**, 리프(`Toast` · `Stage` · `MiniLineChart` · `LiveTimerCompact` · `Button` 등)는 **`Primitives/`**, 최상위 조립(`DashboardLayout`)은 **`Shell/`** 에 위치한다.

> **Enterprise 시나리오 신규 정책/prop**(2026-06): `Sidebar`(`MenuItem.children[].onClick`, `OrgContext.badge`, 아이콘-없음 12px 스페이서) · `PageHeader`(`profileMenu`, `roleBadge`=드롭다운 헤더, `notifications` 벨 인디케이터) · `SubHeaderBar` · 토큰 색상/48px 헤더/사용자 메뉴 일원화/컨텍스트 정합성 정책 → **[`enterprise-changes.md`](./enterprise-changes.md)** 참조.

**조립 순서:** `DashboardLayout` → `Sidebar` + `header` 슬롯 (`PageHeader` 또는 `PageHeaderAiInline` + 옵션으로 `OptionbarPage` 또는 `FilterBar`) + `main` 슬롯 + 자식으로 `WhaTapAiWidget`

## 카탈로그 (32)

| 영역 | 컴포넌트 |
|---|---|
| 레이아웃 | DashboardLayout · Sidebar · PageHeader · PageHeaderAiInline · SubHeaderBar |
| 옵션바 (시간/인스턴스/프리셋) | OptionbarPage · OptionbarInstanceSelector · LiveTimerCompact · TimeRangeSelector · PresetSelect |
| 데이터 표시 | WidgetFrame · CardHead · DataTable · FilterBar · EventWeekTimeMatrix |
| 대시보드 차트 (`frame={false}` 로 WidgetFrame 안에) | MiniLineChart · MiniMultiLineChart · MiniBarChart · ApdexChart · ForecastLineChart · BarList · MiniDonutChart · KpiCard · HexGrid |
| 액션·진입 | Button · AiSymbol |
| 알림·상태 | Toast · ConfirmDialog · InfoTip · Stage · DashboardBuildingProgress |
| 위젯 컨텍스트 | WhaTapAiContext (Provider) |

---

## DashboardLayout

240px Sidebar + 우측 콘텐츠 2컬럼 레이아웃. AI 위젯이 열리면 사이드바를 40px 레일로 자동 축소합니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 보통 `<WhaTapAiWidget>` 등 floating 자식 |
| `header` | `ReactNode` | — | 상단 헤더 슬롯 (`PageHeader` + `OptionbarPage`) |
| `main` | `ReactNode` | — | 본문 슬롯 |
| `widgetOpen` | `boolean` | `false` | true면 사이드바가 40px 레일로 축소 ([patterns.md](./patterns.md#2-sidebar-collapse-on-widget-open)) |
| `activeProduct` | `string` | — | 현재 활성 제품 (사이드바 강조용) |
| `project` | `ProjectContext` | `DEFAULT_PROJECT` | 조직/프로젝트 컨텍스트 |
| `menu` | `MenuItem[]` | `K8S_GPU_MENU` | 사이드바 메뉴 트리 |

---

## Sidebar

240px (collapsed 시 40px) WhaTap 사이드바. 로고 + 조직/프로젝트 스위처 + 메뉴 트리 + 우측 제품 레일.

```ts
export type MenuItem = {
  icon: string;
  label: string;
  children?: { label: string; active?: boolean; onClick?: () => void }[]; // onClick: 하위 항목 네비게이션
  expanded?: boolean;      // onToggle 없으면 «초기값» — 그 뒤엔 행을 눌러 사용자가 접고 편다
  onToggle?: (expanded: boolean) => void; // 주면 제어 모드 — 호출부가 expanded 를 갱신해야 바뀐다
  active?: boolean;        // 단일 항목 active 강조
  onClick?: () => void;    // 단일 항목 클릭
};

export type ProjectContext = {
  productIcon?: string;    // 미지정 시 12px 스페이서(빈 영역 금지)
  groupLabel: string;
  projectLabel: string;
};

export type OrgContext = { label: string; icon?: string; badge?: string }; // badge: 컨텍스트 칩(예: "엔터프라이즈")
```

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `activeProduct` | `string` | `"gpu"` | 제품 레일 강조 |
| `project` | `ProjectContext` | `DEFAULT_PROJECT` | 프로젝트 스위처 컨텍스트 |
| `menu` | `MenuItem[]` | `K8S_GPU_MENU` | 메뉴 트리 |
| `collapsed` | `boolean` | `false` | 제품 레일만 남기고 축소 |
| `hideProjectSwitcher` | `boolean` | `false` | 상단 프로젝트 스위처(productIcon + group/project 라벨 + chevron) 숨김 |
| `org` | `OrgContext \| null` | `DEFAULT_ORG` | 상단 조직 스위처. `null`이면 숨김. `badge`로 컨텍스트 칩(예: "엔터프라이즈") |
| `onOrgClick` | `() => void` | — | 조직 스위처 클릭(엔터프라이즈 선택/전환 등) |
| `hideProductRail` | `boolean` | `false` | 우측 제품 레일 숨김(테넌트 상위·계정 영역) |

**메뉴 하위 항목 네비게이션:** `MenuItem.children[].onClick`으로 그룹(예: "관리 ▾") 하위 항목도 라우팅 진입점이 된다(`expanded: true` + 각 child `onClick`).
**펼침은 컴포넌트가 갖는다:** 부모 행을 누르면 접히고 펴진다. `expanded` 는 초기값이므로 호출부는 아무것도 하지 않아도 된다. caret 이 보이는데 눌리지 않으면 사용자는 고장으로 읽으므로 이것이 기본 동작이다. 라우팅이 펼침을 정해야 할 때만 `onToggle` 을 주고(제어 모드) 호출부가 `expanded` 를 갱신한다. **메뉴 트리는 1단(부모 → 자식)까지다** — 「관리 → 구독 · 결제 → 화면들」 같은 3단은 만들 수 없으므로 중간 층을 없애고 자식 라벨이 스스로를 설명하게 쓴다.
**스위처 컨텍스트 뱃지:** `org.badge`는 **토큰** 칩으로 렌더 — `bg-[var(--color-brand-blue-bg)] text-[color:var(--color-brand-blue)]`(하드코딩 hex 금지). `org.icon` 미지정 시 라벨 좌측은 **12px 스페이서**(빈 40px 박스 금지).

`collapsed=true`일 때 사이드바는 제품 레일만 남기고 다 숨깁니다. AI 위젯이 열렸을 때의 표준 동작 — 보통 `DashboardLayout`이 자동으로 이 prop을 전달합니다.

**프로젝트 스위처 노출 규칙:** 상단 프로젝트/조직 스위처는 **프로젝트 컨텍스트가 있을 때만** 노출합니다. 컨텍스트가 없는 화면(엔터프라이즈 활성화 전, 계정/관리 영역 등)은 `hideProjectSwitcher`(프로젝트)·`org={null}`(조직)로 숨겨 **빈 라벨/기본값 노출을 금지**합니다. 기본값(`false` / `DEFAULT_ORG`)이라 기존 호출처 동작은 불변. `DashboardLayout`도 두 prop을 passthrough 합니다.

---

## SubHeaderBar

페이지 헤더(48px) 아래 **고정 40px** 보조 네비 행. 뒤로가기·브레드크럼·모드 탭·보조 액션 컨테이너. 사이드바 조직 스위처(40px)와 동일 높이라 좌/우 컬럼 2행이 정렬됩니다(헤더 48 → 보조 40 chrome 스케일).

**슬롯 3개 전부 optional** — 환경에 따라 있는 것만 렌더됩니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `left` | `ReactNode` | — | 좌측 슬롯 — 백 버튼(`<Button variant="basic" size="md">`)·브레드크럼·모드 `Tabs` |
| `children` | `ReactNode` | — | `left` 별칭(기존 사용처 호환). 둘 다 주면 `left` 우선 |
| `center` | `ReactNode` | — | 가운데 슬롯 — 남는 폭을 차지하며 중앙 정렬(선택) |
| `right` | `ReactNode` | — | 우측 정렬 보조 액션(선택) |
| `className` | `string` | `""` | 루트 바 className 병합 |

```tsx
// 대시보드 모드 행 — 좌: 모드 탭 / 우: LIVE 타이머 + 툴바 아이콘
<SubHeaderBar
  left={<Tabs variant="large" items={MODES} value={mode} onChange={setMode} aria-label="대시보드 모드" />}
  right={<><LiveTimerCompact durationLabel="30분" /><ToolbarIconButton icon={PRINT_ICON} label="인쇄" tooltipPlacement="bottom" /></>}
/>
```

슬롯 내용은 **등록 컴포넌트 조합으로** — `Tabs` · `LiveTimerCompact` · `ToolbarIconButton` · `Button`. 반복/의미 구조를 인라인 JSX 로 짜지 않습니다. 좌우 padding 은 `--wds-header-px` 토큰 고정(헤더·사이드바와 세로 정렬).

**높이 정책:** `h-[40px] box-border` 고정 — padding/border 가 높이를 부풀리지 않음. 페이지에서 `px py border-b` inline `<div>` 로 보조 행을 **재구현 금지**, 본 컴포넌트로 조립. (조직 스위처 40px 와 행 정렬 보장)

---

## PageHeader

48px 우측 컬럼 헤더. **AI 위젯 토글의 단일 진입점**입니다. 위젯이 열려도 이 헤더의 구성요소는 **하나도 사라지지 않습니다** ([patterns.md](./patterns.md#1-page-header-invariant)).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `title` | `string` | — | 좌측 페이지 타이틀 |
| `aiActive` | `boolean` | `false` | AI 위젯 활성 상태 (버튼 시각적 강조용) |
| `onAiToggle` | `() => void` | — | AI 버튼 클릭 콜백 |
| `profileMenu` | `ProfileMenuItem[]` | — | 우상단 **아바타 클릭 드롭다운**(계정 정보·엔터프라이즈 관리·전환·로그아웃 등). 미지정 시 정적 아바타 |
| `roleBadge` | `string` | — | 프로필 드롭다운 **헤더**에 표시할 역할(예: `"OWNER"`) → "OWNER · 내 계정". **아바타 옆 독립 칩 아님** |
| `notifications` | `NotificationItem[]` | — | **벨 빨간 점 + 드롭다운**. 1건↑일 때만 인디케이터 |
| `language` | `PageHeaderLanguage` | — | **언어 설정**. 주면 벨 왼쪽에 지구본 24px 트리거([[PageHeaderLanguageMenu]]). 라벨은 그 언어 자기 이름(한국어 · English · 日本語) |
| `labels` | `PageHeaderLabels` | 한국어 | 헤더 고정 글자(`support` 고객지원 · `notifications` 알림 · `myAccount` 내 계정). 화면 언어가 한국어가 아닐 때 번역해 넘긴다 |

```ts
export type ProfileMenuItem = { label: string; onClick?: () => void };
export type NotificationItem = { label: string; onClick?: () => void };
export type PageHeaderLanguage = { value: string; options: { code: string; label: string }[]; onChange?: (code: string) => void; title?: string };
export type PageHeaderLabels = { support?: string; notifications?: string; myAccount?: string };
```

**언어 설정 정책:** 언어 트리거는 벨 · 아바타와 같은 **24px 아이콘 트리거**다(글자 pill 아님). 그래서 켜도 오른쪽 줄의 크기와 16px 간격이 그대로다. 선택지 라벨을 지금 언어로 번역하지 않는다. 읽지 못하는 언어로 들어온 사람이 자기 언어를 찾을 수 있어야 한다. 헤더는 고른 값만 알리고, 저장과 화면 다시 그리기는 소비 레이어가 한다.

타이틀 + AI 버튼 + Docs + 고객지원 + (언어 · `language` 시) + **bell(notifications 시 빨간 점)** + **avatar(profileMenu 드롭다운 · roleBadge 헤더)** 가 항상 한 줄에 모두 표시됩니다.

**사용자 메뉴 정책:** 우상단 사용자 영역은 **아바타 드롭다운 1개**로 일원화. 역할(`roleBadge`)은 **드롭다운 헤더**로 표시하고, 아바타 옆에 별도 역할 칩(2번째 트리거)을 두지 않는다.

---

## PageHeaderAiInline

48px `PageHeader` 의 **AI inline variant**. WhaTap AI 토글 버튼 자리를 [`AiInlinePrompt`](./ai-entry.md#aiinlineprompt) 로 대체 — AI 위젯 호출 entry 가 인라인 prompt 송신으로 이동. 별도 토글 entry 없음 (2-step → 1-step UX).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `title` | `string` | — | 좌측 페이지 타이틀 |
| `promptPlaceholder` | `string` | `"어떤 작업을 함께 할까요?"` | inline prompt placeholder (`promptPlaceholders` 미주입 시 정적 1개) |
| `promptPlaceholders` | `string[]` | — | **옵션** — 제품별 핵심 prompt 배열. 입력 비어 있을 때 세로 롤링(`AiInlinePrompt.rollingPlaceholders` passthrough) |
| `promptSuggestions` | `AiPromptSuggestion[]` | — | chip suggestions — 페이지 컨텍스트별 카탈로그 |
| `onPromptSubmit` | `(v: string) => void` | — | Enter/⬆ 송신 콜백 |
| `onPromptSelectSuggestion` | `(s: AiPromptSuggestion) => void` | — | suggestion chip 선택 콜백 |
| `promptDefaultOpen` | `boolean` | `false` | Storybook/시연용 마운트 시 dropdown 강제 펼침 |

inline prompt 는 `max-w-[480px]` cap — 우측 chrome (고객지원·bell·avatar) 잠식 금지 ([patterns.md](./patterns.md#1-page-header-invariant)).

```tsx
<PageHeaderAiInline
  title="이벤트 카탈로그"
  promptPlaceholder="이벤트 카탈로그에 대해 질문..."
  promptSuggestions={CATALOG_AI_SUGGESTIONS}
  onPromptSubmit={(q) => handleAiSubmit(q)}
/>
```

**`PageHeader` vs `PageHeaderAiInline` 선택:**

- 위젯 토글 entry 가 필요 (AI 위젯이 페이지 컨텍스트와 무관하게 열리는 패턴) → `PageHeader`
- AI 진입점이 페이지 컨텍스트 prompt 인 페이지 (최근 표준) → `PageHeaderAiInline`

---

## OptionbarPage

옵션바 통합 헤더 (PageHeader 바로 아래에 배치). 시간/인스턴스/DB/프리셋.

| Prop | Type | Default |
|---|---|---|
| `liveTime` | `string` | — |
| `durationLabel` | `string` | `"10분"` |
| `paused` | `boolean` | `false` |
| `onTogglePause` | `() => void` | — |
| `instanceLabel` | `string` | `"DMX-3-12-949"` |
| `instanceStatus` | `InstanceStatus` | `"ok"` |
| `databaseLabel` | `string` | `"ORA11K"` |
| `presetLabel` | `string` | `"Default"` |
| `layout` | `"inline" \| "stack"` | `"inline"` | 항목 배치 — `inline`(**기본**): 타이틀을 값 좌측에 나란히 + **행 높이 40px 고정** / `stack`: 타이틀 위·값 아래(`box-border` + `minHeight:40`, `size` 와 무관). 각 `OptionbarItem` 에 그대로 전달됨 |
| `size` | `OptionbarSize` (`"sm" \| "md" \| "lg"`) | `"sm"` | 행 chrome 높이 — `sm` 24px(기본) / `md` 28px / `lg` 32px. `LiveTimerCompact` · `OptionbarInstanceSelector` · `OptionbarValueDisplay` · `PresetSelect` 에 일괄 전달되어 baseline 이 어긋나지 않음 |

**24px(`sm`) 이 기본선:** 옵션바 컨트롤 4종(`OptionbarInstanceSelector` · `OptionbarValueDisplay` · `PresetSelect`) + `LiveTimerCompact` 는 모두 **기본 `size="sm"`(24px)** 이고, 컨트롤 공통 사다리 `md`(28px) · `lg`(32px) 는 세로 공간이 넉넉한 자리에서 명시적으로 올려 씁니다. 행 컨테이너 높이는 `size` 와 무관하게 40px 고정이며, 한 행에서는 **같은 size 로 통일**합니다.

내부적으로 `OptionbarInstanceSelector` + `LiveTimerCompact` + `PresetSelect`를 조합합니다. 보통은 이 컴포넌트 하나만 쓰면 충분하고, 옵션바를 세부 커스터마이즈해야 할 때만 하위 셋을 직접 import 합니다.

---

## OptionbarInstanceSelector

180px 인스턴스 셀렉터 드롭다운. status dot + chevron.

```ts
export type InstanceStatus = "ok" | "warn" | "error" | "idle";
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"인스턴스"` |
| `width` | `number` | `180` |
| `label` | `string` | — |
| `status` | `InstanceStatus` | `"ok"` |
| `open` | `boolean` | `false` |
| `onToggle` | `() => void` | — |

---

## LiveTimerCompact

32px LIVE 타이머 + polling progress (pause/play 토글, 캘린더/duration).

| Prop | Type | Default |
|---|---|---|
| `time` | `string` | — |
| `paused` | `boolean` | `false` |
| `onTogglePause` | `() => void` | — |
| `refreshIntervalMs` | `number` | `5000` |
| `onOpenCalendar` | `() => void` | — |
| `durationLabel` | `string` | — |
| `showCalendar` | `boolean` | — |

---

## TimeRangeSelector

시간 범위 입력기. dual datetime + live 토글 + 이전/다음 + 달력.

```ts
type DateParts = { year: string; month: string; day: string; hour: string; minute: string };
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"시간"` |
| `start` | `DateParts` | _(기본값 있음)_ |
| `end` | `DateParts` | _(기본값 있음)_ |
| `durationLabel` | `string` | `"10분"` |
| `onLive` | `() => void` | — |
| `onPrev` | `() => void` | — |
| `onNext` | `() => void` | — |
| `onPickDate` | `() => void` | — |

`OptionbarPage`가 `LiveTimerCompact`를 쓰고 있으니, 별도 시간 입력 UI가 필요한 페이지에서만 `TimeRangeSelector`를 직접 씁니다.

---

## PresetSelect

프리셋 드롭다운 (230px, 관리 버튼 포함). 드롭다운과 정사각 관리 버튼이 4px 떨어져 섭니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `string` | — | 지금 고른 프리셋 이름. 넘치면 말줄임 |
| `width` | `number` | `230` | 드롭다운 폭(px). 관리 버튼은 따로 붙는다 |
| `size` | `"sm" \| "md" \| "lg"` | `"sm"` | 높이 24 · 28 · 32px. 한 줄의 다른 옵션바 컨트롤과 같은 값 |
| `onOpenList` | `() => void` | — | 드롭다운 누름 |
| `onManage` | `() => void` | — | 관리 버튼 누름 |

| size | 높이 | 글자 | 좌우 여백 | 관리 아이콘 |
|---|---|---|---|---|
| `sm` (기본) | 24px | 11px | 8px | 14px |
| `md` | 28px | 12px | 10px | 16px |
| `lg` | 32px | 13px | 10px | 16px |

- 목록과 관리 패널은 이 컴포넌트가 띄우지 않는다. 두 콜백으로 호출측이 연다
- 페이지에서 드롭다운과 저장 버튼을 손으로 다시 짜지 않는다(테두리를 이어 붙이거나 hex 회색을 쓰는 자작이 있었다)
- Figma 정본은 `size` variant 셋. Figma 기본은 이미 놓인 인스턴스를 지키려고 `lg` 다

---

## Stage

16:9 프로토타입 무대 (1280×720 흰색 카드, 어두운 배경). 마케팅/데모 화면 전용 — 실제 SaaS 페이지에서는 쓰지 않습니다.

| Prop | Type |
|---|---|
| `badge` | `string` |
| `children` | `ReactNode` |

---

## DataTable

Generic 재활용 데이터 테이블. CSS grid 기반, density 옵션. **전체 정책은 [`patterns.md`](./patterns.md#4-data-table-종합-정책) 참조.**

```ts
export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  flex?: number;            // 가변 트랙 (fr). width 지정 시 무시
  width?: number | string;  // 고정 트랙 (px/CSS) — 정형 컬럼
  align?: "left" | "right" | "center";
  numeric?: boolean;
  render?: (row: T, idx: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  density?: "compact" | "default";  // 기본 "default" (모든 새 페이지)
  onRowClick?: (row: T, idx: number) => void;
};
```

**Density — 기본은 `default`**
- `default` — header `text-base` 12px bold · row `text-md` 13px regular · padding 12/10
- `compact` — header `text-xs` 10px bold · row `text-sm` 11px regular · padding 8/6. **dense 데이터 (100+ 행) 전용. 채택 시 별도 근거 필요.**

**정렬:** 텍스트 → left, 숫자 → right (`numeric: true`), header `"No"` → center 자동. 명시 `align` 이 최우선.

**너비:** 정형 컬럼 → `width(px)`, 가변 컬럼 → `flex(fr)`.

**셀 내 inline 폰트** — wrapping span 이 `tokens.rowText` 자동 적용. override 가이드:

| 컨텐츠 | className |
|---|---|
| 주 텍스트 (강조 없음) | **override 안 함** |
| 메인 식별자 강조 | `text-md font-medium` 또는 `font-bold` |
| 보조/부 텍스트 | `text-base text-tertiary` (한 단계 작게) |
| 수치 | `text-md font-numeric tabular-nums` |

`text-sm`/`text-xs` 를 default density 셀 본문에 쓰지 말 것 (compact 시절 잔재).

**셀 내 컴포넌트 사이즈:** `Chip` md(20px) · `Button` sm(~24px) · inline pill `text-sm h-[20-24px]` · status dot 6-8px. lg(28-32px) 는 row 압도 금지.

```tsx
<DataTable
  density="default"
  columns={[
    { key: "name", header: "인스턴스", flex: 2 },
    { key: "tps",  header: "TPS", width: 96, numeric: true, render: r => r.tps.toLocaleString() },
  ]}
  rows={instances}
/>
```

---

## FilterBar

페이지 상단의 **검색·필터·액션 묶음 영역**. 통합 이벤트 목록·카탈로그·룰 목록 같은 큰 데이터 표 페이지의 헤더. Primitives 9 종(TextField/FilterChip/FilterDropdown) 의 조립체.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `search` | `ReactNode` | — | 좌측 검색 슬롯 (TextField 등) |
| `dropdowns` | `FilterBarDropdownConfig[]` | — | 중간 dropdown 묶음 — FilterChip 트리거 + FilterDropdown 자동 생성 |
| `actions` | `ReactNode` | — | 우측 actions (TimeRangeSelector · Button 등) |
| `showSelectedChips` | `boolean` | `false` | 선택된 항목을 별도 row 에 closable FilterChip 노출 |
| `showResetAll` | `boolean` | `false` | "전체 초기화" 버튼 (선택 있을 때만) |
| `onResetAll` | `() => void` | — | reset 콜백 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 내부 FilterChip 사이즈 (lg=32px 권장 페이지 헤더용) |

```tsx
<FilterBar
  size="lg"
  search={<TextField leadingIcon={<IconSearch />} clearable fullWidth placeholder="검색..." />}
  dropdowns={[
    { key: "category", label: "카테고리", options: CAT_OPTIONS, value: cat, onChange: setCat },
    { key: "severity", label: "심각도",   options: SEV_OPTIONS, value: sev, onChange: setSev },
  ]}
  actions={<Button variant="outline">고급 필터</Button>}
  showSelectedChips
  showResetAll
/>
```

---

## EventWeekTimeMatrix

요일(7) × 시간(24) 알림 수신 매트릭스. 셀 ON = Tone "low" 배경(#e8f4ff), OFF = 회색 격자.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `weekdays` | `boolean[][]` | — | 7×24 그리드. `weekdays[d][h]` = true 면 ON |
| `onToggle` | `(day: number, hour: number, next: boolean) => void` | — | 셀 토글 (미지정이면 read-only) |
| `dayLabels` | `string[]` | `["월","화",…,"일"]` | 요일 라벨 |
| `caption` | `string` | — | 위쪽 안내 라벨 |

시간 헤더는 6시간 간격(0/6/12/18)만 표시 — 24개 다 쓰면 비좁음.

```tsx
<EventWeekTimeMatrix
  caption="요일·시간별 알림 수신"
  weekdays={weekdays}
  onToggle={(d, h, on) => updateWeekdays(d, h, on)}
/>
```

---

## Button

표준 클릭 trigger primitive. 3 variant × 4 size × 4 tone + loading/fullWidth.

**위계는 variant, 색 의미는 tone.** contained=1차 CTA · outline=2차 · basic=3차 텍스트. `tone` 은 그 위의 색 의미 — `tertiary` 는 색 의미가 없는 중립 무채색(취소·닫기·나중에·더보기).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"basic" \| "contained" \| "outline"` | — | basic(텍스트만) · contained(채움) · outline(보더) |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | — | sm=20 · md=24 · lg=32 · xl=36px |
| `tone` | `"primary" \| "tertiary" \| "warning" \| "critical"` | `"primary"` | 색 의미 — primary(브랜드 블루) · tertiary(중립 회색) · warning · critical |
| `loading` | `boolean` | `false` | 자동 disabled + spinner |
| `fullWidth` | `boolean` | `false` | 컨테이너 폭 100% |
| `children` | `ReactNode` | — | 라벨 |
| ...HTML button attrs | — | — | onClick · type · disabled 등 |

```tsx
<Button variant="contained" tone="primary" size="md" onClick={apply}>적용</Button>
<Button variant="outline" tone="critical" size="sm" loading={deleting}>삭제</Button>
<Button variant="outline" tone="tertiary" size="md">취소</Button>   {/* 중립 — CTA 와 경쟁하지 않는다 */}
```

**Button vs 다른 진입점:**
- 링크 이동 → `<a>` 직접
- AI 위젯 토글 (그라데이션) → [`AiAssistantButton`](./ai-entry.md#aiassistantbutton)
- AI 위젯 송신 → [`AiSendButton`](./ai-entry.md#aisendbutton)
- icon-only 압축 (size 16-20px) → 인라인 OK

---

## WidgetFrame

대시보드 격자의 위젯 한 칸. **헤더(`CardHead`) · 본문 · 푸터** 세 칸으로 나누고, 표면 · 테두리 · 반경 · 안쪽 여백을 이 컴포넌트 한 곳에서 정한다. 차트 · 표는 본문만 그린다. 정책은 [patterns.md §15](./patterns.md#15-대시보드-위젯--껍데기는-widgetframe-하나).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `title` | `string` | — | 지표 이름만(「TPS」). 범위 · 대상 · 단위는 `meta` |
| `summary` | `ReactNode` | — | 본문 첫 줄 왼쪽 — 칸에 꼭 필요한 값(건수 · 최대 · 최소 · 척도). 같은 줄 오른쪽이 범례. **헤더에는 값을 두지 않는다**(제목 · 메뉴만) |
| `onFullscreen` | `() => void` | — | 헤더 메뉴 첫 칸 ⛶ 전체 화면. 주면 선다 |
| `menu` | `ActionMenuAction[]` | — | 헤더 메뉴 둘째 칸 ⋮ 더보기 안의 줄(설정 · 복사 · 상세로 이동). 주면 선다 |
| `onAsk` | `() => void` | — | AI 진입점. ⋮ 첫 줄 「AI 에게 묻기」 + 헤더 맨 앞 호버 지름길(같은 동작). AI 위젯을 여는 화면에서만 |
| `draggable` | `boolean` | `false` | 헤더를 끌기 손잡이로(`.wds-widget-frame-handle`, 메뉴 `.wds-widget-frame-actions` 제외). 배치하는 보드에서만 |
| `legend` | `{ label, color, value? }[]` | — | 본문 오른쪽 위 한 줄 범례. 모든 차트 칸에(계열 하나여도). 이름표가 본문 안에 있는 BarList · 도넛 · Apdex · 숫자 칸만 제외. 속도 구분 `SPEED_LEGEND`. `value` 는 지금 값(이름 뒤에 굵게) · 계열 넷 이하일 때만(§25) |
| `bleed` | `boolean` | `false` | 본문 안쪽 여백 없앰. 표 · 히트맵 · 아크처럼 본문이 가장자리를 가질 때만 |
| `state` | `"ready" \| "no-data" \| "collect-gap"` | `"ready"` | `ready` 가 아니면 본문 대신 [[EmptyState]] |
| `stateTitle` / `stateDescription` | `ReactNode` | 상태별 기본 문장 / — | 빈 상태 두 줄 |
| `footer` | `ReactNode` | — | 출처 · 마지막 수집 시각 한 줄(범례는 `legend`) |

- 높이는 부모(격자 행)가 정한다. WidgetFrame 은 `h-full`
- 헤더 줄은 24px 고정. 메뉴가 있는 칸과 없는 칸의 본문 시작선이 같다
- **헤더 오른쪽 아이콘 메뉴는 ⛶ 전체 화면 + ⋮ 더보기 둘로 고정**(순서 고정). 나머지 행동은 전부 더보기 안으로. AI 위젯을 여는 화면이면 `onAsk` 로 맨 앞에 호버 지름길(AI)이 더해져 [AI][⛶][⋮] — ⋮ 첫 줄 「AI 에게 묻기」도 함께 선다
- **헤더는 제목 · 메뉴만.** 값 · 건수 · 단위 · 시간 범위를 헤더에 두지 않는다. 값은 본문 첫 줄 `summary`, 시간은 옵션바
- **범례는 본문 오른쪽 위 한 줄.** 헤더 오른쪽은 메뉴 자리다. 계열이 셋을 넘거나 글이 길면 본문 안 차트 옆 열로
- **지금 값은 계열 수로 자리를 고른다**(§25). 하나는 `summary`, 둘 ~ 넷은 `legend[].value`, 강조 계열이 여럿이면 MiniMultiLineChart 선 끝 배지(`series[].endLabel`). 한 칸에 한 방식
- **Figma 정본**: MiniMultiLineChart 세트 342:69 에 `endBadges` 축(4 variant · 배지 변형 507:30 등) · 변수 `wds/widget-end-gutter`(VariableID:507:29, 44 · `WDS · Size`). WidgetFrame 범례 값 예시 507:235(같은 페이지). 게시는 사람이 한다
- 세 칸 사이에 구분선을 긋지 않는다. 같은 표면 안이라 여백이 경계다
- 껍데기를 가진 차트(MiniLineChart · MiniMultiLineChart · MiniDonutChart · KpiCard · HexGrid)는 `frame={false}` 로 끄고 넣는다. 켠 채 넣으면 카드가 두 겹이 된다
- AI 진입점은 껍데기에 두지 않는다(§15)

```tsx
<div className="grid grid-cols-4 gap-12px" style={{ height: 232 }}>
  <WidgetFrame title="액티브 트랜잭션" legend={SPEED_LEGEND} onFullscreen={open} menu={WIDGET_MENU}>
    <ActiveTransactionArc frame={false} total={total} maxTx={maxTx} agent={agent} />
  </WidgetFrame>
  <WidgetFrame title="서버 CPU" state="collect-gap" stateDescription="서버 12대 · 32분째 끊김" />
</div>
```

---

## CardHead

카드 머리 한 줄 — **이름 · 탭 · 우측 메타**. 이름은 영역이 무엇인지, 탭은 무엇으로 나뉘는지, 메타는 지금 무엇을 보는지를 말한다. [[WidgetFrame]] 의 헤더가 이것이다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `title` | `string` | — | 영역 이름. 타이포 역할 `heading.subsection`(`text-md font-bold`, 13px) |
| `tabs` | `{ items, value, onChange, variant? }` | — | 탭. 기본 `segmented`. 없으면 이름만 |
| `meta` | `ReactNode` | — | 우측 끝. 지금 보는 범위 · 기준 |

- 이름과 탭을 위아래로 나누지 않는다. 위계는 줄이 아니라 굵기가 진다
- 이름 · 메타는 한 줄(`whitespace-nowrap`)
- 탭 `large` 가 필요하면 탭을 머리 아래 자기 줄로 내린다

---

## 차트 공통 요소 — ChartGrid · ChartValueAxis · ChartPeakMarker (Primitives)

값축이 있는 차트가 함께 쓰는 플롯 부품(patterns §26). 차트는 이 둘을 **조합**하고 격자 · 눈금을 다시 그리지 않는다 — 그래서 MiniLineChart · MiniMultiLineChart · MiniBarChart · ForecastLineChart 는 Composite 계층이다. `@whatap/design-system/chart` 에서 가져온다.

| 부품 | 그리는 것 | 놓는 순서 |
|---|---|---|
| [[ChartGrid]] | 눈금(최대 · 절반 · 0)마다 가로 점선 · `--color-border-soft` | 마크 **아래** |
| [[ChartValueAxis]] | X 바닥선 · Y 세로선(`--color-border-divider`) + 눈금 글자(`text-chart` · 숫자 서체 · tertiary, 단위 접미사) | 마크 **위** |
| [[ChartPeakMarker]] | 최고점 값 말풍선(카드 바탕 · `text-xs` 굵게) + ▼(계열 색). `label` · `color` · `left` · `top` — ▼ 끝이 (`left`, `top`) 에 닿는다(§5) | 덧그림 겹, 맨 위 |
| [[ChartCategoryAxis]] | 범주 막대 아래 이름 — 칸 등분 · 가운데 · 말줄임(title 에 전체). `labels` · `padBottom`(18) · `right` · `gap`(4) | 덧그림 |
| [[ChartStackedColumn]] | 세로 막대 하나 — 구간을 아래에서 위로(`segments[0]` 바닥), 몫은 계열 색 + 안 글자(흰색), 나머지는 `surface-200` + 바깥 글자. `max` 는 값축과 같게 | 막대 칸 |

| Prop (둘 공통) | Type | Default |
|---|---|---|
| `max` | `number` — 이미 보기 좋은 값으로 올린 최대. 0 이면 바닥 눈금 하나 | — |
| `ticks` | `number[]` — 눈금 값(데이터에서 오는 눈금: 단계 값 · 판정 경계). 없으면 최대 · 절반 · 0 | — |
| `padTop` | `number` (px) | `4` |
| `padBottom` | `number` (px) — X축 글자 자리 | `14` |
| `right` | `number \| string` — 선 끝 배지 칸이 있으면 `var(--wds-widget-end-gutter)` | `8` |
| `unit` (ChartValueAxis) | `string` — 축 제목 대신 단위 | `""` |

```tsx
<div className="relative" style={{ height: 120 }}>
  <ChartGrid max={100} />
  {/* 선 · 막대 */}
  <ChartValueAxis max={100} unit="%" />
</div>
```

- 범례 견본은 [[ChartSwatch]](Primitives) — 마크 모양을 따른다. 선 = `shape="line"`(8×2), 면 · 막대 · 조각 · 칸 = 기본 사각(8×8). [[WidgetFrame]] 범례 항목은 `{ label, color, shape }` — 선 차트 칸이면 `shape: "line"`.
  Figma 정본: 페이지 ChartSwatch `549:2` · 세트 `549:5`(`shape` square · line, 칠은 인스턴스에서 마크 색 변수로).
- 높이가 정해진 `position: relative` 플롯 상자 안에 둔다. 두 부품에 **같은 `max` · 여백**을 줘야 글자와 점선이 같은 높이에 선다.
- 축 제목은 그리지 않는다(§26 결정). 오른쪽 두 번째 Y축은 금지(§19).
- X축 시간 · 범주 글자는 차트마다 놓는 규칙이 달라 차트가 그린다.
  → (2026-10-22) **시간 글자는 [[ChartTimeAxis]](Primitives)** 가 놓는다 — `labels` · `positions`(0 ~ 1, 없으면 같은 간격) · `right`. 범주 글자는 여전히 [[MiniBarChart]] `categories`.
  Figma 정본: 페이지 ChartTimeAxis `551:2` · 세트 `551:13`(`right` 2 variant, TEXT `first` · `second` · `third` · `last`). 예시 프레임은 요소 다섯으로 조립한 선 차트.
- **Figma 정본**: 페이지 ChartGrid `545:2` · 세트 `545:16`, 페이지 ChartValueAxis `545:3` · 세트 `546:22`(`ticks` × `right` 4 variant, ChartValueAxis 는 TEXT `max` · `mid` · `zero`). 페이지 ChartPeakMarker `547:2` · 컴포넌트 `548:2`(TEXT `label`, ▼ 칠은 `color/chart/series-1` — 다른 계열이면 인스턴스에서 바꾼다). 두 부품을 겹친 예시 프레임이 페이지마다 있다. 기존 Figma 차트 세트(MiniLineChart 등)는 아직 자기 격자 · 축을 그린다(`border/default`) — 인스턴스로 바꾸는 것은 후속.

---

## MiniLineChart

96px 소형 라인 차트. 모니터링 카드용. **SVG plot + HTML overlay**가 같은 좌표계로 정렬되어 peak 라벨이 line max 픽셀과 1:1 매칭됩니다 ([patterns.md](./patterns.md#5-chart-peak-alignment)). Composite — 값축 · 격자는 [[ChartGrid]] · [[ChartValueAxis]].

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | — |
| `values` | `number[]` | — |
| `xLabels` | `string[]` | _(기본값 있음)_ |
| `markerAt` | `number` | `0.08` |
| `showTopStat` | `boolean` | `false` |
| `color` | `string` | `"#3DA9FF"` |
| `unit` | `string` | `""` |
| `delay` | `number` | — |
| `frame` | `boolean` | `true` |

- `frame={false}` 면 본문만 그린다(카드 · 제목 줄 · Top Stat · ⋮ · AI 트리거를 뺀다). [[WidgetFrame]] 안에 넣을 때 쓴다.

⚠️ SVG 내부 `<text fontSize>`는 **반드시 `"9px"` 형식**으로 단위 명시 ([patterns.md](./patterns.md#3-svg-text-must-include-units)).

---

## 대시보드 차트 공통 — `frame`

아래 차트들은 단독으로 세우면 **스스로 껍데기나 바깥 여백**을 그린다. 대시보드 격자에서는 늘 `frame={false}` 로 끄고 [[WidgetFrame]] 에 담는다. 그러면 제목 · 범위 · 메뉴(⛶ + ⋮) · 범례 · 본문 여백이 모든 칸에서 같은 자리 · 같은 모양이 된다(patterns §15).

**본문 간격 토큰** — `--wds-widget-body-px`(12) · `--wds-widget-body-pb`(12) · `--wds-widget-row-gap`(4) · `--wds-widget-axis-gutter`(28) · `--wds-widget-end-gutter`(44). WidgetFrame 이 앞의 셋을, 그래프가 축 칸을 쓴다. 배지 칸은 MiniMultiLineChart 에 선 끝 값 배지(`endLabel`)가 있을 때만 플롯 오른쪽에 비운다(§25). **축 글자**는 모든 그래프가 `text-chart`(9px) · 숫자 서체 · tertiary.

| 차트 | `frame={false}` 에서 빠지는 것 | WidgetFrame 쪽에서 채우는 것 |
|---|---|---|
| MiniLineChart | 카드 · 제목 줄 · Top Stat · ⋮ · AI 트리거 | `title` · `meta` · 메뉴 |
| MiniMultiLineChart | 카드 · 제목 줄 · 헤더 범례 · ⋮ · AI 트리거 (`stat` · `footer` 는 남음) | `title` · `meta` · `legend`(시리즈 색 그대로) · 메뉴 |
| MiniDonutChart | 카드 · 제목 줄 (도넛 옆 범례는 남음) | `title` · `meta` · 메뉴 |
| KpiCard | 카드 · 제목 | `title` · `meta`(최대 · 최소 등) · 메뉴 |
| HexGrid | 카드 · 「GPU Map」 제목 줄 · 범례 | `title` · `legend={HEX_GRID_LEGEND}`(칸 수를 붙이면 `hexGridLegend(items)`) · 메뉴 |
| ActiveTransactionArc | 바깥 여백(좌우 · 아래 8px) · 왼쪽 아래 Elapsed 범례 | `title` · `meta` · `legend={SPEED_LEGEND}` · 메뉴 |
| ScatterHeatmap | 바깥 좌우 여백(8px) | `title` · `meta` · `legend={SPEED_LEGEND}` · 메뉴 |
| MiniBarChart | 바깥 좌우 여백(8px) | `title` · `meta` · `legend`(막대 색 그대로) · 메뉴 |
| ApdexChart | 바깥 좌우 여백(8px) | `title`(「Apdex」) · `meta` · 메뉴 (구간 이름이 띠 안에 있어 범례 없음) |
| ForecastLineChart | 바깥 좌우 여백(8px) | `title` · `summary`(추세 구간 · 지평) · `legend`(선 색 그대로) · 메뉴 |
| BarList | 바깥 여백(좌우 · 아래 8px) | `title` · `meta` · 메뉴 (줄마다 색이 이름표라 범례 없음) |

## MiniBarChart

구간마다 막대 하나, 계열이 둘 이상이면 누적(시스템 CPU usr + sys). 축 규칙은 다른 그래프와 같다(축 칸 토큰 · 바닥 14 · `text-chart`).

**TOP-N 범주 막대.** `categories` + `valueLabels`. Disk IOPS · Disk Inode · 메모리 상위 5대처럼 대상마다 막대 하나를 세운다. 이름은 막대 바로 아래 가운데(`text-chart` · tertiary · 칸 폭에서 말줄임, 전체 이름은 `title`), 값은 모든 막대 위(가장 큰 값만 굵게 · primary). 범주축이면 바닥 여백이 18 로, 값 글자를 켜면 위 여백이 14 로 늘어난다. Y축 칸은 그대로 `--wds-widget-axis-gutter` 라 옆 칸과 Y축 선이 맞는다.

- X축은 시간축(`xLabels`)과 범주축(`categories`) 중 하나. 둘 다 주면 `categories` 만 그린다.
- `peak` 는 시계열에서 최댓값 하나만 적을 때. `valueLabels` 를 켜면 `peak` 는 따로 켜지 않는다.
- 대상이 여섯 이상이거나 이름이 잘리면 안 되면 [[BarList]](가로 막대 줄)를 쓴다.

| Prop | Type | Default |
|---|---|---|
| `series` | `{ label, values, color }[]` | — |
| `xLabels` · `unit` · `yMax` | `string[]` · `string` · `number` | — · `""` · 자동 |
| `categories` | `string[]` | — (주면 `xLabels` 대신) |
| `peak` | `boolean` | `false` |
| `valueLabels` | `boolean` | `false` |
| `frame` | `boolean` | `true` |

## ApdexChart

Apdex × 100 을 네 구간 띠(Excellent 94 · Good 85 · Poor 70 · Unacceptable) 위에 선과 값으로. 띠 높이는 경계값에서 계산(50~100 축), 경계 숫자는 Y축 칸에. 색은 Apdex 토큰(`--color-chart-apdex-*` · `-bg`).

| Prop | Type | Default |
|---|---|---|
| `value` | `number` | — |
| `values` · `xLabels` | `number[]` · `string[]` | — |
| `frame` | `boolean` | `true` |

## ForecastLineChart

관측은 실선, 예측은 점선. x = 0 「지금」 세로선이 둘을 가르고, 임계선(점선) 위에 옅은 띠, 예측이 천장에 닿는 자리에 빈 원 마커와 도달 시각을 적는다. 디스크 · 쿼터 고갈처럼 판정이 기울기의 연장에서 나오는 지표용. x 는 도메인 단위(음수 = 과거, 0 = 지금, 양수 = 미래). 축 규칙은 다른 그래프와 같다(축 칸 토큰 · 바닥 14 · `text-chart`).

색은 호출부가 토큰으로 준다. 기본은 `--color-chart-series-N`. 위젯이 상태를 말할 때만 `--color-status-error` · `--color-status-warning` 을 쓰고, 그때 판정 밖 계열(평탄 · 지평 밖 · 대조군)은 `--color-chart-neutral` 회색으로 낮춘다. 임계 띠는 `threshold.tone` 이 정한다(선 `--color-status-*` · 띠 `--color-status-*-soft`). 글자는 text 토큰.

| Prop | Type | Default |
|---|---|---|
| `series` | `{ id, label, color, observed, forecast?, reach? }[]` (점은 `{ x, y }`, `reach` 는 `{ x, y, label? }`) | — |
| `xDomain` | `[number, number]` | — |
| `xLabels` | `{ x, label }[]` | `[]` |
| `nowLabel` | `string` | `"지금"` |
| `yMax` · `unit` | `number` · `string` | `100` · `""` |
| `threshold` | `{ value, label?, tone?: "critical" \| "warning" }` | — |
| `highlightId` | `string \| null` | `null` |
| `frame` | `boolean` | `true` |
| `ariaLabel` | `string` | — |

## BarList

값 · 이름 · 가로 막대 한 줄을 여러 줄(액티브 스테이터스). 막대 길이는 줄마다 받은 `ratio`(0~1), 색은 시리즈 토큰 — 엔티티 계열이면 고정 슬롯(method 1 · sql 3 · httpc 7 · dbc 2 · socket 5, patterns §21). **Composite** — 줄은 [[BarListItem]](Primitives: 값 칸 88px 고정 · 막대 줄 높이 60% · 최소 4px)이 그린다.

Figma 정본: BarListItem 페이지 `552:15` · 컴포넌트 `552:22`(TEXT `value` · `label`, 막대 길이 = track 오른쪽 안쪽 여백 = 폭 × (1 − ratio)) · BarList 세트 `351:333` 은 줄 5개가 BarListItem 인스턴스(엔티티 슬롯 색 · 스토리 비율).

| Prop | Type | Default |
|---|---|---|
| `rows` | `{ label, value, ratio, color }[]` | — |
| `frame` | `boolean` | `true` |

## MiniMultiLineChart

2~3 계열(백분위 · 입출력 · 상태 코드)을 한 칸에 겹쳐 그리는 시계열. 단일 계열 + 통계값도 된다.

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | — |
| `series` | `{ label, values, color, showArea? }[]` | — |
| `xLabels` · `unit` | `string[]` · `string` | 샘플 · `""` |
| `stat` · `statUnit` · `statSub` | `string` · `string` · `ReactNode` | — |
| `footer` | `ReactNode` | — |
| `frame` | `boolean` | `true` |

## MiniDonutChart

구성비 도넛 + 옆 범례(값 포함). 범례 글이 길어 한 줄 범례로 올리지 않는다.

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | — |
| `segments` | `{ label, value, color }[]` | — |
| `centerLabel` · `centerSub` | `string` | — |
| `frame` | `boolean` | `true` |

## KpiCard

핵심 지표 하나를 큰 숫자로.

| Prop | Type | Default |
|---|---|---|
| `title` · `value` · `unit` | `string` | — |
| `frame` | `boolean` | `true` |

## HexGrid

개별 장치(GPU · 서버 등)를 헥사곤으로 깔아 상태를 색으로. 범례 상수 `HEX_GRID_LEGEND` · 칸 수를 붙인 범례 `hexGridLegend(items, labels?)`.

```ts
export type HexTone = "active" | "idle" | "warning" | "critical";
export type HexItem = { id: string; label?: string; tone: HexTone; ariaLabel?: string };
```

| Prop | Type | Default |
|---|---|---|
| `items` | `HexItem[]` | — |
| `columns` · `radius` | `number` | `6` · `24` |
| `frame` | `boolean` | `true` |
| `onSelect` | `(item: HexItem) => void` | — |
| `highlightIds` | `ReadonlySet<string> \| readonly string[] \| null` | — |
| `renderTooltip` | `(item: HexItem) => ReactNode` | — |

- **상호작용은 opt-in.** `onSelect` · `renderTooltip` 이 없으면 hover 흐림 · 포인터 · role 이 붙지 않는다(GPU 맵 기본은 정적).
- `onSelect` 를 주면 헥사곤이 버튼이 된다(`role="button"` · Tab · Enter/Space). 이름은 `ariaLabel` → `label` → `id`.
- hover 중엔 나머지 칸이 0.32 로, `highlightIds` 밖의 칸은 0.18 로 흐려진다. **하이라이트가 hover 보다 우선**(배너가 가리키는 대상이 마우스에 흔들리지 않게).
- `renderTooltip` 은 내용만 준다. 상자(`bg-card` · `--color-border-default` · `--shadow-md`)는 HexGrid 가 SVG 와 같은 좌표계로 hover · 포커스한 칸에 붙여 그린다(patterns §5). `pointer-events: none` 이라 툴팁 안에 버튼을 두지 않는다. 행동은 헥사곤 클릭으로.
- `label` 이 비면 글자를 그리지 않는다(서버 맵).
- 칸 수 범례: `legend={hexGridLegend(items, { active: "Normal", idle: "Inactive" })}` → `Normal 0 · Inactive 0 · Warning 11 · Critical 3`. 칠해진 톤을 세고 0 개 톤도 줄은 남긴다.

---

## Toast

상단 중앙 고정 알림 (자동 dismiss). React Portal 사용.

```ts
export type ToastVariant = "success" | "info" | "warning" | "error";
```

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `variant` | `ToastVariant` | `"success"` |
| `message` | `string` | — |
| `actionLabel` | `string` | — |
| `onAction` | `() => void` | — |
| `onClose` | `() => void` | — |
| `durationMs` | `number` | `4500` |

---

## ConfirmDialog

실행 직전에 **대상과 결과를 되읽는** 확인 모달. [`patterns.md`](./patterns.md) P1 「위험한 실행 확인」 을 컴포넌트로 굳힌 것(Composite = [[Modal]] + [[Button]]). 확인 버튼은 footer 오른쪽 끝, 라벨은 동작 낱말.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `open` | `boolean` | — | |
| `title` | `ReactNode` | — | 실행 이름(「플랜에서 제외」) |
| `target` | `ReactNode` | — | 무엇을 — 대상을 이름 그대로 |
| `outcomes` | `{ text; tone?: "default" \| "critical" }[]` | — | 그래서 무엇이 바뀌나, 한 줄씩. 되돌릴 수 없는 결과는 `critical` |
| `children` | `ReactNode` | — | 되읽기 값(KpiField 등). target 과 outcomes 사이 |
| `confirmLabel` | `string` | — | 동작 낱말. 「확인」 금지 |
| `cancelLabel` | `string` | `"취소"` | 「취소」 로 둔다. 고치러 돌아가는 흐름도 같다 |
| `tone` | `"critical" \| "primary"` | `"critical"` | `primary` = 약정 · 생성처럼 무겁지만 파괴는 아닌 실행 |
| `loading` | `boolean` | — | 실행 버튼 로딩 |
| `onConfirm` · `onClose` | `() => void` | — | |
| `size` | `"sm" \| "md" \| "lg"` | `"sm"` | |

- 되돌릴 수 있는 가벼운 실행 · 자주 반복하는 일에는 쓰지 않는다 — 그 자리는 Toast 의 되돌리기
- 완료는 Toast 로, 되돌릴 수 있으면 토스트에 「되돌리기」

```tsx
<ConfirmDialog
  open={!!target}
  title="플랜에서 제외"
  target={<><strong>김서연</strong> kim@whatap.io 을 운영팀 플랜에서 제외합니다.</>}
  outcomes={[{ text: "이 계정은 더 이상 AI 를 쓸 수 없습니다.", tone: "critical" }]}
  confirmLabel="제외"
  onConfirm={remove}
  onClose={() => setTarget(null)}
/>
```

---

## InfoTip

글자 옆 **ⓘ 아이콘 버튼 + [[Tooltip]]**(Composite). 원 안에 영문 i 가 든 16px 버튼이고 hover · focus 로 툴팁이 열린다. 툴팁 트리거를 밑줄로 그리지 않는다([`patterns.md`](./patterns.md) §16).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `content` | `ReactNode` | — | 툴팁 본문 1-2 문장. 줄을 가르려면 `<br />` |
| `label` | `string` | `"도움말"` | 스크린리더 이름. 본문과 같은 문장을 넣지 않는다 |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | |
| `open` | `boolean` | _auto_ | 강제 표시(디자인 확인용) |
| `className` | `string` | — | |

- 설명이 붙는 글자는 밑줄 없이 두고 바로 뒤에. 사이 4px, 같은 줄 가운데 정렬
- 꼭 읽어야 하는 경고 · 차단 이유는 숨기지 않는다 → [[Notice]]
- 색 tertiary → hover · focus secondary, 포커스 링 brand-blue

```tsx
<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
  한계 금액 200,000원
  <InfoTip content="종량제 사용량 한계는 기본 크레딧이 소진된 후 누적 사용액에 적용됩니다." />
</span>
```

---

## AiSymbol

WhaTap AI 핀휠 그라데이션 심볼. 위젯 헤더, AI 토글 버튼, 인사말 영역 등 모든 AI 컨텍스트의 시각 표식.

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `16` |
| `className` | `string` | `""` |

---

## DashboardBuildingProgress

대시보드 구성 중 진행 로딩 화면. spinner + 단계별 체크. (AI가 "대시보드를 만들고 있어요" 상태일 때 본문 영역에 표시.)

```ts
export type DashboardBuildingProgressProps = {
  steps: string[];
  title: string;
  subtitle?: string;
  intervalMs?: number;
  card?: boolean;
  className?: string;
  background?: string;
};
```

| Prop | Default |
|---|---|
| `subtitle` | `"잠시만 기다려 주세요"` |
| `intervalMs` | `380` |
| `card` | `false` |

---

## WhaTapAiContext (Provider)

페이지 트리 전체에서 AI 위젯 상태를 공유하기 위한 React Context. `useWhaTapAi()` 훅으로 `aiActive` · `setAiActive` · `lastPrompt` 등 접근.

```tsx
import { WhaTapAiProvider, useWhaTapAi } from "@whatap/design-system";

// app root
<WhaTapAiProvider>
  <App />
</WhaTapAiProvider>

// any descendant
const { aiActive, setAiActive, lastPrompt } = useWhaTapAi();
```

이미 `<App>` 최상단에서 한 번 wrap 되어 있으니, 페이지 컴포넌트는 hook 만 호출하면 됩니다.

---

## AiWidget (deprecated)

라이브 whatap-ai-assistant 복제 UI 패널. **`WhaTapAiWidget`이 이 컴포넌트를 대체합니다.** 신규 페이지에서는 `WhaTapAiWidget`을 쓰세요. `AiWidget`은 마케팅 비교용으로만 남아 있습니다.

---

## Do / Don't

✅ **Do**

- 페이지를 만들 때 **`DashboardLayout` slot 패턴**을 따르기 — header/main/children 슬롯에 컴포넌트만 꽂아넣기
- AI 위젯을 켤 때 **`DashboardLayout`의 `widgetOpen` prop** 한 곳으로 사이드바 축소 트리거 ([patterns.md](./patterns.md#2-sidebar-collapse-on-widget-open))
- `DataTable`의 `align` / `numeric`을 명시 — 휴리스틱에 의존하지 말기
- `MiniLineChart` 등 SVG 안의 `fontSize`에 반드시 `"px"` 붙이기
- **옵션바는 기본값 그대로 쓰기** — `layout="inline"` + `size="sm"`(24px). 값을 바꿔야 할 이유가 있을 때만 명시
- **한 행 안에서는 `size` 를 하나로 통일** — 행 단위로 `OptionbarPage size` 를 주면 하위 4종에 일괄 전달됨
- 40px 라인을 쓰는 보조 행(`SubHeaderBar` · 사이드바 조직/프로젝트 스위처 · inline 옵션바)은 **컴포넌트로 조립** — 높이는 컨테이너가 고정하고 안의 컨트롤은 `size` 로만 조절
- 읽기 전용 값을 시각적으로 구분해야 하면 `OptionbarValueDisplay display="chip"` — **무채색(neutral·soft) 고정**

❌ **Don't**

- 페이지 별로 사이드바를 직접 import해서 다르게 렌더 — `DashboardLayout`에 prop으로 전달
- AI 위젯이 열렸다고 PageHeader 일부를 hide — 절대 금지 ([patterns.md](./patterns.md#1-page-header-invariant))
- `Stage` 컴포넌트를 실서비스 페이지에 사용 — 마케팅 데모 전용
- 한 행에서 **컨트롤마다 다른 `size`** 를 주기 — baseline 이 어긋난다(LIVE 타이머만 24px, 셀렉터는 32px 같은 조합 금지)
- 행 높이를 **padding 으로 만들기** — `size` 를 내리면 행까지 같이 줄어든다. 행은 고정 높이(40px), 안의 컨트롤만 `size` 로 조절
- `px py border-b` **inline `<div>` 로 보조 행/툴바를 재구현** — `SubHeaderBar` 의 `left`/`center`/`right` 슬롯에 조립
- 값 표시용 칩에 **상태 톤(primary/warning/critical/success)** 주기 — severity 로 오독된다. 값 칩은 `neutral` 만
- `Chip` 을 데이터 값 강조에 남용 — `Chip` 의 용도는 severity·카테고리·상태이고, 읽기 전용 값 신호가 필요한 자리에만 `display="chip"` 으로 제한

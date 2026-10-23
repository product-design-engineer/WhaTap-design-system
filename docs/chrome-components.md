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

요일(7) × 시간(24) 알림 수신 매트릭스. **Composite** — 칸과 범례 견본은 [[EventTimeCell]](Primitives)이 그린다: 켜짐 = 칠 `--color-brand-blue` · 테두리 `--color-brand-blue-deep`, 꺼짐 = 칠 `--color-surface-100` · 테두리 `--color-border-strong`. 칸은 `aria-pressed` + «월 09시 수신» 이름. Figma 정본 EventTimeCell `59:4`.

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
    <ActiveTransactionArc frame={false} agents={agents} maxTx={maxTx} agent={agent} />
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
| [[ChartBar]] | 칸 바닥에서 자라는 막대 하나 — `ratio`(0~1, 최소 2px) · `null` = 모름(칸 전체 `surface-100`) · `delay` 진입 애니메이션 | 가로 flex 줄 |

| Prop (둘 공통) | Type | Default |
|---|---|---|
| `max` | `number` — 이미 보기 좋은 값으로 올린 최대. 0 이면 바닥 눈금 하나 | — |
| `ticks` | `number[]` — 눈금 값(데이터에서 오는 눈금: 단계 값 · 판정 경계). 없으면 최대 · 절반 · 0 | — |
| `vertical` (ChartGrid) | `number` — 세로 점선 칸 수. 분포 차트에만(ScatterHeatmap 22) | — |
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

- 범례 항목은 [[ChartLegendItem]](Primitives) — 견본 + 이름 + (선택) 값, 사이 4px. 세로 목록은 `fill`(이름 말줄임 · 값 오른쪽 끝). 견본만 필요하면 [[ChartSwatch]] — 둘은 같은 견본을 그린다(내부 `_swatch`). 견본은 마크 모양을 따른다: 선 = `shape="line"`(8×2), 면 · 막대 · 조각 · 칸 = 기본 사각(8×8), 점 · 버블 = `shape="dot"`(8px 원). [[WidgetFrame]] 범례 항목은 `{ label, color, shape, value }` — 선 차트 칸이면 `shape: "line"`.
  Figma 정본: ChartSwatch 페이지 `549:2` · 세트 `549:5` / ChartLegendItem 페이지 `567:47` · 세트 `567:64`(`shape` × `fill` · label · value · showValue, 견본 칠은 인스턴스에서 마크 색 변수로).
- 고리형 막대는 [[ChartRadialBars]](Primitives) — 칸 하나 = 대상 하나, 구간은 안쪽부터 쌓인 줄무늬(`levels` 단계, 0 보다 큰 구간은 최소 한 줄). 바탕 `--color-chart-radial-track` · 구분선 `--color-chart-radial-divider`. 가운데는 `children`, 회전 장식은 `sweep`(동작 줄이기에서 멈춤). [[ActiveTransactionArc]] 는 `agents`(에이전트별 `{ normal, slow, verySlow }`)로 이것을 그린다 — 종전 정적 이미지는 삭제.
  Figma 정본: ChartRadialBars 페이지 `568:6848` · 세트 `568:6918`(`sweep` · center · showCenter) · 변수 `color/chart/radial-track` `568:2` · `radial-divider` `568:3`. ActiveTransactionArc 세트 `347:267` 은 이 세트 · MetricStat · ChartLegendItem 인스턴스로 다시 짰다.
- 가리킨 마크 강조(공통 규칙, patterns §26 «강조») — 가리킨 마크는 불투명 + 카드색 2px 고리, 나머지 0.32, 색은 그대로. 차트 안 범례는 [[ChartLegendItem]] `onHover` · `dimmed` 로 그 계열만 남긴다. 전환은 `.wds-chart-mark`(120ms · 동작 줄이기면 없음).
- 시간축 차트의 hover 는 [[ChartCrosshair]](Primitives) — 플롯 위 포인터 x → 가장 가까운 시점 · 세로 안내선(`--color-border-strong`) · 계열마다 점(카드색 고리) · 값 툴팁. Props: `count` · `max` · `min` · `series({ label, color, values, shape?, noDot?, unit? })` · `labels`(시점 이름) · `unit` · `footer(i)` · `band`(막대) · `positions`(고르지 않은 x) · `onIndex`(막대 흐림) · `index`(제어형 — 칸 여럿이 한 시점) · `noTooltip` · 플롯 여백(`right` · `padTop` · `padBottom`, ChartGrid 와 같게). MiniLine · MiniMultiLine · MiniBar · Forecast · Apdex 가 쓰고, 각 차트는 시점 이름을 `pointLabels`(Forecast 는 `formatX`)로 받는다.
  Figma 정본: 페이지 ChartCrosshair `591:2` · 컴포넌트 `591:3`(가리켰을 때 모습 견본).
- 경과 시간 차트(Flame · Waterfall)의 요소 — [[ChartSpanBar]](Primitives, 구간 막대: `start` · `end` 플롯 폭 비율 · `color` · `textColor` · `label` · `dimmed` · `active` · `top` · `height`. 이름은 차트가 막대 폭 40px 이상일 때만 준다) · [[ChartBrush]](Primitives, 시간축 줄을 끌어 구간 확대: `onSelect(from, to)` · 플롯 상자 `left` · `right` · `top` · `bottom` · `strip` · `minRatio`. 띠 `--color-brand-blue-wash`). [[ChartTimeAxis]] 는 `left` 로 Y축 칸이 없는 플롯에 맞춘다.
  Figma 정본: ChartSpanBar 페이지 `599:2` · 세트 `599:9`(`state` default · dimmed · active · label · showLabel) / ChartBrush 페이지 `599:16` · 컴포넌트 `599:17`(끄는 중 견본).
- 마크 hover 값 상자는 [[ChartTooltip]](Primitives) — 카드 표면 · 1px 테두리 · 반경 6 · 그림자 · 제목 + 값 줄(견본 · 이름 · 값 굵게) + 보조 줄. `left` · `top` 은 마크 자리(차트가 계산), `flipX` · `flipY` 로 반대쪽에 편다. 자유 내용은 `children`. 차트 마크에 브라우저 `title` 을 쓰지 않는다. ScatterChart · ZoneScatterChart · BoxPlotChart · StatusTimeline(`formatAt`) · EqualizerChart · StackedAreaChart(`pointLabels`, 세로 안내선) · HexGrid 가 쓴다.
  Figma 정본: 페이지 ChartTooltip `589:10` · 세트 `589:67`(`rows` × `footer` · title).
- 차트 옆 수치(라벨 위 큰 숫자 · 단위 · 보조 줄)는 [[MetricStat]](Primitives, 옛 이름 SpeedStat) — [[ActiveTransactionSpeedWidget]] RPS · TPS, [[ActiveTransactionArc]] Max TX · Agent.
- 높이가 정해진 `position: relative` 플롯 상자 안에 둔다. 두 부품에 **같은 `max` · 여백**을 줘야 글자와 점선이 같은 높이에 선다.
- 축 제목은 그리지 않는다(§26 결정). 오른쪽 두 번째 Y축은 금지(§19).
- X축 시간 · 범주 글자는 차트마다 놓는 규칙이 달라 차트가 그린다.
  → (2026-10-22) **시간 글자는 [[ChartTimeAxis]](Primitives)** 가 놓는다 — `labels` · `positions`(0 ~ 1, 없으면 같은 간격) · `right`. 범주 글자는 여전히 [[MiniBarChart]] `categories`.
  Figma 정본: 페이지 ChartTimeAxis `551:2` · 세트 `551:13`(`right` 2 variant, TEXT `first` · `second` · `third` · `last`). 예시 프레임은 요소 다섯으로 조립한 선 차트.
- **Figma 정본**: 페이지 ChartGrid `545:2` · 세트 `545:16`, 페이지 ChartValueAxis `545:3` · 세트 `546:22`(`ticks` × `right` 4 variant, ChartValueAxis 는 TEXT `max` · `mid` · `zero`). 페이지 ChartPeakMarker `547:2` · 컴포넌트 `548:2`(TEXT `label`, ▼ 칠은 `color/chart/series-1` — 다른 계열이면 인스턴스에서 바꾼다). 두 부품을 겹친 예시 프레임이 페이지마다 있다. 기존 Figma 차트 세트(MiniLineChart 등)는 아직 자기 격자 · 축을 그린다(`border/default`) — 인스턴스로 바꾸는 것은 후속.

---

## ActiveTransactionSpeedWidget

실시간 트래픽 흐름 위젯 — 등급별 점이 왼쪽에서 오른쪽으로 흐르고 RPS · TPS · 등급별 개수 · 속도 막대가 함께 움직인다. **Composite** — 좌우 RPS · TPS 는 [[MetricStat]](Primitives: 라벨 위 큰 숫자, 폭 72 · compact 56 고정 · 옛 이름 SpeedStat). 흐르는 점 · 속도 막대는 이 위젯의 마크라 위젯이 그린다. 등급별 개수 색은 판정 등급 토큰 `--color-chart-speed-*`(patterns §17) — Arc · Hitmap 의 `SPEED_LEGEND` 와 같다. 실데이터 없는 데모 · 캡처는 `paused`.

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | 「액티브 트랜잭션 스피드」 |
| `baseRps` · `baseTps` | `number` | 113 · 116 |
| `baseTotals` | `{ normal, warning, critical, sum }` | — |
| `paused` | `boolean` | `false` |
| `compact` | `boolean` | `false` |
| `onOpenDetail` | `() => void` | — |

Figma 정본: ActiveTransactionSpeedWidget `374:5` · MetricStat `564:15`.

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
| EqualizerChart | 바깥 좌우 여백(8px) | `title` · `legend`(구간 누적이면 `SPEED_LEGEND` 등) · 메뉴 |
| StackedAreaChart | 바깥 좌우 여백(8px) · 계열 범례 줄 | `title` · `summary` · `legend={stackedAreaLegend(series)}` · 메뉴 |
| StatusTimeline | 바깥 좌우 여백(8px) · 심각도 범례 줄 | `title` · `summary` · `legend={statusTimelineLegend()}` · 메뉴 |
| ScatterChart | 바깥 좌우 여백(8px) · 계열 범례 줄 | `title` · `summary` · `legend={scatterLegend(series)}`(원 견본) · 메뉴 |
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

## ScatterChart

두 수치(X · Y)의 관계를 점으로 — 상관 · 군집 · 이상점. `size` 를 주면 면적이 그 값인 버블. **Composite** — 격자 [[ChartGrid]](가로 눈금 + 세로 절반) · Y [[ChartValueAxis]] · X 글자 [[ChartTimeAxis]](`positions` 0 · 0.5 · 1) 를 조합하고 점만 그린다. X 가 시간이고 응답 판정 색이면 [[ScatterHeatmap]] — 근사하지 않는다(§21).

| Prop | Type | Default |
|---|---|---|
| `series` | 1~3개 `{ label, points: { x, y, size?, label? }[], slot?: 1 \| 2 \| 3 }` | — |
| `xMax` · `yMax` | `number` — 없으면 데이터 최대를 1 · 2 · 4 · 5 · 10 × 10ⁿ 로 올림 | — |
| `xUnit` · `yUnit` | `string` — 축 제목 대신 단위 | `""` |
| `frame` | `boolean` | `true` |

- 색 = `--color-chart-series-{slot}`(기본 계열 순서). 필터로 계열이 빠져도 색을 지키려면 `slot` 고정(§17). 계열 4개 이상은 타입이 막는다 — facet(§18).
- 점 원 6px · 불투명도 0.6 — 겹친 곳이 짙어져 밀도가 읽힌다(§21 결정). 버블 반지름 3~12px(면적 비례), 큰 것을 먼저 그린다.
- 단독(`frame`)이면 계열 둘 이상일 때 플롯 위 오른쪽에 원 견본 범례. 대시보드 칸은 `frame={false}` + WidgetFrame `legend={scatterLegend(series)}`.

Figma 정본: 페이지 ScatterChart `572:6908` · 세트 `572:7311`(`frame` × `marks` dot · bubble). ChartSwatch `shape=dot` `572:39` · ChartLegendItem `shape=dot` `572:6745` · `572:6749` 추가.

## ZoneScatterChart

판정 구역(행 × 열 칸) 위에 대상 점 — 점이 어느 구역에 몇 개인지가 판정. **Composite** — [[ChartValueAxis]](`ticks` = 0 · Y 경계 · 최대) · [[ChartTimeAxis]](`positions` = 0 · X 경계 · 최대) 를 조합하고 구역 · 점 · 임계 띠를 그린다.

| Prop | Type | Default |
|---|---|---|
| `points` | `{ x, y, label? }[]` | — |
| `xBreaks` · `yBreaks` | 구역 경계(오름차순) | — |
| `zones` | `string[][]` — `[행(위부터)][열]` 이름 | — |
| `columnLabels` | 열 머리(개수 자동) | — |
| `critical` | `{ from, label }` — Y 임계 띠 | — |
| `xMax` · `yMax` · `xUnit` · `yUnit` | 축 | `100` · `100` · `""` |
| `color` · `frame` | 점 색 · 여백 | series-1 · `true` |

- 축은 선형 — 0~1% 같은 구역은 실제대로 좁다. 좁은 열의 이름 · 개수는 플롯 아래 한 줄로 옮긴다.
- 구역 = 무채색 면, 점 = 계열색 — 같은 색 계열로 칠하지 않는다(§17). 액션은 [[WidgetFrame]] `menu`.

Figma 정본: 페이지 ZoneScatterChart `587:2` · 세트 `587:117`(`frame`).

## BoxPlotChart

대상(범주)마다 값 분포를 **백분위**로 — 선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99. 경보 · SLO 와 같은 숫자를 말한다. **Composite** — [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCategoryAxis]] 를 조합하고 상자 · 수염 · 점 · p50 숫자를 그린다.

| Prop | Type | Default |
|---|---|---|
| `boxes` | `{ label, values?: number[], stats?: { p5, p25, p50, p75, p95, p99 } }[]` | — |
| `max` · `unit` | Y 최대 · 단위 | p95 최대 × 1.1 올림 · `""` |
| `color` | 계열 토큰 하나 | series-1 |
| `frame` | `boolean` — 범례 줄 | `true` |

- 원값을 주면 `boxPlotStats(values)` 가 선형 보간 백분위를 계산한다. APM 서버 백분위는 `stats` 로.
- Y 는 p95 기준 — 축을 넘는 p99 는 위 끝 ▲ + 값. p50 숫자는 가운데 선 오른쪽.
- 범례 문장 `BOX_PLOT_LEGEND` 를 늘 보인다(WidgetFrame 안이면 `summary`). 표본 20개 미만이면 쓰지 않는다.
- 사분위 · Tukey 수염 · 개별 이상치는 쓰지 않는다(2026-10-23 결정 — 운영자의 언어가 아니고 축이 늘어 상자가 눌렸다).

Figma 정본: 페이지 BoxPlotChart `586:2` · 세트 `586:93`(`frame`).

## ArcGauge · ChartArc

범위 안 지금 값 하나 — 호 길이 + 가운데 큰 숫자. **ArcGauge(Composite)** = **ChartArc(Primitives — 240° 호 트랙 · 채움 · 바깥 임계 띠)** + 가운데 값 · 양 끝 글자. [[RangeGauge]] 와 같은 계약의 둥근 판 — 정사각 칸은 호, 좁고 긴 칸은 막대.

| Prop (ArcGauge) | Type | Default |
|---|---|---|
| `value` · `max` | `number` | — |
| `min` | `number` | `0` |
| `unit` · `label` | 단위 · 지표 이름(가운데 · 접근성) | — |
| `minLabel` · `maxLabel` | 양 끝 이름 | `Min` · `Max` |
| `thresholds` | `{ from, tone: "warning" \| "critical" }[]` | `[]` |
| `size` | 호 크기(px) | `140` |

- 호 여러 개로 대상을 비교하지 않는다 — 각도는 길이보다 비교가 어렵다([[EqualizerChart]] · [[BarList]]).
- `role="meter"` · 값 · 범위를 읽는다.

Figma 정본: ChartArc 페이지 `585:2` · 세트 `585:153`(`level` × `bands`) / ArcGauge 페이지 `585:183` · 세트 `585:226`(`tone` · unit · label · min · max).

## Treemap

계층 구성의 크기를 칸 면적으로 — 묶음(1단계) 안에 항목 칸. **Composite** — [[ChartLegendItem]](묶음 범례) · [[ChartTooltip]] 을 조합하고 칸만 그린다(배치는 내부 squarified `_treemapLayout`).

| Prop | Type | Default |
|---|---|---|
| `data` | `{ label, value?, children?: { label, value }[] }[]` | — |
| `unit` | `string` | `""` |
| `legend` | 묶음 범례 | `true` |

- 묶음 색 = 계열 슬롯(묶음 순서) · 묶음 없으면 한 색 · 8개 넘으면 「기타」(§22). 상태색 아님.
- 라벨은 칸 ≥ 56 × 28 일 때만(흰 글자 — 컬러 위 전경 예외), 작은 칸은 툴팁.
- 양수 · 더할 수 있는 값만. 비율 · 평균 · 증감은 쓰지 않는다.

Figma 정본: 페이지 Treemap `596:2` · 컴포넌트 `596:3`.

## GeoMap

국가별 값을 세계 지도 위에 — 단계 구분(국가 칸 색 4단계) 또는 버블(국가 자리 원 넓이). **Composite** — [[ChartLegendItem]](단계 범례) · [[ChartTooltip]] · [[TopologyZoomControl]](`limits` 100%~600%) 을 조합하고 국가 도형 · 격자 · 버블만 그린다. 도형은 Natural Earth 1:110m(퍼블릭 도메인) · Equal Earth 투영 · 남극 제외(내부 `_geoWorld`, 생성 `scripts/build-geo-world.mjs`).

| Prop | Type | Default |
|---|---|---|
| `data` | `{ code: ISO alpha-2, value, name? }[]` | — |
| `mode` | `"fill"`(비율 · 평균) · `"bubble"`(개수 · 합계) | `"fill"` |
| `label` · `unit` | 값 이름 · 단위 | `"값"` · `""` |
| `breaks` | 단계 경계 3개 | 0 ~ 최대 4등분 |
| `emptyLabel` | 빈 상태 글 | `"데이터 없음"` |
| `zoom` | 줌 컨트롤 | `true` |

- 값 없는 국가(바탕 `--color-surface-200`) ≠ 낮은 값(`--color-chart-seq-1`). 데이터가 하나도 없으면 지도 위 «데이터 없음».
- 개수 · 합계는 버블 — 단계 구분은 넓은 나라를 크게 보이게 한다. 음수(증감)는 쓰지 않는다.
- 110m 도형에 없는 작은 나라(싱가포르 · 홍콩 …)의 값은 지도 아래 «지도 밖» 줄로.
- 휠 줌 없음(대시보드 스크롤 보호) — 버튼으로 확대, 끌어서 이동.

Figma 정본: 페이지 GeoMap `598:2` · 세트 `598:8161`(`mode` fill · bubble · empty) · 내부 도형 `_GeoWorld` `598:7530` / 줌 컨트롤 페이지 TopologyZoomControl `597:30` · 컴포넌트 `597:31`.

## FlameChart

호출 · 요청 구간을 시간 위에 깊이별 계단으로 — 색 = 상태. **Composite** — [[ChartSpanBar]] · [[ChartBrush]] · [[ChartTimeAxis]] · [[ChartLegendItem]] · [[ChartTooltip]] · [[Button]](전체 보기) 조합.

| Prop | Type | Default |
|---|---|---|
| `spans` | `{ label, start, end, depth, status?: normal · slow · error · none, lane?, detail? }[]` | — |
| `range` | 전체 시간 범위(ms) | 0 ~ 가장 늦은 끝 |
| `statusLabels` | 상태 이름 바꾸기 | 정상 · 느림 · 에러 · 정보 없음 |

- 색 = 상태(BlockGrid · HexGrid 와 같은 `_statusTone`). 계열 색을 섞지 않는다.
- 시간축 줄을 끌어 확대 · «전체 보기». 폭 40px 미만 막대는 이름 없이(툴팁).
- 에러 시각은 Flame 안 세로선이 아니라 위에 [[StatusTimeline]] 을 같은 시간 범위로.

Figma 정본: 페이지 FlameChart `600:2` · 컴포넌트 `600:3`.

## WaterfallChart

리소스 · 요청 하나에 한 줄, 단계를 이어 붙인 가로 막대 — 색 = 단계. **Composite** — FlameChart 와 같은 요소 조합 + 이름 칸 · 표시선.

| Prop | Type | Default |
|---|---|---|
| `phases` | 단계 이름(색 순서) | — |
| `rows` | `{ label, meta?, start, segments: number[] }[]` | — |
| `markers` | `{ at, label }[]`(DOMContentLoaded · load) | `[]` |
| `range` · `labelWidth` | 시간 범위 · 이름 칸 | 자동 · `160` |

- 색 = 단계(계열 슬롯 8개까지, 넘으면 «기타»). 리소스 타입은 색이 아니라 이름 아래 글자.
- 여러 로드의 평균 단계는 [[SegmentBar]].

Figma 정본: 페이지 WaterfallChart `601:2` · 컴포넌트 `601:3`.

## MetricGrid

같은 대상의 관련 집계 값 여럿을 세로 구분선으로 나눈 숫자 칸 줄. **Composite** — 칸마다 [[MetricStat]].

| Prop | Type | Default |
|---|---|---|
| `items` | `{ label, value, unit?, caption? }[]` | — |
| `maxColumns` | 한 줄 최대 칸 | `4` |
| `compact` | 작은 숫자 | `false` |

- 한 줄 4칸까지 · 넘으면 줄바꿈(가로 스크롤 금지) · 칸 이름 한 줄 말줄임(MetricStat 라벨, 2026-10-23).
- 칸은 세 겹까지(이름 · 값 + 단위 · 보조). 하위 분해는 SegmentBar · BarList, 범위는 RangeGauge 를 줄 아래에(화면 조합).
- 값 색은 primary 하나 — 칸 하나만 색 강조하지 않는다.

Figma 정본: 페이지 MetricGrid `595:2` · 세트 `595:61`(`columns`).

## PairedTimeChart

단위가 다른 두 지표를 시간축을 공유하는 위 · 아래 두 칸으로 — 이중 Y축 대신(§19). **Composite** — 칸마다 [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCrosshair]](`index` 공유), 막대 칸은 [[ChartBar]], 아래 칸만 [[ChartTimeAxis]].

| Prop | Type | Default |
|---|---|---|
| `top` · `bottom` | `{ label, kind: "bar" \| "line", values: (number \| null)[], unit?, color?, max? }` | — |
| `count` | 전체 시점 수(시간 범위) — 값보다 크면 뒤쪽 빈 미래 | 값 길이 최대 |
| `xLabels` · `pointLabels` | 시간 글자 · 툴팁 제목 | — |
| `frame` | `boolean` | `true` |

- 축 제목 대신 칸 이름(왼쪽 위), 단위는 눈금 접미사. 오른쪽 Y축 없음.
- 미래 = 빈칸 · 수집 없음(`null`) = 막대 «모름» 칸 · 선 끊김.
- 한 칸을 가리키면 두 칸이 같은 시점 — 위 칸 툴팁에 두 지표(계열별 단위).

Figma 정본: 페이지 PairedTimeChart `594:2` · 컴포넌트 `594:3`.

## SegmentBar

전체 하나를 구간으로 나눈 단일 가로 누적 바 + 바 아래 한 줄 범례. **Composite** — [[ChartLegendItem]] · [[ChartTooltip]] 을 조합하고 구간만 그린다.

| Prop | Type | Default |
|---|---|---|
| `segments` | `{ label, value, color }[]` | — |
| `total` · `restLabel` | 전체 · 남는 몫 이름 | 구간 합 · 「나머지」 |
| `unit` | `string` | `""` |
| `legendValue` | `"value" \| "percent" \| "both"` | `"value"` |
| `height` · `legend` | 바 높이 · 범례 그리기 | `12` · `true` |

- 남는 몫은 `--color-surface-200` 이름 구간 — 범례에 없는 빈 구간을 두지 않는다.
- 범례 한 줄 · 줄바꿈 · 사각 견본. 0 인 구간은 바에서 빠지고 범례에 남는다.
- hover: 구간 · 범례 → 그 구간만 + 툴팁(값 · 전체의 %).

Figma 정본: 페이지 SegmentBar `592:2` · 세트 `592:49`(`legendValue`).

## TrendTile

지표 하나의 지금 값 · 비교 시점 대비 변화 · 최근 추이. **Composite** — [[MetricStat]](지표명 · 값 · 단위) + [[Sparkline]](추이, 데이터 최소 ~ 최대) + 변화 줄.

| Prop | Type | Default |
|---|---|---|
| `label` · `value` · `unit` | 지표명 · 값 · 단위 | — |
| `delta` · `deltaUnit` | 변화(부호) · 단위(`%` `%p` `ms`) | — |
| `better` | `"up" \| "down" \| "none"` — 좋은 방향 | `"up"` |
| `compareLabel` | 비교 기준 글자 | 「직전 대비」 |
| `values` · `color` | 최근 추이 · 스파크라인 색 | — · series-1 |
| `frame` | `boolean` — 카드 껍데기 | `true` |

- 변화 색 = 개선 `--color-status-success` · 악화 `--color-status-error` · 없음/판정 없음 tertiary. ▲▼ · 부호 · 비교 기준을 함께(§23).
- 좋은 방향이 없는 지표는 `better="none"`. 누적 카운터 원값은 늘 «개선» 으로 보이니 쓰지 않는다.
- [[StatCard]] `trend` 는 방향만 받아 색이 지표 방향을 무시한다 — 변화를 판정해야 하면 이것.

Figma 정본: 페이지 TrendTile `584:2` · 세트 `584:99`(`verdict` × `frame` · change · compare).

## BlockGrid · BlockCell

대상 하나 = 이름 있는 칸 하나를 격자로 깐 상태 맵 — 이름으로 대상을 찾는다. **BlockGrid(Composite)** = **BlockCell(Primitives — 상태 칠 · 이름 말줄임 · 높이 32)** 격자 + 단독 범례 [[ChartLegendItem]]. 이름 없는 분포는 [[HexGrid]] — 상태 어휘 · 색 · 범례는 둘이 같다(내부 `_statusTone`).

| Prop (BlockGrid) | Type | Default |
|---|---|---|
| `items` | `{ id, label, tone: "active" \| "idle" \| "warning" \| "critical" }[]` | — |
| `columns` | `number` | `4` |
| `toneLabels` | 상태 이름 바꾸기(`{ active: "정상" }`) | — |
| `onSelect` | `(item) => void` — 칸이 버튼이 된다 | — |
| `frame` | `boolean` — 범례 줄 | `true` |

- 범례는 개수를 붙이고 0 개인 상태도 남긴다(`blockGridLegend(items)` → WidgetFrame `legend`, `hexGridLegend` 와 같은 줄).
- 칸 순서 = `items` 순서. 심각도순 · 이름순 정렬은 호출부.
- 3D 블록은 그리지 않는다. 고를 수 있는 칸은 `.wds-block-cell:focus-visible` 바깥 링.

Figma 정본: BlockCell 페이지 `582:2` · 세트 `582:11`(`tone` · label) / BlockGrid 페이지 `582:41` · 세트 `582:111`(`frame`).

## EqualizerChart

대상마다 세로 막대를 칸으로 끊어 쌓는다 — 칸 하나 = 축 최대 ÷ `levels`. **Composite** — [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCategoryAxis]] 를 조합하고 칸만 그린다. 호 형태는 [[ChartRadialBars]](같은 칸 계산, 내부 `_stripes`).

| Prop | Type | Default |
|---|---|---|
| `bars` | `{ label, segments?: { value, color, label? }[], value? }[]` | — |
| `max` | `number` — 사용률이면 100 | 합 최대 올림 |
| `levels` | `number` — 칸 수 | `10` |
| `threshold` | `number` — `value` 막대 임계 2색 | — |
| `unit` | `string` | `""` |
| `valueLabels` | `boolean` — 최대만 굵게 | `true` |
| `frame` | `boolean` | `true` |

- 색은 구간 누적(`segments`, 속도 등급이면 `--color-chart-speed-*` + WidgetFrame `legend={SPEED_LEGEND}`) 또는 임계 2색(`--color-brand-blue` / `--color-status-warning`) 중 하나.
- 임계 슬라이더는 화면의 컨트롤 — 차트는 `threshold` 만 받는다.
- 0 보다 큰 구간은 최소 1칸이라, 작은 구간이 여럿이면 큰 구간 칸이 줄어든다. 정밀 비교는 [[BarList]].

Figma 정본: 페이지 EqualizerChart `579:2` · 세트 `579:431`(`mode` × `frame`).

## StackedAreaChart

계열을 아래에서 위로 쌓은 면 — 위 경계 = 합계의 추이, 층 두께 = 각 계열의 몫. **Composite** — [[ChartGrid]] · [[ChartValueAxis]] · [[ChartTimeAxis]] · [[ChartPeakMarker]](합계 최고점) 를 조합하고 면만 그린다.

| Prop | Type | Default |
|---|---|---|
| `series` | `{ label, values, slot?: 1..8 }[]` — `series[0]` 이 바닥, 8개까지 | — |
| `xLabels` | `string[]` | — |
| `unit` | `string` | `""` |
| `max` | `number` — Y 고정 | 합계 최대 올림 |
| `peak` | `boolean` — 합계 최고점 ▼ | `false` |
| `frame` | `boolean` | `true` |

- 면은 불투명 + 층 사이 카드색 1px. 누적면은 겹치지 않으므로 투명도가 뜻이 없고, 투명하면 범례 견본과 색이 달라 보인다.
- 크고 안정적인 계열을 바닥에 — 바닥이 평평해야 위층이 읽힌다. 계열끼리 견주는 자리는 [[MiniMultiLineChart]].
- 범례는 `stackedAreaLegend(series)`(위층부터) 를 WidgetFrame `legend` 로. 별도 범례 패널로 빼지 않는다.

Figma 정본: 페이지 StackedAreaChart `578:2` · 세트 `578:80`(`frame`).

## SparklineCell · Sparkline

표 셀 하나에 행 색 인덱스 · 지금 값 · 최근 추이. **SparklineCell(Composite)** 은 **Sparkline(Primitives — 축 없는 선 1.5px · 끝점 4px · 바닥선, 높이 20)** 을 조합하고 인덱스 바 · 값 글자 · 자리 맞춤만 그린다. 비율 막대만이면 [[MetricBarCell]].

| Prop (SparklineCell) | Type | Default |
|---|---|---|
| `value` | `number \| string \| null` — null 이면 `-` + 빈 자리 | — |
| `unit` | `string` | — |
| `values` | `number[]` — 최근 추이(시간순) | `[]` |
| `max` | `number` — 같은 열 행끼리 공유(비율이면 100) | 이 줄 최대 |
| `color` | 계열 색 토큰 | series-1 |
| `indexColor` | 짝 차트 계열 색 토큰 — 없으면 바 없음 | — |
| `valueWidth` · `sparkWidth` | `number` | `48` · `64` |

- 인덱스 바는 같은 칸 짝 차트가 있을 때만 — 표와 차트를 잇는 장치(§21). 스토리 `LinkedToChart`.
- 바닥선이 있어 0 에 붙은 평평함과 중간의 평평함이 갈린다. 부호 있는 지표는 쓰지 않는다.
- Sparkline `min`(기본 0) — 0 에서 먼 값의 모양을 보일 때(추세 타일)만 데이터 최소를 주고, 그때는 바닥선을 긋지 않는다.
- [[MetricBarCell]] 은 0 보다 큰 구간을 최소 2px 로 그린다(2026-10-23).

Figma 정본: Sparkline 페이지 `577:2` · 컴포넌트 `577:3` / SparklineCell 페이지 `577:35` · 세트 `577:62`(`index` × `state` · value · unit).

## RangeGauge

범위(min ~ Max) 안의 지금 값 — 채움 · ▼ 말풍선 · 이름 붙은 양 끝 · 임계 띠. 할당 · 한계 · 쿼터 · 정원 대비 사용. **Composite** — 채움 [[UsageGauge]] · ▼ [[ChartPeakMarker]] 를 조합하고 임계 띠 · 범위 글자만 그린다.

| Prop | Type | Default |
|---|---|---|
| `value` · `max` | `number` | — |
| `min` | `number` | `0` |
| `unit` | `string` | `""` |
| `label` | `string` — 스크린리더 이름 | — |
| `minLabel` · `maxLabel` | `string` — 양 끝 이름(`Limit` · `Allocatable`) | `Min` · `Max` |
| `thresholds` | `{ from, tone: "warning" \| "critical" }[]` | `[]` |
| `caption` | `string` — 말줄임 없이 줄바꿈 | — |

- 채움 · ▼ 색 = 지금 값이 든 임계 구간(neutral · warning · critical). 임계 기준값은 제품 규칙이라 호출부가 준다.
- 숫자는 천 단위 쉼표(정확한 값) — 축처럼 K 로 줄이지 않는다. 범위 밖 값은 막대가 끝에 멈추고 글자만 실제 값.
- 큰 숫자 칸(2.1) 아래 막대로 쓸 때 같은 값을 같은 표기로 말한다(스토리 `InWidgetFrame`).

Figma 정본: 페이지 RangeGauge `576:19` · 세트 `576:68`(`tone` · min · max · caption · showCaption).

## StatusTimeline

시간 위에 사건을 세로 마커로 — 높이 = 건수, 색 = 심각도. 경보 · 이벤트 · 배포 기록. **Composite** — 격자 [[ChartGrid]](시간 글자 사이마다 세로 점선) · 값축 [[ChartValueAxis]](단위 `건`) · 시간축 [[ChartTimeAxis]] 를 조합하고 마커만 그린다.

| Prop | Type | Default |
|---|---|---|
| `events` | `{ at, count, severity: "critical" \| "warning" \| "info", label? }[]` | — |
| `start` · `end` | `number` — X 양 끝(`at` 과 같은 단위) | — |
| `xLabels` | `string[]` — 같은 간격 시간 글자 | — |
| `max` | `number` — 건수 축 고정 | 데이터 최대 올림 |
| `frame` | `boolean` | `true` |

- 마커 폭 3px · 바닥에서 위로 · 최소 2px. 0 건은 그리지 않는다(빈 구간).
- 색은 `--color-status-error` · `-warning` · `-info`. 계열 색과 섞지 않고, 이름(범례 · `title`)과 함께 말한다(§23).
- 같은 칸 사건은 미리 묶어 건수를 더하고 가장 높은 심각도를 준다. 지표 차트 아래에 붙이면 시간 글자 · Y축 칸이 같아 세로로 맞는다.

Figma 정본: 페이지 StatusTimeline `574:2` · 세트 `574:80`(`frame`).

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

대시보드 구성 중 진행 로딩 화면. spinner + 단계별 체크. (AI가 "대시보드를 만들고 있어요" 상태일 때 본문 영역에 표시.) **Composite** — 단계 줄은 [[BuildingProgressStep]](Primitives: `done` · `active` · `pending`). Figma 정본 BuildingProgressStep `57:22`.

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

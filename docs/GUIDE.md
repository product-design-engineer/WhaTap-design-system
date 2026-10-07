# WhaTap 디자인 시스템으로 UI 구현하기 — 비개발자 가이드

아래는 코드 경험이 없는 분도 Claude Code(AI)에게 지시하여 화면을 만들 수 있도록 정리한 **단계별 절차**입니다.

---

## 전체 흐름 요약

```
① 어떤 화면인지 정의  →  ② 뼈대 조립  →  ③ 내용물 채우기  →  ④ 색·글꼴 확인  →  ⑤ 검수
```

---

## 1단계: 만들 화면의 종류를 결정한다

WhaTap 디자인 시스템에는 **3가지 영역**이 있습니다. 어떤 화면을 만들지에 따라 사용하는 부품이 달라집니다.

| 영역 | 설명 | 예시 |
|---|---|---|
| **Chrome** (크롬) | 페이지의 뼈대 — 사이드바, 상단 헤더, 옵션바, 데이터 테이블 | 대시보드 페이지, 모니터링 목록 화면 |
| **WhaTap AI** (위젯) | AI 어시스턴트 영역 — 채팅 카드, 분석 결과, 진입 버튼 | AI 응답 메시지, 분류 테이블, 비용 분석 카드 |
| **Primitives** (기본 부품) | 가장 작은 단위 — 버튼, 입력란, 체크박스, 칩, 탭 | 폼 입력, 필터 선택, 모달 팝업 |

**결정 방법:**
- "새 페이지를 하나 만들겠다" → Chrome + Primitives
- "AI 응답에 새 카드를 추가하겠다" → WhaTap AI
- "기존 페이지에 입력란/버튼을 추가하겠다" → Primitives

> 위 "영역"은 **이해를 돕는 개념 묶음**이다. 실제 Storybook 카탈로그 트리는 *import 계층* 기준 3-Layer 단일 체계 — **Primitives**(자체 렌더 리프) · **Composite**(프리미티브 조합) · **Shell**(진입점). "Chrome" 컴포넌트는 Composite/Primitives 로, "WhaTap AI" 는 각 계층 `Ai/` 하위그룹으로 들어간다. (예: `PageHeader`→`Composite/`, `Toast`→`Primitives/`, `AiReasoning`→`Composite/Ai/`, `DashboardLayout`→`Shell/`)

---

## 2단계: 페이지 뼈대를 조립한다 (Chrome)

모든 WhaTap 페이지는 **같은 뼈대 구조**를 공유합니다. 레고 블록처럼 정해진 슬롯에 부품을 끼우는 방식입니다.

```
┌─────────────────────────────────────────────┐
│  PageHeader (상단 48px — 제목, AI 버튼, 알림)  │  ← 절대 숨기면 안 됨
├──────┬──────────────────────────────────────┤
│      │  OptionbarPage (시간 선택, 프리셋)      │
│ 사이드 ├──────────────────────────────────────┤
│ 바    │                                      │
│ 240px │         main (본문 영역)               │
│      │                                      │
├──────┴──────────────────────────────────────┤
│        (AI 위젯이 열리면 우측에 480px 패널)      │
└─────────────────────────────────────────────┘
```

**조립 순서:**

1. **`DashboardLayout`** — 전체 틀. 사이드바 + 본문을 자동 배치
2. **`PageHeader`** — 상단 고정 헤더 (제목, AI 토글, 알림 등). **AI가 열려도 헤더는 그대로 유지** (불변 규칙)
3. **`OptionbarPage`** (선택) — 시간 범위, 프리셋 선택 등 옵션 도구 모음
4. **`main` 슬롯** — 실제 콘텐츠 (테이블, 차트, 카드 등)
5. **`WhaTapAiWidget`** (선택) — AI 위젯 패널

> **핵심:** AI 위젯이 열리면 사이드바가 240px → 80px(제품 레일 40 + 아이콘 메뉴 40)로 자동 축소됩니다. 별도 처리 불필요.

---

## 3단계: 내용물을 채운다

### A. 데이터 테이블이 필요한 경우

`DataTable` 컴포넌트를 사용합니다. 지켜야 할 규칙:

| 항목 | 규칙 |
|---|---|
| **밀도** | 기본은 `default` (13px 글씨). `compact`(11px)는 100행 이상 로그 같은 극단적 경우만 |
| **정렬** | 글자 → 왼쪽, 숫자 → 오른쪽, No(순번) → 가운데 |
| **너비** | 고정 항목(No, 시각, 상태)은 px 고정. 가변 항목(이름, 메시지)은 비율(flex) |
| **셀 안 부품** | Chip은 `md`(20px), Button은 `sm`(24px). `lg`(28px+)는 행을 압도하므로 금지 |

### B. AI 응답 카드가 필요한 경우

모든 AI 카드는 반드시 **`AiCard`로 감싸야** 합니다. 직접 `<div>`에 흰 배경과 테두리를 만들면 안 됩니다.

```
AiCard (흰 배경 + 테두리 + 둥근 모서리 + 진입 애니메이션)
  └─ AiSectionHeading (제목 + 색상 톤)
  └─ AiBulletList (항목 목록)
  └─ AiToneBadge (분류 뱃지)
  └─ AiCaption (캡션 텍스트)
```

**여러 카드가 연속으로 나올 때:** 순차 진입 애니메이션을 적용합니다.
- 첫 번째 카드: delay=0
- 두 번째 카드: delay=120
- 세 번째 카드: delay=240
- (120ms씩 증가)

### C. 폼 입력이 필요한 경우

| 용도 | 사용할 부품 |
|---|---|
| 텍스트 입력 | `TextField` |
| 선택(드롭다운) | `Select` |
| 체크박스 | `Checkbox` |
| 태그/라벨 표시 | `Chip` |
| 필터 선택 칩 | `FilterChip` |
| 탭 전환 | `Tabs` |
| 팝업 대화상자 | `Modal` |
| 도움말 | `Tooltip` |

---

## 4단계: 색상과 글꼴을 확인한다

### 색상 — 절대 직접 색 코드를 쓰지 않는다

❌ `색상: #E53935` (직접 입력 금지)
✅ `tone="high"` (토큰 이름으로 지정)

**5가지 톤(Tone) 시스템:**

| 톤 | 의미 | 색상 | 사용 상황 |
|---|---|---|---|
| `high` | 위험/즉시 조치 | 빨강 | 잘못된 설정, 알람 위반 |
| `mid` | 경고/주의 | 노랑 | 모니터링 필요하지만 급하지 않음 |
| `low` | 정보/권장 | 파랑 | 개선 제안, 링크 |
| `idle` | 유휴/비활성 | 회색 | 안 쓰는 자원 |
| `neutral` | 분류 없음 | 회색 | 합계 행, 일반 캡션 |

### 글꼴 — 크기와 굵기의 위계

글씨 크기가 클수록 더 중요한 정보입니다. **같은 크기에서 굵기만 바꾸는 것은 금지**합니다.

| 크기 | 굵기 | 용도 |
|---|---|---|
| 20px | medium | 페이지 제목 |
| 14px | bold | 섹션 헤더 |
| 13px | bold/medium | 카드 제목, 테이블 강조 |
| 12px | medium | 라벨, 메타 정보 |
| 11px | medium/regular | 보조 캡션 |
| 10px | regular | 마이크로 캡션 |

**글꼴 종류:**
- 한국어/일반 텍스트 → **Noto Sans** (korean)
- 숫자/지표값 → **Roboto** (numeric) — 자릿수 정렬이 정확

---

## 5단계: 검수 체크리스트

화면을 만든 뒤 아래 항목을 하나씩 확인합니다.

- [ ] **색상 리터럴 없음** — `#FF0000` 같은 직접 색 코드가 없는가?
- [ ] **AI 카드는 `AiCard`로 감쌌는가?** — 직접 만든 `<div>` 카드가 없는가?
- [ ] **대시보드 위젯 한 칸은 `WidgetFrame`인가?** — 제목은 지표 이름만, 범위는 `meta`, 헤더 메뉴는 ⛶ `onFullscreen` + ⋮ `menu` 둘로 고정, 범례는 본문 오른쪽 위 `legend`, 데이터 없음 · 수집 끊김은 `state`. 끊긴 수집을 0 선으로 그리지 않았는가? 칸 안 차트는 아크 · 히트맵까지 모두 `frame={false}` 인가? 축 글자는 `text-chart` 하나인가?
- [ ] **페이지 헤더가 AI 위젯 열었을 때도 그대로인가?** — 어떤 요소도 숨겨지지 않는가?
- [ ] **테이블 숫자는 오른쪽 정렬인가?**
- [ ] **SVG 차트 텍스트에 단위(px)가 있는가?** — `fontSize="9px"` (O) / `fontSize={9}` (X)
- [ ] **글꼴 위계가 지켜지는가?** — 큰 제목이 bold, 본문이 regular로 구분되는가?
- [ ] **AI 진입은 `AiInlinePrompt` 또는 `AiAssistantButton`을 쓰는가?** — 일반 `Button`으로 AI를 여는 것은 금지

---

## 절대 하면 안 되는 것 (불변 정책)

| 금지 사항 | 이유 |
|---|---|
| 디자인 시스템 컴포넌트를 복사해서 수정 | 단일 출처 원칙 위반 |
| CSS 덮어쓰기 (`!important` 등) | 시스템 일관성 훼손 |
| 토큰 값을 소비 측에서 변경 | 역방향 수정 금지 (불변) |
| 새 색상을 hex로 직접 사용 | 토큰에 먼저 등록 필요 |
| `AiCard` 없이 AI 카드 div 직접 작성 | 1px 차이로 시각 불일치 |

**변경이 필요하면** → 디자인 시스템 repo(이 저장소)에서 수정 → 소비 측에 자동 반영됩니다.

---

## 기본 프리셋 4종 — 코드 + Prompt 세트

페이지 유형별로 **코드 템플릿**(복사-붙여넣기용)과 **Prompt 프리셋**(Claude에게 그대로 전달)을 함께 제공합니다. 빈칸(`{...}`)만 자기 상황에 맞게 바꾸면 됩니다.

---

### 프리셋 A: 기본 대시보드

> Sidebar + PageHeader + OptionbarPage + DataTable + AI 위젯

**언제 쓰나:** 모니터링 지표를 테이블로 보여주는 가장 일반적인 페이지.

**구조도:**

```
┌─────────────────────────────────────────────────────┐
│  PageHeader  [제목]           [WhaTap AI] [알림] [아바타] │
├────────┬────────────────────────────────────────────┤
│        │  OptionbarPage  [LIVE 5s] [인스턴스] [프리셋]   │
│Sidebar ├────────────────────────────────────────────┤
│ 240px  │                                            │
│        │  DataTable                                 │
│  메뉴   │  ┌─No─┬──이름──┬──TPS──┬──상태──┐           │
│  트리   │  │ 1  │ inst-1 │ 1,234 │ ● 정상 │           │
│        │  │ 2  │ inst-2 │   892 │ ▲ 경고 │           │
│        │  └────┴────────┴───────┴───────┘           │
├────────┴────────────────────────────────────────────┤
│                (AI 위젯 480px — 우측 슬라이드)           │
└─────────────────────────────────────────────────────┘
```

**코드 템플릿:**

```tsx
import {
  DashboardLayout, PageHeader, OptionbarPage,
  DataTable, type DataTableColumn,
  WhaTapAiWidget, WhaTapAiProvider, useWhaTapAi,
  Chip,
} from "@whatap/design-system";

type Row = { no: number; name: string; tps: number; status: string };

const columns: DataTableColumn<Row>[] = [
  { key: "no",     header: "No",     width: 52,  numeric: true },
  { key: "name",   header: "인스턴스",  flex: 2 },
  { key: "tps",    header: "TPS",    width: 96,  numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.tps.toLocaleString()}</span> },
  { key: "status", header: "상태",    width: 96,
    render: (r) => <Chip size="md" tone={r.status === "경고" ? "mid" : undefined}>{r.status}</Chip> },
];

export default function MyDashboard() {
  const { aiActive, setAiActive } = useWhaTapAi();

  return (
    <DashboardLayout
      widgetOpen={aiActive}
      activeProduct="db"
      header={
        <>
          <PageHeader
            title="GPU 모니터링"
            aiActive={aiActive}
            onAiToggle={() => setAiActive(!aiActive)}
          />
          <OptionbarPage />
        </>
      }
      main={<DataTable columns={columns} rows={rows} density="default" />}
    >
      <WhaTapAiWidget
        open={aiActive}
        onClose={() => setAiActive(false)}
      />
    </DashboardLayout>
  );
}
```

**Prompt 프리셋 (복사해서 Claude에게 전달):**

> 기본 대시보드 페이지를 만들어 줘.
> - 파일: `pages/{제품}/{페이지명}.tsx`
> - 뼈대: `DashboardLayout` + `PageHeader` (제목: '{페이지 제목}') + `OptionbarPage`
> - 본문: `DataTable` density="default"
>   - 컬럼: {컬럼 목록 — 각각 이름, width 또는 flex, 숫자 여부, 렌더 방식 기술}
>   - 예: No (width: 52) / 인스턴스명 (flex: 2) / TPS (width: 96, numeric) / 상태 (width: 96, Chip md)
> - AI 위젯: `WhaTapAiWidget` + `useWhaTapAi` 연결
> - `activeProduct="{제품코드}"` (db / k8s / apm 등)
> - 테이블 정렬: 글자=왼쪽, 숫자=오른쪽, No=가운데
> - hex 직접 쓰지 마. Chip 사이즈는 md. 셀에 text-xs 쓰지 마.

---

### 프리셋 B: AI 전용 페이지

> Sidebar + PageHeaderAiInline + AI 위젯 전면 배치

**언제 쓰나:** 페이지 자체가 AI 중심. 헤더에서 바로 자연어 입력 → 위젯이 즉시 열리는 1-step UX.

**구조도:**

```
┌──────────────────────────────────────────────────────────┐
│  PageHeaderAiInline  [제목]  [____AI 질문 입력____⬆]  [알림] │
├────────┬─────────────────────────────┬───────────────────┤
│        │                             │                   │
│Sidebar │    main (본문 영역)           │  WhaTapAiWidget   │
│ 40px   │    대시보드 / 차트 / 테이블      │  480px            │
│ (축소)  │                             │  AI 응답 카드 스택   │
│        │                             │                   │
├────────┴─────────────────────────────┴───────────────────┤
└──────────────────────────────────────────────────────────┘
```

**코드 템플릿:**

```tsx
import {
  DashboardLayout, PageHeaderAiInline,
  WhaTapAiWidget, WhaTapAiProvider, useWhaTapAi,
  type AiPromptSuggestion,
} from "@whatap/design-system";

const AI_SUGGESTIONS: AiPromptSuggestion[] = [
  { label: "고활용 GPU 찾기",        query: "GPU 사용률 80% 이상인 노드를 찾아줘" },
  { label: "비용 절감 분석",          query: "유휴 자원 기반 비용 절감 방안을 분석해줘" },
  { label: "최근 이상 탐지",          query: "최근 1시간 이상 징후가 있는 인스턴스를 알려줘" },
];

const ROLLING_PLACEHOLDERS = [
  "GPU 사용률이 급증한 노드를 찾아줘",
  "최근 1시간 GPU 메모리 추세를 분석해줘",
  "유휴 GPU 워크로드를 정리 제안해줘",
];

export default function AiFirstPage() {
  const { aiActive, setAiActive, setLastPrompt } = useWhaTapAi();

  const handlePromptSubmit = (query: string) => {
    setLastPrompt({ text: query, fromRoute: "/db/ai-dashboard" });
    setAiActive(true);
  };

  return (
    <DashboardLayout
      widgetOpen={aiActive}
      activeProduct="db"
      header={
        <PageHeaderAiInline
          title="AI 대시보드"
          promptPlaceholders={ROLLING_PLACEHOLDERS}
          promptSuggestions={AI_SUGGESTIONS}
          onPromptSubmit={handlePromptSubmit}
        />
      }
      main={<MyContent />}
    >
      <WhaTapAiWidget
        open={aiActive}
        onClose={() => setAiActive(false)}
      />
    </DashboardLayout>
  );
}
```

**Prompt 프리셋 (복사해서 Claude에게 전달):**

> AI 중심 페이지를 만들어 줘.
> - 파일: `pages/{제품}/{페이지명}.tsx`
> - 뼈대: `DashboardLayout` + `PageHeaderAiInline` (제목: '{페이지 제목}')
> - 헤더에 인라인 AI 입력:
>   - `promptPlaceholders`: [{롤링 placeholder 3개 — 제품 맥락에 맞는 예시 질문}]
>   - `promptSuggestions`: [{suggestion chip 2~4개 — label(짧게) + query(구체적) 분리}]
> - 입력 submit 시 `setLastPrompt` + `setAiActive(true)`로 위젯 열기
> - AI 위젯: `WhaTapAiWidget` + `useWhaTapAi` 연결
> - AI 진입에 일반 `Button` 쓰지 마 — `PageHeaderAiInline`이 `AiInlinePrompt`를 자동 포함
> - `activeProduct="{제품코드}"`

---

### 프리셋 C: 목록 페이지

> Sidebar + PageHeader + FilterBar + DataTable

**언제 쓰나:** 이벤트 목록, 알림 규칙, 인스턴스 카탈로그 등 검색·필터가 핵심인 페이지.

**구조도:**

```
┌──────────────────────────────────────────────────────┐
│  PageHeader  [제목]                   [WhaTap AI] [알림] │
├────────┬─────────────────────────────────────────────┤
│        │  FilterBar                                  │
│Sidebar │  [🔍 검색...]  [카테고리 ▾]  [심각도 ▾]  [초기화] │
│ 240px  ├─────────────────────────────────────────────┤
│        │  선택된 필터: [카테고리: DB ✕] [심각도: 위험 ✕]    │
│  메뉴   ├─────────────────────────────────────────────┤
│  트리   │  DataTable                                  │
│        │  ┌─No─┬──이름──┬──카테고리──┬──심각도──┬──시각──┐ │
│        │  │ 1  │ evt-1 │ DB       │ ● 위험  │ 14:23 │ │
│        │  │ 2  │ evt-2 │ Network  │ ▲ 경고  │ 14:20 │ │
│        │  └────┴───────┴─────────┴────────┴──────┘ │
└────────┴─────────────────────────────────────────────┘
```

**코드 템플릿:**

```tsx
import {
  DashboardLayout, PageHeader,
  FilterBar, DataTable, type DataTableColumn,
  TextField, Chip,
  WhaTapAiWidget, useWhaTapAi,
} from "@whatap/design-system";

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "db", label: "DB" },
  { value: "network", label: "Network" },
  { value: "server", label: "Server" },
];

const SEVERITY_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "critical", label: "위험" },
  { value: "warning", label: "경고" },
  { value: "info", label: "정보" },
];

export default function EventListPage() {
  const { aiActive, setAiActive } = useWhaTapAi();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");

  return (
    <DashboardLayout
      widgetOpen={aiActive}
      activeProduct="apm"
      header={
        <PageHeader
          title="이벤트 목록"
          aiActive={aiActive}
          onAiToggle={() => setAiActive(!aiActive)}
        />
      }
      main={
        <>
          <FilterBar
            size="lg"
            search={
              <TextField
                value={search}
                onChange={setSearch}
                placeholder="이벤트 검색..."
                clearable
                fullWidth
              />
            }
            dropdowns={[
              { key: "category", label: "카테고리", options: CATEGORY_OPTIONS, value: category, onChange: setCategory },
              { key: "severity", label: "심각도",   options: SEVERITY_OPTIONS, value: severity, onChange: setSeverity },
            ]}
            showSelectedChips
            showResetAll
            onResetAll={() => { setCategory("all"); setSeverity("all"); setSearch(""); }}
          />
          <DataTable columns={columns} rows={filteredRows} density="default" />
        </>
      }
    >
      <WhaTapAiWidget open={aiActive} onClose={() => setAiActive(false)} />
    </DashboardLayout>
  );
}
```

**Prompt 프리셋 (복사해서 Claude에게 전달):**

> 필터 + 목록 페이지를 만들어 줘.
> - 파일: `pages/{제품}/{페이지명}.tsx`
> - 뼈대: `DashboardLayout` + `PageHeader` (제목: '{페이지 제목}')
> - 필터: `FilterBar` size="lg"
>   - 검색: `TextField` (placeholder: "{검색 대상} 검색...", clearable, fullWidth)
>   - 드롭다운 필터: {필터 목록 — 각각 key, label, 옵션값 나열}
>   - `showSelectedChips` + `showResetAll` 켜줘
> - 본문: `DataTable` density="default"
>   - 컬럼: {컬럼 목록}
> - AI 위젯: `WhaTapAiWidget` + `useWhaTapAi` 연결
> - `activeProduct="{제품코드}"`
> - 테이블 정렬: 글자=왼쪽, 숫자=오른쪽
> - FilterChip 사이즈는 md. hex 직접 쓰지 마.

---

### 프리셋 D: 상세 페이지

> Sidebar + PageHeader + Tabs + 차트 그리드 + DataTable

**언제 쓰나:** 인스턴스 상세, 서버 상세 등 하나의 대상을 탭으로 나눠 깊이 있게 보여주는 페이지.

**구조도:**

```
┌──────────────────────────────────────────────────────┐
│  PageHeader  [인스턴스 상세]           [WhaTap AI] [알림] │
├────────┬─────────────────────────────────────────────┤
│        │  OptionbarPage  [LIVE 5s] [DMX-3-12] [프리셋] │
│Sidebar ├─────────────────────────────────────────────┤
│ 240px  │  Tabs  [ 개요 | 성능 | 이벤트 ]                 │
│        ├─────────────────────────────────────────────┤
│  메뉴   │  (개요 탭 선택 시)                              │
│  트리   │  ┌──────────┬──────────┐                    │
│        │  │ CPU      │ Memory   │  ← MiniLineChart  │
│        │  │ ~~~~/~~~ │ ~~~~/~~~ │    2x2 그리드       │
│        │  ├──────────┼──────────┤                    │
│        │  │ Disk I/O │ Network  │                    │
│        │  │ ~~~~/~~~ │ ~~~~/~~~ │                    │
│        │  └──────────┴──────────┘                    │
│        ├─────────────────────────────────────────────┤
│        │  DataTable (하단 상세 지표)                     │
│        │  ┌──시각──┬──CPU──┬──MEM──┬──TPS──┐          │
│        │  │ 14:23 │ 78%  │ 62%  │ 1,234 │          │
│        │  └───────┴──────┴──────┴───────┘          │
└────────┴─────────────────────────────────────────────┘
```

**코드 템플릿:**

```tsx
import {
  DashboardLayout, PageHeader, OptionbarPage,
  Tabs, MiniLineChart, WidgetFrame,
  DataTable, type DataTableColumn,
  WhaTapAiWidget, useWhaTapAi,
} from "@whatap/design-system";

const DETAIL_TABS = [
  { key: "overview", label: "개요" },
  { key: "performance", label: "성능" },
  { key: "events", label: "이벤트" },
];

export default function InstanceDetailPage() {
  const { aiActive, setAiActive } = useWhaTapAi();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout
      widgetOpen={aiActive}
      activeProduct="db"
      header={
        <>
          <PageHeader
            title="인스턴스 상세"
            aiActive={aiActive}
            onAiToggle={() => setAiActive(!aiActive)}
          />
          <OptionbarPage instanceLabel="DMX-3-12-949" />
        </>
      }
      main={
        <>
          <Tabs
            items={DETAIL_TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "overview" && (
            <>
              {/* 차트 그리드 2x2 — 칸은 WidgetFrame, 차트는 frame={false} 로 본문만 (patterns §15) */}
              <div className="grid grid-cols-2 gap-12px wds-page-content" style={{ gridAutoRows: 180 }}>
                {CHARTS.map((c) => (
                  <WidgetFrame key={c.title} title={c.title} meta="최근 10분" onFullscreen={() => open(c)} menu={WIDGET_MENU}>
                    <MiniLineChart title={c.title} values={c.values} unit={c.unit} frame={false} />
                  </WidgetFrame>
                ))}
              </div>

              {/* 하단 상세 지표 테이블 */}
              <DataTable
                density="default"
                columns={[
                  { key: "time",   header: "시각",    width: 150 },
                  { key: "cpu",    header: "CPU %",  width: 96,  numeric: true },
                  { key: "mem",    header: "MEM %",  width: 96,  numeric: true },
                  { key: "tps",    header: "TPS",    width: 96,  numeric: true },
                ]}
                rows={timeSeriesRows}
              />
            </>
          )}

          {activeTab === "performance" && <PerformanceContent />}
          {activeTab === "events" && <EventsContent />}
        </>
      }
    >
      <WhaTapAiWidget open={aiActive} onClose={() => setAiActive(false)} />
    </DashboardLayout>
  );
}
```

**Prompt 프리셋 (복사해서 Claude에게 전달):**

> 상세 페이지를 만들어 줘.
> - 파일: `pages/{제품}/{페이지명}.tsx`
> - 뼈대: `DashboardLayout` + `PageHeader` (제목: '{대상} 상세') + `OptionbarPage`
> - 탭: `Tabs` — [{탭 목록 나열, 예: 개요 / 성능 / 이벤트}]
> - 개요 탭 구성:
>   - 상단: 차트 {개수}칸을 {N}x{M} 그리드 배치. 칸은 `WidgetFrame`(제목 · 범위 `meta` · ⛶ `onFullscreen` + ⋮ `menu`), 안의 `MiniLineChart` 는 `frame={false}`
>     - 각 칸: {차트 항목 — 제목, 단위}
>     - SVG 텍스트는 반드시 `fontSize="9px"` (단위 필수)
>     - peak 라벨은 라인 최고점과 1:1 좌표 매칭
>   - 하단: `DataTable` density="default"
>     - 컬럼: {컬럼 목록 — 시각(width: 150) + 지표들(width: 96, numeric)}
> - AI 위젯: `WhaTapAiWidget` + `useWhaTapAi` 연결
> - `activeProduct="{제품코드}"`
> - 숫자=오른쪽 정렬, 칸 머리는 WidgetFrame 이 그린다(직접 짜지 마), hex 직접 쓰지 마.

---

### 프리셋 선택 가이드

| 만들 화면 | 프리셋 | 핵심 부품 |
|---|---|---|
| 지표 모니터링 대시보드 | **A. 기본 대시보드** | PageHeader + OptionbarPage + DataTable |
| AI 질의 중심 화면 | **B. AI 전용** | PageHeaderAiInline + WhaTapAiWidget |
| 검색·필터가 핵심인 목록 | **C. 목록 페이지** | PageHeader + FilterBar + DataTable |
| 단일 대상 심층 분석 | **D. 상세 페이지** | PageHeader + Tabs + MiniLineChart + DataTable |

> **조합도 가능합니다.** 예를 들어 "AI 전용 + 필터 목록"이 필요하면 프리셋 B의 헤더(PageHeaderAiInline) + 프리셋 C의 본문(FilterBar + DataTable)을 합치면 됩니다.

---

## Prompt 예시 모음 — 이대로 복사해서 Claude에게 붙여넣기

### 예시 1: 새 대시보드 페이지 만들기

> 새 페이지를 만들어 줘.
> - 파일: `pages/db/GpuMonitoring.tsx`
> - `DashboardLayout` + `PageHeader` (제목: 'GPU 모니터링')
> - `OptionbarPage` 포함
> - 본문에 `DataTable` — 컬럼:
>   - No (width: 52, 가운데 정렬)
>   - 인스턴스명 (flex: 2, 왼쪽 정렬)
>   - GPU 사용률 (width: 120, 오른쪽 정렬, numeric)
>   - 메모리 (width: 120, 오른쪽 정렬, numeric)
>   - 상태 (width: 96, Chip으로 표시)
> - AI 위젯도 연결해 줘 (`WhaTapAiWidget` + `useWhaTapAi`)
> - density는 default

---

### 예시 2: AI 응답 카드 추가

> AI 위젯 안에 새 응답 카드를 만들어 줘.
> - 파일: `src/widget/AiCostAlert.tsx`
> - `AiCard`로 감싸고
> - 상단: `AiSectionHeading` tone="high", 제목 "비용 초과 항목"
> - 본문: `AiBulletList` 3개 항목
>   - "GPU 인스턴스 3대 유휴 상태 — 월 ₩2,400,000 절감 가능"
>   - "미사용 스토리지 500GB — 월 ₩180,000 절감 가능"
>   - "오버프로비저닝 CPU 12코어 — 월 ₩960,000 절감 가능"
> - 하단: `AiCaption` "최근 30일 사용량 기준 분석"
> - delay prop 받도록

---

### 예시 3: 기존 페이지에 필터 바 추가

> `pages/db/InstanceList.tsx` 페이지의 DataTable 위에 FilterBar를 추가해 줘.
> - `FilterBar` 사용
> - 필터 항목:
>   - 상태: FilterChip (전체 / 활성 / 비활성)
>   - 프로젝트: FilterDropdown (다중 선택)
>   - 검색: TextField (placeholder: "인스턴스 검색")
> - FilterChip 사이즈는 md

---

### 예시 4: 테이블 셀 안 스타일링 지정

> `InstanceTable`의 DataTable 셀 스타일을 정리해 줘.
> - 인스턴스명 컬럼: 메인 텍스트는 `text-md font-medium`, 아래 부 텍스트(IP)는 `text-base text-tertiary`
> - TPS 컬럼: `font-numeric tabular-nums` 적용, 0일 때 `text-disabled`
> - 상태 컬럼: `Chip` size="md"
>   - 정상 → tone 없이 기본
>   - 경고 → tone="mid"
>   - 위험 → tone="high"
> - 셀 안에 text-sm, text-xs 쓰지 마 (default density 금지 사항)

---

### 예시 5: AI 위젯에 분류 테이블 카드 추가

> AI 응답으로 인스턴스 분류 결과를 보여주는 카드를 만들어 줘.
> - `AiCard` delay=120
> - `AiSectionHeading` tone="neutral", 제목 "인스턴스 분류 결과"
> - 분류 행 4개, 각 행마다 `AiToneBadge`로 톤 표시:
>   - "db-prod-01" → tone="high" (고활용)
>   - "db-prod-02" → tone="mid" (활용)
>   - "db-staging" → tone="low" (저활용)
>   - "db-backup" → tone="idle" (완전 유휴)
> - 색상은 톤 토큰만 사용, hex 직접 입력 금지

---

### 예시 6: 모달 팝업 만들기

> 인스턴스 상세 정보를 보여주는 모달을 만들어 줘.
> - `Modal` 사용 (title: "인스턴스 상세")
> - 내부 구성:
>   - 상단: 인스턴스명 (text-lg font-bold)
>   - 본문: 정보 목록 — 라벨은 `text-base text-tertiary`, 값은 `text-md text-primary`
>   - 하단 버튼: `Button` 2개 ("닫기" 회색, "설정 변경" 파랑)
> - 모달 내부에서 직접 색 코드 쓰지 마

---

### 예시 7: 페이지에 AI 인라인 진입점 추가

> `pages/db/Dashboard.tsx`의 헤더를 `PageHeader` 대신 `PageHeaderAiInline`으로 교체해 줘.
> - 사용자가 헤더에서 바로 자연어 입력 가능하도록
> - AI 진입에 일반 `Button` 쓰지 마 — 반드시 `AiInlinePrompt` 계열
> - 위젯 토글은 기존 `useWhaTapAi()` 유지

---

### 예시 8: 차트 카드 만들기

> 본문 영역에 차트 칸 4개를 2x2 그리드로 배치해 줘.
> - 칸은 `WidgetFrame`(헤더 메뉴 ⛶ + ⋮ 고정, 범례는 본문 오른쪽 위 `legend`), 안의 `MiniLineChart` 는 `frame={false}`
> - 각 칸: CPU / Memory / Disk I/O / Network
> - 차트 안 SVG 텍스트는 반드시 `fontSize="9px"` (단위 필수)
> - peak 라벨은 라인 최고점과 1:1 좌표 매칭
> - 칸 머리 · 부제(범위)는 WidgetFrame `title` · `meta` 로 — 글자 크기를 직접 정하지 마

---

## Prompt 작성 팁 요약

| 포함할 것 | 예시 |
|---|---|
| **어떤 컴포넌트를 쓸지** 이름 | "`DataTable` 사용", "`AiCard`로 감싸" |
| **어떤 데이터가 들어가는지** | "컬럼: No, 이름, TPS, 상태" |
| **톤(색상 의미)** | "tone='high'", "위험은 빨강 톤" |
| **사이즈** | "Chip md", "Button sm", "density default" |
| **정렬** | "숫자는 오른쪽", "이름은 왼쪽" |
| **금지 사항 리마인드** | "hex 직접 쓰지 마", "text-xs 쓰지 마" |

**가장 중요한 한 가지:** 디자인 시스템에 이미 있는 부품 이름을 구체적으로 말할수록, AI가 정확하게 만들어 줍니다. "예쁜 카드 만들어 줘" 보다 **"`AiCard` + `AiSectionHeading` tone='low' + `AiBulletList` 3개"** 가 훨씬 정확한 결과를 냅니다.

# Patterns — 합성 패턴 + Do / Don't

WhaTap AI Assistant 화면을 만들면서 누적된 **반복되는 규칙**들입니다. 코드 리뷰에서 같은 지적이 나오는 항목을 모았으니, 디자인 시스템 사용 전에 한 번씩 읽어 두세요.

각 패턴마다 **Why / How** 형식으로 — 규칙만 외우지 말고 근거를 함께 이해해야 엣지 케이스에서 올바른 판단을 할 수 있습니다.

---

## 1. Page Header Invariant

**규칙.** AI 위젯이 열려도 48px 페이지 헤더(`PageHeader`)의 어떤 요소도 사라지지 않는다 — title, AI 버튼, Docs, 고객지원, bell, avatar 모두 그대로 표시.

**Why.** 사용자가 위젯과 본문을 오가며 작업할 때, 헤더는 "어디로 돌아갈 수 있는지"의 닻이다. 위젯이 열렸을 때 일부 요소를 hide하면 헤더 자체가 컨텍스트에 따라 모양이 바뀌는 컴포넌트가 되어, 다른 페이지로 이동했을 때 무엇이 사라졌는지 사용자가 추적해야 한다. 사이드바는 240→40px로 축소되어 공간을 양보하지만, **헤더는 invariant**.

**How.** `PageHeader`의 prop은 `title` / `aiActive` / `onAiToggle` 3개뿐 — 헤더의 가시성을 제어하는 prop이 의도적으로 없다. 헤더 변경이 필요하면 디자인 리뷰부터.

❌ `aiActive` 일 때 `<PageHeader>` 내부 요소를 조건부로 hide
✅ `aiActive` 일 때 사이드바만 축소 (`DashboardLayout`의 `widgetOpen`)

---

## 2. Sidebar Collapse on Widget Open

**규칙.** AI 위젯이 열리면 사이드바는 240px → 40px 제품 레일로 축소된다.

**Why.** 위젯이 480px를 차지하므로 기본 사이드바(240)와 합치면 720px가 가로를 잡아먹어 본문이 너무 좁아진다. 사이드바를 완전히 숨기면 다른 제품으로의 이동 경로가 사라지므로, **제품 레일만 남기는 40px 절충**.

**How.** `DashboardLayout`에 `widgetOpen={aiActive}`만 넘기면 내부에서 `Sidebar`의 `collapsed`를 자동 처리한다. 페이지 별로 따로 `Sidebar`를 import해서 collapsed를 수동 관리하지 말 것.

```tsx
<DashboardLayout widgetOpen={aiActive} ...>
  <WhaTapAiWidget open={aiActive} ... />
</DashboardLayout>
```

---

## 3. SVG Text Must Include Units

**규칙.** SVG 내부 `<text fontSize>`는 항상 `"9px"` (또는 `"9pt"`)처럼 단위를 명시. 단위 없는 숫자(`fontSize={9}`)는 금지.

**Why.** SVG에서 단위 없는 fontSize는 viewBox의 user-space units으로 해석된다. viewBox가 `0 0 100 60`인 차트와 `0 0 400 240`인 차트에서 같은 `fontSize={9}`가 화면상 전혀 다른 크기로 렌더된다. 단위(`px`)를 명시하면 사용자 좌표가 아니라 CSS pixel로 고정되어 일관성 확보.

**How.**

```tsx
// ❌
<text fontSize="9">100%</text>
<text fontSize={9}>100%</text>

// ✅
<text fontSize="9px">100%</text>
```

`MiniLineChart`, `AiUsageChart` 등 차트 컴포넌트 안에서 이 규칙을 위반하면 dashboard 카드 크기에 따라 텍스트가 거대해지거나 사라진다.

---

## 4. Data Table 종합 정책

DataTable 은 본 디자인 시스템에서 가장 자주 쓰이는 chrome 컴포넌트. 사용 정책이 누적되어 있으니 모두 함께 준수.

### 4-1. Density — 기본 `default`

**규칙.** 새 페이지의 DataTable 은 무조건 `density="default"` 시작. `compact` 채택은 별도 근거 필요.

| density | header | row | padding |
|---|---|---|---|
| `default` (기본) | `text-base` 12px bold | `text-md` 13px regular | px-12 py-10 |
| `compact` (제한 사용) | `text-xs` 10px bold | `text-sm` 11px regular | px-8 py-6 |

**Why.** default 가 한글 가독성 + 일반 모니터링 페이지 정보 밀도의 균형점. compact 는 11px 한글 가독성을 희생하므로 100+ 행 raw log 같은 극단 dense 데이터 전용.

### 4-2. 정렬 (alignment)

**규칙.**
- 문자 → **left**
- 숫자 (`numeric: true`) → **right** (자릿수 세로 정렬)
- header `"No"` 컬럼 → **center** (별도 align 없이 자동)
- 명시 `align` prop 이 최우선 override

**Why.** 숫자 우측 정렬 = 자릿수 비교 (1,234 vs 12,345). 문자 좌측 정렬 = 자연어 읽기 흐름. No(순번) 은 좁은 정형 컬럼이라 가운데 자연스러움.

```tsx
{ key: "name", header: "인스턴스", flex: 2 }                                 // 텍스트 — 기본 left
{ key: "tps",  header: "TPS", width: 96, align: "right", numeric: true }    // 숫자
{ key: "no",   header: "No", width: 52, numeric: true }                     // No → 자동 center
```

### 4-3. 너비 (width)

**규칙.**
- 정형 컬럼 (No 52 · 시각 150 · 상태 96 · 액션) → **`width`(px 고정)**
- 가변 컬럼 (이름 · 메시지) → **`flex`(fr)**, 정보량 많은 쪽에 더 큰 비율
- `width` 지정 시 `flex` 무시

**Why.** 정형 폭이 흔들리면 가변 컬럼이 늘어날 때 시각 안정성이 깨짐.

### 4-4. 셀 내 inline 폰트 — DataTable tokens 와 정합

DataTable wrapping span 이 `tokens.rowText` (default density 면 `text-md text-primary`) 자동 적용. 셀 안 `<span>` 의 inline 폰트 override 시 다음 가이드:

| 컨텐츠 | className |
|---|---|
| 주 텍스트 (강조 없음) | **override 안 함** (자동 `text-md text-primary`) |
| 메인 식별자 강조 | `text-md font-medium` 또는 `font-bold` |
| 보조/부 텍스트 (이메일·라벨) | `text-base text-tertiary` (한 단계 작게) |
| 수치 | `text-md font-numeric tabular-nums` |
| 비활성 수치 (0/null) | `text-md text-disabled font-numeric tabular-nums` |

**금지:** default density 셀 본문에 `text-sm`/`text-xs` — compact 시절 잔재.

### 4-5. 셀 내 컴포넌트 사이즈

row height ≈ 33-36px (default density) 기준:

| 컴포넌트 | size | height |
|---|---|---|
| `<Chip>` | `md` | 20px |
| `<FilterChip>` | `md` | 24px |
| `<Button>` | `sm` | ~24px |
| inline pill (span) | `text-sm h-[20-24px] px-[8px]` | 20-24px |
| status dot | — | 6-8px |
| `<Checkbox>` | `sm` | 14-16px |

**금지:** lg(28-32px) — row 를 압도.

위젯 내 메시지 카드(`AiClassificationTable`, `AiCostBreakdown` 등)도 동일한 정렬·너비 정책을 따른다.

---

## 5. Chart Peak Alignment

**규칙.** 라인 차트의 peak 라벨(▼ 또는 값 표시)은 line max의 픽셀 좌표와 1:1 정렬한다.

**Why.** SVG로 라인을 그리고 HTML로 라벨을 띄울 때, 두 좌표계가 어긋나면 "peak" 표시가 실제 최고점에서 몇 px 옆에 박힌다. 사용자는 즉시 어색함을 느끼지만 원인을 짚지 못한다.

**How.** SVG plot 영역을 absolute 배치하고 같은 컨테이너 안에서 HTML overlay도 absolute. **둘 다 같은 plot 좌표계(left/top)를 공유**해 peak의 픽셀 위치를 계산. `MiniLineChart`가 이 방식으로 구현되어 있다 — 새 차트를 만들 때 패턴을 따라가세요.

---

## 6. Card 외형은 AiCard에 위임

**규칙.** 위젯 안의 모든 카드형 메시지는 `<AiCard>` 또는 `<AiCard>`를 내부에서 쓰는 컴포넌트로 작성.

**Why.** 보더 색(`#eaeaea`), 라운드(8px), 패딩(12px), 진입 애니메이션(`.ai-anim-in`), gap(8px) — 다섯 가지가 모든 카드에서 일치해야 위젯이 단정해 보인다. 한 번이라도 직접 `<div className="bg-white border ...">`를 작성하면 1px 어긋남이 시각적으로 잡힌다.

**How.** [`primitives.md`](./primitives.md#aicard) 참조. 새 카드 컴포넌트를 만들 때 첫 줄이 `<AiCard delay={delay}>` 가 아니라면 멈추고 다시 생각하세요.

---

## 7. 색은 토큰에서만

**규칙.** 컴포넌트 내부에 `#E53935` 같은 색상 리터럴 금지. [`tokens.md`](./tokens.md)의 `TONE_*`를 import해 사용.

**Why.** 디자인 결정이 코드 전반에 흩어지면, 톤을 한 번 조정하기 위해 grep으로 hex를 찾아 다녀야 한다. 토큰으로 중앙화하면 `_tokens.ts` 한 파일 수정으로 위젯 전체가 따라온다.

**How.** 새 색이 필요하다면 — 토큰에 먼저 추가하고 컴포넌트에서 import. 5단계 `Tone`을 늘리는 것보다 토큰 외 색상(예: 차트 전용 색)을 별도 named export로 두는 게 보통 옳다.

---

## 8. Stagger Delay로 시각적 흐름

**규칙.** 메시지 스택 안의 카드들은 `delay`를 단계적으로 증가시켜 순차 진입.

**Why.** 모든 카드가 동시에 페이드 인하면 정보량이 한꺼번에 쏟아져 사용자가 어디부터 봐야 할지 길을 잃는다. 120ms씩 stagger하면 자연스러운 읽기 흐름이 생긴다.

**How.** 위젯 메시지 컴포넌트는 대부분 `delay` prop을 받는다. 한 응답 안에서 `0 → 120 → 240 → 360 …` 식으로 증가.

```tsx
<AiReasoning  delay={0}   />
<AiClassificationTable delay={120} />
<AiCostTable  delay={240} />
<AiChoiceButtons delay={360} />
```

데모/녹화용이 아닌 일반 응답에서도 적용 — 사용자 인지 부담을 낮춘다.

---

## 9. 새 컴포넌트를 만들기 전 체크리스트

새 컴포넌트를 추가하려는 충동이 들 때 — 추가하기 **전에** 다음을 확인:

1. **[`primitives.md`](./primitives.md)의 5개**로 조립 가능한가? → 가능하면 컴포넌트 만들지 말고 페이지에서 직접 조립
2. **기존 widget 컴포넌트의 prop 확장**으로 해결되는가? → 같은 외형/다른 데이터인 경우 매우 흔함
3. 위 둘이 다 안 되는 진짜 새 패턴인가? → 그러면 `widget/Ai<Name>.tsx`를 만들되, **반드시 `AiCard` + 토큰 + primitive 조합**으로

추가한 컴포넌트는 같은 PR에서 [`widget-components.md`](./widget-components.md)에 등록.

---

## 10. 타이포그래피 위계 — `font-weight` 평탄화 금지

**규칙.** 사이즈 + weight 둘 다로 위계 표현. 같은 사이즈에 weight 만 다르게 평탄화하지 말 것.

| 사이즈 | weight 기준 | 용도 |
|---|---|---|
| `text-lg+` (14px+) | `font-bold` | 페이지 타이틀 · 섹션 헤더 |
| `text-md` (13px) | `font-bold` 또는 medium (강조 시) | 카드 헤더 · 테이블 row 강조 |
| `text-base` (12px) | `font-medium` | 라벨 · 메타 · dropdown 항목 |
| `text-sm` (11px) | `font-medium` 또는 regular | 보조 메타 · 캡션 |
| `text-xs` (10px) | regular | 마이크로 캡션 · 인디케이터 |
| running text | regular | 본문 |

**Why.** 한국어는 영문보다 가독성 향상이 weight 보다 size 에 더 의존. 같은 사이즈에서 medium ↔ bold 만 바꾸는 것은 위계가 흐릿. 사이즈 + weight 둘 다 조합 시 정보 우선순위가 분명해짐.

**How.** Tailwind utility 토큰 (`text-md font-bold`) 만 사용. 직접 `style={{ fontSize: 13, fontWeight: 700 }}` 금지 — 토큰 외 값은 차후 토큰 변경 시 누락됨.

---

## 11. AI 카테고리 vs 일반 Primitive 분리

**규칙.**
- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** 사용 (`AiInlinePrompt` / `AiSendButton` / `AiAssistantButton`)
- 일반 폼/검색은 `TextField` / `Button`
- 페이지의 AI 진입점은 **버튼 대신 `AiInlinePrompt` 직접 주입** (2-step UX → 1-step UX)

**Why.** AI 와 일반 UI 의 시각 톤 (그라데이션 · 핀휠 심볼 · 송신 ⬆) 이 명확히 다르며, 페이지 안에서 "어디가 AI 이고 어디가 일반 액션인가" 즉시 구분되어야 사용자가 자연어 입력의 결과(분석/추론) 와 일반 폼 액션(저장/삭제) 을 혼동하지 않음.

inline prompt 직접 주입(1-step) 이 토글 버튼 → 위젯 열기 → input focus → 입력(4-step) 보다 훨씬 빠른 자연어 진입.

**How.**
- 페이지 헤더의 AI 진입 → [`PageHeaderAiInline`](./chrome-components.md#pageheaderaiinline) (내부 `AiInlinePrompt`)
- 위젯이 페이지 컨텍스트와 무관하게 토글되는 페이지만 → [`PageHeader`](./chrome-components.md#pageheader) (내부 `AiAssistantButton`)
- AI 카테고리는 패키지 `@whatap/design-system/widget` subpath 로도 import 가능 — 카테고리 분리가 코드 레벨에서도 가시화

❌ AI 진입에 `<Button>` (일반 primitive) — 시각 모호
✅ AI 진입에 `<AiInlinePrompt>` 또는 `<AiAssistantButton>`

---

## 12. 의사결정 우선순위 — 부작용 없음 > 재사용성 > 정확한 디자인

Product-SaaS 안에서 어떤 구현을 선택할지 갈릴 때, 다음 순서를 따른다.

1. **Side-effect-free**: 라이브 라우트(`/db/*`, `/k8s/*` 등 실제 SaaS 페이지를 복제한 라우트)의 동작을 깨지 않는다. 새 파일/라우트/prop 추가 (additive) 가 라이브 라우트 본문 수정보다 우선.
2. **Reusable**: 추가한 것은 다른 페이지에서도 재사용 가능해야 한다. 한 페이지 전용 hack은 곧 다른 페이지로 누수된다.
3. **Exact design**: 디자인 명세에 정확히 부합해야 한다. 픽셀/색/폰트를 임의로 근사하지 않는다 — 토큰/Figma 노드를 확인.

세 가지 모두 동시에 만족하지 않는 변경은 **머지하지 말고 디자인/엔지니어링 리뷰**.

---

## 부록 — 빠른 결정 표

| 상황 | 무엇을 할까 |
|---|---|
| 새 페이지 만들기 | `DashboardLayout` slot 패턴 + `PageHeader` + `OptionbarPage` |
| AI 응답에 새 카드 한 종류 추가 | [`widget-components.md`](./widget-components.md)에서 가장 가까운 것 찾아 prop 확장 / 안되면 새 `widget/Ai*.tsx` |
| 새 색상이 필요 | [`tokens.md`](./tokens.md)에 토큰 추가 → 컴포넌트에서 import |
| 새 카드 외형이 필요 | 거의 항상 `AiCard`로 충분. 정말 다르다면 디자인 리뷰 후 primitive 추가 |
| 차트가 필요 | `MiniLineChart` / `AiUsageChart` 확장 — SVG 단위 규칙(#3) 준수 |
| 테이블이 필요 | `DataTable` (chrome) / `AiClassificationTable` `AiCostTable` (widget) |
| 위젯 토글 | `useWhaTapAi()` 한 곳에서 `aiActive` 공유. `DashboardLayout`에 `widgetOpen` 전달 |

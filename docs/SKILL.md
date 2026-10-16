---
name: whatap-design-system
description: WhaTap 디자인 시스템 — `@whatap/design-system` (별도 repo · 소스온리). Tokens + 3-Layer(Primitives / Composite / Shell, AI 는 각 계층 `Ai/`) + 합성 패턴. 신규 화면은 인라인 스타일 새로 짜지 말고 이 패키지의 컴포넌트를 prop으로 조립하세요.
metadata:
  type: design-system
  scope: WhaTap (프로토타입이 link: 로 소비)
  source: src/ (interfacedesigner/WhaTap-design-system)
  audience: frontend engineers
---

# WhaTap Design System (@whatap/design-system)

WhaTap 제품의 단일 컴포넌트 출처. 빌드된 패키지(JS + 타입 + CSS)를 Vercel 호스팅 tarball로 배포하며, DS 동시 개발 시에는 `link:` 심링크도 지원.

원본 소스는 `src/`. 이 문서는 실제 코드와 1:1 동기화된 카탈로그입니다.

## 설치 / Import

> 상세 절차·사전조건·트러블슈팅: [`ONBOARDING.md`](./ONBOARDING.md)

### 소비 (tarball — 권장)

```bash
npm i https://whatap-design-system-storybook.vercel.app/releases/whatap-design-system-latest.tgz
```

repo 접근 불필요. Vite·Next.js·webpack 모두 추가 설정 없이 동작. main 배포마다 자동 갱신.

### DS 동시 개발 (link: 심링크)

소비자 프로토타입의 `package.json` 에:

```json
"dependencies": {
  "@whatap/design-system": "link:<상대경로>/WhaTap-design-system"
}
```

`pnpm install` 후 `node_modules/@whatap/design-system` 가 DS 소스로의 **심링크**가 됨 — **빌드 단계 없음**. `exports` 가 `.ts` 소스를 직접 가리키므로 Vite 가 source 로 취급해 **DS 수정이 즉시 HMR**. (소비 vite 에 `resolve.dedupe: ['react','react-dom']` 필요 — DS 자체 react 중복 방지.)

### Import 예

```ts
// Shell · Composite · Primitive 한 번에
import {
  DashboardLayout, PageHeader, PageHeaderAiInline,
  WhaTapAiWidget, WhaTapAiProvider, useWhaTapAi,
  Button, TextField, Select, Checkbox, Modal, Chip, FilterChip, FilterBar,
  DataTable, type DataTableColumn,
  AiCard, AiToneBadge, AiClassificationTable,
  type Tone,
} from "@whatap/design-system";

// 위젯 (AI 카테고리) subpath
import { AiCard, AiSectionHeading, TONE_DOT } from "@whatap/design-system/widget";

// 차트 (데이터 시각화 · Chart Art) subpath — 루트에서도 같은 이름을 재수출한다
import { MiniLineChart, Heatmap } from "@whatap/design-system/chart";

// 스타일시트 (소비자 진입점에서 1회) — 토큰+유틸+전역+.dark 전부 포함
import "@whatap/design-system/style.css";
```

### 스타일 import (일반 CSS · Tailwind 없음)

소비자 진입점(`main.tsx` 등)에서:

```ts
import "@whatap/design-system/style.css";
```

DS는 **Tailwind를 쓰지 않습니다.** `style.css`(= `whatap-ds.css`)는 외부 프레임워크 흔적이 0인 자체 일반 CSS(클래스명도 escape 없는 식별자)라, 컴포넌트가 쓰는 모든 유틸·토큰·전역·`.dark`가 이미 포함됩니다. 소비 앱에 Tailwind·`@source` 설정 **불필요**. (토큰만 필요하면 `@whatap/design-system/tokens.css`.) 자세한 내용은 repo root `CLAUDE.md`.

> ⚠️ `whatap-ds.css` 는 **직접 편집한다**(hand-maintained). `scripts/detailwind.mjs generate` 는 최초 1회 변환용이었고 **재실행 금지** — 가드가 거부한다(CLAUDE.md «스타일»). 새 유틸 · 토큰은 이 파일에 바로 추가한다.

### 새 소비 프로젝트 추가 시

1. `npm i https://whatap-design-system-storybook.vercel.app/releases/whatap-design-system-latest.tgz`
2. 진입점에 `import "@whatap/design-system/style.css"` (Tailwind 불필요)
3. `import { ... } from "@whatap/design-system"`
4. (DS 동시 개발 시에만) `link:` 심링크 + vite `resolve.dedupe: ['react','react-dom']`

자세한 절차·사전조건(협업자 초대 등): [`ONBOARDING.md`](./ONBOARDING.md) · [`AI-INTEGRATION.md`](./AI-INTEGRATION.md).

## 누가, 언제 읽나

- **신규 페이지를 만든다** → [`chrome-components.md`](./chrome-components.md)로 쉘을 조립하고 → [`widget-components.md`](./widget-components.md)로 AI 위젯 내용을 작성
- **AI 응답 메시지 한 종류를 추가한다** → [`widget-components.md`](./widget-components.md)에서 가장 가까운 카드를 찾아 prop 확장
- **새 색/뱃지/카드 스타일이 필요한가 싶다** → 먼저 [`tokens.md`](./tokens.md) + [`primitives.md`](./primitives.md)에서 재사용할 수 있는지 확인 (있을 확률 매우 높음)
- **인라인 div 새로 짤까 고민된다** → [`patterns.md`](./patterns.md)의 Do/Don't부터 확인

## 컴포넌트 규칙은 어디에 있나 — Do / Don't 단일 표기

컴포넌트 하나를 쓰기 전에 읽어야 하는 것은 **그 컴포넌트의 Do/Don't** 다. 표기는 **하나**로 통일한다.

**정본은 소스 docstring 4섹션이다** — `## Purpose` · `## When to use` · `## When NOT to use` · `## Composition rules` (+ `@example`). Do/Don't 를 따로 손으로 복제하지 않는다:

| 출력 | 무엇에서 오나 |
|---|---|
| ✅ **Do** | `## Do` 가 있으면 그대로 · 없으면 `When to use` 불릿 |
| ❌ **Don't** | `## Don't` 가 있으면 그대로 · 없으면 `When NOT to use` + `Composition rules` 의 **금지형 문장**(금지·말 것·안 된다…) |

특별히 강조할 컴포넌트만 docstring 에 `## Do` / `## Don't` 를 명시해 승격한다(그 컴포넌트에서 실제로 사고가 났던 것들). 스토리 설명의 `✅ Do — … / ❌ Don't — …` 블록도 같은 표기이며 함께 수집된다.

**기계 판독 출력:** [`components.json`](./components.json) — `scripts/build-components-json.mjs` 가 위 규칙대로 생성하고 `/design-system/components.json` 으로 서빙한다. MCP `get_component` 와 `get_do_dont` 가 이 파일을 읽는다. **직접 편집 금지** — docstring 을 고치고 재생성(`pnpm build:design`).

> 이 배달 경로가 없던 동안, 소스에 잘 쓰인 「When NOT to use」는 소비 AI 에게 **존재하지 않는 정보**였다(MCP 는 title·import·스토리 URL 만 돌려줬다). 규칙을 쓰는 것과 전달되는 것은 다른 일이다.

## 디자인 시스템 구조

트리는 **컴포넌트 3계층(Primitives · Composite · Shell)** 과 동일한 기준. AI 전용 에셋은 별도 카테고리가 아니라 각 계층 안 **`Ai/` 하위그룹**.

```
WhaTap Design System (@whatap/design-system)
├─ Tokens (메타)       ─ 색·폰트·spacing · 11 type-scale · 3 weight · 6 line-height
│                        `tokens.css` 의 `:root` (단일 출처) + `widget/_tokens.ts` Tone 5단계
├─ Primitives (65)     ─ 자체 렌더 리프 (다른 DS import 0)
│   │                    Button / TextField / Select / Tabs / Modal / Tooltip / Toast /
│   │                    Switch / Checkbox / Chip / FilterChip / DataTableRow /
│   │                    SidebarMenuItem / MiniLineChart / WhaTap Symbol …
│   └─ Ai/              ─ AiCard / AiCaption / AiSectionHeading / AiToneBadge /
│                          AiBulletList / AiSymbol / AiUserBubble / ReasoningStep /
│                          AiProgressStep / AiStageMotion …
├─ Composite (29)      ─ 프리미티브 1단계 조합 (Composite 끼리 import 금지)
│   │                    PageHeader / PageHeaderAiInline / Sidebar / FilterBar /
│   │                    DataTable / FilterDropdown / OptionbarPage / ThemeToggle …
│   └─ Ai/              ─ AiChatExchange / AiReasoning / AiDashboardProposal /
│                          AiCostTable / InlinePrompt / PromptInput / SendButton /
│                          AiProgress / AiProgressCompact …
└─ Shell (5)           ─ 최종 조립 진입점 (전 계층 import 가능)
                         DashboardLayout / Ai/Widget(WhaTapAiWidget) /
                         Page(A 기본 · B AI 전용 · D 상세)
```

**의존 방향 (역방향 import 금지):**

```
Tokens → Primitives → Composite → Shell
```

- Tokens 는 누구도 import 하지 않는 leaf — 순수 `:root` CSS 변수 + Tone 토큰
- Primitives 는 Tokens 만 import — 형태 + 외관의 base
- Composite 는 Primitives + Tokens import · Shell 은 전 계층 import (PageHeaderAiInline 은 헤더 레이아웃이라 `Composite/`, `Ai/` 아님)

### AI 영역 vs 일반 Primitives 분리 원칙

- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** 사용 (AiInlinePrompt / AiSendButton / AiAssistantButton)
- 일반 폼/검색은 TextField / Button
- 페이지의 AI 진입점은 **버튼 대신 AiInlinePrompt 직접 주입** (2-step UX → 1-step UX)

자세한 근거는 [`patterns.md`](./patterns.md).

## 핵심 규칙 5가지

이 5가지만 지키면 디자인 시스템의 80%를 따른 것입니다. 자세한 근거는 [`patterns.md`](./patterns.md).

1. **인라인 색상 리터럴 금지.** `#E53935` 같은 hex를 컴포넌트에 직접 쓰지 마세요. [`tokens.md`](./tokens.md)의 `TONE_*` 또는 기존 톤을 재사용. 새 톤은 토큰에 먼저 추가.
2. **카드 껍데기는 직접 짜지 않는다. 어디에 놓이느냐로 둘 중 하나.** AI 위젯 **안**의 응답 카드는 `<AiCard>`([`primitives.md`](./primitives.md#aicard)), 대시보드 격자의 **위젯 한 칸**은 `<WidgetFrame>`(헤더 · 본문 · 푸터, [`chrome-components.md`](./chrome-components.md#widgetframe) · [`patterns.md`](./patterns.md) §15). 둘을 바꿔 쓰면 화면의 조각이 AI 답처럼, AI 답이 화면의 조각처럼 읽힙니다. div 로 새로 짜면 칸마다 여백이 어긋납니다.
3. **AI 위젯이 열려도 페이지 헤더(48px)는 그대로.** 사이드바는 240→80px(제품 레일 40 + 아이콘 메뉴 40)로 축소되지만, 헤더의 title/AI/Docs/고객지원/bell/avatar는 절대 사라지지 않습니다. ([`patterns.md`](./patterns.md#1-page-header-invariant))
4. **차트 텍스트는 단위까지.** SVG 안의 `<text fontSize>`는 반드시 `"9px"`처럼 단위를 붙입니다. 단위 없는 숫자는 viewBox 좌표로 계산되어 화면마다 크기가 달라집니다.
5. **데이터 테이블 정렬.** 텍스트 컬럼은 좌측, 숫자 컬럼은 우측. `DataTable`의 `align` / `numeric` prop으로 명시.

## 빠른 시작 — 새 페이지 한 장 만들기

```tsx
// pages/db/MyNewPage.tsx
import {
  DashboardLayout,
  PageHeader,
  OptionbarPage,
  WhaTapAiWidget,
  useWhaTapAi,
} from "@whatap/design-system";

export default function MyNewPage() {
  const { aiActive, setAiActive } = useWhaTapAi();

  return (
    <DashboardLayout
      widgetOpen={aiActive}
      activeProduct="db"
      header={
        <>
          <PageHeader title="My New Page" aiActive={aiActive} onAiToggle={() => setAiActive(!aiActive)} />
          <OptionbarPage />
        </>
      }
      main={<MyContent />}
    >
      <WhaTapAiWidget open={aiActive} onClose={() => setAiActive(false)} />
    </DashboardLayout>
  );
}
```

이 한 화면에서 chrome 컴포넌트 4개 + 위젯 컨텍스트가 어떻게 맞물리는지 보입니다. 자세한 prop은 각 컴포넌트 페이지 참조.

## 빠른 시작 — AI 위젯 안에 새 응답 카드 한 종류 추가

```tsx
// components/widget/AiMyNewMessage.tsx
import { AiCard, AiSectionHeading, AiBulletList, type Tone } from "@whatap/design-system/widget";

export default function AiMyNewMessage({
  tone, title, bullets, delay = 0,
}: { tone: Tone; title: string; bullets: string[]; delay?: number }) {
  return (
    <AiCard delay={delay}>
      <AiSectionHeading tone={tone}>{title}</AiSectionHeading>
      <AiBulletList items={bullets} />
    </AiCard>
  );
}
```

새 색을 만들 필요가 없고, 새 폰트도 없고, 새 카드 스타일도 없다는 점을 보세요. 디자인 시스템이 잘 작동하면 이런 식으로 짧아집니다.

## 색인

| 파일 | 내용 |
|---|---|
| [`GUIDE.md`](./GUIDE.md) | **비개발자 가이드** — 5단계 절차 + 프리셋 4종(코드+Prompt) + Prompt 예시 8개 + 검수 체크리스트 |
| [`tokens.md`](./tokens.md) | `:root` 색·타입 스케일·웨이트·라인하이트·트래킹 + Tone 5 단계 + TONE_BG/DOT/LABEL |
| [`primitives.md`](./primitives.md) | 14 종 — 일반 폼 (Checkbox · Tooltip · Chip · FilterChip · TextField · Select · Tabs · Modal · FilterDropdown) + AI 카드 빌딩 블록 (AiCard · AiCaption · AiSectionHeading · AiToneBadge · AiBulletList) |
| [`chrome-components.md`](./chrome-components.md) | 31 종 — DashboardLayout · Sidebar · PageHeader · PageHeaderAiInline · Optionbar* · LiveTimerCompact · TimeRangeSelector · PresetSelect · Stage · Toast · ConfirmDialog · AiSymbol · DataTable · FilterBar · WidgetFrame · CardHead · 대시보드 차트(MiniLineChart · MiniMultiLineChart · MiniBarChart · ApdexChart · ForecastLineChart · BarList · MiniDonutChart · KpiCard · HexGrid, 칸 안에서는 `frame={false}`) · EventWeekTimeMatrix · Button · DashboardBuildingProgress · WhaTapAiContext |
| [`ai-entry.md`](./ai-entry.md) | AI 진입점 4 종 — AiAssistantButton · AiSendButton · AiInlinePrompt · AiPromptInput |
| [`widget-components.md`](./widget-components.md) | WhaTapAiWidget + 20 종 Ai* 메시지 카드 |
| [`patterns.md`](./patterns.md) | **Part 1 인터랙션 패턴** — 컴포넌트 횡단 시퀀스(위험한 실행 확인 · 완료 통보 · 즉시반영 vs 폼제출). **Part 2 구현 정책** — 사이드바 collapse · 헤더 invariant · 차트 정렬 · SVG 단위 · 대시보드 위젯 껍데기(WidgetFrame) · DataTable density · 타이포 위계 · AI 카테고리 분리 등 |

## 동기화 정책

이 가이드의 모든 prop 시그니처는 `src/` 의 실제 코드에서 추출된 것입니다.
컴포넌트의 prop을 변경했다면 해당 .md 파일의 표도 같은 PR에서 업데이트하세요. 어긋난 채로 머지하지 마세요.

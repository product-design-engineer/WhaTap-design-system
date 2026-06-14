---
name: whatap-design-system
description: WhaTap 디자인 시스템 — `@whatap/design-system` (별도 repo · 소스온리). Tokens / Primitives / Chrome / WhaTap AI + 합성 패턴. 신규 화면은 인라인 스타일 새로 짜지 말고 이 패키지의 컴포넌트를 prop으로 조립하세요.
metadata:
  type: design-system
  scope: WhaTap (프로토타입이 link: 로 소비)
  source: src/ (interfacedesigner/WhaTap-design-system)
  audience: frontend engineers
---

# WhaTap Design System (@whatap/design-system)

WhaTap 제품의 단일 컴포넌트 출처(별도 git repo, 빌드 산출물 없는 소스온리). 소비 측(프로토타입)은 `link:` 심링크로 import — DS 수정이 자동 반영(HMR).

원본 소스는 `src/`. 이 문서는 실제 코드와 1:1 동기화된 카탈로그입니다.

## 설치 / Import

> 외부 repo·신규 엔지니어(접근 권한·사전조건·설치 순서)는 [`ONBOARDING.md`](./ONBOARDING.md)의 체크리스트를 먼저 참고하세요. (private repo collaborator 초대 + Vite·TS·React19·Tailwind4)

### 소비 (link: 심링크)

소비자 프로토타입의 `package.json` 에:

```json
"dependencies": {
  "@whatap/design-system": "link:<상대경로>/WhaTap-design-system"
}
```

`pnpm install` 후 `node_modules/@whatap/design-system` 가 DS 소스로의 **심링크**가 됨 — **빌드 단계 없음**. `exports` 가 `.ts` 소스를 직접 가리키므로 Vite 가 source 로 취급해 **DS 수정이 즉시 HMR**. (소비 vite 에 `resolve.dedupe: ['react','react-dom']` 필요 — DS 자체 react 중복 방지.)

### Import 예

```ts
// Chrome + Primitive 한 번에
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

// 토큰 CSS (소비자의 index.css 에서 1회)
@import "@whatap/design-system/tokens.css";
```

### Tailwind 4 — 토큰 import (`@theme static`)

소비자 프로토타입의 `index.css` 에:

```css
@import "tailwindcss";
@import "@whatap/design-system/tokens.css";
```

`tokens.css` 가 `@theme static` 이라 **모든 토큰이 `:root` 에 항상 emit** → 컴포넌트의 inline `var(--color-X)` 가 보장됨. (과거엔 `@source` 로 DS src 를 스캔해야 했으나 `@theme static` 전환으로 **불필요**.) 자세한 내용은 repo root `CLAUDE.md` 참조.

### 새 소비 프로토타입 추가 시

1. `package.json` 에 `"@whatap/design-system": "link:<상대경로>/WhaTap-design-system"`
2. vite `resolve.dedupe: ['react','react-dom']`
3. `index.css` 에 `@import "@whatap/design-system/tokens.css"`
4. `import { ... } from "@whatap/design-system"`

자세한 절차·사전조건(협업자 초대 등): [`ONBOARDING.md`](./ONBOARDING.md) · [`AI-INTEGRATION.md`](./AI-INTEGRATION.md).

## 누가, 언제 읽나

- **신규 페이지를 만든다** → [`chrome-components.md`](./chrome-components.md)로 쉘을 조립하고 → [`widget-components.md`](./widget-components.md)로 AI 위젯 내용을 작성
- **AI 응답 메시지 한 종류를 추가한다** → [`widget-components.md`](./widget-components.md)에서 가장 가까운 카드를 찾아 prop 확장
- **새 색/뱃지/카드 스타일이 필요한가 싶다** → 먼저 [`tokens.md`](./tokens.md) + [`primitives.md`](./primitives.md)에서 재사용할 수 있는지 확인 (있을 확률 매우 높음)
- **인라인 div 새로 짤까 고민된다** → [`patterns.md`](./patterns.md)의 Do/Don't부터 확인

## 디자인 시스템 구조

```
WhaTap Design System (@whatap/design-system)
├─ Tokens            ─ 색·폰트·spacing · 11 type-scale · 3 weight · 6 line-height
│                      `tokens.css` `@theme static` (단일 출처) + `widget/_tokens.ts` Tone 5단계
├─ Primitives (9)    ─ 일반 form / 표시
│                      Checkbox / Tooltip / Chip / FilterChip / TextField / Select /
│                      Tabs / Modal / FilterDropdown
├─ Chrome (20)       ─ 페이지 레벨 레이아웃·도구·표시
│                      DashboardLayout / Sidebar / PageHeader / PageHeaderAiInline /
│                      SubHeaderBar / OptionbarPage / OptionbarInstanceSelector /
│                      LiveTimerCompact / TimeRangeSelector / PresetSelect / Stage /
│                      Toast / DataTable / FilterBar / MiniLineChart /
│                      EventWeekTimeMatrix / Button / DashboardBuildingProgress
└─ WhaTap AI         ─ 모든 AI 컴포넌트 (좌측 `WhaTap AI/`)
    ├─ 빌딩 블록 5   ─ AiCard / AiCaption / AiSectionHeading / AiToneBadge / AiBulletList
    ├─ 진입 4        ─ AiAssistantButton / AiSendButton / AiInlinePrompt / AiPromptInput
    ├─ 위젯 셸       ─ WhaTapAiWidget / WhaTapAiContext / AiSymbol
    └─ 메시지 카드 22 ─ AiChatExchange / AiReasoning / AiCostTable / AiMigPlan /
                        AiExecutionResult / AiReceiverChannels / … / AiClickCursor
```

**의존 방향 (역방향 import 금지):**

```
Chrome / WhaTap AI → Primitives → Tokens
```

- Tokens 는 누구도 import 하지 않는 leaf — `@theme static` CSS 변수 + Tone 토큰
- Primitives 는 Tokens 만 import — 형태 + 외관의 base
- Chrome · WhaTap AI 는 Primitives 와 Tokens import (PageHeaderAiInline 은 헤더 레이아웃이라 Chrome)

### AI 카테고리 vs 일반 Primitives 분리 원칙

- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** 사용 (AiInlinePrompt / AiSendButton / AiAssistantButton)
- 일반 폼/검색은 TextField / Button
- 페이지의 AI 진입점은 **버튼 대신 AiInlinePrompt 직접 주입** (2-step UX → 1-step UX)

자세한 근거는 [`patterns.md`](./patterns.md).

## 핵심 규칙 5가지

이 5가지만 지키면 디자인 시스템의 80%를 따른 것입니다. 자세한 근거는 [`patterns.md`](./patterns.md).

1. **인라인 색상 리터럴 금지.** `#E53935` 같은 hex를 컴포넌트에 직접 쓰지 마세요. [`tokens.md`](./tokens.md)의 `TONE_*` 또는 기존 톤을 재사용. 새 톤은 토큰에 먼저 추가.
2. **위젯 카드는 `<AiCard>`로 감싼다.** 흰 배경 + `#eaeaea` 보더 + 8px 라운드 + 12px 패딩 + 진입 애니메이션은 [`primitives.md`](./primitives.md#aicard)가 책임집니다. div를 새로 짜면 톤이 어긋납니다.
3. **AI 위젯이 열려도 페이지 헤더(48px)는 그대로.** 사이드바는 240→40px로 축소되지만, 헤더의 title/AI/Docs/고객지원/bell/avatar는 절대 사라지지 않습니다. ([`patterns.md`](./patterns.md#1-page-header-invariant))
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
| [`tokens.md`](./tokens.md) | `@theme` 색·타입 스케일·웨이트·라인하이트·트래킹 + Tone 5 단계 + TONE_BG/DOT/LABEL |
| [`primitives.md`](./primitives.md) | 14 종 — 일반 폼 (Checkbox · Tooltip · Chip · FilterChip · TextField · Select · Tabs · Modal · FilterDropdown) + AI 카드 빌딩 블록 (AiCard · AiCaption · AiSectionHeading · AiToneBadge · AiBulletList) |
| [`chrome-components.md`](./chrome-components.md) | 19 종 — DashboardLayout · Sidebar · PageHeader · PageHeaderAiInline · Optionbar* · LiveTimerCompact · TimeRangeSelector · PresetSelect · Stage · Toast · AiSymbol · DataTable · FilterBar · MiniLineChart · EventWeekTimeMatrix · Button · DashboardBuildingProgress · WhaTapAiContext |
| [`ai-entry.md`](./ai-entry.md) | AI 진입점 4 종 — AiAssistantButton · AiSendButton · AiInlinePrompt · AiPromptInput |
| [`widget-components.md`](./widget-components.md) | WhaTapAiWidget + 20 종 Ai* 메시지 카드 |
| [`patterns.md`](./patterns.md) | 합성 패턴 + Do/Don't (사이드바 collapse · 헤더 invariant · 차트 정렬 · SVG 단위 · DataTable density · 타이포 위계 · AI 카테고리 분리 등) |

## 동기화 정책

이 가이드의 모든 prop 시그니처는 `src/` 의 실제 코드에서 추출된 것입니다.
컴포넌트의 prop을 변경했다면 해당 .md 파일의 표도 같은 PR에서 업데이트하세요. 어긋난 채로 머지하지 마세요.

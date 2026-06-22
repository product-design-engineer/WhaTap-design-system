# Widget Components — AI 위젯 메시지 (AI 영역)

> 원본: `src/WhaTapAiWidget.tsx`, `src/widget/` (interfacedesigner/WhaTap-design-system) · Storybook 트리 — 리프 카드 `Primitives/Ai` · 합성 카드 `Composite/Ai` · 위젯 본체 `Shell/Ai/Widget`

AI 위젯 본체(`WhaTapAiWidget`)와 그 안에 표시되는 20여 종의 메시지 카드입니다. **모든 메시지 카드는 [`primitives.md`](./primitives.md)의 `AiCard`로 감싸지거나, 동등한 외형을 따릅니다.**

## 위젯 본체

### WhaTapAiWidget

480px 우측 AI 위젯 패널. 헤더 + 인사말(랜딩) + 메시지 스택 + 입력 영역.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `open` | `boolean` | — | 위젯 표시 여부 |
| `onClose` | `() => void` | — | 닫기 버튼 |
| `onNewSession` | `() => void` | — | 새 세션 버튼 |
| `onFullscreen` | `() => void` | — | 전체화면 토글 |
| `user` | `string` | `"Wha-tap Kim"` | 인사말의 사용자 이름 |
| `pageHighlight` | `string` | `"애플리케이션 대시보드"` | 현재 페이지 컨텍스트 칩 |
| `actions` | `string[]` | _(기본 액션)_ | 랜딩 화면의 추천 액션 |
| `tokenInput` | `number` | `3395` | 입력 토큰 카운트 |
| `tokenOutput` | `number` | `181` | 출력 토큰 카운트 |
| `messages` | `ReactNode` | — | **메시지 카드 스택 — 여기 Ai* 컴포넌트들을 꽂습니다** |
| `inputValue` | `string` | — | 입력창 controlled value |
| `showLanding` | `boolean` | `true` | 랜딩(인사말) 표시 여부 |
| `attachments` | `{name; mime?}[]` | — | 첨부 파일 칩 |
| `scrollSignal` | `unknown` | — | 변경 시 메시지 스택 하단으로 스크롤 |
| `showSendCursor` | `boolean` | `false` | 데모용 자동 클릭 커서 표시 |
| `onSubmit` | `(value: string) => void` | — | 입력 submit |
| `inputPlaceholder` | `string` | `"어떤 작업을 함께 할까요?"` | — |

**사용 패턴:**

```tsx
<WhaTapAiWidget
  open={aiActive}
  showLanding={messages.length === 0}
  messages={
    <>
      <AiChatExchange question="고활용 GPU 찾아줘" />
      <AiReasoning steps={[{ label: "데이터 수집", running: true }]} />
      <AiClassificationTable rows={…} />
      <AiMessageActions />
    </>
  }
  onSubmit={handleSubmit}
/>
```

### WhaTapAiContext

위젯 상태 + 대화 문맥 Context. 라우트 간 위젯 활성 상태와 마지막 프롬프트를 유지합니다.

```ts
export type LastPrompt = { text: string; fromRoute: string };

type Ctx = {
  aiActive: boolean;
  setAiActive: (v: boolean) => void;
  lastPrompt: LastPrompt | null;
  setLastPrompt: (p: LastPrompt | null) => void;
};

// Export
export function WhaTapAiProvider({ children }: { children: ReactNode })
export function useWhaTapAi(): Ctx
```

**App 루트에서 한 번만 `<WhaTapAiProvider>`로 감싸고**, 모든 페이지에서 `useWhaTapAi()`로 `aiActive` 상태를 공유합니다.

---

## 메시지 카드 — 사용자 / 시스템 입력

### AiChatExchange

사용자 Q&A 한 쌍 + 첨부 (파일 / 이미지). 메시지 스택의 첫 줄.

```ts
export type AiChatAttachment =
  | { kind: "file"; name: string; mime?: string }
  | { kind: "image"; src: string; alt?: string };
```

| Prop | Type | 설명 |
|---|---|---|
| `question` | `string` | 사용자 질문 |
| `answer` | `string?` | AI의 초기 답변 (텍스트, 카드 응답 전) |
| `attachments` | `AiChatAttachment[]?` | 첨부 |

내부적으로 `AiUserBubble` 사용.

### AiUserBubble

사용자 입력 우측 정렬 버블 (`#f5f5f5` 배경, 4px radius).

| Prop | Type |
|---|---|
| `children` | `ReactNode` |
| `className` | `string?` |

---

## 메시지 카드 — 진행 상태 (Reasoning / Tool calls)

### AiReasoning

추론 진행 단계 표시. 회색 칩 + 활성 spinner + 체크.

```ts
export type ReasoningStep = { label: string; running?: boolean };
```

| Prop | Default |
|---|---|
| `steps: ReasoningStep[]` | — |
| `delay` | `0` |

### AiStepsTimeline

콜랩서블 진행 타임라인. `▼ N steps` 토글 + 각 step 체크/spinner.

```ts
export type TimelineStep = { label: string; running?: boolean };
```

| Prop | Default |
|---|---|
| `steps` | — |
| `defaultOpen` | `true` |
| `delay` | `0` |

### AiToolCallStep

Agent tool invocation 블록. `stepsCompleted` + running spinner + tool 이름 + 본문.

| Prop | Default |
|---|---|
| `stepsCompleted: number` | — |
| `running` | `false` |
| `toolName?: string` | — |
| `body?: string` | — |
| `defaultOpen` | `true` |
| `delay` | `0` |

### AiLoadingMessage

데이터 수집 중 로딩 메시지. 차트 아이콘 + 텍스트.

| Prop | Default |
|---|---|
| `text` | `"분석에 필요한 데이터를 수집중입니다."` |

---

## 메시지 카드 — 분석 / 인사이트

### AiInsightSection

일반 분석 문단. 제목 + 본문.

| Prop | Default |
|---|---|
| `title?: string` | — |
| `body: string` | — |
| `delay` | `0` |

### AiClassificationTable

분류 결과 테이블 (GPU/모델/평균/최대/최소/Pod + tone 배지).

```ts
export type ClassificationRow = {
  gpu: string | number;
  model: string;
  avg: string;
  max: string;
  min: string;
  pod: string;
  tone: Tone;
  badge?: string;
};
```

| Prop | Default |
|---|---|
| `caption?: string` | — |
| `description?: string` | — |
| `warning?: string` | — |
| `rows: ClassificationRow[]` | — |
| `delay` | `0` |

내부에서 `AiToneBadge`를 자동 배치. 새 분류 화면을 만들 때 — 컬럼 구성이 이 6개와 같으면 그대로 쓰고, 다르면 `DataTable`을 직접 조립.

### AiUsageChart

24시간 GPU 사용률 막대 차트. 스태거 애니메이션.

| Prop | Default |
|---|---|
| `caption` | `"Hourly GPU Utilization"` |
| `values: (number \| null)[]` | — |
| `highlightThreshold` | `50` |
| `delay` | `0` |

`null`은 데이터 없음(빈 막대). `highlightThreshold` 초과 막대는 강조.

---

## 메시지 카드 — 비용 분석

### AiCostTable

현행 vs 제안 비용 비교 + 절감액 카드.

```ts
export type CostRow = { label: string; detail: string; cost: string; highlight?: boolean };
```

| Prop | Default |
|---|---|
| `caption` | `"Cost Analysis"` |
| `rows: CostRow[]` | — |
| `savingsLabel?: string` | — |
| `savingsValue?: string` | — |
| `delay` | `0` |

### AiCostBreakdown

비용 분석 상세. tone dot + 4컬럼 표 + 소계 + 월 환산.

```ts
export type CostBreakdownRow = { gpu: string; pod: string; avg: string; idle: string; daily: string };
```

| Prop | Type |
|---|---|
| `toneLabel` | `string` |
| `toneColor` | `string` |
| `context?` | `string` |
| `rows` | `CostBreakdownRow[]` |
| `subtotal?` | `string` |
| `monthly?` | `string` |
| `monthlyNote?` | `string` |
| `delay` | `number` |

---

## 메시지 카드 — 제안 / 의사결정

### AiCriteriaSelection

분류 기준 선택 카드. reasoning + tone 그룹 + 참고 + CTA 4개.

```ts
export type CriterionGroup = { tone: "low" | "mid" | "high" | "neutral"; title: string; detail: string };
export type CriteriaOption = { key: string; label: string };
```

| Prop | Default |
|---|---|
| `heading` | `"Reasoning"` |
| `body: string` | — |
| `groups: CriterionGroup[]` | — |
| `notes?: string[]` | — |
| `options: CriteriaOption[]` | — |
| `onSelect?: (key) => void` | — |
| `delay` | `0` |
| `selectionDelay` | `450` |
| `autoPick?: { key; after }` | — | _(데모/프로토타입 자동 클릭용)_

### AiChoiceButtons

2개 선택지 CTA (primary gradient + secondary outline).

```ts
export type Choice = { label: string; hint?: string; onClick?: () => void };
```

| Prop | Default |
|---|---|
| `primary: Choice` | — |
| `secondary: Choice` | — |
| `delay` | `0` |

3개 이상 선택지가 필요한 경우는 `AiCriteriaSelection`을 쓰거나, 새 컴포넌트가 필요하다는 신호 — 디자인 시스템에 추가하기 전에 디자인 리뷰.

### AiDashboardProposal

대시보드 구성 제안. intro + 위치 안내 + 섹션들 + 마무리 질문.

```ts
export type ProposalSection = { emoji: string; title: string; bullets: string[] };
```

| Prop | Default |
|---|---|
| `intro: string` | — |
| `locationHeading?: string` | — |
| `locationLabel?: string` | — |
| `sections: ProposalSection[]` | — |
| `closingQuestion: string` | — |
| `delay` | `0` |

### AiMigPlan

MIG 통합 기획. heading + bullets + 3컬럼 표 + 월 환산 + 우선순위 액션.

```ts
export type MigPlanRow = { label: string; config: string; monthly: string; highlight?: boolean };
export type MigAction = { step: number; body: string };
```

| Prop | Default |
|---|---|
| `heading` | `"MIG 통합 기획 (A100 핵심 활용 전략)"` |
| `bullets?: string[]` | — |
| `rows?: MigPlanRow[]` | — |
| `totalLabel` | `"통합 비용 요약"` |
| `total?: string` | — |
| `totalNote?: string` | — |
| `actionsHeading` | `"우선순위 액션"` |
| `actions?: MigAction[]` | — |
| `delay` | `0` |

### AiAlertRulePreview

알림 규칙 등록 전 미리보기. 2컬럼 KV 테이블 + 참고 노트.

```ts
export type AlertRuleField = { label: string; value: ReactNode };
```

| Prop | Default |
|---|---|
| `title` | `"알림 규칙 상세"` |
| `fields: AlertRuleField[]` | — |
| `notes?: string[]` | — |
| `notesTitle` | `"참고"` |
| `delay` | `0` |

---

## 메시지 카드 — 실행 결과 / 액션

### AiExecutionResult

실행 결과 메시지. success / failure / unknown + timestamp + body + bullets + details + footer.

```ts
export type ExecutionResultVariant = "success" | "failure" | "unknown";
export type AiExecutionResultProps = {
  variant: ExecutionResultVariant;
  timestamp: string;
  body: string;
  bullets?: string[];
  details?: { label: string; value: string }[];
  footer?: string;
};
```

### AiMessageActions

AI 응답 하단 피드백 액션. 좋아요 / 싫어요 / 복사.

| Prop | Default |
|---|---|
| `divider` | `false` |
| `onLike` | — |
| `onDislike` | — |
| `onCopy` | — |

**각 AI 응답의 마지막 자식**으로 둡니다. `divider=true`일 때 상단 구분선 표시.

---

## 데모/프로토타입 보조

### AiClickCursor

자동 클릭 손 커서 데모 인디케이터. 발표/마케팅 시나리오에서만 사용 — 실서비스에서는 렌더하지 않습니다.

| Prop | Default |
|---|---|
| `size` | `48` |
| `style?: CSSProperties` | — |

---

## 합성 — 전형적인 AI 응답 메시지 스택

```tsx
<WhaTapAiWidget
  open={open}
  showLanding={false}
  messages={
    <>
      <AiChatExchange question="고활용 GPU 찾아서 비용 절감안 줘" />
      <AiReasoning steps={[
        { label: "GPU 메트릭 수집" },
        { label: "활용도 분류", running: true },
      ]} />
      <AiClassificationTable rows={classification} delay={120} />
      <AiCostTable rows={cost} savingsLabel="예상 절감" savingsValue="₩320,000/월" delay={240} />
      <AiMigPlan rows={mig} total="₩1,580,000" actions={actions} delay={360} />
      <AiChoiceButtons
        primary={{ label: "MIG 적용 계획서 만들기", onClick: makePlan }}
        secondary={{ label: "다른 옵션 보기", onClick: showAlternatives }}
        delay={480}
      />
      <AiMessageActions divider />
    </>
  }
/>
```

**`delay`를 단계적으로 증가**시켜서 카드들이 순차 진입하는 효과를 줍니다.

---

## Do / Don't

✅ **Do**

- 새 메시지 종류가 필요하면 **여기 20개 중 가장 가까운 것을 prop으로 확장** 시도 — 같은 외형 다른 데이터인 경우 다수
- 메시지 스택은 항상 **`<AiChatExchange>`로 시작**해서 사용자 질문을 표시
- AI 응답의 마지막엔 **`<AiMessageActions>`** 로 피드백 수집 자리 확보
- `delay`를 활용해 카드 진입을 **순차적으로 stagger**

❌ **Don't**

- 카드 외형을 새로 짜기 — `AiCard` 기반으로 거의 모든 메시지가 표현됨
- 같은 데이터 모양인데 컴포넌트 이름만 다른 변형을 추가 — prop 확장으로 처리
- `WhaTapAiWidget` 안에 `WhaTapAiWidget` 중첩 — 위젯은 페이지당 하나
- `showLanding`을 그대로 둔 채 `messages`를 채우기 — 메시지가 있으면 `showLanding={false}`

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
| `onStop` | `() => void` | — | AI 가 답을 만드는 중이면 넘긴다. 송신 버튼 자리가 중단 버튼(■)이 되고 Enter 로 보내지 않는다. 입력창은 열려 있다. 끝나면 `undefined` (patterns §24) |

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

### ThreadDivider

대화 스레드 경계선. 양옆 1px `--color-border-default` 선 사이에 `text-base` · `text-tertiary` 글자 한 줄(예: 「여기부터 SRE 플랜」). 대화 도중 재원 · 대상 같은 조건이 바뀐 순간 그 자리(앞 답 다음)에 끼운다. `role="separator"`.

| Prop | Type | 설명 |
|---|---|---|
| `children` | `ReactNode?` | 가운데 글자. 비우면 선만 선다 |
| `label` | `string?` | 스크린리더 문장. 글자가 문자열이면 생략 |
| `className` | `string?` | |

- 답 하나의 끝맺음 선은 `MessageActions divider` 다. 이것을 쓰지 않는다
- 바뀐 사실의 설명은 카드나 `UnavailableNotice` 로. 구분선 글자는 경계의 사실 한 줄만

---

## 메시지 카드 — 진행 상태 (Reasoning / Tool calls)

> **10초를 넘길 수 있는 단계 연산은 아래 [[AiProgress]] 하나로.** `AiReasoning` · `AiStepsTimeline` · `AiLoadingMessage` 는 짧은 대기(2초 안팎) · 끝난 과정의 기록용으로 남는다(patterns §24).

### AiProgress

10초 넘게 걸리는 AI 연산의 진행 카드(대기 표현 V2). 머리(단계 그림 32px · 제목 · 경과 초) · 단계 수로 나눈 막대 · 단계 목록 · 하단 줄. 경과 시간대별로 바뀐다: 0~2초 «질문을 확인하고 있어요» + 단계 이름 한 줄(막대 · 목록 없음) → 단계 진행(처리 수) → 10초~ 예상 시간 · 「완료되면 알림」 · 「중단」 → 30초~ 경고 면 지연 사유 → 완료 «3단계 완료 · 23초» 윗줄로 접힘(펼치기 · 접기는 늘 그 윗줄 오른쪽 끝) · 중단 «여기서 멈췄어요». Composite(Ai). `AiCard` · `AiStageMotion` · `AiProgressStep` · `Button` 조합.

```ts
export type AiProgressItem = {
  stage: "collect" | "analyze" | "write"; // 머리 그림
  label: ReactNode;                        // 단계 이름 «데이터 수집»
  title: ReactNode;                        // 진행 중 카드 제목 «성능 지표를 수집하고 있어요»
  status: "pending" | "active" | "done" | "halted";
  progress: number;                        // 0~1 처리 수 ÷ 전체
  count?: { value: number; total: number; unit: string };
  detail?: ReactNode;                      // 완료 뒤 한 줄
  findings?: ReactNode[];                  // 중간 발견
  marker?: number;                         // analyze 이상 구간 표시 시점
};
```

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `steps` | `AiProgressItem[]` | — | 단계(서버 이벤트에서 만든다) |
| `phase` | `"running" \| "done" \| "stopped"` | — | 진행 중인데 진행 단계가 없으면 0~2초 상태 |
| `elapsed` | `number` | — | 경과 초. 완료면 걸린 시간 |
| `expected` | `ReactNode?` | — | 10초부터 하단 줄 문장. 근거 없으면 비운다 |
| `delayReason` | `ReactNode?` | — | 30초부터 경고 면 하단 줄 |
| `longAfter` · `lateAfter` | `number` | `10` · `30` | 하단 줄 · 지연 사유 시점(초) |
| `notify` · `onNotifyChange` | `boolean` · `(v) => void` | `false` · — | 주면 「완료되면 알림」 토글 |
| `onStop` | `() => void` | — | 주면 「중단」 |
| `expanded` · `onExpandedChange` | `boolean?` | 내부 상태(접힘) | 완료 뒤 펼침 |
| `startingTitle` · `doneTitle` · `stoppedTitle` · `stoppedNote` | `ReactNode` | 한국어 기본 문장(`doneTitle` 은 «N단계 완료») | 문구 교체(다국어) |
| `still` | `boolean?` | `prefers-reduced-motion` | 머리 그림 멈춤 |

- **Figma 정본**(`2LktjSjKZDnCuWo5CQ6828`): 페이지 `AiProgress` 485:2 · 세트 485:317(state 7) / `AiProgressStep` 483:2 · 세트 483:47(status 4) / `AiStageMotion` 482:2 · 세트 482:90(stage 3 × progress 3). 색 · 반경 · 간격은 WDS 변수, 글자는 WDS 텍스트 스타일(미연결 0). 라이브러리 게시는 사람이 한다
- **개발 스펙**(격자 · 치수 · 토큰 · 상태 → 화면 · 서버 이벤트 계약 · 접근성 · 모션)은 소스 docstring `## Spec` 이 정본이다. 같은 내용이 Storybook Docs 탭 「개발 스펙」 과 DS MCP `get_component("AiProgress")` 의 `## Spec` 에 나온다. `AiProgressStep` · `AiStageMotion` 도 같다
- 함께 쓰는 것: 작성 단계에서만 `AnswerSkeleton still` · 위젯 `onStop` · 완료 답변을 `.wds-ai-reveal` 로 감싸기
- 진행률을 시간으로 계산하지 않는다. 분모 모르는 단계에 `count` 를 주지 않는다
- 제목은 상황에 맞게: «{처리하는 대상}을/를 {동작}하고 있어요». `label` 은 고정, `title` · `count.unit` 은 같은 대상(patterns §24)

### AiProgressStep

[[AiProgress]] 의 단계 한 줄. Primitives(Ai). 상태 넷: `pending` 회색 점 · 흐린 이름 / `active` 파란 고리 + 처리 수 «에이전트 8 / 12» / `done` 초록 체크 + 한 줄 / `halted` 빈 원 + «여기서 멈췄어요». 아래에 발견 칩(경고 면 `--color-status-warning-soft` · 글자 `--color-tone-text-warning`). `<li>` 를 그리므로 `<ul>` 안에 둔다.

| Prop | Type | 설명 |
|---|---|---|
| `status` | `AiProgressStepStatus` | |
| `label` | `ReactNode` | 단계 이름 |
| `count` | `{ value; total; unit }?` | `active` 에서만 보인다 |
| `detail` | `ReactNode?` | `done` 한 줄(`active` 에 `count` 없으면 대신) |
| `haltedText` | `ReactNode?` | 기본 «여기서 멈췄어요» |
| `findings` · `findingPrefix` | `ReactNode[]?` · `ReactNode?` | 발견 칩 · 머리말 기본 «발견» |

### AiStageMotion

진행 카드 머리의 단계 그림(32px). Primitives(Ai). 반복 루프가 아니라 `progress` 를 받아 그린다. `collect` 바깥 점 12개가 가운데로 모인다 · `analyze` 선 그래프 위를 스캔 선이 지나가고 `marker` 를 넘으면 이상 구간이 경고 색으로 남는다 · `write` 문서에 줄이 한 줄씩 그어진다. 동작 줄이기 설정이면 멈춘다. 장식(`aria-hidden`).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `stage` | `"collect" \| "analyze" \| "write"` | — | |
| `progress` | `number` | — | 0~1 |
| `size` | `number` | `32` | 설명 화면은 96 |
| `still` | `boolean?` | `prefers-reduced-motion` | |
| `marker` | `number?` | — | `analyze` 이상 구간 시점 |

- 완료 순간 그림(④ 정보 표현)은 컴포넌트가 아니라 CSS 클래스 `.wds-ai-reveal` 이다. 답변 카드에 완료 이벤트에서 한 번만 붙인다

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

데이터 수집 중 로딩 메시지. 차트 아이콘 + 텍스트. 2초 안에 끝나는 대기 전용이다. 더 길면 [[AiProgress]] 의 0~2초 상태가 이 역할을 맡는다.

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

### AiTargetMesh

대상 판정 결과의 군집 메시 — **점 하나 = 대상 하나**. 대상 종류마다 군집 하나이고 **군집 면적이 곧 대상 수**(반지름 ∝ √개수). 이상 점은 가운데부터, 수집 실패는 바깥 테두리부터 빈 점.

```ts
export type TargetMeshItem = {
  short: string;      // 열 라벨 (짧게)
  label: string;      // 문장·툴팁용 이름
  total: number;
  warning: number;
  critical: number;
  missing?: number;   // 수집이 끊겨 판정 못 한 수 — 바깥부터 빈 점
  hint?: string;      // 툴팁 끝에 붙일 한 줄(추이 등)
  iconSrc?: string;   // 16px 제품 아이콘 — 종류 식별은 점 모양이 아니라 이 아이콘이 맡는다
};
```

| Prop | Default |
|---|---|
| `items: TargetMeshItem[]` | — |
| `revealedCount?` | 전체 (앞에서부터 N개 군집만 점등 — 판정 진행 표시) |
| `interactive` | `true` |
| `onSelect?: (item) => void` | — |
| `legend?: ReactNode` | 기본 문구 (`null` 로 끌 수 있으나 권장하지 않음) |

함께 내보내는 것: `targetMeshDots(item, scale)`(같은 점 데이터를 다른 크기로 재사용 — 배경 오브제 등) · `meshScaleOf(items)` · `MESH_DOT_R` · `MESH_CLUSTER_K`.

**규칙**
- 열 폭은 군집 지름이 아니라 **1/N 등폭**. 지름에 맞추면 132개 열이 6개 열보다 두 배 넓어져 «어느 종류가 더 중요한가»로 잘못 읽힌다.
- 대상 수가 상한(군집당 150점)을 넘으면 **점 하나가 여러 대상**을 뜻하도록 축척이 자동 전환되고, 범례가 «점 하나가 대상 N개»로 바뀐다. 축척은 **전 종류 공통** — 종류마다 다르면 면적 비교가 깨진다.
- 종류 식별은 **아이콘**으로. 점을 종류마다 다른 도형으로 바꾸지 말 것 — 같은 개수가 다른 크기로 읽히고, 4.2px에서 도형은 구별되지 않는다.
- 분모는 등록 수가 아니라 **판정된 수**(`total - missing`).
- 애니메이션 클래스는 `whatap-ds.css` 의 `.wds-mesh-*`. `prefers-reduced-motion: reduce` 에서 정지.


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

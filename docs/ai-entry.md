# AI 진입점 — 4 컴포넌트 (WhaTap AI 카테고리)

> 원본: `src/widget/` (interfacedesigner/WhaTap-design-system) · Storybook 트리 `WhaTap AI/Buttons` · `WhaTap AI/Input`

페이지에서 WhaTap AI 위젯을 호출하는 진입 컴포넌트 4 종. **일반 form Primitive (Button/TextField) 와 의도적으로 분리** — AI 영역에는 `Ai...` 카테고리만 사용 (AI 카테고리 분리 원칙은 [`patterns.md`](./patterns.md#ai-카테고리-vs-일반-primitive-분리)).

| 컴포넌트 | 용도 | 트리거 위치 |
|---|---|---|
| `AiAssistantButton` | 위젯 열기/닫기 토글 (그라데이션 강조) | `PageHeader` 우측 |
| `AiSendButton` | 위젯 안 / inline prompt 의 송신 ⬆ | input adjacent |
| `AiInlinePrompt` | 페이지 헤더에 inline AI 입력 (1-step UX) | `PageHeaderAiInline` 안 |
| `AiPromptInput` | 위젯 본체의 메인 prompt 영역 | `WhaTapAiWidget` 내부 |

---

## AiAssistantButton

32px 둥근 알약 — "WhaTap AI" 라벨 + 핀휠 심볼. `aiActive=true` 시 그라데이션 강조.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `aiActive` | `boolean` | `false` | true 면 `.is-active` 강조 |
| `children` | `ReactNode` | `"WhaTap AI"` | 라벨 |
| ...HTML button attrs | — | — | onClick · disabled 등 |

```tsx
<AiAssistantButton aiActive={aiActive} onClick={() => setAiActive(!aiActive)} />
```

`PageHeader` 가 내부에서 이 버튼을 자동 렌더링 — 페이지가 직접 import 하는 경우는 별도 위치(예: 인사말 모듈) 한정.

---

## AiSendButton

24px 정사각 송신 버튼 (⬆ 화살표). 활성 시 파랑 채움, 비활성 시 회색.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `active` | `boolean` | `false` | true 면 파랑 + 클릭 가능 |
| `showCursor` | `boolean` | `false` | 시연용 자동 클릭 ripple |
| ...HTML button attrs | — | — | onClick · type 등 |

```tsx
<AiSendButton active={input.length > 0} onClick={() => send(input)} />
```

`AiInlinePrompt` 와 `AiPromptInput` 가 내부에서 이 버튼을 렌더 — 단독 import 는 시연 시나리오 한정.

---

## AiInlinePrompt

**페이지 헤더에 직접 박히는 inline AI 입력**. 32px height, 좌측 input + 우측 ⬆ send. focus 시 chip suggestions 가 floating dropdown 으로 펼쳐짐 (한 줄 invariant — chip 들이 줄바꿈하지 않음).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` / `onChange` | `string` / `(v: string) => void` | — | controlled (undefined → internal state) |
| `onSubmit` | `(v: string) => void` | — | Enter 또는 ⬆ 클릭. trim 비어있으면 호출 안 됨 |
| `placeholder` | `string` | `"어떤 작업을 함께 할까요?"` | 기본 정적 1개 (`rollingPlaceholders` 미주입 시) |
| `rollingPlaceholders` | `string[]` | — | **옵션** — 제품별 핵심 prompt 배열. 입력 비어 있을 때 세로 롤링(순환). 미주입이면 정적 |
| `rollingIntervalMs` | `number` | `2800` | 롤링 전환 간격(ms) |
| `attachments` | `AiInlineAttachment[]` | — | 같은 행 inline 첨부 chip |
| `suggestions` | `AiPromptSuggestion[]` | — | focus 시 floating dropdown chip |
| `onSelectSuggestion` | `(s) => void` | — | chip 선택 (input 채우기 자동, 송신은 사용자 액션) |
| `defaultOpen` | `boolean` | `false` | Storybook/시연용 강제 펼침 |
| `showSendCursor` | `boolean` | `false` | 송신 ripple |
| `onSendClick` | `() => void` | — | 송신 핸들러 (없으면 onSubmit) |

### 롤링 placeholder (옵션) — 정책 갱신 (2026-06)

기존 "placeholder 회전 미적용(정적 1개)" 정책은 **opt-in 롤링 지원으로 확장**됨. 기본은 여전히 정적 — `rollingPlaceholders` 를 주입한 화면에서만 입력이 비어 있을 때 제품별 핵심 prompt 가 세로로 순환한다 (입력 시 자동 정지). 미주입 호출처는 기존과 100% 동일.

**송신 버튼은 롤링 중에도 비활성 유지.** 근거: 롤링 텍스트는 placeholder(힌트)이지 입력값이 아니므로(`placeholder ≠ value`), 빈 입력에서 활성화하면 사용자가 입력하지 않은 prompt 가 전송되는 오발송이 된다. 빠른 진입(클릭→입력)은 `suggestions` chip 채널이 담당하고 placeholder 는 예시/영감 역할로 분리한다. a11y 상으로도 placeholder 를 값으로 취급하지 않는다.

```tsx
const GPU_AI_PLACEHOLDERS = [
  "GPU 사용률이 급증한 노드를 찾아줘",
  "최근 1시간 GPU 메모리 추세를 분석해줘",
  "유휴 GPU 워크로드를 정리 제안해줘",
];

<AiInlinePrompt rollingPlaceholders={GPU_AI_PLACEHOLDERS} onSubmit={(q) => askAi(q)} />
```

### suggestions 사양

- **label ≠ query 분리** — chip 라벨은 사용자 친화, query 는 LLM 친화 (구체적)
- 한 줄 invariant: chip 들이 줄바꿈 없이 가로로 — 폭 부족 시 scroll
- 1 단계: 페이지가 suggestions 를 prop 으로 주입
- 2 단계 (예정): `WhaTap_Scenarios/` build-time codegen 자동 생성

```tsx
const CATALOG_AI_SUGGESTIONS: AiPromptSuggestion[] = [
  { label: "디스크 알림 끄기", query: "디스크 사용률 알림을 OFF 로 일괄 설정해줘" },
  { label: "어제 발생 패턴",   query: "최근 24시간 알림 발생 패턴 분석해줘" },
];

<AiInlinePrompt
  placeholder="이벤트 카탈로그에 대해 질문..."
  suggestions={CATALOG_AI_SUGGESTIONS}
  onSubmit={(q) => openWidget(q)}
/>
```

`PageHeaderAiInline` 이 내부에서 이 컴포넌트를 자동 마운트 — 페이지가 직접 import 할 일은 거의 없음.

---

## AiPromptInput

**위젯 본체의 메인 prompt 영역**. 멀티라인 textarea + 토큰 카운트 pill + 첨부 + 송신.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` / `onChange` | `string` / `(v: string) => void` | — | controlled |
| `onSubmit` | `(v: string) => void` | — | Enter 또는 ⬆ 송신 |
| `placeholder` | `string` | `"어떤 작업을 함께 할까요?"` | — |
| `attachments` | `AiPromptAttachment[]` | — | 입력 영역 위 chip |
| `tokenInput` / `tokenOutput` | `number` | — | 토큰 카운트 pill |
| `showSendCursor` | `boolean` | `false` | — |
| `onSendClick` | `() => void` | — | 사용자 정의 송신 |
| `caption` | `ReactNode` | _(default)_ | 하단 caption — 정책상 default 유지 권장 |

`WhaTapAiWidget` 내부에서 자동 사용. 직접 import 는 시연 또는 widget 외 환경 한정.

---

# AI 영역 ↔ 일반 영역 분리 원칙

- AI 진입점·AI 응답 UI 는 **`Ai...` 카테고리만** — AiInlinePrompt · AiSendButton · AiAssistantButton
- 일반 폼/검색은 TextField · Button
- 페이지의 AI 진입점은 **버튼 대신 AiInlinePrompt 직접 주입** (2-step UX → 1-step UX)
- AI 카테고리 컴포넌트는 디자인 시스템 안에서도 `widget/` 경로에 거주, subpath `@whatap/design-system/widget` 으로 import 가능

자세한 근거는 [`patterns.md`](./patterns.md#ai-카테고리-vs-일반-primitive-분리).

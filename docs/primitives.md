# 일반 폼/표시 Primitives — 12 컴포넌트

> 원본: `src/` (interfacedesigner/WhaTap-design-system) · Storybook 트리 `Primitives/`

가장 작은 단위의 재사용 컴포넌트들. **새 화면을 만들 때 인라인 form/feedback UI 를 새로 짜지 마세요. 이들을 조립하세요.**

> **참고:** `Primitives` 는 "자체 렌더 리프" 계층 전체(65종 — 행·칩·항목·심볼 포함)를 뜻한다. 이 문서는 그중 **일반 폼/표시 12종**만 다룬다. AI 리프 카드는 `Primitives/Ai`(아래) 참조.

- **일반 폼/표시 (12)** — 페이지·다이얼로그 어디서나 — Checkbox · RadioGroup · Tooltip · Chip · FilterChip · TextField · Select · Slider · Tabs · Modal · FilterDropdown · Disclosure

> **AI 카드 빌딩 블록(AiCard · AiCaption · AiSectionHeading · AiToneBadge · AiBulletList)** 은 Storybook `Primitives/Ai` 하위그룹(AI 리프 프리미티브). 카탈로그: [widget-components.md](./widget-components.md). 아래 "AI 카드 빌딩 블록" 상세는 참고용으로 유지.

모든 컴포넌트는 [`tokens.md`](./tokens.md) 의 색·타입 토큰을 사용하며 직접 hex 리터럴 금지.

---

# A. 일반 폼/표시 Primitives (12)

## Checkbox

3 상태 체크박스 — 체크/언체크/indeterminate. 라벨 옆 박스 클릭 또는 키보드 Space.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `checked` | `boolean` | — | controlled 체크 상태 |
| `indeterminate` | `boolean` | `false` | 트리/그룹 일부 선택 — `checked` 와 독립 |
| `disabled` | `boolean` | `false` | 비활성 |
| `size` | `"sm" \| "md"` | `"md"` | sm=14px / md=16px |
| `onChange` | `(next: boolean) => void` | — | 변경 콜백 |
| `label` / `children` | `ReactNode` | — | 라벨. 둘 다 있으면 children 우선 |
| `aria-label` | `string` | — | label/children 없을 때 a11y 필수 |

```tsx
<Checkbox checked={enabled} onChange={setEnabled}>알림 활성</Checkbox>
<Checkbox checked={false} indeterminate onChange={...}>일부 선택</Checkbox>
```

## RadioGroup

서로 배타인 선택지 2–5개 중 하나를 고르는 폼 값. 선택지를 접지 않고 펼쳐 둔다. 네이티브 radio 라 화살표 이동 · Space 선택 · 낭독을 브라우저가 맡는다(`role="radiogroup"`).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `items` | `RadioGroupItem[]` | — | `{ value, label, description?, disabled? }` |
| `value` / `onChange` | `string` / `(next) => void` | — | controlled |
| `defaultValue` | `string` | 고를 수 있는 첫 선택지 | uncontrolled |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | 가로는 2–3개 · 풀이 없을 때만 |
| `disabled` | `boolean` | `false` | 묶음 전체 비활성 |
| `label` / `aria-labelledby` | `string` | — | 묶음 이름. 둘 중 하나 필수 |

- 처음부터 하나를 골라 둔다. 추천이 있으면 그것(patterns P4)
- 고를 수 없는 선택지는 지우지 않고 `disabled`. 이유는 그 아래 문장이 말한다
- 6개 이상 → `Select`. 뷰 전환 → `Tabs`(라디오는 «값», 탭은 «보기»). 크기순 값 → `Slider`

```tsx
<RadioGroup
  label="과금 범위"
  direction="horizontal"
  value={mode}
  onChange={setMode}
  items={[
    { value: "all", label: "전체 프로젝트 (7개)" },
    { value: "pick", label: "직접 선택" },
  ]}
/>
```

## Tooltip

hover/focus 시 짧은 설명 표시. 트리거 1개를 wrap (cloneElement) 해서 ARIA 자동 주입.

> 글자에 설명을 달 때는 Tooltip 을 직접 쓰지 말고 [[InfoTip]](ⓘ 버튼)을 쓴다. 툴팁 트리거를 밑줄로 그리지 않는다([`patterns.md`](./patterns.md) §16).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `content` | `ReactNode` | — | 1-2 문장 권장 |
| `children` | `ReactElement` | — | 트리거 1개 |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | 배치 |
| `hoverDelayMs` | `number` | `200` | hover 지연. focus 는 즉시 |
| `open` | `boolean` | _auto_ | 강제 표시 (디버그·Storybook) |
| `disabled` | `boolean` | `false` | — |

```tsx
<Tooltip content="이 항목은 읽기 전용입니다">
  <IconLock />
</Tooltip>
```

## TextLink

문장 안에서 다음 동선을 바로 여는 링크. 안내 문장이 이미 «어디로 가야 하는지» 를 말할 때(「플랜 관리자에게 요청」), 그 도착지 낱말을 링크로 만든다. `href` → `<a>`, `onClick` 만 → `<button type="button">`(모양 동일).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 도착지를 부르는 명사구 |
| `href` | `string` | — | 주소. 주면 `<a>` |
| `onClick` | `MouseEventHandler` | — | 라우터 이동 등 |
| `external` | `boolean` | `false` | 제품 밖 문서 — 새 창 + `rel="noopener noreferrer"` |

- 명사구에만 건다. 「여기」「자세히」 같은 빈 낱말 · 문장 전체 금지. 한 문장 2개까지.
- 실행은 `Button`, 설명 열기는 `InfoTip`. 링크는 이동만.
- 색 `--color-text-link`(톤 표면 위에서도 4.5:1) · 크기·굵기는 둘러싼 문장 · 밑줄은 hover/focus 에만.

```tsx
<p>내가 만든 플랜이 없으면 <TextLink href="/account/plans">플랜 관리자</TextLink>에게 범위 추가를 요청해 주세요.</p>
```

## Chip

라벨/태그/메타데이터 표시 — 작은 컬러 칩. 인라인 `<span>` 으로 직접 색 칠하지 말 것.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"solid" \| "soft" \| "outline"` | `"soft"` | 시각 강도 |
| `tone` | `"primary" \| "warning" \| "critical" \| "success" \| "neutral"` | `"neutral"` | 색 테마 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=18 / md=20 / lg=28px (h/2 pill) |
| `leadingIcon` | `ReactNode` | — | 도트·아이콘 |
| `closable` | `boolean` | `false` | 우측 × 버튼 |
| `onClose` | `() => void` | — | × 콜백 |

```tsx
<Chip tone="critical" variant="soft">Critical</Chip>
<Chip tone="neutral" variant="outline" leadingIcon="●">Disk</Chip>
<Chip tone="primary" closable onClose={...}>Disk</Chip>
```

> **interactive 필터 칩 (클릭 토글)** 은 `FilterChip` — `Chip` 은 정적 라벨 전용.

## Calendar

날짜 판(Primitives) — 연 · 월 · 일, `time` 을 주면 시 · 분 · 초까지. 달력 버튼을 눌렀을 때 뜨고, **고를 수 없는 날은 미리 흐리게 막는다** — 고른 뒤에 오류를 띄우지 않는다.
머리줄 « ‹ 2026년 10월 › » — ‹ › 한 달, « » 한 해.
띄우는 자리(팝오버 위치 · 바깥 누르면 닫기)는 부르는 쪽이 정한다. [[TimeRangeSelector]] 는 시작 · 종료 시각의 📅 아래에 띄운다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` | `string` (YYYY-MM-DD) | — | 고른 날 — brand 바탕 + 흰 글자 |
| `onSelect` | `(date) => void` | — | `time` 이 없을 때 — 누르는 즉시. 고를 수 없는 날은 부르지 않는다 |
| `time` | `{ hour, minute, second? }` | — | 주면 판 아래에 시 · 분 · 초 칸 + «고른 값»(`YYYY-MM-DD HH:MM:SS`) + 취소 · 적용 |
| `onApply` | `(date, time) => void` | — | `time` 이 있을 때 — 적용을 눌러야 부른다(날짜만 눌러서는 닫히지 않는다) |
| `min` · `max` | `string` | — | 고를 수 있는 범위(포함). 밖은 `--color-text-disabled` · `aria-disabled` |
| `month` | `string` (YYYY-MM) | `value` 의 달 | 처음 보여 줄 달 |
| `today` | `string` | 실제 오늘 | brand 1px 테두리. 스토리 · 스냅샷 고정용 |
| `onClose` | `() => void` | — | Esc · 취소 |

- 이번 달이 아닌 칸은 비운다(지난달 숫자를 흐리게 채우면 막힌 날과 구별되지 않는다).
- 키보드: ← → 하루 · ↑ ↓ 일주일 · Enter 고르기 · Esc 닫기. 판 안에서 Tab 은 한 칸에만 선다.

```tsx
<Calendar value="2026-10-26" min="2026-09-26" max="2026-10-26" onSelect={setDay} onClose={close} />
<Calendar value="2026-10-26" time={{ hour: "16", minute: "08", second: "26" }} onApply={(d, t) => set(d, t)} onClose={close} />
```

- 시각 칸은 숫자만 · 2자리 · 벗어날 때 범위로 맞춘다(시 0–23, 분 · 초 0–59).

## TimeChip

`Chip` md/soft/neutral 위에 **자형 규칙만** 얹은 조합 — 화면에 나가는 **시간값의 단일 표기**(Composite).
날짜 · 구간 · 판정 기준 시각 · 차트 축 끝점이 전부 같은 크기·같은 자형으로 선다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `string` | — | 한글 접두 라벨(「구간」·「판정 기준」). 값만 세울 땐 생략 |
| `value` | `string` | — | 시간값 본체 — `--font-family-numeric` + medium |
| `note` | `string` | — | 꼬리말(「(화)」·「· 방금」) — korean |
| `tone` | `"neutral" \| "warning"` | `"neutral"` | 낡은 값·주의가 필요한 시각은 warning |
| `leadingIcon` | `ReactNode` | — | 값의 **성격**을 말할 때만(예: 스냅샷 셔터) |

```tsx
<TimeChip value="8월 11일" note="(화)" />
<TimeChip label="구간" value="8월 9일 18:00 ~ 10:08" />
<TimeChip label="판정 기준" value="10:08" note="· 방금" leadingIcon={<IcSnapshot size={12} />} />
```

**`size` 를 열지 않는다** — 화면마다 크기가 갈리면 이 컴포넌트가 존재할 이유가 없어진다.
표기 규칙 전문(Do/Don't)은 [`patterns.md`](./patterns.md#12-시간-정보-표기--timechip-하나로) 참조.

## FilterChip

`Chip` 의 **interactive 변형**. 다중 필터 진입점 — 클릭 토글, 우측 count, 닫기 가능.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `selected` | `boolean` | — | 선택 상태 (controlled) |
| `onChange` | `(next: boolean) => void` | — | 토글 콜백 |
| `disabled` | `boolean` | `false` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=20 / md=24 / lg=32px |
| `leadingIcon` | `ReactNode` | — | 도트 등 |
| `count` | `number \| string` | — | 우측 카운트 (예: `12`, `"9+"`) |
| `closable` | `boolean` | `false` | true && selected 일 때만 × 표시 |
| `onClose` | `() => void` | — | × 콜백 |

```tsx
<FilterChip selected={isDisk} onChange={setDisk}>Disk</FilterChip>
<FilterChip selected count={12}>Critical</FilterChip>
<FilterChip selected closable onClose={() => removeFilter("disk")}>Disk</FilterChip>
```

> **단일 옵션 드롭다운** = `FilterDropdown`. **강제 단일 선택 (segmented)** = `Tabs variant="segmented"`.

## TextField

라벨 + 입력 + helper text 의 완전한 폼 필드. clearable(× 버튼) · invalid · leading/trailing 슬롯.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `ReactNode` | — | 상단 라벨 (생략 시 미표시) |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | sm=24 / md=28 / **lg=32px (default)** — 페이지 헤더·FilterBar 검색이 가장 흔한 사용처. Modal dense form 은 `size="md"` 명시 |
| `leadingIcon` | `ReactNode` | — | 좌측 슬롯 (검색 아이콘 등) |
| `trailingNode` | `ReactNode` | — | 우측 슬롯 (단위·아이콘) |
| `invalid` | `boolean` | `false` | 보더·focus critical |
| `helperText` | `ReactNode` | — | 하단 helper/error. invalid 시 critical |
| `fullWidth` | `boolean` | `false` | 컨테이너 폭 100% |
| `value` / `onChange` | `string` / `(next: string) => void` | — | controlled |
| `clearable` | `boolean` | `false` | value 있을 때 × 버튼 (clear) |
| `onClear` | `() => void` | — | clear 콜백 |
| ...HTML input attrs | — | — | type · placeholder · maxLength 등 |

```tsx
<TextField
  label="이메일"
  size="md"
  value={email}
  onChange={setEmail}
  invalid={!valid}
  helperText={!valid ? "이메일 형식이 올바르지 않습니다" : undefined}
  fullWidth
  clearable
/>
```

## Select

native `<select>` 기반 드롭다운 + 통일된 보더·사이즈. TextField 와 height 일치.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `ReactNode` | — | 상단 라벨 |
| `options` | `SelectOption[]` | — | `{ value, label }` 배열 |
| `value` / `onChange` | `string` / `(next: string) => void` | — | controlled |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | **lg=32px (default)** — TextField 와 height 정렬. Modal dense form 은 `size="md"` 명시 |
| `placeholder` | `string` | — | value="" 일 때 표시 |
| `leadingIcon` | `ReactNode` | — | — |
| `invalid` / `helperText` | — | — | TextField 와 동일 |
| `fullWidth` | `boolean` | `false` | — |
| `clearable` / `onClear` | — | — | chevron 옆 × 버튼 |

```tsx
<Select
  label="심각도"
  options={[
    { value: "critical", label: "Critical" },
    { value: "warning",  label: "Warning" },
  ]}
  value={sev}
  onChange={setSev}
  placeholder="선택하세요"
/>
```

## Slider

한 축 위에서 크기를 고르는 막대. 네이티브 `<input type="range">` 라 키보드 · 스크린리더 · 터치를 브라우저가 맡는다.
상한 · 한도 · 임계치처럼 **크기순으로 놓인 값** 중 하나를 고를 때 [[Select]] 대신 쓴다. 전체 범위와 지금 위치가 한눈에 보인다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `value` / `onChange` | `number` / `(next: number) => void` | — | controlled. 끄는 동안에도 불린다 |
| `defaultValue` | `number` | `stops[0]` 또는 `min` | uncontrolled |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | 연속. `stops` 가 있으면 무시 |
| `stops` | `readonly number[]` | — | 정해진 값(크기순). 값의 간격과 상관없이 **같은 간격의 눈금**에 놓인다 |
| `markLabel` | `(v: number) => ReactNode` | — | 눈금 아래 짧은 글자. `stops` 면 눈금마다, 연속이면 양 끝에만. 고른 눈금은 진하게 |
| `valueText` | `(v: number) => string` | — | `aria-valuetext` |
| `label` | `string` | — | 시각 라벨이 없을 때 `aria-label` |
| `disabled` | `boolean` | `false` | — |

- 지금 고른 값은 막대 밖에 글로 적는다(라벨 줄 또는 막대 위 한 줄). 막대 위치만으로 금액을 읽게 하지 않는다
- 눈금 글자는 짧게(「50만」). 단위와 풀이는 위 문장이 맡는다
- 폭은 부모가 정한다(`width: 100%`). 폼 열에 세울 때는 `className` 으로 폭을 준다
- 크기순이 아닌 선택지 → `Select`. 정확한 숫자 입력 → `TextField`. 둘 중 하나 → `Switch` · `Tabs segmented`

```tsx
<p>누적 사용액 {won(limit)}까지</p>
<Slider
  stops={[0, 100_000, 200_000, 500_000, 1_000_000, 2_000_000]}
  value={limit}
  onChange={setLimit}
  markLabel={(v) => (v === 0 ? "0" : `${v / 10_000}만`)}
  valueText={won}
  label="사용량 한계"
/>
```

## Tabs

탭 그룹. variant = `"large"` (페이지 탭) / `"segmented"` (작은 토글). 키보드 ←/→ 이동.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `items` | `TabsItem[]` | — | `{ value, label, count?, disabled? }` |
| `value` / `onChange` | `string` / `(next: string) => void` | — | controlled |
| `variant` | `"large" \| "segmented"` | `"large"` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=24 / md=32 / lg=40px |
| `fullWidth` | `boolean` | `false` | true 면 균등 분배 |
| `aria-label` | `string` | — | 페이지에 다중 Tabs 있을 때 필수 |

```tsx
<Tabs
  items={[
    { value: "all",  label: "전체", count: 42 },
    { value: "open", label: "열린 항목", count: 12 },
    { value: "closed", label: "닫힘" },
  ]}
  value={tab}
  onChange={setTab}
/>
```

## Modal

dialog — backdrop · panel · footer · 3 채널 닫기 (× / ESC / backdrop). React Portal.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `open` | `boolean` | — | controlled |
| `onClose` | `() => void` | — | 3 채널 모두 호출 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | width sm=400 / md=560 / lg=720px |
| `title` / `description` | `ReactNode` | — | 헤더 (description 은 선택) |
| `children` | `ReactNode` | — | 본문 |
| `footer` | `ReactNode` | — | 액션 영역 (보통 우측 정렬 버튼 1-2개) |
| `hideCloseButton` | `boolean` | `false` | × 숨김 |
| `disableBackdropClose` | `boolean` | `false` | — |
| `disableEscClose` | `boolean` | `false` | — |
| `container` | `HTMLElement` | `document.body` | Portal mount target |

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  size="md"
  title="삭제 확인"
  description="이 작업은 되돌릴 수 없습니다."
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
      <Button tone="critical" onClick={handleDelete}>삭제</Button>
    </>
  }
>
  3 개의 알림 규칙이 영구 삭제됩니다.
</Modal>
```

## FilterDropdown

트리거 + 펼침 패널 (Checkbox 묶음 또는 자유 children) + footer slot. outside-click/ESC 닫기.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `trigger` | `ReactElement` | — | Button / FilterChip 등. onClick 자동 주입 |
| `title` | `ReactNode` | — | 패널 상단 타이틀 |
| `options` | `FilterDropdownOption[]` | — | Checkbox 자동 모드 |
| `value` / `onChange` | `string[]` / `(next: string[]) => void` | — | options 모드 controlled |
| `children` | `ReactNode` | — | 자유 모드 — options 무시하고 본문 직접 |
| `footer` | `ReactNode` | — | Apply/Cancel 영역 |
| `placement` | `"bottom-start" \| "bottom-end"` 등 | `"bottom-start"` | 펼침 위치 |
| `width` | `number` | `240` | 패널 width(px) |
| `open` / `onOpenChange` | — | — | controlled (선택). 미지정 시 internal |
| `disableOutsideClick` / `disableEscClose` | — | — | — |
| `disabled` | `boolean` | `false` | — |

```tsx
<FilterDropdown
  trigger={<FilterChip selected={picked.length > 0}>카테고리 {picked.length || ""}</FilterChip>}
  title="카테고리 선택"
  options={[
    { value: "disk", label: "Disk" },
    { value: "jvm",  label: "JVM" },
    { value: "k8s",  label: "Kubernetes" },
  ]}
  value={picked}
  onChange={setPicked}
  footer={<Button size="sm" fullWidth onClick={apply}>적용</Button>}
/>
```

## Disclosure

머리말을 눌러 아래 내용을 펼치고 접는다. 머리말은 늘 보이고 내용은 펼쳤을 때만 선다. 기본은 접힘.
머리말 전체가 버튼이고 `aria-expanded` · `aria-controls` 가 자동으로 붙는다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `summary` | `ReactNode` | — | 늘 보이는 머리말. 접힌 것이 무엇인지와 그 양을 적는다 |
| `children` | `ReactNode` | — | 펼쳤을 때만 서는 내용 |
| `open` | `boolean` | _비제어_ | 제어 모드 열림. 주면 `defaultOpen` 무시 |
| `defaultOpen` | `boolean` | `false` | 비제어 모드 처음 열림 |
| `onOpenChange` | `(open: boolean) => void` | — | 머리말을 누를 때 다음 열림 값 |
| `size` | `"sm" \| "md"` | `"md"` | 머리말 글자 크기 |
| `disabled` | `boolean` | `false` | — |

- 머리말에 「펼치기 · 접기」 낱말을 넣지 않는다. 열림은 화살표와 `aria-expanded` 가 말한다
- 화면의 주요 내용을 접어 두지 않는다. 여러 구획 중 하나만 보여야 하면 `Tabs`, 덮어야 하면 `Modal`

```tsx
<Disclosure summary="다른 플랜에 속한 프로젝트 15">
  <ul>…</ul>
</Disclosure>
```

---

# B. AI 카드 빌딩 블록 Primitives (5)

위젯 콘텐츠 메시지 컴포넌트가 반복 사용하는 wrapper/heading/badge. `<WhaTapAiWidget>` 안의 모든 카드형 메시지는 이 5개로 조립합니다.

## AiCard

`--color-card` 배경 + `--color-border-default` 보더 + 8px 라운드 + 기본 패딩 카드 + 진입 애니메이션(`.ai-anim-in` + `animationDelay`).

**역할 두 가지 — `tone` 유무가 가른다.**

| 역할 | `tone` | 표면 | 담는 것 |
|---|---|---|---|
| 메시지 | 없음 | `--color-card` | AI 응답 한 단위 — 헤딩 + 본문 · 표 · 차트 |
| 안내 | `info` · `warning` · `critical` | `--color-tone-surface-*` | AI 를 쓰기 전에 알아야 할 사정 — `AiSectionHeading icon="info"` 제목 → 설명 → `Button` 하나 |

안내 문장에서 이동할 곳이 읽히는 낱말(플랜 이름 · 「플랜 관리자」)은 [[TextLink]] 로 건다. 버튼과 같은 곳으로 보내는 낱말에는 걸지 않는다. 위젯 전체가 막히면 `UnavailableNotice`, 위젯 밖 제품 화면이면 [[Notice]].

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 카드 본문 |
| `tone` | `"info" \| "warning" \| "critical"` | — | 안내 카드 표면 톤. 없으면 메시지 카드 |
| `delay` | `number` | `0` | 진입 애니메이션 지연 (ms). 메시지 stagger |
| `padding` | `number` | `12` | 안쪽 패딩 (px) |
| `gap` | `number` | `8` | 자식 간 세로 갭 (px). `0` 이면 미적용 |
| `className` | `string` | `""` | 추가 클래스 |

```tsx
<AiCard delay={120}>
  <AiSectionHeading tone="high">즉시 조치 권장</AiSectionHeading>
  <AiBulletList items={["고활용 GPU 2대 식별", "비용 절감 가능 ₩320,000/월"]} />
</AiCard>

<AiCard tone="warning" padding={16}>
  <AiSectionHeading tone="warning" icon="info">「mysql-v2-test 외 1」 플랜에 「Test」 프로젝트가 없습니다.</AiSectionHeading>
  <p className="text-base text-secondary">
    내가 만든 플랜이 없으면 <TextLink href="/account/plans">플랜 관리자</TextLink>에게 범위 추가를 요청해 주세요.
  </p>
  <div><Button variant="contained">범위에 추가</Button></div>
</AiCard>
```

## AiCaption

위젯 내 섹션 헤더용 작은 라벨. 11px bold uppercase. **REASONING / COST ANALYSIS / RESULT** 같은 영문 영역 구분자 전용.

| Prop | Type |
|---|---|
| `children` | `ReactNode` |

```tsx
<AiCaption>Reasoning</AiCaption>
```

한국어 헤딩은 `AiSectionHeading`.

## AiSectionHeading

컬러 도트(또는 emoji) + 굵은 한국어 헤딩 — **카드 내부의 "● 제목" 패턴**.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `tone` | `Tone` | — | 좌측 도트 톤 (생략 시 도트 없음) |
| `emoji` | `string` | — | 도트 대신 이모지. `tone` 보다 우선 |
| `icon` | `"info"` | — | 도트 대신 ⓘ 원 아이콘(안내 카드 제목). 색은 `tone` 라벨 색 |
| `children` | `ReactNode` | — | 헤딩 텍스트 |

```tsx
<AiSectionHeading tone="high">즉시 조치 (3건)</AiSectionHeading>
<AiSectionHeading emoji="📊">사용량 추이</AiSectionHeading>
<AiSectionHeading>일반 분석</AiSectionHeading>
```

## AiToneBadge

분류 결과를 작은 컬러 칩으로 표시 — `●` + 라벨.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `tone` | `Tone` | — | 필수. 배경/도트/라벨 모두 토큰 |
| `label` | `string` | `TONE_LABEL[tone]` | 기본 라벨 오버라이드 |

```tsx
<AiToneBadge tone="high" />              {/* ● 고활용 */}
<AiToneBadge tone="low" label="추천" />  {/* ● 추천 */}
```

## AiBulletList

위젯 본문의 ul/li 통일.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `items` | `string[]` | — | 각 줄 텍스트 |
| `size` | `"sm" \| "md"` | `"sm"` | sm=12px/`#4c4c4c` · md=13px/`#222` |

```tsx
<AiBulletList items={[
  "ORACLE: 평균 응답시간 38ms",
  "MySQL: 평균 응답시간 12ms",
]} />
```

복잡한 줄(굵게/링크/인라인 배지)은 `AiBulletList` 로 표현 불가 — 직접 `<ul>` 작성하되 색/사이즈 토큰만 맞출 것.

---

# 합성 예시 — 가장 흔한 위젯 카드

위젯 메시지의 70% 가 이 구조:

```tsx
<AiCard delay={delay}>
  <AiSectionHeading tone="high">고활용 GPU 분석</AiSectionHeading>
  <AiToneBadge tone="high" />
  <p style={{ fontFamily: tokens.font.family.korean.value, fontSize: 12, color: "#4c4c4c" }}>
    A100 2대가 96시간 이상 80% 이상 점유 중입니다.
  </p>
  <AiBulletList items={["GPU-04: 평균 92%", "GPU-07: 평균 88%"]} />
</AiCard>
```

# Do / Don't

✅ **Do**

- 새 form/feedback UI 를 만들기 전에 **위 컴포넌트로 조립 가능한지 확인**
- size 토큰만 사용 (sm/md/lg) — 임의 px 지정 금지
- TextField/Select/Tabs 등의 `helperText` + `invalid` 로 에러 표시 — 별도 에러 컴포넌트 만들지 말 것
- 위젯 카드는 무조건 `<AiCard>` 로 감싸기
- AI 진입점은 [`ai-entry.md`](./ai-entry.md) 의 `AiInlinePrompt` 사용 (Button 대신)

❌ **Don't**

- `<div className="bg-white border …">` 카드 새로 작성 — `AiCard` 와 1px 라도 어긋남
- `<input type="text">` 직접 작성 — `TextField` 의 라벨/error/clearable 누락
- `Chip` 으로 클릭 토글 만들기 — `FilterChip` 사용
- `Tabs variant="large"` 를 좁은 공간에 — `variant="segmented"` 사용
- `Modal` 안에 또 `Modal` — 흐름 끊김
- Tone 을 6단계 이상으로 확장 — 합칠 수 있는지 먼저 검토

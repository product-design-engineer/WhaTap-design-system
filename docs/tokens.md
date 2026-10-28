# Tokens

> **기계 판독본은 `tokens.json`** 입니다(자동 생성 · `/design-system/tokens.json`). 토큰별 tier·값·**다크 값**·역할(`@role`)·권장(`@use`)·금지(`@avoid`)·유틸 클래스·쓰는 컴포넌트가 들어 있고, MCP `get_tokens`·`search_tokens` 가 그것을 읽습니다.
> 이 문서는 **사람이 읽는 산문**(왜 그렇게 나눴는가)이고, 토큰 하나하나의 의미는 `whatap-ds.css` 선언 위 주석이 정본입니다 — 값과 의미를 한 곳에 둡니다.

> 원본: `src/widget/_tokens.ts` (위젯 Tone 토큰). 색·타입 등 메인 토큰의 단일 출처는 `src/tokens.css` 의 `:root` (순수 CSS, Tailwind 없음).

위젯 안에서 분류/상태 색상이 필요한 **모든** 컴포넌트는 이 토큰을 사용합니다. 인라인 색상 리터럴(`#E53935` 등)을 컴포넌트 내부에 적지 마세요 — 토큰을 추가하거나 기존 톤을 재사용하세요.

## Tone

분류/심각도/우선순위를 표현하는 5단계 시맨틱 토큰입니다.

```ts
export type Tone = "high" | "mid" | "low" | "idle" | "neutral";
```

| Tone | 의미 | 한국어 라벨 (`TONE_LABEL`) | 도트 (`TONE_DOT`) | 배경 (`TONE_BG`) |
|---|---|---|---|---|
| `high` | 고활용 / 위험 / 즉시 조치 | 고활용 | `#E53935` | `#ffe8e8` |
| `mid` | 활용 / 경고 | 활용 | `#F0B400` | `#fff7e0` |
| `low` | 저활용 / 정보 / 권장 | 저활용 | `#296CF2` | `#e8f4ff` |
| `idle` | 완전 유휴 / 비활성 | 완전 유휴 | `#757575` | `#f1f2f4` |
| `neutral` | 분류 없음 (라벨 비표시) | _(빈 문자열)_ | `#757575` | `#f1f2f4` |

**언제 어떤 톤?**

- `high` — 사용자에게 행동을 요구하는 경우 (잘못된 인덱스, 절감 대상 GPU, 알람 위반)
- `mid` — 모니터링 가치는 있지만 즉시 조치 불필요
- `low` — 분류상 "낮은" 그룹, 또는 정보/링크
- `idle` — "쓰지 않는" 자원의 정량적 표현
- `neutral` — 분류 자체가 의미 없는 행(합계, 캡션 행)

## Typography

타이포그래피 토큰은 `tokens.font.*` 네임스페이스 — **11 size · 3 weight · 6 line-height · 4 tracking · 10 named pattern** + family 2종.

### 폰트 패밀리

```ts
tokens.font.family.korean.value   // 'Noto Sans', 'Noto Sans KR', sans-serif
tokens.font.family.numeric.value  // Roboto, 'Noto Sans', 'Noto Sans KR', sans-serif
```

- `korean` — 위젯 본문, 헤딩, 라벨 (한국어 + 영문 혼합)
- `numeric` — 숫자 강조 (지표값, 비용, 카운트). 가독성을 위해 의도적으로 라틴 폰트 사용.

**`font-korean` 유틸에만 의존하지 말고 `style={{ fontFamily: tokens.font.family.korean.value }}`를 명시하세요.** 기본 sans 스택은 OS 폰트에 의존하므로 macOS와 Windows에서 다르게 보입니다. 위젯의 일관성을 위해 토큰을 직접 주입합니다.

> `WIDGET_FONT_KO`/`WIDGET_FONT_NUM` 은 `@deprecated` alias 로 backward-compat 유지.

### Type Scale (Hybrid — Dense 1px + Display 2배수 인접)

| 토큰 | 크기 | 영역 | 의도·용도 |
|---|---:|---|---|
| `chart` | 9px | Dense | SVG 차트 텍스트 (axis · peak 라벨, 단위 명시 필수) |
| `xs` | 10px | Dense | DataTable compact 헤더, AiToneBadge 텍스트, dim 메타 |
| `sm` | 11px | Dense | AiCaption (uppercase), compact 테이블 셀, sidebar 보조 |
| `base` | 12px | Dense | 본문 default — 가장 흔한 본문 사이즈 (117 회) ⭐ |
| `md` | 13px | Dense | AiSectionHeading, DataTable default, Toast, AiUserBubble |
| `lg` | 14px | Dense | AiCard 큰 헤더, LiveTimerCompact digit |
| `xl` | 16px | Display | Sub-display, marketing 타이틀 보조 |
| `2xl` | 20px | Display | PageHeader title — 사실상 페이지 레벨 표준 |
| `3xl` | 24px | Display | Stage 슬라이드 헤딩, marketing 데모 화면 강조 |
| `4xl` | 32px | Display | Stage 대형 메시지, 풀스크린 디스플레이 강조 |
| `5xl` | 48px | Display | Stage 풀스크린 hero, marketing 최대 강조 |

Dense(9~14)는 1px 정밀로 정보 밀도 보존, Display(16+)는 4~16px 간격으로 인접 2배수에 가까운 통합.

### Font Weight — 3 단계

```ts
tokens.font.weight.regular.value  // 400 — 본문 default (109+ callsite)
tokens.font.weight.medium.value   // 500 — 강조 (PageHeader · LIVE · AiToneBadge)
tokens.font.weight.bold.value     // 700 — 강한 강조 (Caption · SectionHeading · metric)
```

### Line-Height — 6 단계

| 토큰 | 값 | 사용 |
|---|---:|---|
| `none` | 1.0 | 단일 라인 (배지 · 헤딩 · 카드 헤더) — 175+ 회, 가장 흔함 ⭐ |
| `tight` | 1.2 | 매우 압축된 본문 |
| `snug` | 1.3 | compact 테이블 row, 옵션바 |
| `normal` | 1.4 | default 본문, 섹션 헤딩 본문 |
| `relaxed` | 1.5 | AiBulletList small, sub-section 본문 |
| `loose` | 1.6 | 긴 본문 단락 |

### Tracking (Letter-Spacing) — 4 단계

| 토큰 | 값 | 사용 |
|---|---:|---|
| `display` | -0.3px | 대형 페이지 타이틀 20px+ |
| `metric` | -0.2px | Roboto numeric digit (LiveTimer 등) |
| `default` | -0.1px | 한국어 본문 사실상 표준 — 159+ callsite ⭐ |
| `caps` | 0.3px | uppercase caption (REASONING 등) |

> 한국어 디자인 시스템에서 `-0.1px` 가 default 인 이유는 Noto Sans KR 의 letter-spacing 이 살짝 넓어 한국어가 분리되어 보이는 현상을 보정하기 위함.

### Named Typography Patterns — 10 종

자주 사용되는 family/size/weight/lineHeight/tracking 조합을 named pattern 으로 토큰화. AI agent 가 의도 명시된 lookup 가능.

| 패턴 | 조합 | 사용 위치 |
|---|---|---|
| `pageTitle` | korean · 2xl(20px) · medium · none · display | PageHeader title |
| `sectionHeading` | korean · md(13px) · bold · normal · default | AiSectionHeading |
| `caption` | korean · sm(11px) · bold · none · caps · uppercase | AiCaption |
| `body` | korean · md(13px) · regular · normal · default | AiBulletList md · AiUserBubble |
| `bodySmall` | korean · base(12px) · regular · relaxed · default | AiBulletList sm · dim 본문 |
| `label` | korean · xs(10px) · medium · none · default | AiToneBadge text |
| `metric` | **numeric** · lg(14px) · bold · none · metric | LiveTimer digit · PlanProposal total · KPI |
| `chartLabel` | **numeric** · chart(9px) · regular · none · default | MiniLineChart axis · peak |
| `tableHeaderCompact` | korean · xs(10px) · bold · none · default | DataTable compact 헤더 |
| `tableCellCompact` | korean · sm(11px) · regular · snug · default | DataTable compact 셀 |

### Korean vs Numeric 폰트 선택 가이드

| Context | family | 이유 |
|---|---|---|
| 한국어 본문, 라벨, 헤딩 | `korean` | 한국어 + Latin 혼용 시 baseline 일치 |
| Mixed 한국어 + 영문 텍스트 | `korean` | Noto Sans 가 Latin glyph 도 처리 |
| SVG 차트 axis · peak 라벨 | `numeric` | 숫자 가독성 + 등폭 비례 우수 |
| DataTable numeric 컬럼 | `numeric` | 자릿수 정렬 정확 |
| 시계 · 타이머 digit (LIVE) | `numeric` | 모노스페이스 느낌, digit 흔들림 없음 |
| 큰 metric 숫자 (₩, %, count) | `numeric` | PlanProposal total · KPI 카드 |
| ISO date · hex 색상 코드 | `numeric` | 한국어 텍스트와 시각 구분 |

## Spacing / Sizing Scale

`--space-*` — 4px 그리드 기반 치수(width/height/gap/padding) 스케일. 색·타이포처럼 **단일 출처**를 두어, 유틸(`h-*`/`w-*`/`size-*`)이 점진적으로 `var(--space-*)` 를 참조. 네이밍은 Tailwind 정렬 — `--space-N` = 4px × N.

| 토큰 | 값 | 대표 용도(illustrative) |
|---|---:|---|
| `--space-0` | 0 | 리셋 · gap 제거 |
| `--space-1` | 4px | 최소 gap (아이콘-라벨) |
| `--space-2` | 8px | 컴팩트 padding · 아이템 gap |
| `--space-3` | 12px | 카드 내부 padding |
| `--space-4` | 16px | 본문 콘텐츠 상·하 여백 |
| `--space-5` | 20px | 중간 여백 |
| `--space-6` | 24px | 큰 여백 · 제품 아이콘 크기 |
| `--space-7` | 28px | 프로젝트 그룹 행 등 |
| `--space-8` | 32px | **행 높이 표준** — 제품 레일 · 메뉴 행 · 하단 유틸 (`h-32px` 바인딩) ⭐ |
| `--space-9` | 36px | — |
| `--space-10` | 40px | 레일 폭 · 아이콘 칸 (`w-40px` 바인딩) · 조직/프로젝트 스위처 높이 · 서브헤더 행 |
| `--space-11` | 44px | — (프로젝트 스위처가 40px 로 통일되며 용도 해제) |
| `--space-12` | 48px | 헤더 · 로고 헤더 높이 |

- **테마 무관** — `.dark` 오버라이드 없음 (타이포 스케일과 동일).
- **바인딩 현황(점진 채택):** `h-32px → --space-8`, `w-40px → --space-10` 만 토큰 바인딩. 나머지 `h-*`/`w-*`/`size-*` 유틸은 아직 raw px — 필요 시 순차 바인딩.
- 소스 오브 트루스: `src/tokens.css` → `src/whatap-ds.css` `:root` 동기화. (`src/widget/_tokens.ts` TS 미러는 미반영 — 필요 시 추가.)

## Text Color Hierarchy

`tokens.color.text.*` — 텍스트 시각 위계 4 단계.

```ts
tokens.color.text.primary.value    // #222    — 본문 default, 헤딩 (154 회) ⭐
tokens.color.text.secondary.value  // #4c4c4c — 보조 본문, dim 텍스트 (75 회)
tokens.color.text.tertiary.value   // #757575 — 라벨, 메타, placeholder (63 회)
tokens.color.text.disabled.value   // #adadad — 비활성 상태 텍스트 (6 회)
```

본문이 압도적으로 흔하므로 `primary` 가 다른 색을 합친 것보다 많이 쓰임 — 위계 4 단계로 충분.

### 필수 표시 — `--color-text-required`

폼 라벨 옆 필수 표시 `*` 의 전경입니다. 값은 `var(--color-brand-blue)` 별칭이라 다크에서도 브랜드색을 따릅니다. 유틸은 `.text-required`.

```tsx
<span className="text-required"> *</span>
```

❌ `*` 를 `--color-status-error` 나 `--color-status-warning` 으로 칠하지 마세요. 아직 아무것도 치지 않은 빈 칸이 이미 틀린 것처럼 읽힙니다. 오류 색은 실제로 검증이 실패했을 때를 위해 아껴 둡니다.
❌ 없는 유틸(`text-status-warning` 등)을 쓰지 마세요. 실제로 그 이름으로 칠한 `*` 가 몇 달간 본문 색으로 나왔습니다 — 없는 클래스는 아무도 에러를 내지 않습니다.

### 반전 전경 — `--color-text-inverse`

위계 4단계와 별개로, **`--color-text-strong` 을 배경으로 깐 표면**(툴팁 등) 위의 텍스트·아이콘에 쓰는 전용 토큰입니다. 라이트 `#FFFFFF` / 다크 `#0E1116` — `text-strong` 이 다크에서 밝아지므로 전경은 반대로 어두워집니다.

```tsx
// Tooltip 패널
backgroundColor: "var(--color-text-strong)",
color: "var(--color-text-inverse)",
```

❌ 이 자리에 `--color-bg`(페이지 배경)를 쓰지 마세요. 값이 우연히 맞아 보여도 **페이지 배경을 바꾸는 순간 전경색이 딸려 움직입니다** — 실제로 라이트 `--color-bg` 를 회색으로 바꿨을 때 툴팁 글자색이 함께 흐려지는 문제가 있었습니다. 컬러 배경 위 **고정** 흰색(브랜드 배지 등)은 `--color-text-inverse` 가 아니라 `#fff` + `// raw-color-ok:` 입니다 — 그건 테마에 따라 반전되면 안 되기 때문입니다.

### 링크 글자 — `--color-text-link`

문장 안에서 다른 화면으로 이동하는 낱말([[TextLink]])의 전경입니다. 값은 `var(--color-brand-blue-deep)` 별칭이라 다크에서도 따라옵니다. 유틸 대신 `.wds-text-link` 클래스가 씁니다.

❌ `--color-brand-blue` 원색으로 링크를 칠하지 마세요. 안내 카드의 warning 톤 표면(`--color-tone-surface-warning`) 위에서 4.34:1 로 본문 대비 4.5:1 에 못 미칩니다.
❌ 링크가 아닌 강조 글자를 이 색으로 칠하지 마세요. 파란 글자는 «누르면 이동한다» 로 읽힙니다.

## Base Surface — 페이지 vs 카드 (2단 레이어)

`--color-bg` / `--color-card` 는 **값이 아니라 층(layer)** 을 뜻하는 토큰입니다. 페이지는 한 단계 뒤로 물러나고(회색), 콘텐츠는 그 위에 카드로 **쌓입니다**(흰색). 라이트·다크 모두 같은 모델입니다.

| 토큰 | 층 | 라이트 | 다크 | 유틸 | 용도 |
|---|---|---|---|---|---|
| `--color-bg` | 바닥 (page) | `#F5F5F5` | `#0E1116` | `bg-bg` | 페이지·앱 셸 배경 (`DashboardLayout`, `main`, `html/body/#root`) |
| `--color-card` | 위 (floating) | `#FFFFFF` | `#181C22` | `bg-card` | 떠 있는 표면 — 카드·헤더·사이드바·패널·입력·드롭다운·모달 |

**두 값이 같아지면 안 됩니다.** 같아지는 순간 카드는 1px 보더만 남아 "쌓인" 것으로 읽히지 않습니다 — 이 토큰 쌍이 존재하는 유일한 이유가 그 대비입니다.

✅ **Do**

- 페이지 본문의 의미 단위(테이블·차트·폼 섹션)는 **각각 `bg-card` 블록으로 감싼다.** 회색 바닥 위에 맨몸으로 놓지 않는다.
- 셸 배경은 `bg-bg`(또는 `var(--color-bg)`), 떠 있는 표면은 `bg-card` — **용도로 고른다.** 값이 같아 보여도 층이 다르면 다른 토큰.
- 카드 안의 보조 표면(hover 행·muted 셀·트랙)만 `bg-surface-50/100/200`.
- 테마 전환은 토큰 재매핑에 맡긴다. `.dark` 분기 스타일을 컴포넌트에 직접 쓰지 않는다.

❌ **Don't**

- `bg-white` · 인라인 `#fff` · `background: "#FFFFFF"` 로 페이지/패널 배경 지정 — 다크에서 깨진다. (예외: **컬러 위 전경** 텍스트·아이콘의 `#fff` 는 유지)
- **`--color-bg` 를 전경색(글자·아이콘·stroke)으로 사용** — 배경 토큰의 용도 이탈. 페이지 배경을 바꾸는 순간 전경색이 딸려 움직인다. 반전 전경에는 **`--color-text-inverse`** 를 쓴다.
- 페이지 배경에 `--color-surface-50` 사용 — 값은 같아도(`#F5F5F5`) 의미가 "hover/muted 보조 표면"이라, 나중에 한쪽만 조정할 수 없게 된다.
- `--color-bg` 를 `#FFFFFF` 로 되돌려 카드와 동일화 — 위 대비 규칙 위반.
- 카드 위에 카드를 또 얹어 3층 이상 쌓기 — 층은 page → card 2단까지. 더 필요하면 `surface-*` 로 표현.
- 소비 레이어(프로토타입·앱)에서 이 토큰 값을 override — DS 불변 정책 위반. 변경은 DS 본체 `src/tokens.css` + `src/whatap-ds.css` **동시 수정**으로만.

### 컴포넌트 표면 — 카드 안쪽에도 같은 규칙이 적용된다

page/card 층을 지켜도, **카드 컴포넌트 내부**(위젯 셸·툴바 컨트롤·차트 그리드)에서 흰색·회색을 하드코딩하면 다크에서 그대로 깨집니다. 컴포넌트 표면은 아래 매핑을 **강제**합니다.

| 컴포넌트 표면 | 토큰 | 라이트 | 유틸 / 사용 |
|---|---|---|---|
| 위젯 셸 배경, 위젯 본문 배경 | `--color-card` | `#FFFFFF` | `bg-card` |
| 위젯 외곽 보더 | `--color-border-strong` | `#E6E6E6` | `border-color-var-color-border-strong` |
| 툴바 컨트롤(버튼·셀렉트) 배경 | `--color-card` | `#FFFFFF` | `bg-card` |
| 툴바 컨트롤 보더 | `--color-border-strong` | `#E6E6E6` | — |
| 차트 그리드 점선 | `--color-border-soft` | `#F0F0F0` | — |
| 차트 baseline(축) 실선 | `--color-border-strong` | `#E6E6E6` | — |
| 아이콘 `fill`/`stroke` (무채색) | `--color-text-tertiary` | `#757575` | — |
| 시리즈 라인/막대 색 | `--color-chart-series-1..8` | 고정 순서 | 하드코딩 금지 |
| 크기·강도 표현(사용률 막대 등) | `--color-chart-seq-1..4` | 옅음→진함 | 하드코딩 금지 |

보더 토큰은 **네 개 모두 다크 오버라이드가 정의돼 있습니다** (`default #2A2F39` · `soft #21262E` · `strong #353B46` · `divider #4A515C`). 즉 토큰만 쓰면 다크는 공짜고, 하드코딩하면 그 컴포넌트만 라이트에 고정됩니다.

✅ **Do**

- 위젯/차트를 새로 만들 때 **색 리터럴을 한 개도 쓰지 않는 것**을 기본값으로 둔다. 필요한 색이 위 표에 없으면 → 리터럴을 적지 말고 **토큰을 먼저 추가**한다.
- SVG 안에서도 동일. `stroke="var(--color-border-soft)"` 처럼 CSS 변수를 그대로 쓴다 (`fill="#757575"` ❌).
- 값이 우연히 같아도 **용도로 고른다.** 그리드 점선은 `border-soft`, 컨트롤 보더는 `border-strong` — 나중에 한쪽만 조정 가능해야 한다.

❌ **Don't**

- `bg-white`, `background: "#fff"`, `background: "rgb(255,255,255)"` 로 위젯 셸·본문·컨트롤 배경 지정. → `bg-card` / `var(--color-card)`
- `#d3d3d3` · `#f0f0f0` · `#eaeaea` 같은 **회색 보더 리터럴**. → `--color-border-strong` / `--color-border-soft` / `--color-border-default`
- 무채색 아이콘에 `fill="#757575"`. → `var(--color-text-tertiary)`
- `bodyBg = "#fff"` 처럼 **색 리터럴을 컴포넌트 prop 기본값으로 굳히기** — 호출부 전체로 위반이 번식한다. 기본값도 토큰이어야 한다.
- 토큰이 없다는 이유로 리터럴 사용 — 토큰 부재는 리터럴의 근거가 아니라 **토큰 추가 요청의 근거**다.

> 예외는 하나뿐: **컬러 위에 얹는 흰색 전경**(브랜드 배경 위 텍스트·아이콘, `--wds-btn-fg`, 배지 안 `fill="#fff"`). 이건 테마와 무관하게 흰색이어야 하므로 유지한다.

## Status — 원색 · Deep · Soft 3단

`--color-status-*` 는 세 단계로 나뉩니다. **같은 의미의 색을 어느 자리에 쓰는지**가 단계를 결정합니다.

| 단계 | 토큰 | 자리 |
|---|---|---|
| 원색 | `--color-status-{success,warning,error}` | 채워진 배경(contained 버튼·도트·알약), 아이콘 |
| Deep | `--color-status-{warning,error}-deep` | 원색 배경의 **hover/pressed** (`--color-brand-blue-deep` 과 같은 역할) |
| Soft | `--color-status-{success,info,warning,error}-soft` | 옅은 **표면** — 토스트 배경, soft 칩/버튼, 경고 배너 |

Soft 표면 위 텍스트는 대비가 검증된 짝 **`--color-tone-text-*`** 를 씁니다 (`success` → `--color-tone-text-success` #007030). `warning-soft` 표면에 경계선이 필요하면 `--color-status-warning-soft-border`.

❌ **status 원색을 배경으로 쓰지 마세요** — 그 위 텍스트 대비가 무너집니다. 원색은 도트·아이콘·채워진 컨트롤 전용입니다.

Soft 4색은 tone surface 와 함께 **다크 반전됩니다** — 아래 *Tone Surface* 절의 표 참조.

## Neutral Solid — 중립 강조면 (`tone="tertiary"`)

색 의미가 **없는** 액션(취소·닫기·나중에·더보기)에도 채워진 버튼이 필요합니다. status 원색을 쓰면 없는 의미가 생기고, `surface-*` 는 흰 글자를 받을 만큼 어둡지 않습니다. 그래서 무채색 원색을 따로 둡니다.

| 토큰 | 라이트 | 다크 | 자리 |
|---|---|---|---|
| `--color-neutral-solid` | `#4C4C4C` | `#3A414D` | `tone="tertiary"` contained 버튼 배경 |
| `--color-neutral-solid-deep` | `#333333` | `#4A515C` | 그 hover/pressed |

- 위 전경은 **고정 흰색** — 대비 라이트 8.4:1 · 다크 10.3:1. 그래서 다크에서도 밝아지지 않고 어두운 단계를 유지합니다(밝히면 흰 글자가 깨집니다).
- ❌ **전경색으로 쓰지 마세요.** outline/basic tertiary 의 글자·보더는 테마 반전되는 `--color-text-secondary` · `--color-border-divider` 를 씁니다 — `neutral-solid` 를 글자에 쓰면 다크에서 어두운 배경 위 어두운 글자가 됩니다.

## Tone Surface — CSS 변수로 승격됨

위젯 분류/심각도 카드·배지의 배경입니다. `_tokens.ts`(`tokens.color.surface.*`)와 DESIGN.md 에는 있었지만 **CSS 변수가 없어서** 컴포넌트마다 `#ffe8e8` 같은 리터럴을 각자 복제하고 있었습니다. 이제 `--color-tone-surface-*` 로 참조하세요.

| 토큰 | 값 | Tone(구 이름) |
|---|---|---|
| `--color-tone-surface-critical` | `#ffe8e8` | high |
| `--color-tone-surface-warning` | `#fff7e0` | mid |
| `--color-tone-surface-info` | `#e8f4ff` | low |
| `--color-tone-surface-muted` | `#f1f2f4` | idle |
| `--color-tone-surface-neutral` | `#f1f2f4` | neutral |

위에 올리는 텍스트는 `--color-tone-text-*` (대비 검증된 짝).

### 다크 반전 — 표면과 라벨을 함께 뒤집는다

라이트 tone surface 는 "흰 카드 위 옅은 색 패널"이라, 값을 그대로 두면 다크에서 밝은 블록이 떠 눈을 때리고, **테마 적응 텍스트(`text-primary`)를 올리는 자리(Toast 본문·강조 행)에서는 밝은 배경 위 밝은 글자가 되어 읽을 수 없습니다.** 그래서 표면은 어둡게, 라벨은 같은 색조의 밝은 톤으로 짝을 맞춰 반전합니다.

| tone | 다크 표면 | 다크 라벨 | 라벨 대비 | 도트 대비 |
|---|---|---|---|---|
| critical | `#3A2226` | `#FFA8A3` | 7.92:1 | 3.46:1 |
| warning | `#33290F` | `#F5C860` | 9.09:1 | **7.67:1** |
| info | `#16233D` | `#9CC0FF` | 8.49:1 | 3.37:1 |
| muted / neutral | `#232932` | `#AEB5BF` | 7.08:1 | — |

`--color-status-*-soft` 4색도 같은 값 체계로 반전됩니다 (Toast 본문 대비 11.9~13.1:1). 라이트에서 warning 도트가 1.75:1 로 lint 경고를 받는 조합이 다크에서는 7.67:1 로 오히려 개선됩니다.

⚠️ **TS 토큰을 인라인 style 로 주입할 때는 `value`(hex) 가 아니라 `cssVar` 를 쓰세요.** `.dark` 는 CSS 변수만 재매핑하므로, hex 를 박으면 다크에서 뒤집히지 않습니다. `TONE_BG` / `TONE_TEXT` 는 이미 `cssVar` 기반입니다.

❌ **라벨 텍스트에 `TONE_DOT`(indicator) 을 쓰지 마세요** — indicator 는 도트·스트로크용 고채도 색이라 같은 톤 표면 위 텍스트로는 AA 미달입니다(warning 1.75:1). 도트는 `TONE_DOT`, 라벨은 `TONE_TEXT`.

## Elevation — 그림자도 토큰

층(surface)이 아니라 **떠 있는 높이**로 고릅니다. 컴포넌트가 `rgba(...)` 를 직접 적지 않도록 그림자에도 토큰이 있습니다.

| 토큰 | 값 | 자리 |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.25)` | 컨트롤 — switch/토글 knob |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,.12)` | 떠 있는 패널 — 드롭다운·토스트 |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,.2)` | 모달·다이얼로그 |
| `--shadow-xl` | `0 20px 60px rgba(0,0,0,.15)` | 플로팅 위젯 — 화면에서 가장 높이 뜬 표면 |
| `--shadow-panel-slide` | `-10px 0 30px rgba(0,0,0,.06)` | 우측에서 밀려나온 슬라이드 패널(방향 있는 그림자) |
| `--shadow-brand-glow` | `0 2px 8px rgba(41,108,242,.25)` | 선택된 컨트롤의 브랜드 강조 |
| `--shadow-ring-hairline` | `0 0 0 1px rgba(0,0,0,.04)` | 단독으로 쓰지 않음 — md/lg 에 겹치는 1px 경계 |

```tsx
// Toast — 패널 그림자 + hairline 경계
boxShadow: "var(--shadow-md), var(--shadow-ring-hairline)",
```

## 반투명 — 불투명 토큰과 언제 갈리나

값이 아니라 **아래 층이 배어나야 하는지**로 고릅니다. 배어나야 하면 알파 토큰, 층을 덮어야 하면 불투명 토큰입니다.

| 토큰 | 자리 |
|---|---|
| `--color-brand-blue-wash` (8%) | active/선택된 행·아이콘 버튼 배경 — 아래 표 줄무늬가 비쳐야 함 |
| `--color-brand-blue-border-tint` (25%) | 틴트 표면(AI 제안 카드)의 경계선 |
| `--gradient-ai-tint` | AI 제안/계획 카드의 blue→purple 틴트 배경 |
| `--color-brand-blue-tint` (불투명 `#eef4ff`) | 강조된 표 행 — 아래가 비치면 안 되는 자리 |
| `--color-brand-blue-bg` / `-bg-2` (불투명) | 배지·hover 표면 |
| `--color-overlay-loading` | 버튼 로딩 막 — 컬러 버튼 위에 얹히므로 라이트/다크 모두 흰 워시 |

**Stage 전용** — `--color-stage-backdrop` · `--color-stage-badge-bg` 는 발표·캡처용 16:9 무대의 캔버스 chrome입니다. 라이트박스처럼 무대를 띄우는 것이 목적이라 **테마와 무관하게 항상 어둡고**, `.dark` 오버라이드가 없습니다. ❌ 앱 표면에 쓰지 마세요.

**Backdrop scrim** — 모달류 배경 딤은 역할이 하나이므로 토큰도 하나입니다: `--color-overlay-scrim` (`rgba(0,0,0,0.5)`). Modal · DsReadOnlyNotice 가 이 하나를 공유합니다. 컴포넌트마다 0.4/0.5 를 따로 적던 것을 통일한 결과입니다.

## 반전 hover — 아이콘 버튼이 어두워지는 패턴

hover 시 표면이 뒤집히는 아이콘 버튼(첨부 `+` 버튼 등)은 `black`/`white` 고정색이 아니라 반전 짝을 씁니다.

```tsx
<button className="group-plus bg-card hover-bg-invert">
  <svg><line className="stroke-color-var-color-text-secondary group-hover-plus-stroke-invert" /></svg>
</button>
```

`.hover-bg-invert` → `--color-text-strong` (다크에서는 밝아짐) · `.group-hover-plus-stroke-invert` → `--color-text-inverse`. 라이트/다크 모두 자동으로 대비가 맞습니다. ❌ `hover-bg-black` + `stroke-white` 조합은 다크에서 검정 위 흰색이 되어 문맥과 어긋납니다.


## Chart — 색은 역할로 고른다 (series vs seq)

구 `--color-palette-{hex}` 36색을 대체했습니다. 그 팔레트는 **값이 이름**이라 "시리즈 색을 무엇으로 고르나"에 답이 없었고(36색 중 실제 참조 4색), `.dark` 오버라이드가 없어 차트 다크가 검증되지 않았습니다.

| 역할 | 토큰 | 무엇을 인코딩하나 |
|---|---|---|
| **series** (categorical) | `--color-chart-series-1..8` | **정체성** — 어느 계열인가 |
| **seq** (sequential) | `--color-chart-seq-1..4` | **크기** — 얼마나 큰가 |
| **neutral** | `--color-chart-neutral` | **판정 밖**: 대조군 · 평탄 계열. 상태색을 쓰는 차트에서 대상이 아닌 계열을 회색으로 낮춘다(ForecastLineChart) |

**규칙은 [`patterns.md`](./patterns.md) 가 정본이다** — 이 절은 토큰과 측정값만 둔다.

| 무엇을 정하나 | 정책 |
|---|---|
| 색이 무엇을 말하나 → 어느 토큰 묶음 · series 순서 · 순환 금지 · 엔티티를 따라가는 색 | §17 `chart-color-role` |
| 맞닿는 차트는 3계열까지 | §18 `chart-all-pairs-cap` |
| 이중 축 금지 | §19 `chart-no-dual-axis` |
| 팔레트를 바꿀 때 검증기 | §20 `chart-palette-validate` |
| 레거시(D-032 `--wds-chart-*`) 흡수 · 엔티티 슬롯 | §21 `chart-legacy-absorb` |
| 계열이 9개 이상일 때 · 100개 넘는 극단(묶어서 단순화) | §22 `chart-many-series` |
| 계열 색 ↔ Severity 색 변별 | §23 `chart-series-vs-severity` |

**seq** 는 한 색조의 단조 lightness 램프다. 라이트는 옅음→진함, **다크는 anchor 가 뒤집혀** 어두움→밝음이다(자동 반전이 아니라 고른 값).

**측정값은 여기에 적지 않는다** — 손으로 옮긴 수치는 값을 바꾸는 순간 낡는다(2026-10-14 재조정 때 옛 수치가 다섯 군데에 남아 있었다).

| 보고 싶은 것 | 정본 |
|---|---|
| 대역 · 채도 · 대비 · 인접 · 1~3 전체 · 엔티티 순서 · Severity 최악 쌍 (라이트 · 다크) | `pnpm lint:chart-palette` 출력 — `pnpm test` 가 매번 잰다 |
| 계열 슬롯별 Severity · info 와의 거리 (모든 쌍 · 정상시야 / protan / deutan) | `docs/tokens.json` 의 `distinctFrom` — MCP `get_tokens` 가 읽는다 |
| 값 · 다크 값 | `docs/tokens.json` 의 `value` · `dark` (런타임 `whatap-ds.css` 에서 생성) |

식은 dataviz `validate_palette.js` 와 같다(`scripts/lib/color-distance.mjs`). 이력: 첫 후보는 gold 밝기 대역 초과로, 엔티티 순서의 첫 배치는 dbc↔socket 이웃에서, 2026-10-14 재조정의 계산 후보는 hex 반올림 뒤 대역 · 채도 경계에서 FAIL 했다.

seq 램프는 단조 L · 인접 ΔL ≥ 0.06 · 옅은 끝 대비 ≥ 2:1 · 단일 색조 전부 통과. **팔레트를 바꿀 때는 눈으로 판단하지 말고 검증기를 다시 돌리세요.**

## Marketing Web Landing — 해외 URL 모니터링 랜딩 표면

마케팅 랜딩(www `/newer/products/url`) 한 화면이 쓰는 값입니다. 원래 `URL-product_Prototype` 앱의 `theme.css`·`index.css` 에만 있던 것을 2026-09-30 에 정본으로 올렸습니다. 랜딩은 테마를 `[data-theme]` 로 바꾸므로 앞의 네 개는 `.dark` 블록에 다크 값이 있습니다.

| 토큰 | 자리 |
|---|---|
| `--color-web-landing-fg-rgb` | 전경 RGB 트리플. `rgba(var(--color-web-landing-fg-rgb), 0.6)` 처럼 알파를 합성해 본문·보더·아이콘을 칠함 |
| `--color-web-landing-surface-alt` | 섹션 교대 배경 (마케팅 리듬. 제품의 `--color-bg` 와 다른 기준) |
| `--color-web-landing-input-bg` | 히어로 URL 입력칸 바탕 |
| `--color-web-landing-danger` | 입력 검증 실패 문구. 배지·도트 원색은 `--color-status-error` |
| `--shadow-web-landing-focus` | 그라데이션 입력칸 포커스 링 |
| `--color-web-landing-live-ring` · `-fade` | LIVE 점 펄스 키프레임의 시작·끝 |
| `--shadow-web-landing-cta-glow` · `-peak` · `-end` · `-still` | CTA 글로우 키프레임 세 단계와, 동작 줄이기 설정일 때의 정지 글로우 |

반투명 헤더 면은 새로 만들지 않고 `--color-header-translucent` 를 씁니다(값이 같았습니다). 입력칸 그라데이션 보더는 `--color-brand-blue` · `--color-whatap-purple` · `--color-brand-blue-soft` 를 씁니다.

❌ 제품 화면에 쓰지 마세요. 제품 전경은 `--color-text-*`, 바닥면은 `--color-bg` 입니다.

## 색상 — 토큰 외 hard-coded

토큰화되지 않은 색상은 거의 모두 chrome / 카드 외형에 한정됩니다. 자주 등장하는 것:

| 색 | 용도 |
|---|---|
| `#eaeaea` | AiCard 보더 (위젯 카드 공통) |
| `#f5f5f5` | AiUserBubble 배경 |
| `#222` | AiSectionHeading 텍스트 (제목) |
| `#4c4c4c` | AiBulletList 본문 텍스트 (sm) |
| `#757575` | AiCaption 텍스트, idle/neutral 도트 |
| `#3DA9FF` | MiniLineChart 기본 라인 색상 |

새 컴포넌트에서 이 회색들을 또 쓸 일이 자주 생긴다면 — `_tokens.ts`에 `NEUTRAL_*` 같은 토큰을 추가할 때입니다. 아직은 사용처가 적어 토큰화하지 않았습니다.

## 사용 예

```ts
import { TONE_BG, TONE_DOT, TONE_LABEL, WIDGET_FONT_KO, type Tone } from "@whatap/design-system/widget";

function Pill({ tone }: { tone: Tone }) {
  return (
    <span
      style={{ background: TONE_BG[tone], color: TONE_DOT[tone], fontFamily: WIDGET_FONT_KO }}
    >
      {TONE_LABEL[tone]}
    </span>
  );
}
```

대부분의 경우 직접 `TONE_*`를 import하기보다 [`primitives.md`](./primitives.md)의 `<AiToneBadge tone="high" />`나 `<AiSectionHeading tone="high">…</AiSectionHeading>`을 쓰면 됩니다. 토큰은 그 안에서 이미 적용됩니다.

## Do / Don't

✅ **Do**

- 새 색이 필요하면 `_tokens.ts`에 먼저 추가하고 컴포넌트에서 import
- 분류/상태 의미가 있다면 `Tone` 5단계 안에서 표현
- 한국어 화면이라도 숫자는 `WIDGET_FONT_NUM`

❌ **Don't**

- `style={{ color: "#E53935" }}` — 토큰의 우회
- `Tone`을 6단계 이상으로 확장 — 의미가 흐려져 디자인 결정이 어려워짐. 늘리기 전에 합칠 수 있는지 검토
- `TONE_BG['high']`를 도트로, `TONE_DOT['high']`를 배경으로 — 의미가 뒤바뀜

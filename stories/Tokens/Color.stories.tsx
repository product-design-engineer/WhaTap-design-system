import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens, type SemanticIntent } from "@whatap/design-system/widget";
import { useTokens, tokenLabel, type TokenEntry } from "../_useTokens";

/**
 * Color — WDS 컬러 토큰 전체 카탈로그.
 *
 * ## 값을 손으로 적지 않는다
 * 이 페이지는 `:root` 에 선언된 커스텀 프로퍼티를 **런타임에 열거**하고 계산값을 읽는다.
 * 예전에는 `<Swatch color="#296CF2" hex="#296CF2" />` 처럼 값을 적어 두었는데, 그러면
 * `tokens.css` 와 두 벌이 되어 (a) 새 토큰이 카탈로그에 누락되고 (b) 설명이 낡고
 * (c) 값이 어긋나도 아무도 모른다. 지금은 **토큰을 추가하면 여기 자동으로 나타나고**,
 * 값을 바꾸면 자동으로 따라오며, 다크로 전환하면 다크 값이 보인다.
 *
 * 카탈로그가 소유하는 것은 **값이 아니라 의미**(용도 설명)뿐이다.
 */
const meta: Meta = {
  title: "Tokens/Color",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**WDS Color 토큰 전체 카탈로그.**\n\n" +
          "값은 `:root` 에서 런타임에 읽습니다 — 토큰을 추가하면 자동으로 나타나고, " +
          "테마를 바꾸면 그 테마의 계산값이 보입니다. 카탈로그가 값을 복제하지 않으므로 드리프트가 불가능합니다.\n\n" +
          "- **Semantic** — 용도가 이름인 토큰. UI 컴포넌트는 이것만 참조합니다.\n" +
          "- **Global (palette)** — 값이 이름인 원시 팔레트. 차트 시리즈 전용.",
      },
    },
  },
};
export default meta;

/* ─── 공통 ────────────────────────────────────────── */

/** 토큰의 *의미* — CSS 에서 읽을 수 없는 유일한 정보. 카탈로그가 소유한다. */
const DESCRIPTIONS: Record<string, string> = {
  "--color-brand-blue": "주요 브랜드 컬러 — AI 버튼 · 링크 · 강조",
  "--color-brand-blue-deep": "hover/pressed 단계",
  "--color-brand-blue-soft": "MiniLineChart 기본 라인",
  "--color-brand-blue-bg": "브랜드 배경 — active 카드 강조",
  "--color-brand-blue-bg-2": "브랜드 배경 변형 — 입력 평상 보더",
  "--color-brand-blue-tint": "가장 옅은 틴트 — 강조된 표 행/셀",
  "--color-brand-blue-wash": "반투명 — active/선택 행·버튼 (아래 층이 배어남)",
  "--color-brand-blue-border-tint": "반투명 — 틴트 표면의 경계선",

  "--color-status-success": "정상 · 완료 — 도트 · LIVE 알약 · 체크",
  "--color-status-warning": "주의 · 경고",
  "--color-status-error": "오류 · 실패",
  "--color-status-warning-deep": "warning hover/pressed",
  "--color-status-error-deep": "error hover/pressed",
  "--color-status-success-soft": "옅은 표면 — 토스트 배경 · soft 칩/버튼",
  "--color-status-info-soft": "옅은 표면 — info 토스트",
  "--color-status-warning-soft": "옅은 표면 — 경고 배너 · soft 버튼",
  "--color-status-error-soft": "옅은 표면 — 에러 토스트 · soft 버튼",
  "--color-status-warning-soft-border": "warning-soft 표면의 경계선",

  "--color-bg": "페이지/앱 셸 배경 (바닥 층)",
  "--color-card": "떠 있는 표면 — 헤더·사이드바·카드·입력·드롭다운",
  "--color-surface-50": "가장 옅은 보조 표면 — hover 배경 · muted 셀",
  "--color-surface-100": "중간 보조 표면 — active row · 트랙 · 선택 강조",
  "--color-surface-200": "가장 진한 보조 표면 — switch off 트랙 · 무채색 채움",

  "--color-text-primary": "본문 default · 헤딩 · 강조",
  "--color-text-secondary": "보조 본문 · dim 텍스트",
  "--color-text-tertiary": "라벨 · 메타 · placeholder",
  "--color-text-disabled": "비활성 상태 텍스트",
  "--color-text-inverse": "반전 전경 — text-strong 을 배경으로 깐 표면 위",
  "--color-text-strong": "legacy alias",
  "--color-text-body": "legacy alias",
  "--color-text-muted": "legacy alias",
  "--color-text-subtle": "legacy alias",

  "--color-border-default": "위젯·카드 표준 보더",
  "--color-border-soft": "더 옅은 구분선 — 차트 그리드",
  "--color-border-strong": "강조 보더 — PageHeader 하단 · 컨트롤",
  "--color-border-divider": "더 진한 구분선 — LiveTimerCompact 보더",

  "--color-indicator-critical": "위험 도트·스트로크 (텍스트로 쓰지 말 것)",
  "--color-indicator-warning": "경고 도트·스트로크 (텍스트로 쓰지 말 것)",

  "--color-tone-surface-critical": "위젯 분류 배지/카드 배경 — critical",
  "--color-tone-surface-warning": "위젯 분류 배지/카드 배경 — warning",
  "--color-tone-surface-info": "위젯 분류 배지/카드 배경 — info",
  "--color-tone-surface-muted": "위젯 분류 배지/카드 배경 — muted",
  "--color-tone-surface-neutral": "위젯 분류 배지/카드 배경 — neutral",

  "--color-tone-text-critical": "tone-surface 위 라벨 — 대비 검증된 짝",
  "--color-tone-text-warning": "tone-surface 위 라벨 — 대비 검증된 짝",
  "--color-tone-text-info": "tone-surface 위 라벨 — 대비 검증된 짝",
  "--color-tone-text-success": "status-success-soft 위 라벨",
  "--color-tone-text-muted": "tone-surface 위 라벨 — 대비 검증된 짝",
  "--color-tone-text-neutral": "tone-surface 위 라벨 — 대비 검증된 짝",

  "--color-whatap-blue": "AI 그라데이션 시작",
  "--color-whatap-purple": "AI 그라데이션 끝 — pinwheel 강조",
  "--color-whatap-purple-deep": "AI 그라데이션 deep variant",

  "--color-gray-mid": "text 4단계 외 UI 회색",
  "--color-gray-soft": "text 4단계 외 UI 회색",
  "--color-gray-pale": "text 4단계 외 UI 회색",

  "--color-overlay-scrim": "모달류 backdrop 딤 (역할이 하나 → 토큰도 하나)",
  "--color-overlay-loading": "컨트롤 위 로딩 막 — 컬러 버튼 위 흰 워시",
  "--color-stage-backdrop": "Stage 무대 캔버스 (테마 무관 고정 어두움)",
  "--color-stage-badge-bg": "Stage 배지 배경 (테마 무관)",

  "--color-white": "테마 무관 고정 흰색 — 컬러 위 전경 전용",
  "--color-black": "테마 무관 고정 검정 — 팔레트 색이 아님",
};

/** 값이 투명/반투명일 수 있으므로 체커보드 위에 얹어 알파를 드러낸다. */
const CHECKER =
  "repeating-conic-gradient(var(--color-surface-200) 0% 25%, var(--color-card) 0% 50%) 50% / 12px 12px";

function Swatch({ entry }: { entry: TokenEntry }) {
  const described = DESCRIPTIONS[entry.name];
  return (
    <div
      className="flex items-stretch gap-3 p-3 border border-default rounded-lg bg-card"
      style={{ fontFamily: "var(--font-family-korean)" }}
    >
      <div className="rounded-md flex-shrink-0" style={{ width: 80, height: 56, background: CHECKER }}>
        <div
          className="rounded-md w-full h-full"
          style={{ background: `var(${entry.name})`, border: "1px dashed var(--color-border-strong)" }}
        />
      </div>
      <div className="flex flex-col justify-center gap-0_5 min-w-0">
        <div className="text-base font-bold text-primary tracking-default leading-none">
          {tokenLabel(entry.name)}
        </div>
        <div
          className="text-chart text-tertiary leading-none"
          style={{ fontFamily: "var(--font-family-numeric)" }}
        >
          {entry.value}
        </div>
        {described ? (
          <div className="text-sm text-secondary leading-snug">{described}</div>
        ) : (
          // 설명은 CSS 에서 읽을 수 없다 — 새 토큰이면 여기 표시되어 문서화 누락이 드러난다.
          <div className="text-sm text-disabled leading-snug">설명 미기술 — DESCRIPTIONS 에 추가</div>
        )}
      </div>
    </div>
  );
}

function SwatchGrid({ children, minColumn = 320 }: { children: React.ReactNode; minColumn?: number }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minColumn}px, 1fr))` }}
    >
      {children}
    </div>
  );
}

/** prefix 로 CSS 에서 토큰을 긁어 그리는 그룹. 값을 인자로 받지 않는 것이 요점. */
function TokenGroup({
  prefix,
  exclude,
  minColumn,
}: {
  prefix: string;
  exclude?: string[];
  minColumn?: number;
}) {
  const entries = useTokens(prefix, exclude ?? NONE);
  if (!entries.length) {
    return (
      <div className="text-md text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>
        `{prefix}*` 토큰이 없습니다.
      </div>
    );
  }
  return (
    <SwatchGrid minColumn={minColumn}>
      {entries.map((e) => (
        <Swatch key={e.name} entry={e} />
      ))}
    </SwatchGrid>
  );
}

/* 모듈 상수 — useTokens deps 의 identity 안정용 (매 렌더 새 배열 생성 방지). */
const NONE: string[] = [];
const BRAND_EXCLUDE = ["palette"];
const TEXT_EXCLUDE = ["--color-text-strong", "--color-text-body", "--color-text-muted", "--color-text-subtle"];

const INTENTS: SemanticIntent[] = ["critical", "warning", "info", "muted", "neutral"];

/* ─── Semantic ─────────────────────────────────────── */

/** **`--color-brand-*`** — 브랜드 파랑 계열 (불투명 단계 + 반투명 워시). */
export const Brand: StoryObj = { render: () => <TokenGroup prefix="--color-brand-" exclude={BRAND_EXCLUDE} /> };

/** **`--color-status-*`** — 운영 상태 3색 × 원색/deep/soft 3단. */
export const Status: StoryObj = { render: () => <TokenGroup prefix="--color-status-" /> };

/** **`--color-text-*`** — 텍스트 위계 4단계 + 반전 전경. (legacy alias 제외) */
export const TextHierarchy: StoryObj = {
  render: () => <TokenGroup prefix="--color-text-" exclude={TEXT_EXCLUDE} />,
};

/** **`--color-border-*`** — 라인/보더 4단계. */
export const Border: StoryObj = { render: () => <TokenGroup prefix="--color-border-" /> };

/** **`--color-surface-*`** — 보조 표면 3단계. base surface(bg/card)는 Surface 스토리 참조. */
export const SurfaceGeneric: StoryObj = { render: () => <TokenGroup prefix="--color-surface-" /> };

/** **`--color-indicator-*`** — 도트·스트로크 전용 고채도. ❌ 텍스트로 쓰지 말 것. */
export const Indicator: StoryObj = { render: () => <TokenGroup prefix="--color-indicator-" /> };

/** **`--color-tone-*`** — 위젯 분류 표면(surface) + 그 위 라벨(text) 짝. */
export const Tone: StoryObj = { render: () => <TokenGroup prefix="--color-tone-" /> };

/** **`--color-overlay-*` · `--color-stage-*`** — 덮개와 무대 chrome. */
export const OverlayAndStage: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <TokenGroup prefix="--color-overlay-" />
      <TokenGroup prefix="--color-stage-" />
    </div>
  ),
};

/** **`--color-gray-*`** — text 4단계 외 UI 회색. */
export const ExtendedGray: StoryObj = { render: () => <TokenGroup prefix="--color-gray-" /> };

/* ─── Base surface (2단 레이어) ─────────────────────── */

/**
 * **`--color-bg` / `--color-card`** — 값이 아니라 **층(layer)** 을 뜻하는 토큰.
 * 페이지는 한 단계 뒤로(회색), 콘텐츠는 그 위에 카드로 쌓인다(흰색).
 * ⚠️ 두 토큰을 같은 값으로 만들면 카드가 보더만 남아 층이 사라진다.
 */
export const Surface: StoryObj = {
  render: () => {
    const base = useTokens("--color-bg", NONE);
    const card = useTokens("--color-card", NONE);
    return (
      <div className="flex flex-col gap-6">
        <SwatchGrid>
          {[...base, ...card].map((e) => (
            <Swatch key={e.name} entry={e} />
          ))}
        </SwatchGrid>
        {/* 층이 실제로 어떻게 쌓이는지 */}
        <div className="rounded-lg p-4 flex flex-col gap-3" style={{ background: "var(--color-bg)" }}>
          <div
            className="text-sm text-tertiary"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            page (`--color-bg`)
          </div>
          <div className="bg-card border border-default rounded-8px p-4">
            <div className="text-md text-primary" style={{ fontFamily: "var(--font-family-korean)" }}>
              card (`--color-card`) — 의미 단위는 이 위에 얹는다
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/* ─── Tone pairing (의미 조합) ──────────────────────── */

/**
 * **Surface + Indicator + ToneText pairing** — 한 톤의 3역할이 실제로 어떻게 보이는지.
 *
 * 도트는 `indicator`(고채도), **라벨 텍스트는 `toneText`** 로 갈라 씁니다. indicator 를
 * 텍스트로 쓰면 같은 톤 표면 위에서 WCAG AA 4.5:1 에 못 미칩니다(warning 은 1.75:1).
 */
export const TonePairing: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-2xl">
      {INTENTS.map((intent) => {
        const surface = tokens.color.surface[intent];
        const indicator = tokens.color.indicator[intent];
        const toneText = tokens.color.toneText[intent];
        const label = tokens.label[intent];
        return (
          // cssVar 로 주입 — value(hex) 를 쓰면 다크에서 뒤집히지 않는다.
          <div
            key={intent}
            className="flex items-center gap-4 p-3 border border-default rounded-lg"
            style={{ background: surface.cssVar, fontFamily: "var(--font-family-korean)" }}
          >
            <div className="flex items-center gap-1_5 px-2 py-1 rounded-xl bg-card">
              <div className="rounded-full" style={{ width: 6, height: 6, background: indicator.cssVar }} />
              <span className="text-xs leading-none" style={{ color: toneText.cssVar, fontWeight: 500 }}>
                {label.value || `(${intent})`}
              </span>
            </div>
            <div
              className="flex-1 min-w-0 flex flex-col gap-0_5"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              <div className="text-sm text-primary font-bold">{intent}</div>
              <div className="text-chart text-tertiary">
                surface {surface.value} · indicator {indicator.value} · toneText {toneText.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ),
};

/* ─── Gradient ─────────────────────────────────────── */

/** **`--color-whatap-*`** — AI 심볼·위젯 그라데이션 stops + 실제 적용 미리보기. */
export const WhaTapGradient: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-3xl">
      <TokenGroup prefix="--color-whatap-" />
      <div className="text-md text-secondary mt-2" style={{ fontFamily: "var(--font-family-korean)" }}>
        그라데이션 미리보기 — 토큰 stops 로만 조립 (hex 를 다시 적지 않는다)
      </div>
      <div
        className="rounded-lg h-12"
        style={{
          background:
            "linear-gradient(110.34deg, var(--color-whatap-blue), var(--color-whatap-purple), var(--color-whatap-blue), var(--color-whatap-purple), var(--color-whatap-blue)) 0 0 / 300% 100%",
        }}
      />
      <div className="flex items-center gap-3">
        <div
          className="rounded-full"
          style={{
            width: 48,
            height: 48,
            background:
              "conic-gradient(from 90deg, var(--color-whatap-blue), var(--color-whatap-purple), var(--color-whatap-blue))",
          }}
        />
        <div className="text-md text-secondary" style={{ fontFamily: "var(--font-family-korean)" }}>
          DashboardBuildingProgress 의 spinner
        </div>
      </div>
    </div>
  ),
};

/* ─── Chart ────────────────────────────────────────── */

const HUE_NAME = ["navy", "amber", "teal", "gold", "magenta", "green", "violet", "raspberry"];

/**
 * **`--color-chart-series-1..8`** — 계열 **정체성**(categorical). 구 `--color-palette-{hex}` 36색을 대체.
 *
 * **1번부터 순서대로 배정하고 순환하지 않는다.** 순서 자체가 CVD 안전 장치이므로 바꾸지 않는다.
 * 9번째 계열은 새 색을 만드는 게 아니라 "기타" 로 접거나 small multiples 로 쪼갠다.
 * 색은 **엔티티를 따라간다** — 필터로 계열 수가 바뀌어도 남은 계열의 색은 그대로 유지한다.
 *
 * ⚠️ **all-pairs 상한 3슬롯.** scatter · bubble · choropleth · small-multiples 처럼 임의의 두
 * 마크가 맞닿을 수 있는 형태는 3계열까지만 안전하다. 4번째(gold)는 2번(amber)과 구별되지 않는다 —
 * 팔레트로 해결되지 않으므로 facet 으로 쪼갠다 (patterns.md §18).
 *
 * **Severity 와 구별된다.** 모든 슬롯이 Severity 색과 info 에서 정상시야 ΔE 15 이상 떨어져 있다
 * (§23). 그래서 2번은 주황이 아니라 amber, 8번은 빨강이 아니라 raspberry 다 — 밝은 주황 · 빨강 ·
 * 초록은 Severity 몫이다.
 *
 * 측정값은 여기에 적지 않는다 — `pnpm lint:chart-palette` 출력과 `docs/tokens.json` 의
 * `distinctFrom` 이 정본이다.
 */
export const ChartSeries: StoryObj = {
  render: () => {
    const series = useTokens("--color-chart-series-", NONE);
    return (
      <div className="flex flex-col gap-3">
        <div
          className="text-md text-secondary max-w-2xl"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          계열 정체성 <strong>{series.length}슬롯</strong> — 고정 순서. 다크는 같은 색조를 다크
          표면용으로 <strong>다시 스텝</strong>한 것(자동 반전 아님).
        </div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {series.map((e, i) => (
            <div
              key={e.name}
              className="flex flex-col items-stretch gap-1 p-2 border border-default rounded-md bg-card"
            >
              {/* 선 + 막대 — 실제 마크로 보여야 판단이 된다 */}
              <div className="flex items-end gap-1 h-12">
                <div className="flex-1 rounded-2px" style={{ background: `var(${e.name})`, height: "100%" }} />
                <div className="flex-1 rounded-2px" style={{ background: `var(${e.name})`, height: "60%" }} />
                <div className="flex-1 rounded-2px" style={{ background: `var(${e.name})`, height: "35%" }} />
              </div>
              <div
                className="text-chart text-tertiary leading-none truncate"
                style={{ fontFamily: "var(--font-family-numeric)" }}
              >
                series-{i + 1} · {HUE_NAME[i] ?? ""}
              </div>
              <div
                className="text-chart text-tertiary leading-none"
                style={{ fontFamily: "var(--font-family-numeric)" }}
              >
                {e.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * **`--color-chart-seq-1..4`** — **크기/강도**(sequential). 한 색조의 단조 lightness 램프.
 *
 * 라이트는 옅음→진함, **다크는 anchor 가 뒤집혀** 어두움→밝음이다(자동 반전이 아니라 선택된 값).
 * `UsageChart` 의 시간별 사용률 막대가 이 램프를 쓴다.
 *
 * ❌ 계열 구분에 seq 를 쓰지 말 것 — 순서가 없는 항목에 순서를 부여해 잘못 읽힌다.
 * 검증: 단조 L · 인접 ΔL ≥ 0.06 · 옅은 끝 대비 ≥ 2:1 · 단일 색조 전부 PASS.
 */
export const ChartSequential: StoryObj = {
  render: () => {
    const seq = useTokens("--color-chart-seq-", NONE);
    return (
      <div className="flex flex-col gap-4">
        <div
          className="text-md text-secondary max-w-2xl"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          크기 램프 <strong>{seq.length}단</strong> — 낮음 → 높음.
        </div>
        {/* 램프 전체를 이어 붙여 단조성이 눈에 보이게 */}
        <div className="flex rounded-md overflow-hidden border border-default" style={{ height: 40 }}>
          {seq.map((e) => (
            <div key={e.name} className="flex-1" style={{ background: `var(${e.name})` }} />
          ))}
        </div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {seq.map((e, i) => (
            <div
              key={e.name}
              className="flex flex-col items-stretch gap-1 p-2 border border-default rounded-md bg-card"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              <div className="rounded h-10" style={{ background: `var(${e.name})` }} />
              <div className="text-chart text-tertiary leading-none">seq-{i + 1}</div>
              <div className="text-chart text-tertiary leading-none">{e.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

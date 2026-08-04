/**
 * WhaTap AI Prototype — Widget Design Tokens.
 *
 * AI 위젯/메시지 카드/차트에서 의미를 전달하는 색상·라벨·폰트의 단일 출처.
 *
 * ## 구조
 *
 * ```
 * tokens
 * ├─ color
 * │  ├─ surface.<intent>   ─ 카드/패널 배경 (낮은 채도)
 * │  └─ indicator.<intent> ─ 도트/스트로크/강조 (높은 채도)
 * ├─ label.<intent>        ─ 분류 배지의 기본 한국어 라벨
 * └─ font.family.<role>    ─ 폰트 패밀리 stack
 * ```
 *
 * 각 토큰은 `{ value, description }` 형태 — `value` 는 실제 적용값, `description` 은
 * AI agent / 사람이 이해 가능한 사용 의도. JSDoc 으로 IDE hover 에서도 동일 정보 노출.
 *
 * ## Semantic intent
 *
 * | intent     | 의미                              | 색 계열   |
 * |------------|-----------------------------------|-----------|
 * | `critical` | 시급한 문제 · 실패 · 이상치       | 빨강      |
 * | `warning`  | 주의 · 경계 · 주변값              | 노랑/주황 |
 * | `info`     | 안내 · 정상 · 정보 전달           | 파랑      |
 * | `muted`    | 비활성 · idle · 중립 컨테이너      | 회색      |
 * | `neutral`  | 강조 없는 기본 (placeholder 격)    | 회색      |
 *
 * ## Backward compat
 *
 * 구 이름 (`Tone="high"/"mid"/"low"/"idle"/"neutral"`, `TONE_BG`/`TONE_DOT`/`TONE_LABEL`,
 * `WIDGET_FONT_KO`/`WIDGET_FONT_NUM`) 은 @deprecated 로 유지 — 기존 callsite 무중단.
 * 신규 코드는 `tokens.color.surface.critical.value` 같은 의미 경로 사용 권장.
 *
 * ## 사용 규칙
 *
 * 1. 인라인 색상 리터럴 (#xxx, rgba(...)) 컴포넌트 안에 직접 쓰지 말 것 — 토큰만 사용.
 * 2. 새 의미 색이 필요하면 토큰을 먼저 추가하고 컴포넌트가 그 토큰을 참조하도록.
 * 3. `description` 필드는 사용 시 변경 금지 — 변경 시 카탈로그 (`packages/design-system/docs/tokens.md`) 동시 업데이트.
 */

/* ─── Types ─────────────────────────────────────────── */

/**
 * SemanticIntent — 색상이 전달하는 의미. 신규 코드 권장.
 *
 * 매핑: critical=시급/위험, warning=주의, info=안내/정상, muted=비활성, neutral=기본
 */
export type SemanticIntent = "critical" | "warning" | "info" | "muted" | "neutral";

/**
 * LegacyTone — `Tone` 타입의 구 이름. 새로 작성하는 코드에서는 SemanticIntent 사용 권장.
 *
 * 매핑: high→critical, mid→warning, low→info, idle→muted, neutral→neutral
 */
export type LegacyTone = "high" | "mid" | "low" | "idle";

/**
 * Tone — 위젯 컴포넌트의 톤 prop 타입. SemanticIntent 와 LegacyTone 모두 수용.
 *
 * 신규 호출처는 의미 명시되는 이름 (`critical`/`warning`/`info`/`muted`/`neutral`) 권장.
 * 기존 callsite (high/mid/low/idle) 은 그대로 동작 — 점진 마이그레이션.
 */
export type Tone = SemanticIntent | LegacyTone;

/**
 * Token<V> — 디자인 토큰 단위.
 *
 * - `value`: 실제 적용값 (CSS color, font-family stack 등)
 * - `description`: AI/사람이 이해 가능한 한 줄 사용 의도
 * - `cssVar`: 같은 토큰의 CSS 변수 참조 (있는 경우)
 *
 * ## `value` vs `cssVar` — 언제 무엇을
 * `value` 는 **라이트 테마의 실측 hex** 다. 카탈로그 표시·대비 계산·문서용.
 * 런타임에 `style={{ background: ... }}` 로 주입할 때 `value` 를 쓰면 hex 가 그대로
 * 박혀 **다크에서 뒤집히지 않는다** — 그 자리에는 `cssVar` 를 쓴다.
 * (`.dark` 가 CSS 변수만 재매핑하는 구조이므로, 변수를 통과해야 테마가 따라온다.)
 */
export interface Token<V = string> {
  readonly value: V;
  readonly description: string;
  readonly cssVar?: string;
}

/* ─── Tokens ────────────────────────────────────────── */

/**
 * 디자인 토큰 단일 출처. 모든 위젯·카드·차트가 이 객체를 참조해야 합니다.
 */
export const tokens = {
  color: {
    /** 카드/패널의 배경 — 낮은 채도, 콘텐츠 가독성 보장. */
    surface: {
      critical: {
        value: "#ffe8e8",
        cssVar: "var(--color-tone-surface-critical)",
        description: "Critical 톤 카드 배경 — 시급한 문제·실패·이상치 메시지 컨테이너.",
      },
      warning: {
        value: "#fff7e0",
        cssVar: "var(--color-tone-surface-warning)",
        description: "Warning 톤 카드 배경 — 주의·경계가 필요한 메시지.",
      },
      info: {
        value: "#e8f4ff",
        cssVar: "var(--color-tone-surface-info)",
        description: "Info 톤 카드 배경 — 안내·정상·정보 전달 메시지.",
      },
      muted: {
        value: "#f1f2f4",
        cssVar: "var(--color-tone-surface-muted)",
        description: "Muted 톤 카드 배경 — 비활성·idle 컨테이너.",
      },
      neutral: {
        value: "#f1f2f4",
        cssVar: "var(--color-tone-surface-neutral)",
        description: "Neutral 톤 카드 배경 — 강조 없는 기본 placeholder.",
      },
    },
    /** 도트, 스트로크, 강조 — 높은 채도, 시각 신호. */
    indicator: {
      critical: {
        value: "#E53935",
        description: "Critical 톤 indicator — 위험·이상치 도트/스트로크/차트 강조선.",
      },
      warning: {
        value: "#F0B400",
        description: "Warning 톤 indicator — 경고 도트/스트로크/차트 강조선.",
      },
      info: {
        value: "#296CF2",
        description: "Info 톤 indicator — 정보·안내 도트/스트로크/차트 강조선.",
      },
      muted: {
        value: "#757575",
        description: "Muted 톤 indicator — 비활성 도트/스트로크.",
      },
      neutral: {
        value: "#757575",
        description: "Neutral 톤 indicator — 기본 회색 도트/스트로크.",
      },
    },
    /**
     * tone.surface 위에 올리는 라벨 텍스트 색.
     *
     * indicator 는 도트·스트로크용 고채도 색이라 같은 톤 surface 위 텍스트로 쓰면
     * WCAG AA 4.5:1 에 못 미친다 (warning 은 1.75:1). 배지·칩 라벨은 이 토큰을 쓴다.
     * design-lint 의 contrast-ratio 룰이 error 로 검사한다.
     */
    toneText: {
      critical: {
        value: "#B5302A",
        cssVar: "var(--color-tone-text-critical)",
        description: "Critical 톤 라벨 텍스트 — tone.surface.critical 대비 5.25:1.",
      },
      warning: {
        value: "#8A6200",
        cssVar: "var(--color-tone-text-warning)",
        description: "Warning 톤 라벨 텍스트 — tone.surface.warning 대비 5.13:1.",
      },
      info: {
        value: "#1B5CD9",
        cssVar: "var(--color-tone-text-info)",
        description: "Info 톤 라벨 텍스트 — tone.surface.info 대비 5.26:1. brand-blue-deep 과 동일값.",
      },
      muted: {
        value: "#6E6E6E",
        cssVar: "var(--color-tone-text-muted)",
        description: "Muted 톤 라벨 텍스트 — tone.surface.muted 대비 4.55:1.",
      },
      neutral: {
        value: "#6E6E6E",
        cssVar: "var(--color-tone-text-neutral)",
        description: "Neutral 톤 라벨 텍스트 — tone.surface.neutral 대비 4.55:1.",
      },
    },
    /**
     * 텍스트 색 hierarchy — 시각적 위계 4 단계.
     *
     * 본문 텍스트가 가장 흔하므로 primary 가 다른 색보다 압도적으로 많이 쓰임 (154 회).
     * 인라인 hex 리터럴 대신 이 토큰을 참조.
     */
    text: {
      primary: {
        value: "#222",
        description: "본문 default · 헤딩 · 강조 텍스트. 가장 흔한 텍스트 색.",
      },
      secondary: {
        value: "#4c4c4c",
        description: "보조 본문 · dim 텍스트 · sub-section 본문.",
      },
      tertiary: {
        value: "#757575",
        description: "라벨 · 메타 · placeholder · 캡션 부속 정보.",
      },
      disabled: {
        value: "#adadad",
        description: "비활성 상태 텍스트 · 사용 불가 항목 표시.",
      },
      inverse: {
        value: "#FFFFFF",
        description:
          "반전 전경 — text-strong 을 배경으로 깐 표면(툴팁 등) 위의 텍스트·아이콘. 이 용도에 --color-bg(페이지 배경)를 쓰지 말 것.",
      },
    },
  },
  /** 분류 배지의 기본 한국어 라벨. AiToneBadge 등에서 톤 → 텍스트 매핑. */
  label: {
    critical: {
      value: "고활용",
      description: "Critical 톤 배지의 기본 라벨 — GPU/리소스 분석 시나리오의 고활용군.",
    },
    warning: {
      value: "활용",
      description: "Warning 톤 배지의 기본 라벨 — 보통 수준의 활용군.",
    },
    info: {
      value: "저활용",
      description: "Info 톤 배지의 기본 라벨 — 저활용군 / 최적화 후보.",
    },
    muted: {
      value: "완전 유휴",
      description: "Muted 톤 배지의 기본 라벨 — 완전히 사용되지 않는 자원.",
    },
    neutral: {
      value: "",
      description: "Neutral 톤 — 기본값으로 라벨 표기 없음.",
    },
  },
  font: {
    /** 폰트 패밀리 stack — 본문/숫자 역할 분리. */
    family: {
      korean: {
        value: "'Noto Sans', 'Noto Sans KR', sans-serif",
        description:
          "한국어 본문 — 위젯 카드 내 메시지·라벨·제목. Latin glyph 도 Noto Sans 가 처리.",
      },
      numeric: {
        value: "Roboto, 'Noto Sans', sans-serif",
        description:
          "숫자·메트릭 — 차트 라벨, 테이블의 numeric 컬럼, 통계 강조 숫자에 사용.",
      },
    },
    /**
     * Type Scale — Hybrid (Dense 1px 정밀 + Display 2배수 인접).
     *
     * Dense (9~14px) — 정보 밀도 보존, 1px 단위. dashboard UI 핵심 영역.
     * Display (16~48px) — 강조·페이지 레벨, 4~16px 간격.
     */
    size: {
      chart: {
        value: "9px",
        description: "SVG 차트 텍스트 (axis label · peak 라벨). 단위 명시 필수.",
      },
      xs: {
        value: "10px",
        description: "DataTable compact 헤더 · AiToneBadge 텍스트 · dim 메타.",
      },
      sm: {
        value: "11px",
        description: "AiCaption (uppercase) · compact 테이블 셀 · sidebar 보조.",
      },
      base: {
        value: "12px",
        description: "본문 default — AiBulletList sm · step label · 옵션바 본문. 가장 흔한 본문 사이즈.",
      },
      md: {
        value: "13px",
        description: "AiSectionHeading · DataTable default · Toast · AiUserBubble · AiBulletList md.",
      },
      lg: {
        value: "14px",
        description: "AiCard 큰 헤더 · LiveTimerCompact digit · DashboardBuildingProgress title.",
      },
      xl: {
        value: "16px",
        description: "Sub-display · marketing 타이틀 보조 사이즈.",
      },
      "2xl": {
        value: "20px",
        description: "PageHeader title — 사실상 페이지 레벨 표준 사이즈.",
      },
      "3xl": {
        value: "24px",
        description: "Stage 슬라이드 헤딩 · marketing 데모 화면 강조 텍스트.",
      },
      "4xl": {
        value: "32px",
        description: "Stage 대형 메시지 · 풀스크린 디스플레이 강조.",
      },
      "5xl": {
        value: "48px",
        description: "Stage 풀스크린 hero · marketing 최대 강조 (rare).",
      },
    },
    /**
     * Font Weight — 3 단계. 한국어 본문 가독성 균형.
     */
    weight: {
      regular: {
        value: 400,
        description: "본문 default — 모든 일반 텍스트. 109+ callsite.",
      },
      medium: {
        value: 500,
        description: "강조 — PageHeader title · LIVE 라벨 · AiToneBadge 텍스트.",
      },
      bold: {
        value: 700,
        description: "강한 강조 — AiCaption · AiSectionHeading · metric 숫자.",
      },
    },
    /**
     * Line-Height — 6 단계. leading-none 이 압도적으로 흔함 (단일 라인 카드/배지).
     */
    lineHeight: {
      none: {
        value: 1.0,
        description: "leading-none — 단일 라인 (배지 · 헤딩 · 카드 헤더). 175+ callsite, 가장 흔함.",
      },
      tight: {
        value: 1.2,
        description: "매우 압축된 본문 (드문 사용).",
      },
      snug: {
        value: 1.3,
        description: "compact 테이블 row · 옵션바 본문.",
      },
      normal: {
        value: 1.4,
        description: "default 본문 · 섹션 헤딩 본문. 두 번째로 흔한 라인 하이트.",
      },
      relaxed: {
        value: 1.5,
        description: "AiBulletList small · sub-section 본문.",
      },
      loose: {
        value: 1.6,
        description: "긴 본문 단락 (drop-down 안내 · 도움말 텍스트).",
      },
    },
    /**
     * Tracking (Letter-Spacing) — 4 단계.
     *
     * Note: 한국어 디자인 시스템에서 `-0.1px` 가 default 인 이유는 Noto Sans KR 의
     * letter-spacing 이 살짝 넓어 한국어가 분리되어 보이는 현상을 보정하기 위함.
     */
    tracking: {
      display: {
        value: "-0.3px",
        description: "대형 페이지 타이틀 (20px+) 의 시각 균형 보정.",
      },
      metric: {
        value: "-0.2px",
        description: "Roboto numeric digit 의 가독성 보정 — LiveTimer 등.",
      },
      default: {
        value: "-0.1px",
        description: "한국어 본문 사실상 표준 — 159+ callsite. 새 본문 텍스트의 기본.",
      },
      caps: {
        value: "0.3px",
        description: "uppercase caption (REASONING / COST ANALYSIS 등) — 가시성 보정.",
      },
    },
    /**
     * Named Typography Patterns — 의도 기반 lookup.
     *
     * 자주 사용되는 조합을 named pattern 으로 토큰화. AI agent 가 "section heading 만들어줘"
     * 했을 때 정확한 조합을 매칭. 각 pattern 은 family/size/weight/lineHeight/tracking 의 조합.
     */
    pattern: {
      pageTitle: {
        value: { family: "korean", size: "2xl", weight: "medium", lineHeight: "none", tracking: "display" },
        description: "PageHeader 페이지 타이틀 — 20px Medium / -0.3px / leading-none / korean.",
      },
      sectionHeading: {
        value: { family: "korean", size: "md", weight: "bold", lineHeight: "normal", tracking: "default" },
        description: "AiSectionHeading 카드 헤딩 — 13px Bold / -0.1px / 1.4 / korean.",
      },
      caption: {
        value: { family: "korean", size: "sm", weight: "bold", lineHeight: "none", tracking: "caps", transform: "uppercase" },
        description: "AiCaption sub-section 라벨 — 11px Bold uppercase / 0.3px / leading-none / korean.",
      },
      body: {
        value: { family: "korean", size: "md", weight: "regular", lineHeight: "normal", tracking: "default" },
        description: "default 본문 — 13px Regular / -0.1px / 1.4 / korean. AiBulletList md · AiUserBubble.",
      },
      bodySmall: {
        value: { family: "korean", size: "base", weight: "regular", lineHeight: "relaxed", tracking: "default" },
        description: "본문 작은 사이즈 — 12px Regular / -0.1px / 1.5 / korean. AiBulletList sm · dim 본문.",
      },
      label: {
        value: { family: "korean", size: "xs", weight: "medium", lineHeight: "none", tracking: "default" },
        description: "작은 라벨 — 10px Medium / -0.1px / leading-none / korean. AiToneBadge text.",
      },
      metric: {
        value: { family: "numeric", size: "lg", weight: "bold", lineHeight: "none", tracking: "metric" },
        description: "강조 metric 숫자 — 14px Bold / -0.2px / leading-none / numeric. LiveTimer · AiMigPlan total.",
      },
      chartLabel: {
        value: { family: "numeric", size: "chart", weight: "regular", lineHeight: "none", tracking: "default" },
        description: "SVG 차트 axis/peak 라벨 — 9px Regular / leading-none / numeric.",
      },
      tableHeaderCompact: {
        value: { family: "korean", size: "xs", weight: "bold", lineHeight: "none", tracking: "default" },
        description: "DataTable compact 헤더 — 10px Bold / -0.1px / leading-none / korean.",
      },
      tableCellCompact: {
        value: { family: "korean", size: "sm", weight: "regular", lineHeight: "snug", tracking: "default" },
        description: "DataTable compact 셀 (numeric 컬럼은 family numeric) — 11px Regular / -0.1px / 1.3 / korean.",
      },
    },
  },
} as const;

/* ─── Backward compat aliases (deprecated) ──────────── */
/* 기존 callsite 보호용. 단계적으로 새 경로 (tokens.*) 로 마이그레이션. */

/**
 * @deprecated `tokens.color.surface[intent].value` 사용 권장.
 * 옛 키 (high/mid/low/idle) 와 새 키 (critical/warning/info/muted/neutral) 모두 수용.
 */
export const TONE_BG: Record<Tone, string> = {
  // 구 이름 → 새 값
  high: tokens.color.surface.critical.cssVar!,
  mid: tokens.color.surface.warning.cssVar!,
  low: tokens.color.surface.info.cssVar!,
  idle: tokens.color.surface.muted.cssVar!,
  // 새 이름 (동의어로 같이 노출)
  critical: tokens.color.surface.critical.cssVar!,
  warning: tokens.color.surface.warning.cssVar!,
  info: tokens.color.surface.info.cssVar!,
  muted: tokens.color.surface.muted.cssVar!,
  neutral: tokens.color.surface.neutral.cssVar!,
};
/**
 * TONE_TEXT — tone surface 위 **라벨 텍스트** 색 (CSS 변수 참조 → 다크 자동 반전).
 *
 * ⚠️ 이 자리에 `TONE_DOT`(indicator) 을 쓰지 말 것. indicator 는 도트·스트로크용
 * 고채도 색이라 같은 톤 surface 위 텍스트로는 WCAG AA 4.5:1 에 못 미친다
 * (warning 은 1.75:1). 도트는 TONE_DOT, 라벨은 TONE_TEXT 로 갈라 쓴다.
 */
export const TONE_TEXT: Record<Tone, string> = {
  high: tokens.color.toneText.critical.cssVar!,
  mid: tokens.color.toneText.warning.cssVar!,
  low: tokens.color.toneText.info.cssVar!,
  idle: tokens.color.toneText.muted.cssVar!,
  critical: tokens.color.toneText.critical.cssVar!,
  warning: tokens.color.toneText.warning.cssVar!,
  info: tokens.color.toneText.info.cssVar!,
  muted: tokens.color.toneText.muted.cssVar!,
  neutral: tokens.color.toneText.neutral.cssVar!,
};

/**
 * @deprecated `tokens.color.indicator[intent].value` 사용 권장.
 */
export const TONE_DOT: Record<Tone, string> = {
  high: tokens.color.indicator.critical.value,
  mid: tokens.color.indicator.warning.value,
  low: tokens.color.indicator.info.value,
  idle: tokens.color.indicator.muted.value,
  critical: tokens.color.indicator.critical.value,
  warning: tokens.color.indicator.warning.value,
  info: tokens.color.indicator.info.value,
  muted: tokens.color.indicator.muted.value,
  neutral: tokens.color.indicator.neutral.value,
};

/**
 * @deprecated `tokens.label[intent].value` 사용 권장.
 */
export const TONE_LABEL: Record<Tone, string> = {
  high: tokens.label.critical.value,
  mid: tokens.label.warning.value,
  low: tokens.label.info.value,
  idle: tokens.label.muted.value,
  critical: tokens.label.critical.value,
  warning: tokens.label.warning.value,
  info: tokens.label.info.value,
  muted: tokens.label.muted.value,
  neutral: tokens.label.neutral.value,
};

/** @deprecated `tokens.font.family.korean.value` 사용 권장. */
export const WIDGET_FONT_KO = tokens.font.family.korean.value;

/** @deprecated `tokens.font.family.numeric.value` 사용 권장. */
export const WIDGET_FONT_NUM = tokens.font.family.numeric.value;

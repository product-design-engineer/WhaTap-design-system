---
# ============================================================================
#  @whatap/design-system — Design Tokens
#
#  토큰 타입 4가지:
#    Color      — #hex sRGB
#    Dimension  — 숫자+단위 (px / em / rem / ms)
#    Reference  — {token.path} 참조
#    Typography — fontFamily · fontSize · fontWeight · lineHeight · letterSpacing 객체
#
#  섹션 순서:
#    Overview → Colors → Typography → Layout → Elevation & Depth → Shapes
#    → Components → Do's and Don'ts
#    (생략 가능하지만, 있는 섹션은 이 순서를 지켜야 section-order 경고 없음)
#
#  컴포넌트 토큰:
#    유효 속성: backgroundColor, textColor, typography, rounded, padding,
#              size, height, width
#    변형(hover, active, pressed)은 별도 항목:
#      button-primary  /  button-primary-hover
#
#  원본: src/tokens.css (CSS) + src/widget/_tokens.ts (JS)
#  이 YAML 이 규범적(normative) 값. 아래 산문은 적용 맥락.
# ============================================================================

# ── 1. Overview ─────────────────────────────────────────

overview:
  name: "@whatap/design-system"
  description: "WhaTap AI Assistant 단일 컴포넌트 출처. 모니터링 SaaS 정보 밀도에 최적화된 한국어 디자인 시스템."
  source-css: "src/tokens.css"
  source-ts: "src/widget/_tokens.ts"
  categories: [Primitives, Chrome, Widget]

# ── 2. Colors ───────────────────────────────────────────

colors:

  # Brand
  brand-blue:                "#296CF2"    # Color
  brand-blue-deep:           "#1B5CD9"    # Color
  brand-blue-soft:           "#3DA9FF"    # Color
  brand-blue-bg:             "#D6E1FF"    # Color
  brand-blue-bg-2:           "#C2D5FC"    # Color
  brand-blue-tint:           "#eef4ff"    # Color — 가장 옅은 브랜드 틴트 (강조된 표 행/셀)

  # Brand Alpha — 반투명. 아래 층이 배어나야 하는 자리 (불투명 brand-blue-bg 계열과 구분)
  brand-blue-wash:           "rgba(41, 108, 242, 0.08)"   # Color — active/선택 행·버튼 배경
  brand-blue-border-tint:    "rgba(41, 108, 242, 0.25)"   # Color — 틴트 표면의 경계선

  # Status
  status-success:            "#00B442"    # Color
  status-warning:            "#FFA012"    # Color
  status-error:              "#f34646"    # Color

  # Status Deep — hover/pressed 단계 (brand-blue-deep 과 같은 역할)
  status-warning-deep:       "#E08A0E"    # Color
  status-error-deep:         "#D03333"    # Color

  # Status Soft — status 원색의 옅은 표면 (토스트 배경 · soft 칩/버튼 · 경고 배너)
  #  위에 올리는 텍스트는 tone-text-* 를 쓴다. status 원색을 배경으로 쓰지 말 것.
  status-success-soft:       "#E8F8EE"    # Color
  status-info:               "#296CF2"    # Color — 정보 상태 인디케이터 (다크 #5B92F7)
  status-info-soft:          "#E8F0FE"    # Color
  status-warning-soft:       "#FFF4E5"    # Color
  status-error-soft:         "#FDECEC"    # Color
  status-warning-soft-border: "#FFE0B2"   # Color — warning-soft 표면의 경계선

  # Surface
  surface-50:                "#F5F5F5"    # Color
  surface-100:               "#F1F2F4"    # Color
  surface-200:               "#EAEAEA"    # Color

  # Neutral Solid — 중립(무채색) 강조면. tone="tertiary" 버튼의 채움/hover.
  #  위 전경은 고정 흰색(라이트 8.4:1 · 다크 10.3:1). 다크에서도 어두운 단계를 유지한다.
  neutral-solid:             "#4C4C4C"    # Color — tertiary contained 배경
  neutral-solid-deep:        "#333333"    # Color — tertiary contained hover

  # Text — 시각 위계 4단계
  text-strong:               "#1E1E1E"    # Color
  text-body:                 "#2D2D2D"    # Color
  text-muted:                "#4C4C4C"    # Color
  text-subtle:               "#757575"    # Color
  text-primary:              "#222222"    # Color — 본문 default · 헤딩 (154 callsite)
  text-secondary:            "#4c4c4c"    # Color — 보조 본문 · dim (75 callsite)
  text-tertiary:             "#757575"    # Color — 라벨 · 메타 · placeholder (63 callsite)
  text-disabled:             "#adadad"    # Color — 비활성 (6 callsite)
  text-inverse:              "#FFFFFF"    # Color — text-strong 을 배경으로 깐 표면 위 전경 (툴팁 · 반전 hover)

  # Border
  border-default:            "#EAEAEA"    # Color
  border-soft:               "#F0F0F0"    # Color
  border-strong:             "#E6E6E6"    # Color
  border-divider:            "#ADADAD"    # Color

  # Indicator (Semantic Intent)
  indicator-critical:        "#E53935"    # Color
  indicator-warning:         "#F0B400"    # Color
  indicator-info:            "#296CF2"    # Color
  indicator-muted:           "#757575"    # Color
  indicator-neutral:         "#757575"    # Color

  # Tone Surface (카드/패널 배경)
  tone-surface-critical:     "#ffe8e8"    # Color
  tone-surface-warning:      "#fff7e0"    # Color
  tone-surface-info:         "#e8f4ff"    # Color
  tone-surface-muted:        "#f1f2f4"    # Color
  tone-surface-neutral:      "#f1f2f4"    # Color

  # Tone Text (tone-surface 위 라벨 텍스트)
  #  indicator-* 는 도트·스트로크·차트 강조선용 고채도 색이라 tone-surface 위
  #  텍스트로 쓰면 WCAG AA 4.5:1 에 못 미친다. 텍스트 전경은 이 토큰을 쓴다.
  #  (contrast-ratio 룰이 error 로 검사 — tone-surface-* 대비 4.5:1 이상)
  tone-text-critical:        "#B5302A"    # Color
  tone-text-warning:         "#8A6200"    # Color
  tone-text-info:            "#1B5CD9"    # Color
  tone-text-success:         "#007030"    # Color — status-success-soft 위 라벨 (원색은 대비 미달)
  tone-text-muted:           "#6E6E6E"    # Color
  tone-text-neutral:         "#6E6E6E"    # Color

  # Backdrop scrim — 모달류 배경 딤. 역할이 하나이므로 토큰도 하나.
  overlay-scrim:             "rgba(0, 0, 0, 0.5)"        # Color
  overlay-loading:           "rgba(255, 255, 255, 0.4)"  # Color — 컨트롤 위 로딩 막(버튼)

  # Stage — 발표·캡처용 16:9 무대 chrome. 테마 무관 고정 어두움 (Stage 전용, 앱 표면 금지)
  stage-backdrop:            "#0a0a14"                    # Color
  stage-badge-bg:            "rgba(26, 26, 46, 0.85)"     # Color

  # AI Gradient
  ai-gradient-blue:          "#004BE0"    # Color
  ai-gradient-purple:        "#8B52FF"    # Color
  ai-gradient-purple-deep:   "#4F5BD5"    # Color

  # Extended Gray
  gray-mid:                  "#8b8b8b"    # Color
  gray-soft:                 "#a0a3a6"    # Color
  gray-pale:                 "#bdbdbd"    # Color

  # Chart — Series (categorical) · 계열 정체성. 고정 순서, 1번부터 배정, 순환 금지.
  #  ⚠️ all-pairs 상한 3슬롯 — scatter/bubble/map/small-multiples 는 3계열까지.
  #  검증(dataviz validate_palette.js): 라이트 최악 인접 CVD ΔE 9.5 · 정상시야 17.0 · 대비 ≥3:1
  chart-series-1:            "#296CF2"    # Color — blue
  chart-series-2:            "#C75B1A"    # Color — orange
  chart-series-3:            "#00908A"    # Color — teal
  chart-series-4:            "#9A7B00"    # Color — gold
  chart-series-5:            "#B0349B"    # Color — magenta
  chart-series-6:            "#0E7A56"    # Color — green
  chart-series-7:            "#6B3FD4"    # Color — violet
  chart-series-8:            "#C93B34"    # Color — red

  # Chart — Sequential · 크기/강도. 한 색조 단조 램프, 옅음→진함 (다크는 anchor 반전).
  chart-seq-1:               "#7AB8F0"    # Color
  chart-seq-2:               "#4A97E8"    # Color
  chart-seq-3:               "#2472D8"    # Color
  chart-seq-4:               "#1A50B0"    # Color

  # Chart — Speed · APM 응답 속도 등급(계열 아님). speed-bullet 아이콘과 같은 값 — 다크 재매핑 없음.
  chart-speed-normal:        "#3DA9FF"    # Color — 정상
  chart-speed-slow:          "#FFA012"    # Color — 느림
  chart-speed-very-slow:     "#F34747"    # Color — 매우 느림

  # Shadow flood — SVG feDropShadow 의 그림자 색(불투명도는 floodOpacity). 테마 무관.
  shadow-flood:              "#000000"    # Color

  # Avatar gradient — 프로필 아바타 그라데이션 시작 stop (끝은 brand-blue). 테마 무관.
  avatar-gradient-from:      "#4FC3F7"    # Color

  # Flag — CountryFlag 국기 고유색. 국가 표장이라 테마 무관 고정. 국기 밖 사용 금지.
  flag-red:                  "#D80027"    # Color — 적색 — 태극 적·성조기 줄·히노마루 공용
  flag-blue-kr:              "#0052B4"    # Color — 태극기 태극 청색
  flag-blue-us:              "#2E52B2"    # Color — 성조기 칸톤 청색
  flag-field:                "#F0F0F0"    # Color — 흰 바탕 — 성조기·일장기
  flag-field-kr:             "#FFFFFF"    # Color — 태극기 흰 바탕
  flag-ink:                  "#000000"    # Color — 태극기 4괘 흑색

  # Tone 메타데이터
  tone-types: [critical, warning, info, muted, neutral]
  tone-legacy-alias:
    high:   critical
    mid:    warning
    low:    info
    idle:   muted
  tone-label:
    critical:  "고활용"
    warning:   "활용"
    info:      "저활용"
    muted:     "완전 유휴"
    neutral:   ""

# ── 3. Typography ───────────────────────────────────────

typography:

  # Font Family
  family-sans:           '"Noto Sans KR", "Noto Sans", ui-sans-serif, system-ui, sans-serif'
  family-korean:         '"Noto Sans", "Noto Sans KR", sans-serif'
  family-numeric:        'Roboto, "Noto Sans", sans-serif'
  family-mono:           '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'
  family-korean-kr:      '"Noto Sans KR", sans-serif'
  family-korean-inter:   'Inter, "Noto Sans KR", sans-serif'
  family-numeric-kr:     'Roboto, "Noto Sans KR", sans-serif'
  family-numeric-jp:     'Roboto, NotoSansJP, NotoSans, sans-serif'

  # Type Scale — Dimension
  # Dense scale (1px 정밀 — 정보 밀도)
  size-chart:            "9px"       # Dimension
  size-xs:               "10px"      # Dimension
  size-sm:               "11px"      # Dimension
  size-base:             "12px"      # Dimension — 가장 흔한 본문
  size-md:               "13px"      # Dimension
  size-lg:               "14px"      # Dimension
  # Display scale (시각 강조)
  size-xl:               "16px"      # Dimension
  size-2xl:              "20px"      # Dimension
  size-3xl:              "24px"      # Dimension
  size-4xl:              "32px"      # Dimension
  size-5xl:              "48px"      # Dimension

  # Font Weight
  weight-regular:        400
  weight-medium:         500
  weight-bold:           700

  # Line Height
  leading-none:          1.0
  leading-tight:         1.2
  leading-snug:          1.3
  leading-normal:        1.4
  leading-relaxed:       1.5
  leading-loose:         1.6

  # Line Height — pixel literal
  leading-px-0:          "0"         # Dimension
  leading-px-12:         "12px"      # Dimension
  leading-px-16:         "16px"      # Dimension
  leading-px-18:         "18px"      # Dimension
  leading-px-20:         "20px"      # Dimension

  # Tracking (Letter Spacing)
  tracking-display:      "-0.3px"    # Dimension
  tracking-metric:       "-0.2px"    # Dimension
  tracking-default:      "-0.1px"    # Dimension — 한국어 본문 표준
  tracking-caps:         "0.3px"     # Dimension
  tracking-precision:    "-0.48px"   # Dimension

  # Named Typography Patterns — Typography 타입 (객체)
  pattern-pageTitle:                 # Typography
    fontFamily:     "{typography.family-korean}"      # Reference
    fontSize:       "{typography.size-2xl}"           # Reference → 20px
    fontWeight:     "{typography.weight-medium}"      # Reference → 500
    lineHeight:     "{typography.leading-none}"       # Reference → 1.0
    letterSpacing:  "{typography.tracking-display}"   # Reference → -0.3px

  pattern-sectionHeading:            # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-md}"            # Reference → 13px
    fontWeight:     "{typography.weight-bold}"        # Reference → 700
    lineHeight:     "{typography.leading-normal}"     # Reference → 1.4
    letterSpacing:  "{typography.tracking-default}"   # Reference → -0.1px

  pattern-caption:                   # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-sm}"            # Reference → 11px
    fontWeight:     "{typography.weight-bold}"
    lineHeight:     "{typography.leading-none}"
    letterSpacing:  "{typography.tracking-caps}"      # Reference → 0.3px
    textTransform:  uppercase

  pattern-body:                      # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-md}"            # Reference → 13px
    fontWeight:     "{typography.weight-regular}"     # Reference → 400
    lineHeight:     "{typography.leading-normal}"
    letterSpacing:  "{typography.tracking-default}"

  pattern-bodySmall:                 # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-base}"          # Reference → 12px
    fontWeight:     "{typography.weight-regular}"
    lineHeight:     "{typography.leading-relaxed}"    # Reference → 1.5
    letterSpacing:  "{typography.tracking-default}"

  pattern-label:                     # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-xs}"            # Reference → 10px
    fontWeight:     "{typography.weight-medium}"
    lineHeight:     "{typography.leading-none}"
    letterSpacing:  "{typography.tracking-default}"

  pattern-metric:                    # Typography
    fontFamily:     "{typography.family-numeric}"
    fontSize:       "{typography.size-lg}"            # Reference → 14px
    fontWeight:     "{typography.weight-bold}"
    lineHeight:     "{typography.leading-none}"
    letterSpacing:  "{typography.tracking-metric}"    # Reference → -0.2px

  pattern-chartLabel:                # Typography
    fontFamily:     "{typography.family-numeric}"
    fontSize:       "{typography.size-chart}"         # Reference → 9px
    fontWeight:     "{typography.weight-regular}"
    lineHeight:     "{typography.leading-none}"
    letterSpacing:  "{typography.tracking-default}"

  pattern-tableHeaderCompact:        # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-xs}"            # Reference → 10px
    fontWeight:     "{typography.weight-bold}"
    lineHeight:     "{typography.leading-none}"
    letterSpacing:  "{typography.tracking-default}"

  pattern-tableCellCompact:          # Typography
    fontFamily:     "{typography.family-korean}"
    fontSize:       "{typography.size-sm}"            # Reference → 11px
    fontWeight:     "{typography.weight-regular}"
    lineHeight:     "{typography.leading-snug}"       # Reference → 1.3
    letterSpacing:  "{typography.tracking-default}"

# ── 4. Layout ───────────────────────────────────────────

layout:
  page-header-height:       "48px"     # Dimension
  sub-header-bar-height:    "40px"     # Dimension
  sidebar-width:            "240px"    # Dimension
  sidebar-collapsed-width:  "40px"     # Dimension
  widget-width:             "480px"    # Dimension
  stagger-delay-step:       "120ms"    # Dimension

# ── 5. Elevation & Depth ────────────────────────────────
#
#  층(surface)이 아니라 *떠 있는 높이*로 고른다. 컴포넌트가 rgba 를 직접 적지 않도록
#  그림자도 토큰이다. hairline 은 단독 그림자가 아니라 md/lg 에 겹쳐 쓰는 1px 경계.

elevation:
  shadow-sm:              "0 1px 3px rgba(0, 0, 0, 0.25)"    # 용도: 컨트롤 — switch/토글 knob
  shadow-md:              "0 8px 24px rgba(0, 0, 0, 0.12)"   # 용도: 떠 있는 패널 — 드롭다운·토스트
  shadow-lg:              "0 12px 40px rgba(0, 0, 0, 0.2)"   # 용도: 모달·다이얼로그
  shadow-ring-hairline:   "0 0 0 1px rgba(0, 0, 0, 0.04)"    # 용도: md/lg 에 겹쳐 쓰는 1px 경계
  shadow-xl:              "0 20px 60px rgba(0, 0, 0, 0.15)"  # 용도: 플로팅 위젯 — 가장 높이 뜬 표면
  shadow-panel-slide:     "-10px 0 30px rgba(0, 0, 0, 0.06)" # 용도: 우측에서 밀려나온 슬라이드 패널
  shadow-brand-glow:      "0 2px 8px rgba(41, 108, 242, 0.25)" # 용도: 선택된 컨트롤의 브랜드 강조
  scrim:                  "{colors.overlay-scrim}"           # Reference → rgba(0, 0, 0, 0.5)
  gradient-ai-tint:       "linear-gradient(95deg, rgba(0, 75, 224, 0.08) 0%, rgba(139, 82, 255, 0.08) 100%)"

# ── 6. Shapes ───────────────────────────────────────────

shapes:
  ai-card-rounded:          "8px"      # Dimension
  ai-card-border-color:     "{colors.border-default}"  # Reference → #EAEAEA

# ── 7. Components ───────────────────────────────────────

components:

  # ── PageHeader ──
  page-header:
    height:               "{layout.page-header-height}"    # Reference → 48px
    backgroundColor:      "#ffffff"                         # Color
    textColor:            "{colors.text-primary}"           # Reference

  # ── SubHeaderBar ──
  sub-header-bar:
    height:               "{layout.sub-header-bar-height}"  # Reference → 40px
    backgroundColor:      "#ffffff"                         # Color
    padding:              "0 16px"                          # Dimension

  # ── Sidebar ──
  sidebar:
    width:                "{layout.sidebar-width}"          # Reference → 240px
    backgroundColor:      "#ffffff"                         # Color

  sidebar-collapsed:
    width:                "{layout.sidebar-collapsed-width}" # Reference → 40px

  # ── Widget ──
  widget:
    width:                "{layout.widget-width}"           # Reference → 480px
    backgroundColor:      "#ffffff"                         # Color

  # ── AiCard ──
  ai-card:
    backgroundColor:      "#ffffff"                         # Color
    textColor:            "{colors.text-primary}"           # Reference
    rounded:              "{shapes.ai-card-rounded}"        # Reference → 8px
    padding:              "12px"                            # Dimension

  # ── Button ──
  button-primary:
    backgroundColor:      "{colors.brand-blue}"             # Reference → #296CF2
    textColor:            "#ffffff"                         # Color
    rounded:              "4px"                             # Dimension

  button-primary-hover:
    backgroundColor:      "{colors.brand-blue-deep}"        # Reference → #1B5CD9
    textColor:            "#ffffff"                         # Color

  button-outline:
    backgroundColor:      "transparent"
    textColor:            "{colors.text-primary}"           # Reference
    rounded:              "4px"                             # Dimension

  button-outline-hover:
    backgroundColor:      "{colors.surface-50}"             # Reference → #F5F5F5
    textColor:            "{colors.text-primary}"           # Reference

  button-critical:
    backgroundColor:      "{colors.status-error}"           # Reference → #f34646
    textColor:            "#ffffff"                         # Color

  button-critical-hover:
    backgroundColor:      "#d93636"                         # Color
    textColor:            "#ffffff"                         # Color

  button-sm:
    height:               "20px"                            # Dimension
    padding:              "0 8px"                           # Dimension
    typography:           "{typography.pattern-label}"       # Reference

  button-md:
    height:               "24px"                            # Dimension
    padding:              "0 10px"                          # Dimension

  button-lg:
    height:               "32px"                            # Dimension
    padding:              "0 14px"                          # Dimension

  button-xl:
    height:               "36px"                            # Dimension
    padding:              "0 16px"                          # Dimension

  # ── Chip ──
  chip-sm:
    height:               "18px"                            # Dimension
    rounded:              "9px"                             # Dimension
    padding:              "0 6px"                           # Dimension

  chip-md:
    height:               "20px"                            # Dimension
    rounded:              "10px"                            # Dimension
    padding:              "0 8px"                           # Dimension

  chip-lg:
    height:               "28px"                            # Dimension
    rounded:              "14px"                            # Dimension
    padding:              "0 10px"                          # Dimension

  # ── FilterChip ──
  filterchip-sm:
    height:               "20px"                            # Dimension
    rounded:              "10px"                            # Dimension

  filterchip-md:
    height:               "24px"                            # Dimension
    rounded:              "12px"                            # Dimension

  filterchip-lg:
    height:               "32px"                            # Dimension
    rounded:              "16px"                            # Dimension

  # ── TextField ──
  textfield-sm:
    height:               "24px"                            # Dimension
    padding:              "0 8px"                           # Dimension
    rounded:              "4px"                             # Dimension

  textfield-md:
    height:               "28px"                            # Dimension
    padding:              "0 10px"                          # Dimension
    rounded:              "4px"                             # Dimension

  textfield-lg:
    height:               "32px"                            # Dimension
    padding:              "0 12px"                          # Dimension
    rounded:              "4px"                             # Dimension

  # ── Checkbox ──
  checkbox-sm:
    size:                 "14px"                            # Dimension

  checkbox-md:
    size:                 "16px"                            # Dimension

  # ── Modal ──
  modal-sm:
    width:                "400px"                           # Dimension
    rounded:              "8px"                             # Dimension

  modal-md:
    width:                "560px"                           # Dimension
    rounded:              "8px"                             # Dimension

  modal-lg:
    width:                "720px"                           # Dimension
    rounded:              "8px"                             # Dimension

  # ── DataTable ──
  datatable-default:
    padding:              "12px 10px"                       # Dimension
    typography:           "{typography.pattern-body}"        # Reference → 13px Regular

  datatable-default-header:
    padding:              "12px 10px"                       # Dimension
    textColor:            "{colors.text-primary}"           # Reference

  datatable-compact:
    padding:              "8px 6px"                         # Dimension
    typography:           "{typography.pattern-tableCellCompact}"  # Reference

  datatable-compact-header:
    padding:              "8px 6px"                         # Dimension
    typography:           "{typography.pattern-tableHeaderCompact}" # Reference

  # ── AiAssistantButton ──
  ai-assistant-button:
    height:               "32px"                            # Dimension
    rounded:              "16px"                            # Dimension
    textColor:            "{colors.text-primary}"           # Reference

  ai-assistant-button-active:
    backgroundColor:      "linear-gradient(110.34deg, #004be0, #8b52ff, #004be0)"
    textColor:            "#ffffff"                         # Color

  # ── AiSendButton ──
  ai-send-button:
    size:                 "24px"                            # Dimension
    rounded:              "4px"                             # Dimension
    backgroundColor:      "{colors.surface-200}"           # Reference — 비활성

  ai-send-button-active:
    backgroundColor:      "{colors.brand-blue}"            # Reference → #296CF2
    textColor:            "#ffffff"                         # Color

  # ── AiInlinePrompt ──
  ai-inline-prompt:
    height:               "32px"                            # Dimension
    rounded:              "6px"                             # Dimension
    width:                "480px"                           # Dimension — max-width cap

  # ── Toast ──
  toast:
    rounded:              "8px"                             # Dimension
    padding:              "10px 16px"                       # Dimension

  toast-success:
    backgroundColor:      "{colors.status-success}"        # Reference
    textColor:            "#ffffff"                         # Color

  toast-error:
    backgroundColor:      "{colors.status-error}"          # Reference
    textColor:            "#ffffff"                         # Color

  toast-warning:
    backgroundColor:      "{colors.status-warning}"        # Reference
    textColor:            "#ffffff"                         # Color

  # ── AiToneBadge ──
  ai-tone-badge-critical:
    backgroundColor:      "{colors.tone-surface-critical}"  # Reference
    textColor:            "{colors.tone-text-critical}"     # Reference

  ai-tone-badge-warning:
    backgroundColor:      "{colors.tone-surface-warning}"   # Reference
    textColor:            "{colors.tone-text-warning}"      # Reference

  ai-tone-badge-info:
    backgroundColor:      "{colors.tone-surface-info}"      # Reference
    textColor:            "{colors.tone-text-info}"         # Reference

  ai-tone-badge-muted:
    backgroundColor:      "{colors.tone-surface-muted}"     # Reference
    textColor:            "{colors.tone-text-muted}"        # Reference

---

# @whatap/design-system — Design Rationale

이 문서는 위 YAML 토큰의 **존재 이유와 적용 맥락**을 설명합니다.
토큰(YAML)이 규범적(normative) 값이고, 아래 산문은 적용 컨텍스트입니다.

---

## Overview

WhaTap 모니터링 SaaS의 단일 컴포넌트 출처. No-Tailwind 자체완결 CSS(`whatap-ds.css`).

### 아키텍처 — 2-Tier Token + 3-Layer Component

```
Token Tier          Component Layer
─────────────       ──────────────────────────
Global (원시값)  ─▶  Foundation (39) — 단독 렌더
     │                    │
Semantic (의미)  ─▶  Composite (12) — Foundation 1단계 조합
                          │
                     Shell (2) — 최종 진입점
```

**토큰 규칙:** 컴포넌트는 Semantic 토큰만 참조. Global 직접 참조 금지.
**조합 규칙:** Composite 끼리 import 금지. 필요하면 Shell로 승격.

### 토큰 타입 규약

| 타입 | 표기 | 예 |
|---|---|---|
| **Color** | `#hex` sRGB | `"#296CF2"` |
| **Dimension** | 숫자+단위 | `"12px"`, `"120ms"`, `"-0.1px"` |
| **Reference** | `{section.path}` | `"{colors.brand-blue}"`, `"{typography.size-md}"` |
| **Typography** | 객체 | `fontFamily` · `fontSize` · `fontWeight` · `lineHeight` · `letterSpacing` |

### 컴포넌트 토큰 규약

유효 속성: `backgroundColor` · `textColor` · `typography` · `rounded` · `padding` · `size` · `height` · `width`.
변형(hover, active, pressed)은 **별도 항목**으로 정의:

```yaml
button-primary:           # 기본 상태
  backgroundColor: "{colors.brand-blue}"
button-primary-hover:     # hover 변형
  backgroundColor: "{colors.brand-blue-deep}"
```

---

## Colors

### Brand

`brand-blue (#296CF2)`가 WhaTap의 주요 액센트. AI gradient(`#004BE0 → #8B52FF`)와 명확히 구분됩니다 — brand-blue는 일반 UI 강조, gradient는 AI 전용.

### Text — 4단계가 충분한 이유

```
primary   #222     ████████████████████████████████   154회
secondary #4c4c4c  ████████████████                    75회
tertiary  #757575  █████████████                       63회
disabled  #adadad  █                                    6회
```

`primary`가 나머지 셋을 합친 것보다 많습니다. 5단계 이상은 인접 색 차이가 너무 미미해 실질적 구분 불가.

### Tone (Semantic Intent) — 5단계의 근거

| Tone | 의미 | indicator Color | surface Color | 적용 판단 |
|---|---|---|---|---|
| `critical` | 시급, 즉시 조치 | `#E53935` | `#ffe8e8` | 사용자에게 행동을 요구? |
| `warning` | 주의, 관찰 필요 | `#F0B400` | `#fff7e0` | 즉시 조치 불필요, 관찰? |
| `info` | 안내, 정보 전달 | `#296CF2` | `#e8f4ff` | 분류상 "낮은" 그룹? |
| `muted` | 비활성, idle | `#757575` | `#f1f2f4` | 사용하지 않는 자원? |
| `neutral` | 분류 무의미 | `#757575` | `#f1f2f4` | 합계 · 캡션 행? |

**6단계 확장 금지** — adjacent tone 간 의미 차이가 흐려져 디자인 결정이 어려워짐. 늘리기 전에 기존 5개로 합칠 수 있는지 먼저 검토.

**Legacy 매핑:** `high→critical` · `mid→warning` · `low→info` · `idle→muted`. 기존 callsite 무중단.

---

## Typography

### Font Family — Korean vs Numeric 분리

| 컨텍스트 | family | 이유 |
|---|---|---|
| 한국어 본문 · 라벨 · 헤딩 | `korean` | 한/영 baseline 일치 |
| SVG 차트 · DataTable 숫자 | `numeric` | Roboto tabular figures 자릿수 정렬 |
| 시계 · 타이머 · KPI | `numeric` | digit 흔들림 없음 |

Noto Sans KR 숫자 글리프도 가능하지만, Roboto tabular figures가 **자릿수 정렬에서 압도적으로 우수**. 모니터링 SaaS에서 숫자 가독성은 타협 불가.

### Type Scale — 1px 정밀 + 2배수 인접 혼합

**Dense (9-14px, 1px 정밀):** 모니터링 SaaS 본문의 정보 밀도. 테이블 셀 · 사이드바 · 차트 라벨 · 배지가 한 화면에 공존 — 2px 이상 건너뛰면 11px에 적합한 역할(compact 셀, 사이드바 보조)이 사라짐.

**Display (16-48px, 2배수 인접):** 시각 강조 목적. 1px 차이가 의미 없으므로 16→20→24→32→48 자연스러운 비례감.

**경계점 14px(lg):** Dense 최대이자 Display 시작 바로 아래. AiCard 큰 헤더, LiveTimer digit처럼 "본문은 아니지만 타이틀도 아닌" 중간 강조.

### Font Weight — 3단계, 평탄화 금지

한국어 글리프는 영문보다 획이 복잡해서, 같은 사이즈에서 400→500 차이가 시각적으로 미미. **사이즈 + weight 둘 다 조합**해야 정보 우선순위 명확.

| 사이즈 | weight | 용도 |
|---|---|---|
| 14px+ | bold(700) | 페이지 타이틀 · 섹션 헤더 |
| 13px | bold / medium | 카드 헤더 · 테이블 row 강조 |
| 12px | medium(500) | 라벨 · 메타 · dropdown 항목 |
| 11px | medium / regular | 보조 메타 · 캡션 |
| 10px | regular(400) | 마이크로 캡션 · 인디케이터 |

같은 사이즈에서 weight만 바꾸는 것(평탄화) → **위계 손실 → 금지**.

### Tracking — 한국어 -0.1px 기본

Noto Sans KR 기본 letter-spacing이 한국어 글자 사이를 벌려 보이게 함. 영문 body text 기본이 0인 반면, 한국어 본문에서 `-0.1px`이 시각적으로 자연스러운 자간.

| 토큰 | 값 | 적용 |
|---|---|---|
| `display` | -0.3px | 20px+ 타이틀 — 큰 글자일수록 자간이 넓어 보여 더 당김 |
| `metric` | -0.2px | Roboto 숫자 — Latin 전용이라 한국어보다 덜 당김 |
| `default` | -0.1px | 한국어 본문 표준 (159+ callsite) |
| `caps` | +0.3px | uppercase 영문 캡션 — 대문자는 좁히면 가독성 저하, 벌림 |

### Named Typography Patterns

자주 사용되는 조합을 Typography 타입 객체로 토큰화. `{typography.pattern-*}`으로 참조.

| 패턴 | 조합 | 사용 위치 |
|---|---|---|
| `pageTitle` | korean · 20px · 500 · 1.0 · -0.3px | PageHeader |
| `sectionHeading` | korean · 13px · 700 · 1.4 · -0.1px | AiSectionHeading |
| `caption` | korean · 11px · 700 · 1.0 · 0.3px · uppercase | AiCaption |
| `body` | korean · 13px · 400 · 1.4 · -0.1px | AiBulletList md · AiUserBubble |
| `bodySmall` | korean · 12px · 400 · 1.5 · -0.1px | AiBulletList sm |
| `label` | korean · 10px · 500 · 1.0 · -0.1px | AiToneBadge |
| `metric` | numeric · 14px · 700 · 1.0 · -0.2px | LiveTimer · KPI |
| `chartLabel` | numeric · 9px · 400 · 1.0 · -0.1px | MiniLineChart axis |
| `tableHeaderCompact` | korean · 10px · 700 · 1.0 · -0.1px | DataTable compact 헤더 |
| `tableCellCompact` | korean · 11px · 400 · 1.3 · -0.1px | DataTable compact 셀 |

---

## Layout

### Chrome 수직 리듬

```
┌─────────────────────────────────────────────────┐
│  PageHeader                              48px   │
├─────────────────────────────────────────────────┤
│  SubHeaderBar (선택)                     40px   │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main content                        │
│ 240px    │                                      │
│ (40px    │              WhaTapAiWidget           │
│  when    │              480px →                  │
│  widget) │                                      │
└──────────┴──────────────────────────────────────┘
```

| 토큰 | 값 | 근거 |
|---|---|---|
| `page-header-height` | 48px | 로고 헤더와 동일 높이 → 좌우 컬럼 정렬 |
| `sub-header-bar-height` | 40px | Sidebar 조직 스위처(40px)와 동일 높이 → 2행 정렬 |
| `sidebar-width` | 240px | 메뉴 트리 + 프로젝트 스위처 최소 폭 |
| `sidebar-collapsed-width` | 40px | 위젯 열릴 때 제품 레일만 남기는 절충. 완전 숨기면 이동 경로 소실 |
| `widget-width` | 480px | 채팅 + 카드 콘텐츠 편안한 렌더 최소 폭 |
| `stagger-delay-step` | 120ms | 인간 시각 처리 임계(~100ms) 바로 위 — "따로 나타남" 인지 + "느림" 미인지 |

### SVG 텍스트 — fontSize 단위 필수

SVG에서 `fontSize={9}`(unitless)는 viewBox user-space units로 해석. `viewBox="0 0 100 60"`과 `viewBox="0 0 400 240"`에서 같은 값이 전혀 다른 크기로 렌더됨.

```tsx
// 금지
<text fontSize="9">100%</text>
// 필수 — CSS pixel 고정
<text fontSize="9px">100%</text>
```

### 차트 Peak 정렬 — 좌표계 통일

SVG plot 영역과 HTML overlay가 **같은 컨테이너 안에서 같은 plot 좌표계(left/top)를 공유**. 별개 좌표계로 그리면 peak 표시가 실제 최고점에서 수 px 어긋남.

---

## Shapes

### AiCard 외형 통일

`rounded: 8px` · `border: {colors.border-default}` (#EAEAEA) · `padding: 12px` · `gap: 8px`

위젯 내 모든 카드가 이 4개 값을 공유. 1px이라도 어긋나면 시각적으로 잡힘. 직접 `<div className="bg-white border ...">` 재구현 금지 → `<AiCard>` 사용.

---

## Components

### DataTable — density 정책

| density | header typography | row typography | padding | 채택 조건 |
|---|---|---|---|---|
| `default` | 12px bold | 13px regular | 12px 10px | **모든 새 페이지 기본** |
| `compact` | 10px bold | 11px regular | 8px 6px | 100+ 행 raw log 전용. 별도 근거 필요 |

**정렬:** 문자 → left · 숫자(`numeric:true`) → right · No(순번) → center 자동.

**셀 내 컴포넌트:** `Chip md(20px)` · `Button sm(~24px)` · `Checkbox sm(14-16px)` · status dot `6-8px`. `lg(28-32px)` 금지 — row 압도.

**셀 내 폰트 금지:** default density 셀에 `text-sm`/`text-xs` 사용 금지 (compact 잔재). 부 텍스트는 `text-base`(12px).

### Button — variant × tone 매트릭스

변형별 토큰은 YAML `components` 섹션에서 `button-{variant}` / `button-{variant}-hover` 패턴으로 정의.

**AI 버튼과의 분리:** 일반 액션 → `Button` (단색). AI 위젯 토글 → `AiAssistantButton` (그라데이션). AI 송신 → `AiSendButton` (파랑 ⬆). 시각 분리가 핵심.

### AiAssistantButton / AiSendButton — AI 전용 진입점

AI 컴포넌트(그라데이션 · 핀휠 심볼 · 송신 ⬆)와 일반 UI(단색 · 표준 아이콘)의 시각 톤이 명확히 다름. "어디가 AI이고 어디가 일반 액션인가" 즉시 구분 필요.

### AiInlinePrompt — 1-step UX

| 패턴 | 단계 | 경로 |
|---|---|---|
| 2-step (기존) | 4단계 | 버튼 → 위젯 열림 → focus → 입력 |
| **1-step (현재)** | 1단계 | AiInlinePrompt에 바로 입력 |

`max-width: 480px` cap — 우측 chrome(고객지원 · bell · avatar) 잠식 금지.

### AiToneBadge — tone별 변형

`ai-tone-badge-{tone}` 패턴으로 5개 변형 정의. `backgroundColor`는 `tone-surface-*`, `textColor`는 `indicator-*`를 Reference.

---

## Do's and Don'ts

### Do

- 새 컴포넌트를 만들기 전에 **기존 14 Primitives + 20 Widget Cards로 조립 가능한지 확인**
- Typography는 **Named Pattern Reference** 사용 (`{typography.pattern-body}` 등)
- 색상은 **Color 토큰 Reference** (`{colors.indicator-critical}`) — hex 리터럴 금지
- DataTable은 `density="default"`로 시작, compact는 별도 근거
- SVG `<text fontSize>`에 **단위 필수** (`"9px"`)
- 카드는 **`<AiCard>` 사용** — 외형 직접 구현 금지
- Stagger delay `0 → 120 → 240 → 360 …` 순차 진입
- 라이브 CSS dogfooding 시 **live 번들 fetch → 그대로 paste**

### Don't

- **🔒 소비 레이어에서 토큰 · 컴포넌트 · Atom · 위젯을 역방향 수정 (불변 정책, 예외 없음)** — override · 재정의 · CSS 덮어쓰기 · 토큰 값 변경 모두 금지. 변경은 본 repo에서만.
- `style={{ color: "#E53935" }}` — 토큰 우회
- 같은 사이즈에서 weight만 바꾸기(평탄화) — 사이즈 + weight 둘 다 조합
- default density 셀에 `text-sm`/`text-xs` — compact 잔재
- `lg(28-32px)` 컴포넌트를 DataTable row 안에 — row 압도
- Tone을 6단계 이상으로 확장 — 합칠 수 있는지 먼저 검토
- AI 진입에 `<Button>` — `<AiAssistantButton>` 또는 `<AiInlinePrompt>` 사용
- `fontSize={9}` (unitless SVG) — `fontSize="9px"` 필수
- `<div className="bg-white border ...">` 카드 재구현 — `<AiCard>` 사용
- 라이브 CSS 즉흥 작성 — 라이브와 1px/1ms 달라짐
- 의사결정 3조건(side-effect-free · reusable · exact design) 불충족 시 머지 — 리뷰 먼저

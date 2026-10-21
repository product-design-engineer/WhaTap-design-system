/**
 * Button — 공통 (chrome) 버튼 primitive.
 *
 * ## Purpose
 * WhaTap 디자인 시스템의 표준 버튼. 모든 click trigger 가 이 컴포넌트로 통일되어야 함 — 인라인
 * `<button className="...">` 새로 짜지 말 것. 색/사이즈/상태 일관성은 이 컴포넌트가 보장.
 *
 * Spec: @whatap/wds Button-specs.md 기반 (Figma 5701-33519). 3 variant × 4 size × 4 tone +
 * disabled / loading / fullWidth.
 *
 * ## When to use
 * - 사용자 실행 trigger (제출 / 적용 / 닫기 / 등록 등).
 * - Primary CTA, Secondary action, 위험 동작 (delete 등).
 * - 색 의미가 없는 중립 실행 (취소 · 닫기 · 나중에 · 더보기) → `tone="tertiary"`.
 *
 * ## When NOT to use
 * - 링크 이동 → `<a>` 사용.
 * - AI 토글 그라데이션 → [[AssistantButton]].
 * - AI 위젯 송신 → [[SendButton]].
 * - icon-only 압축 버튼 (size 16-20px) → 인라인 OK.
 *
 * ## Composition rules
 * - **위계는 variant 가, 색은 tone 이 진다.** 강조 위계는 variant(contained=1차 CTA · outline=2차 ·
 *   basic=3차 텍스트), `tone` 은 그 위의 색 의미(primary 브랜드 · tertiary 중립 무채색 · warning ·
 *   critical). 그래서 "3차 강조"는 `variant="basic"`, "무채색"은 `tone="tertiary"` 로 각각 표현한다.
 * - 모든 색은 토큰 (`var(--color-brand-blue)` 등) — 인라인 hex 금지.
 * - 사이즈는 spec 4 단계만 — custom px 금지.
 * - 한 화면의 CTA 는 contained primary 하나. 그 옆 취소/닫기는 **outline·basic tertiary** 로 —
 *   취소에 tone="primary" 를 쓰면 파란 두 버튼이 CTA 자리를 다툰다.
 * - 위험한 실행 확인 대화의 취소도 tertiary. critical 은 실행 버튼 쪽만.
 * - loading=true → 자동 disabled + spinner overlay.
 *
 * ## Spec
 * 동적 variant×tone 색은 CSS custom property 로 전달한다.
 * runtime 에 조립되는 variant×tone 색은 정적 유틸 클래스로 표현할 수 없으므로,
 * **inline CSS custom property** 로 전달 (`--wds-btn-bg`, `--wds-btn-fg`, `--wds-btn-border`,
 * `--wds-btn-bg-hover`). `tokens.css` 의 `.wds-btn` 규칙이 이 변수들을 적용 — hover 까지 정상.
 *
 * @example
 * ```tsx
 * <Button variant="contained" tone="primary" size="lg" onClick={onApply}>
 *   네, 적용하고 트렌드 보기
 * </Button>
 * <Button variant="outline" tone="critical" size="md" disabled>
 *   삭제 (권한 없음)
 * </Button>
 * <Button variant="outline" tone="tertiary" size="lg" onClick={onClose}>
 *   취소
 * </Button>
 * ```
 */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "basic" | "contained" | "outline";
export type ButtonSize = "xl" | "lg" | "md" | "sm";
export type ButtonTone = "primary" | "tertiary" | "warning" | "critical";

export type ButtonProps = {
  /** 시각 variant — basic(텍스트만) / contained(채움) / outline(보더). */
  variant?: ButtonVariant;
  /** 사이즈 (높이 px) — xl=36 · lg=32 · md=24 · sm=20. */
  size?: ButtonSize;
  /** 톤 (색 테마) — primary(blue) · tertiary(중립 회색) · warning(orange) · critical(red). */
  tone?: ButtonTone;
  /** 로딩 상태 — true 면 자동 disabled + spinner. */
  loading?: boolean;
  /** 전체 폭 채우기. */
  fullWidth?: boolean;
  /** 버튼 라벨 텍스트(아이콘을 함께 둘 수 있다 — 가로 나열 · 사이즈별 gap). loading 중에는 자리만 남고 숨는다. */
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/* ─── style maps ────────────────────────────────────── */

const SIZE_CLASS: Record<ButtonSize, string> = {
  // whatap-ds.css 에 정의된 일반 유틸 클래스 (h-36px/px-16px 등 — escape 없는 식별자).
  xl: "h-36px px-16px text-md gap-8px",
  lg: "h-32px px-14px text-md gap-6px",
  md: "h-24px px-10px text-base gap-4px",
  sm: "h-20px px-8px text-sm gap-4px",
};

/**
 * tone → CSS color (main / hover / soft surface).
 *
 * `fg`·`border` 는 **outline·basic 에서 main 을 쓰면 안 되는 tone 만** 채운다(기본은 main).
 * `tertiary` 가 그 경우다 — main(중립 강조면)은 contained 배경 전용으로 어둡게 고정돼 있어
 * 다크에서 어두운 배경 위 어두운 글자가 된다. 그래서 전경은 테마 반전되는 text/border 토큰으로 뺀다.
 */
const TONE_COLORS: Record<
  ButtonTone,
  { main: string; hover: string; soft: string; fg?: string; border?: string }
> = {
  primary:  { main: "var(--color-brand-blue)",     hover: "var(--color-brand-blue-deep)", soft: "var(--color-brand-blue-bg)" },
  tertiary: {
    main: "var(--color-neutral-solid)",
    hover: "var(--color-neutral-solid-deep)",
    soft: "var(--color-surface-100)",
    fg: "var(--color-text-secondary)",
    border: "var(--color-border-divider)",
  },
  warning:  { main: "var(--color-status-warning)", hover: "var(--color-status-warning-deep)", soft: "var(--color-status-warning-soft)" },
  critical: { main: "var(--color-status-error)",   hover: "var(--color-status-error-deep)",   soft: "var(--color-status-error-soft)" },
};

/** variant × tone → inline CSS custom property set (button 색 전체 결정). */
function toneStyle(variant: ButtonVariant, tone: ButtonTone): CSSProperties {
  const c = TONE_COLORS[tone];
  if (variant === "contained") {
    return {
      "--wds-btn-bg": c.main,
      "--wds-btn-bg-hover": c.hover,
      "--wds-btn-fg": "var(--color-text-inverse)",
      "--wds-btn-border": "transparent",
    } as CSSProperties;
  }
  if (variant === "outline") {
    return {
      "--wds-btn-bg": "var(--color-card)",
      "--wds-btn-bg-hover": c.soft,
      "--wds-btn-fg": c.fg ?? c.main,
      "--wds-btn-border": c.border ?? c.main,
    } as CSSProperties;
  }
  // basic — text-only, hover 시만 soft 배경
  return {
    "--wds-btn-bg": "transparent",
    "--wds-btn-bg-hover": c.soft,
    "--wds-btn-fg": c.fg ?? c.main,
    "--wds-btn-border": "transparent",
  } as CSSProperties;
}

/* ─── 컴포넌트 ──────────────────────────────────────── */

export default function Button({
  variant = "contained",
  size = "md",
  tone = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  style,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={rest.type ?? "button"}
      disabled={isDisabled}
      // 소스의 raw-color-ok 와 짝 — 런타임 가드에도 사유를 알린다(contained 는 컬러 위 흰 전경).
      data-ds-policy-ok={variant === "contained" ? "컬러 위 고정 흰색 전경(--wds-btn-fg)" : undefined}
      className={[
        "wds-btn",
        "inline-flex items-center justify-center rounded-4px border whitespace-nowrap select-none relative overflow-hidden",
        "transition-colors duration-150",
        "tracking-default font-medium",
        SIZE_CLASS[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      style={{
        fontFamily: "var(--font-family-korean)",
        ...toneStyle(variant, tone),
        ...style, // 사용자 override
      }}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "var(--color-overlay-loading)", backdropFilter: "blur(1px)" }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "1.5px solid currentColor",
              borderTopColor: "transparent",
              animation: "aiSymbolRotateSlow 0.9s linear infinite",
            }}
          />
        </span>
      )}
      <span className={loading ? "invisible" : "inline-flex items-center gap-inherit"}>
        {children}
      </span>
    </button>
  );
}

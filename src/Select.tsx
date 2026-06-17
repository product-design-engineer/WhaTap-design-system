/**
 * Select — Primitives layer.
 *
 * ## Purpose
 * 옵션 목록에서 한 값 선택. `PresetSelect`·`OptionbarInstanceSelector` 같은 chrome
 * specialized 컴포넌트의 *기반* base.
 * 인라인 `<select>` 새로 짜지 말 것 — 색·간격·a11y 일관성은 이 컴포넌트가 보장.
 *
 * ## When to use
 * - 메트릭 선택 (룰 편집기: disk.usage / cpu.usage / ...)
 * - 심각도 선택 (Critical / Warning / Info)
 * - 단위 / 시간 단위 / 정렬 기준 등 단일 값 선택
 *
 * ## When NOT to use
 * - 다중 선택 → `FilterDropdown` (Checkbox 묶음)
 * - 검색 가능한 큰 목록(50+) → `Combobox` (추후, searchable variant)
 * - 양자택일(boolean) → `Switch` 또는 `Tabs` (segmented)
 * - 특정 시간/프리셋 → 기존 chrome `PresetSelect`, `TimeRangeSelector`
 *
 * ## Composition rules
 * - 시각 톤은 TextField와 정렬 (size, border, padding 동일 spec)
 * - 옵션은 `{ value, label, disabled? }` 객체 배열 — 단순 string 배열은 미지원
 * - native `<select>` 기반 — a11y/키보드 자동, 펼침 메뉴 디자인은 브라우저 기본
 *   (디자인 제어 필요 시 추후 `Combobox`/`SelectPopover` 별도 컴포넌트)
 * - clearable / invalid / helperText / fullWidth: TextField 와 동일 prop·동작
 *
 * @example
 * ```tsx
 * <Select
 *   label="메트릭"
 *   value={metric}
 *   onChange={setMetric}
 *   options={[
 *     { value: "disk.usage", label: "Disk usage (%)" },
 *     { value: "cpu.usage",  label: "CPU usage (%)" },
 *   ]}
 *   placeholder="선택..."
 * />
 * <Select size="sm" value={tz} onChange={setTz} options={tzOptions} clearable />
 * ```
 */
import { useId, type ReactNode, type SelectHTMLAttributes } from "react";

export type SelectSize = "sm" | "md" | "lg";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  /** 상단 라벨. */
  label?: ReactNode;
  /** 옵션 배열. */
  options: SelectOption[];
  /** controlled value. */
  value?: string;
  /** controlled change. */
  onChange?: (next: string) => void;
  /**
   * 사이즈 — TextField 와 정렬. sm=24px / md=28px / **lg=32px (default)**.
   *
   * 페이지 헤더 / 옵션바 가 가장 흔한 사용처라 lg 가 default — TextField 와 height 정렬 보존.
   * Modal 안의 dense form 필드라면 `size="md"` 를 명시.
   */
  size?: SelectSize;
  /** placeholder — value=="" 일 때 표시되는 비활성 첫 옵션. */
  placeholder?: string;
  /** 좌측 슬롯 — 아이콘. */
  leadingIcon?: ReactNode;
  /** 에러 상태. */
  invalid?: boolean;
  /** 하단 helper/error 텍스트. */
  helperText?: ReactNode;
  /** 전체 폭 채우기. */
  fullWidth?: boolean;
  /** value 있을 때 우측 × 버튼 노출 → clear (chevron 옆). */
  clearable?: boolean;
  /** clear 클릭 콜백. */
  onClear?: () => void;
  /** 외부 className — outer wrapper. */
  className?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "value" | "onChange">;

const SIZE = {
  sm: { h: 24, padX: 8, gap: 6, text: "text-sm" },
  md: { h: 28, padX: 10, gap: 8, text: "text-base" },
  lg: { h: 32, padX: 12, gap: 8, text: "text-md" },
} as const;

const CLEAR_ICON_SIZE: Record<SelectSize, number> = { sm: 10, md: 12, lg: 12 };
const CHEVRON_SIZE: Record<SelectSize, number> = { sm: 10, md: 12, lg: 12 };

export default function Select({
  label,
  options,
  value,
  onChange,
  size = "lg",
  placeholder,
  leadingIcon,
  invalid = false,
  helperText,
  fullWidth = false,
  clearable = false,
  onClear,
  className = "",
  disabled,
  id,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const spec = SIZE[size];
  const helperId = helperText ? `${selectId}-helper` : undefined;

  const borderColor = disabled
    ? "var(--color-border-default)"
    : invalid
    ? "var(--color-status-error)"
    : "var(--color-border-strong)";

  return (
    <div
      className={`inline-flex flex-col gap-1_5 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {label !== undefined && label !== null && (
        <label
          htmlFor={selectId}
          className={`${spec.text} font-medium ${disabled ? "text-tertiary" : "text-primary"}`}
        >
          {label}
        </label>
      )}
      <div
        className="relative inline-flex items-center rounded-md bg-card transition-colors"
        style={{
          height: spec.h,
          paddingInline: spec.padX,
          gap: spec.gap,
          border: `1px solid ${borderColor}`,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {leadingIcon !== undefined && leadingIcon !== null && (
          <span className="inline-flex shrink-0 items-center text-tertiary" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperId}
          className={`min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 outline-none ${spec.text} text-primary disabled-cursor-not-allowed`}
          style={{
            // value 비어있고 placeholder 있으면 text-tertiary 색
            color:
              !value && placeholder
                ? "var(--color-text-tertiary)"
                : "var(--color-text-primary)",
          }}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled hidden={!!value}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {clearable && !disabled && value !== undefined && value !== "" && (
          <button
            type="button"
            aria-label="선택 지우기"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.("");
              onClear?.();
            }}
            // subtle 톤 — TextField clear 와 일관. 보조 액션이라 약함.
            className="inline-flex shrink-0 cursor-pointer items-center justify-center text-color-var-color-text-disabled transition-colors hover-text-color-var-color-text-secondary"
            style={{
              width: CLEAR_ICON_SIZE[size] + 4,
              height: CLEAR_ICON_SIZE[size] + 4,
              padding: 0,
              border: 0,
              backgroundColor: "transparent",
            }}
          >
            <svg
              viewBox="0 0 10 10"
              width={CLEAR_ICON_SIZE[size]}
              height={CLEAR_ICON_SIZE[size]}
              aria-hidden
            >
              <path
                d="M2 2 L8 8 M8 2 L2 8"
                stroke="currentColor"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        {/* chevron — native select 의 펼침 표시 (CSS appearance:none 으로 기본 화살표 숨김) */}
        <span
          className="pointer-events-none inline-flex shrink-0 items-center text-tertiary"
          aria-hidden
        >
          <svg
            viewBox="0 0 12 12"
            width={CHEVRON_SIZE[size]}
            height={CHEVRON_SIZE[size]}
            fill="none"
          >
            <path
              d="M3 4.5 L6 7.5 L9 4.5"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      {helperText && (
        <span
          id={helperId}
          className={`${size === "sm" ? "text-xs" : "text-sm"} ${
            invalid ? "text-color-var-color-status-error" : "text-tertiary"
          }`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

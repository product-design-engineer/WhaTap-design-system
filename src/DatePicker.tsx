/**
 * DatePicker — 날짜 한 개를 연·월·일 칸으로 나눠 받는 입력. Primitives layer.
 *
 * ## Purpose
 * 조회 기준일처럼 날짜 하나만 필요한 자리. [[DateTimeBlock]] 과 같은 자릿수 정렬 규칙을
 * 쓰되 시·분을 떼고, 오른쪽에 달력 버튼을 붙인다. 값은 세 칸을 직접 고쳐도 되고 달력에서
 * 골라도 된다 — 키보드로 빠른 사람과 달력을 보고 짚는 사람이 같은 컨트롤을 쓴다.
 *
 * ## When to use
 * - 히트맵·보고서의 「시작일」처럼 단일 날짜 기준.
 *
 * ## When NOT to use
 * - 시작~끝 구간 + LIVE → [[TimeRangeSelector]].
 * - 상대 구간 프리셋(최근 1시간) → [[PresetSelect]].
 * - 날짜와 시각을 함께 → [[DateTimeBlock]].
 *
 * ## Composition rules
 * - **크기·글자·테두리·radius 는 [[TextField]] 와 같은 spec** — `size` sm 24 / md 28 / **lg 32(기본)**,
 *   글자는 sm `text-sm` / md `text-base` / lg `text-md`,
 *   `--radius-control`, `--color-border-control`. 옵션 패널에서 [[TextField]]·[[Select]] 와 한 줄에 서기 때문에
 *   여기만 다른 값을 쓰면 줄이 어긋난다.
 * - 자릿수 폭은 [[DateTimeBlock]] 과 같은 컴포넌트 토큰(`--wds-datetime-year-w` ·
 *   `--wds-datetime-field-w`) 을 쓴다 — 같은 화면에 둘이 나란히 서도 폭이 어긋나지 않는다.
 * - 구분자는 `/` (날짜 전용). 시각이 붙는 [[DateTimeBlock]] 의 `-` 와 눈으로 구분된다.
 * - 달력 버튼은 트리거만 — 달력 패널 자체는 이 컴포넌트가 그리지 않는다(`onCalendarClick`).
 * - 세 칸은 controlled. 값 형식은 `YYYY-MM-DD` 하나로 주고받는다(내부에서 쪼갠다).
 *
 * @example
 * ```tsx
 * <DatePicker value="2026-08-19" onChange={setDay} onCalendarClick={openCal} />
 * ```
 */
import { useState } from "react";

export type DatePickerSize = "sm" | "md" | "lg";

/** 사이즈 spec — [[TextField]] 와 같은 높이·좌측 여백·글자 사다리. */
const SIZE: Record<DatePickerSize, { h: number; padLeft: number; text: string }> = {
  sm: { h: 24, padLeft: 8, text: "text-sm" },
  md: { h: 28, padLeft: 10, text: "text-base" },
  lg: { h: 32, padLeft: 12, text: "text-md" },
};

export type DatePickerProps = {
  /** `YYYY-MM-DD`. */
  value: string;
  onChange?: (next: string) => void;
  /** 달력 버튼 클릭. 미지정 시 버튼을 그리지 않는다. */
  onCalendarClick?: () => void;
  /** [[TextField]] 와 같은 스케일 — sm 24 / md 28 / **lg 32(기본)**. */
  size?: DatePickerSize;
  disabled?: boolean;
  "aria-label"?: string;
};

const clampInt = (raw: string, max: number) => {
  const n = Number(raw.replace(/\D/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.min(n, max));
};

export default function DatePicker({
  value,
  onChange,
  onCalendarClick,
  size = "lg",
  disabled = false,
  "aria-label": ariaLabel = "시작일",
}: DatePickerProps) {
  const [focused, setFocused] = useState(false);
  const [year = "", month = "", day = ""] = value.split("-");

  const emit = (y: string, m: string, d: string) =>
    onChange?.(`${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);

  const inputCls = `outline-none border-none bg-transparent ${SIZE[size].text} text-primary text-center font-numeric tabular-nums`;

  return (
    <div
      className="inline-flex items-center rounded-control bg-card transition-colors"
      aria-label={ariaLabel}
      style={{
        width: "fit-content",
        // 인라인 라벨 행에서 남는 폭을 먹지 않는다 — 날짜 칸은 내용만큼만 넓다.
        flex: "0 0 auto",
        height: SIZE[size].h,
        gap: 2,
        paddingLeft: SIZE[size].padLeft,
        // 우측은 달력 버튼이 자기 여백을 갖는다 — TextField 의 padXEnd 와 같은 취급.
        paddingRight: onCalendarClick ? 6 : SIZE[size].padLeft,
        border: `1px solid ${focused ? "var(--color-brand-blue)" : "var(--color-border-control)"}`,
        opacity: disabled ? 0.6 : 1,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <input
        className={inputCls}
        style={{ width: "var(--wds-datetime-year-w)" }}
        value={year}
        disabled={disabled}
        aria-label="년도"
        onChange={(e) => emit(clampInt(e.target.value, 9999), month, day)}
      />
      <span className={`${SIZE[size].text} text-tertiary`} aria-hidden>/</span>
      <input
        className={inputCls}
        style={{ width: "var(--wds-datetime-field-w)" }}
        value={month}
        disabled={disabled}
        aria-label="월"
        onChange={(e) => emit(year, clampInt(e.target.value, 12), day)}
      />
      <span className={`${SIZE[size].text} text-tertiary`} aria-hidden>/</span>
      <input
        className={inputCls}
        style={{ width: "var(--wds-datetime-field-w)" }}
        value={day}
        disabled={disabled}
        aria-label="일"
        onChange={(e) => emit(year, month, clampInt(e.target.value, 31))}
      />
      {onCalendarClick && (
        <button
          type="button"
          onClick={onCalendarClick}
          disabled={disabled}
          aria-label="달력 열기"
          className="flex items-center justify-center cursor-pointer"
          style={{ width: 20, height: 20, border: "none", background: "transparent", padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="var(--color-text-tertiary)" />
            <path d="M2 6.5h12M5.5 2v2M10.5 2v2" stroke="var(--color-text-tertiary)" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

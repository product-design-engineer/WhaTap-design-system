/**
 * WebDateLabel — 마케팅 날짜 표시 라벨.
 *
 * ## Purpose
 * 마케팅 페이지(사례·리소스·뉴스 등)에서 날짜를 표시하는 공통 컴포넌트.
 * 캘린더 아이콘 + YYYY-MM-DD 포맷을 일관되게 보여준다.
 *
 * ## Spec
 * 캘린더 아이콘(12px) + 날짜 텍스트를 인라인으로 나란히 배치한다.
 * CSS 클래스 `wds-web-date-label` 로 스타일링.
 *
 * | size   | 아이콘 | 글자           | 용도               |
 * |--------|--------|----------------|--------------------|
 * | sm     | 12px   | caption        | 카드 목록 날짜      |
 * | md     | 14px   | body-sm        | 상세 페이지 날짜    |
 *
 * ## When to use
 * - 사례·리소스 카드의 날짜 표시.
 * - 상세 페이지 헤더의 날짜.
 * - 뉴스·공지 목록의 날짜.
 *
 * ## When NOT to use
 * - 제품 UI 의 시간 범위 선택 → [[TimeRangeSelector]].
 * - 입력용 날짜 필드 → [[DatePicker]].
 *
 * ## Composition rules
 * - 아이콘 색은 텍스트와 동일 — currentColor 상속.
 * - `<time>` 시맨틱 태그 사용 — `dateTime` 속성에 ISO 날짜 전달.
 * - 공통 정책(2026-06-30): 모든 YYYY-MM-DD 날짜에 캘린더 아이콘 필수.
 *
 * @example
 * ```tsx
 * <WebDateLabel date="2025-05-23" />
 * <WebDateLabel date="2025-05-23" size="md" />
 * ```
 */

export type WebDateLabelSize = "sm" | "md";

export type WebDateLabelProps = {
  /** ISO 날짜 문자열 (YYYY-MM-DD). */
  date: string | null | undefined;
  /** 사이즈. sm=카드 목록, md=상세 페이지. 기본 sm. */
  size?: WebDateLabelSize;
  /** 외부 className. */
  className?: string;
};

export default function WebDateLabel({
  date,
  size = "sm",
  className = "",
}: WebDateLabelProps) {
  if (!date) return null;

  return (
    <time
      className={`wds-web-date-label${size === "md" ? " wds-web-date-label--md" : ""} ${className}`.trim()}
      dateTime={date}
    >
      <CalendarIcon size={size === "md" ? 14 : 12} />
      <span>{date}</span>
    </time>
  );
}

function CalendarIcon({ size }: { size: number }) {
  return (
    <svg
      className="wds-web-date-label-icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

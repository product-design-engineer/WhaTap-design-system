/**
 * WebSearchField — 마케팅 사이트 검색 입력 필드.
 *
 * ## Purpose
 * whatap.io 마케팅 페이지(제품·리소스·사례 등)에서 목록을 필터링하는 검색 입력창.
 * 돋보기 아이콘 + 텍스트 입력 + 클리어 버튼을 하나의 컴포넌트로 제공한다.
 *
 * ## Spec
 * 원본 Webflow 의 `.list-search-field` · `.platform-search-input` 를 통합한 것이다.
 *
 * | size | 높이   | 글자           | 용도               |
 * |------|--------|----------------|--------------------|
 * | sm   | 40px   | body-sm        | 모바일 인라인 필터   |
 * | md   | 48px   | body           | 기본 검색창         |
 * | lg   | 52px   | body           | 히어로 내 검색창     |
 *
 * ## When to use
 * - 마케팅 페이지에서 카드·목록·플랫폼을 실시간 필터링할 때.
 * - 리소스 목록, 제품 지원 플랫폼, 사례 목록 등의 검색.
 *
 * ## When NOT to use
 * - 제품 UI 의 검색 → [[Autocomplete]] 또는 [[FilterBar]].
 * - 전역 사이트 검색(검색 결과 페이지 이동) → 별도 SearchModal.
 *
 * ## Composition rules
 * - 값 변경은 `value` + `onChange` controlled 패턴.
 * - 값이 비어 있지 않으면 클리어(✕) 버튼이 자동 표시.
 * - `placeholder` 기본값은 "검색".
 * - 돋보기 아이콘은 항상 왼쪽에 표시.
 *
 * @example
 * ```tsx
 * <WebSearchField
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="플랫폼 검색"
 * />
 * ```
 */
import type { InputHTMLAttributes } from "react";

export type WebSearchFieldSize = "sm" | "md" | "lg";

export type WebSearchFieldProps = {
  /** 입력값. */
  value: string;
  /** 값 변경 콜백 — 문자열을 직접 전달한다. */
  onChange: (value: string) => void;
  /** 사이즈. sm(40px) · md(48px, 기본) · lg(52px). */
  size?: WebSearchFieldSize;
  /** placeholder 텍스트. 기본 "검색". */
  placeholder?: string;
  /** 외부 className. */
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size" | "type"
>;

function SearchIcon() {
  return (
    <svg
      className="wds-web-search-field-icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.5 12.5 16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function WebSearchField({
  value,
  onChange,
  size = "md",
  placeholder = "검색",
  className = "",
  ...rest
}: WebSearchFieldProps) {
  const cls = [
    "wds-web-search-field",
    size !== "md" ? `wds-web-search-field--${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <SearchIcon />
      <input
        className="wds-web-search-field-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...rest}
      />
      {value && (
        <button
          className="wds-web-search-field-clear"
          type="button"
          onClick={() => onChange("")}
          aria-label="검색 초기화"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}

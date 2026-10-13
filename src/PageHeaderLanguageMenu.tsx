import { useState } from "react";

/** 언어 선택지 한 줄. `label` 은 그 언어 «자기 이름» 으로 쓴다(한국어 · English · 日本語). */
export type LanguageOption = { code: string; label: string };

/**
 * PageHeaderLanguageMenu — Chrome / Parts. [[PageHeader]] 우측의 언어 설정 트리거 + 드롭다운.
 *
 * ## Purpose
 * 지구본 아이콘(24px) 하나로 화면 언어를 고른다. 누르면 선택지가 아래로 펴지고,
 * 지금 언어에는 체크가 붙는다. 알림 벨 · 아바타와 같은 24px 아이콘 트리거 문법이라
 * 헤더 오른쪽 줄의 크기와 간격이 그대로 유지된다.
 *
 * ## When to use
 * - [[PageHeader]] 의 `language` prop 으로 켠다 (기본 용법). 보통 단독 사용하지 않음.
 * - 제품 화면 언어를 사람이 직접 바꾸는 자리.
 *
 * ## When NOT to use
 * - 마케팅(로그인 전) 공개 페이지의 언어 전환 → [[LandingHeader]] 쪽 문법을 따른다.
 * - 데이터 필터처럼 값을 고르는 폼 → [[Select]].
 *
 * ## Composition rules
 * - 선택지 라벨은 그 언어 자기 이름으로 적는다. 「영어」 처럼 지금 언어로 번역하면, 읽지 못하는 언어로
 *   들어온 사람이 자기 언어를 찾지 못한다.
 * - 열림/닫힘은 이 컴포넌트가 가진다. 고른 값의 저장과 화면 반영은 소비 레이어가 `onChange` 에서 한다.
 * - 색·배경은 토큰/기정의 클래스(`text-primary` · `hover-bg-surface-100` · `--color-text-secondary`) — 새 클래스 금지.
 *
 * @example
 * ```tsx
 * <PageHeaderLanguageMenu
 *   value="ko"
 *   options={[{ code: "ko", label: "한국어" }, { code: "en", label: "English" }, { code: "ja", label: "日本語" }]}
 *   onChange={setLang}
 * />
 * ```
 */
export default function PageHeaderLanguageMenu({
  value,
  options,
  onChange,
  title = "Language",
}: {
  /** 지금 언어 코드. */
  value: string;
  /** 선택지. 라벨은 그 언어 자기 이름. */
  options: LanguageOption[];
  /** 다른 언어를 고르면 그 코드로 부른다. 같은 언어를 다시 고르면 부르지 않는다. */
  onChange?: (code: string) => void;
  /** 드롭다운 머리글이자 트리거의 접근성 이름. 기본 "Language". */
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0 size-24px">
      <button
        type="button"
        aria-label={title}
        aria-haspopup="menu"
        aria-expanded={open}
        className="size-24px flex items-center justify-center cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.25" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
          <path d="M3.75 12H20.25" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
          <path
            d="M12 3.75C14.2 6 15.3 8.75 15.3 12C15.3 15.25 14.2 18 12 20.25C9.8 18 8.7 15.25 8.7 12C8.7 8.75 9.8 6 12 3.75Z"
            stroke="var(--color-text-secondary)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-32px z-50 min-w-200px rounded-8px border border-color-var-color-border-default bg-card py-4px shadow-md"
          >
            <div className="px-14px py-6px text-xs text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>{title}</div>
            {options.map((o) => {
              const on = o.code === value;
              return (
                <button
                  key={o.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  onClick={() => {
                    setOpen(false);
                    if (!on) onChange?.(o.code);
                  }}
                  className="flex items-center justify-between gap-12px w-full text-left px-14px py-8px text-md text-primary tracking-default cursor-pointer hover-bg-surface-100 whitespace-nowrap"
                  style={{ fontFamily: "var(--font-family-korean)" }}
                >
                  <span>{o.label}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ visibility: on ? "visible" : "hidden" }}>
                    <path d="M3.5 8.25L6.5 11.25L12.5 5" stroke="var(--color-brand-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * AiAssistantButton — WhaTap AI 위젯 토글 (그라데이션 보더 버튼).
 *
 * ## Purpose
 * PageHeader 우측의 'WhaTap AI' 버튼을 컴포넌트로 추출. AI 위젯 열림/닫힘 토글 trigger.
 * `.ai-assistant-btn` CSS class (src/index.css) 의 정교한 gradient border 애니메이션을 재사용.
 *
 * ## When to use
 * - PageHeader 우측 — `<PageHeader>` 내부 통합 권장.
 * - 다른 위치에서 AI 위젯 호출 trigger 가 필요할 때.
 *
 * ## When NOT to use
 * - 일반 CTA 버튼 → [[Button]] (variant=contained · tone=primary).
 * - AI 위젯 내부의 다른 액션 → [[AiSendButton]] 등.
 *
 * ## Composition rules
 * - `aiActive` prop 으로 위젯 열림 상태 표시 — `.is-active` class 가 추가되어 강조 그라데이션 활성.
 * - 라벨은 기본 "WhaTap AI" — 한국어/영어 따로 필요하면 children override.
 * - 아이콘은 `/icons/ai-btn-icon.svg` + `ai-btn-icon-hover.svg` (라이브 디자인 시스템 자산).
 *
 * @example
 * ```tsx
 * const [active, setActive] = useState(false);
 * <AiAssistantButton aiActive={active} onClick={() => setActive(v => !v)} />
 * ```
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type AiAssistantButtonProps = {
  /** 위젯 열림 상태 — true 면 `.is-active` 강조 그라데이션 활성. */
  aiActive?: boolean;
  /** 버튼 라벨 (기본 "WhaTap AI"). */
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export default function AiAssistantButton({
  aiActive = false,
  children = "WhaTap AI",
  className = "",
  ...rest
}: AiAssistantButtonProps) {
  return (
    <button
      type={rest.type ?? "button"}
      aria-pressed={aiActive}
      className={`ai-assistant-btn group flex items-center justify-center gap-[4px] h-[32px] px-[16px] rounded-[24px] bg-white cursor-pointer relative overflow-visible${aiActive ? " is-active" : ""} ${className}`}
      {...rest}
    >
      <div className="relative shrink-0 size-[16px] z-10">
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full transition-opacity group-hover:opacity-0 group-[.is-active]:opacity-0"
          src="/icons/ai-btn-icon.svg"
        />
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full transition-opacity opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100"
          src="/icons/ai-btn-icon-hover.svg"
        />
      </div>
      <span
        className="text-md tracking-default leading-none whitespace-nowrap relative z-10 transition-colors text-brand-blue group-hover:text-white group-[.is-active]:text-white"
        style={{
          fontFamily: "var(--font-family-korean)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {children}
      </span>
    </button>
  );
}

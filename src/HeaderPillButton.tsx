import type { ReactNode, ButtonHTMLAttributes } from "react";

/**
 * HeaderPillButton — Chrome / Foundation. [[PageHeader]] · [[PageHeaderAiInline]] 공용 알약형 버튼.
 *
 * ## Purpose
 * 페이지 헤더(48px) 안의 "Docs" · "고객지원" 등 알약형(pill) 텍스트 버튼을 렌더.
 * 32px 높이 · rounded-full · 1px divider 보더 · hover 배경 전환.
 * 양쪽 헤더에서 동일한 마크업이 중복되어 있던 것을 한 곳으로 추출.
 *
 * ## When to use
 * - [[PageHeader]] · [[PageHeaderAiInline]] 내부의 Docs / 고객지원 버튼 렌더 (기본 용법).
 * - 48px 헤더 안에서 **동일한 알약 버튼 외형**이 필요한 경우.
 *
 * ## When NOT to use
 * - **일반 액션 버튼** (contained/outline/basic) → [[Button]].
 * - **AI 위젯 토글** → [[AiAssistantButton]].
 * - **AI 송신** → [[AiSendButton]].
 * - **48px 헤더 밖** 에서의 pill 버튼 — 높이/패딩이 헤더 전용 spec.
 *
 * ## Composition rules
 * - `icon` + `children`(라벨) 으로 구성 — 아이콘은 16px SVG ReactNode.
 * - 높이 32px · `rounded-full` · `border-color-var-color-border-divider` · `bg-card` — 토큰 기반.
 * - hover 는 `hover-bg-surface-100 transition-colors`.
 * - 폰트는 `text-md`(13px) · `--font-family-korean` · `--font-weight-medium`.
 *
 * @example
 * ```tsx
 * <HeaderPillButton icon={<DocsIcon />}>Docs</HeaderPillButton>
 * <HeaderPillButton icon={<SupportIcon />}>고객지원</HeaderPillButton>
 * ```
 */
export default function HeaderPillButton({
  icon,
  children,
  ...rest
}: {
  icon: ReactNode;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex items-center justify-center gap-4px h-32px px-16px py-8px rounded-full border border-color-var-color-border-divider bg-card text-md text-primary tracking-default cursor-pointer whitespace-nowrap hover-bg-surface-100 transition-colors"
      style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
      {...rest}
    >
      <span className="shrink-0 flex items-center justify-center size-16px">{icon}</span>
      {children}
    </button>
  );
}

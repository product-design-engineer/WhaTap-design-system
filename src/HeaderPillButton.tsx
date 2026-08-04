import type { ReactNode, ButtonHTMLAttributes } from "react";

/**
 * HeaderPillButton — Chrome / Foundation. [[PageHeader]] · [[PageHeaderAiInline]] 공용 알약형 버튼.
 *
 * ## Purpose
 * 페이지 헤더(48px) 안의 "Docs" · "고객지원" 등 알약형(pill) 텍스트 버튼을 렌더.
 * `size="sm"`(24px, 헤더 기본) / `"md"`(32px) · rounded-full · 1px divider 보더 · hover 배경 전환.
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
export type HeaderPillButtonSize = "md" | "sm";

/**
 * 사이즈별 규격 — [[AiAssistantButton]] 의 SIZE 맵과 같은 단계를 쓴다.
 * 헤더 한 줄에 두 컴포넌트가 나란히 놓이므로 스케일이 갈라지면 안 된다.
 * (DS 사이즈 스케일: 36 / 32 / 24 / 20 — 그 사이의 임의값 금지)
 */
const SIZE: Record<HeaderPillButtonSize, { box: string; icon: string; text: string }> = {
  md: { box: "h-32px px-16px", icon: "size-16px", text: "text-md" },
  sm: { box: "h-24px px-12px", icon: "size-14px", text: "text-base" },
};

export default function HeaderPillButton({
  icon,
  children,
  size = "md",
  ...rest
}: {
  icon: ReactNode;
  children: ReactNode;
  /** 사이즈. 기본 `"md"`(32px). 헤더 컨트롤 축소 시 `"sm"`(24px). */
  size?: HeaderPillButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const spec = SIZE[size];
  return (
    <button
      className={`flex items-center justify-center gap-4px ${spec.box} rounded-full border border-color-var-color-border-divider bg-card ${spec.text} text-primary tracking-default cursor-pointer whitespace-nowrap hover-bg-surface-100 transition-colors`}
      style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
      {...rest}
    >
      <span className={`shrink-0 flex items-center justify-center ${spec.icon}`}>{icon}</span>
      {children}
    </button>
  );
}

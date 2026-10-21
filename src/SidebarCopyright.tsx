/**
 * SidebarCopyright — Chrome / Foundation. [[Sidebar]] 하단 24px 저작권 푸터.
 *
 * ## Purpose
 * 사이드바 최하단의 24px 저작권 텍스트 행을 렌더. "Copyright {year} WhaTap" 한 줄.
 * collapsed(40px) 시 Sidebar 가 숨김 처리 — 텍스트이므로 최소화 형태 없음.
 *
 * ## When to use
 * - [[Sidebar]] 최하단에서 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 저작권 행**이 필요한 경우 (예: 풋터 영역).
 * - `year` prop 으로 연도 제어 (기본 2026).
 *
 * ## When NOT to use
 * - **collapsed(40px) 사이드바** — 텍스트를 40px에 표시할 수 없으므로 Sidebar 가 자동 숨김. 이 컴포넌트에 collapsed prop 없음.
 * - **본문 메뉴 / 스위처 / 레일** → 해당 Sidebar 하위 컴포넌트 사용.
 * - **긴 법적 고지** — 이 컴포넌트는 한 줄 저작권 전용. 멀티라인 법적 고지는 별도 영역.
 *
 * ## Composition rules
 * - 폰트는 **Roboto**(numeric family) — 영문 저작권 표기 전용. 한국어 폰트 사용하지 않음.
 * - 색은 토큰 (`text-tertiary` · `bg-card` · `border-color-var-color-border-default`) — 인라인 hex 금지.
 * - 높이 24px 고정 (`h-24px`). 사이드바 전체 높이 계산에 포함.
 *
 * @example
 * ```tsx
 * <SidebarCopyright />
 * <SidebarCopyright year={2026} />
 * ```
 */
import type { ReactNode } from "react";

const ROBOTO = "Roboto, sans-serif";

export default function SidebarCopyright({
  year = 2026,
  text,
}: {
  /** 기본 문구 `Copyright {year} WhaTap` 의 연도. 기본 2026. `text` 를 주면 쓰이지 않는다. */
  year?: number;
  /**
   * 문구 전체를 갈아 끼운다. 미지정이면 `Copyright {year} WhaTap`.
   *
   * 저작권 주체가 다른 제품(별도 랜딩을 가진 TF 등)이 쓴다. 문구만 바꾸는 자리이므로
   * 높이(24px)와 타이포는 그대로 둔다 — 여기가 길어지면 사이드바 높이 계산이 어긋난다.
   */
  text?: ReactNode;
}) {
  return (
    <div className="flex h-24px items-center p-8px shrink-0 w-full bg-card border-r border-t border-color-var-color-border-default">
      <p
        className="text-sm text-tertiary whitespace-nowrap leading-none"
        style={{ fontFamily: ROBOTO, fontWeight: "var(--font-weight-regular)" }}
      >
        {text ?? `Copyright ${year} WhaTap`}
      </p>
    </div>
  );
}

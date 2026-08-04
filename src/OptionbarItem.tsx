import type { ReactNode } from "react";

/**
 * OptionbarItem — Chrome / Foundation. [[OptionbarPage]] 의 단일 옵션 항목 래퍼.
 *
 * ## Purpose
 * 옵션바 행의 각 항목을 "타이틀(12px bold) + 콘텐츠(chrome)" 로 감싼다. 기본 배치는 **inline**
 * (타이틀이 값 좌측). 세로 스택이 필요하면 `layout="stack"`.
 * 시간 · 인스턴스 · 데이터베이스 · 프리셋 등 모든 옵션 항목이 이 래퍼를 공유.
 *
 * ## When to use
 * - [[OptionbarPage]] 내부에서 각 항목을 감쌀 때 (기본 용법).
 * - 옵션바 밖에서 **동일한 title + content 세로 스택**이 필요한 경우.
 *
 * ## When NOT to use
 * - **옵션바 전체 행** → [[OptionbarPage]].
 * - **title 없이 content 만** — `title=""` 전달하면 타이틀 숨김 처리.
 * - **필터 바 항목** → [[FilterBar]] 의 드롭다운/검색 슬롯.
 *
 * ## Composition rules
 * - `title` + `children` 구조 — title 이 빈 문자열이면 타이틀 행 숨김.
 * - 타이틀은 `text-base`(12px) `font-bold` `text-primary` — 옵션바 타이포 위계.
 * - children 은 같은 `size` chrome 으로 baseline 통일 (LiveTimerCompact · InstanceSelector 등, 기본 24px).
 * - `layout="inline"`(**기본**): 타이틀을 콘텐츠 좌측에 나란히(가로) 배치, chrome 높이 기준 수직 중앙 정렬.
 * - `layout="stack"`: 타이틀 위 / 콘텐츠 아래 세로 스택, gap 6px. 세로 폭이 넉넉한 자리에서만.
 *
 * @example
 * ```tsx
 * <OptionbarItem title="시간">
 *   <LiveTimerCompact time="12:01:35" />
 * </OptionbarItem>
 * ```
 */
/** 옵션바 행 chrome 공용 사이즈 — md(32px, 기본) / sm(24px). 행의 모든 컨트롤이 이 값을 공유한다. */
export type OptionbarSize = "sm" | "md";

export default function OptionbarItem({
  title,
  children,
  layout = "inline",
}: {
  title: string;
  children: ReactNode;
  /** inline: 타이틀을 콘텐츠 좌측에 나란히(**기본**) · stack: 타이틀 위·콘텐츠 아래 */
  layout?: "stack" | "inline";
}) {
  if (layout === "inline") {
    return (
      <div className="flex flex-row items-center gap-6px">
        {title && (
          <div
            className="text-base font-bold text-primary tracking-default leading-none shrink-0"
            style={{ fontFamily: "var(--font-family-korean)" }}
          >
            {title}
          </div>
        )}
        {children}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6px">
      {title && (
        <div
          className="text-base font-bold text-primary tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

/**
 * OptionbarItem — Chrome / Foundation. [[OptionbarPage]] 의 단일 옵션 항목 래퍼.
 *
 * ## Purpose
 * 옵션바 행의 각 항목을 "타이틀(12px bold) + 콘텐츠(32px chrome)" 세로 스택으로 감싼다.
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
 * - children 은 32px height chrome 으로 baseline 통일 (LiveTimerCompact · InstanceSelector 등).
 * - gap 6px (타이틀 ↔ 콘텐츠).
 *
 * @example
 * ```tsx
 * <OptionbarItem title="시간">
 *   <LiveTimerCompact time="12:01:35" />
 * </OptionbarItem>
 * ```
 */
export default function OptionbarItem({ title, children }: { title: string; children: ReactNode }) {
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

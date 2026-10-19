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
 * - `layout="auto"`: **행의 가로 폭으로 자동 결정** — 넉넉하면 inline(라벨 좌측), 좁아지면 stack.
 *   기준은 뷰포트가 아니라 행이 실제로 쓸 수 있는 폭이다(container query). 그래서 AI 위젯이
 *   열려 행이 좁아지면 같은 화면에서도 라벨이 위로 접힌다. **부모 행에 `.wds-optionbar-row`
 *   가 있어야 한다**([[OptionbarPage]] 는 이미 붙인다). 컨테이너가 없으면 stack 으로 남는다 —
 *   폭을 모르는 상태에서 라벨을 옆에 두면 값이 잘리므로, 모를 때는 접는 쪽이 안전하다.
 *
 * @example
 * ```tsx
 * <OptionbarItem title="시간">
 *   <LiveTimerCompact time="12:01:35" />
 * </OptionbarItem>
 * ```
 */
/**
 * 옵션바 행 chrome 공용 사이즈 — 행의 모든 컨트롤이 이 값을 공유한다.
 *
 * 컨트롤 공통 스케일(feedback-control-size-scale)을 그대로 따른다 — sm 24 / md 28 / lg 32.
 * `lg` 는 Product-prototype 사본에만 있던 값이라 이관하며 합쳤다(2026-09-11). 한쪽에만 있으면
 * 같은 옵션바가 repo 마다 다른 높이로 선다.
 */
export type OptionbarSize = "sm" | "md" | "lg";

export default function OptionbarItem({
  title,
  children,
  layout = "inline",
}: {
  /** 항목 제목 (12px bold, 예: 「기간」 · 「인스턴스」). 빈 문자열이면 제목을 그리지 않는다. */
  title: string;
  /** 제목 옆(또는 아래)에 놓일 컨트롤 — Select · DatePicker · 인스턴스 선택 등. */
  children: ReactNode;
  /** inline: 타이틀을 콘텐츠 좌측에 나란히(**기본**) · stack: 타이틀 위·콘텐츠 아래 · auto: 행 폭으로 자동 전환 */
  layout?: "stack" | "inline" | "auto";
}) {
  /* auto — 배치를 JS 가 아니라 CSS(container query)가 정한다. JS 로 폭을 재면 위젯 열림·
     사이드바 접힘마다 리렌더가 필요하고, 첫 페인트에서 한 번 틀린 배치가 보인다. */
  if (layout === "auto") {
    return (
      <div className="wds-optionbar-item-auto">
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

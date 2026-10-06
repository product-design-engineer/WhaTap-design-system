/**
 * Disclosure — Primitives layer.
 *
 * ## Purpose
 * 한 줄 머리말을 눌러 그 아래 내용을 펼치고 접는 덩어리. 머리말은 늘 보이고, 내용은 펼쳤을 때만
 * 선다. 「있다는 것은 알리되, 지금 읽을 필요는 없는 것」 을 화면에 남겨 두는 자리다.
 *
 * 소비 앱이 [[Button]] 텍스트형에 「펼치기 / 접기」 낱말을 붙여 흉내 내던 자리를 대신한다.
 * 그렇게 짜면 화면마다 열림 표시(낱말 · 화살표 · 없음)가 갈리고, `aria-expanded` 가 빠져
 * 화면 읽기 도구는 지금 펼쳐졌는지 알 수 없었다.
 *
 * ## When to use
 * - 목록에서 고를 수 없는 항목 · 지난 항목처럼 «왜 없지» 의 답이 될 뿐 평소엔 읽지 않는 묶음
 * - 폼의 고급 설정 · 부가 설명처럼 대부분이 건드리지 않는 입력
 * - 카드 안에서 근거 · 상세를 접어 두고 요약만 먼저 보일 때
 *
 * ## When NOT to use
 * - 화면의 주요 내용을 접어 두지 않는다 → 사람이 할 일이 접힌 쪽에 있으면 그 일을 찾지 못한다
 * - 여러 구획 중 하나만 보여야 할 때 → [[Tabs]]. 펼침은 서로 배타적이지 않다
 * - 떠서 다른 내용을 덮어야 할 때 → [[Modal]] · 드롭다운. 이것은 흐름 안에서 아래를 밀어낸다
 * - 짧은 한두 문장 설명 → [[Tooltip]] 이나 그냥 적는다. 한 줄을 접으면 펼치는 수고가 읽는 수고보다 크다
 *
 * ## Composition rules
 * - **머리말은 접힌 것이 무엇인지와 그 양을 말한다**(「다른 플랜에 속한 프로젝트 15」). 「더 보기」
 *   만 적으면 펼치기 전에는 열 가치가 있는지 알 수 없다
 * - **머리말에 「펼치기 · 접기」 낱말을 넣지 않는다.** 열림은 화살표와 `aria-expanded` 가 말한다.
 *   낱말까지 바뀌면 같은 자리의 글자가 눌릴 때마다 달라져 머리말을 다시 읽어야 한다
 * - 기본은 접힘이다. 처음부터 펼쳐 둘 것이면 접을 이유가 없는 내용이다
 * - 검색처럼 «찾는 것이 안에 있다» 가 분명할 때만 `open` 으로 펼쳐 준다. 그 밖에는 사람이 정한
 *   열림을 화면이 바꾸지 않는다
 * - 머리말 안에 다른 버튼 · 링크를 넣지 않는다. 머리말 전체가 하나의 버튼이다
 *
 * @example
 * ```tsx
 * <Disclosure summary="다른 플랜에 속한 프로젝트 15">
 *   <ul>
 *     <li>주문 API · 운영팀 플랜</li>
 *   </ul>
 * </Disclosure>
 * ```
 */
import { useId, useState, type ReactNode } from "react";

export type DisclosureSize = "sm" | "md";

export type DisclosureProps = {
  /** 늘 보이는 머리말. 접힌 것이 무엇인지와 그 양을 적는다. */
  summary: ReactNode;
  /** 펼쳤을 때만 서는 내용. */
  children: ReactNode;
  /** 제어 모드의 열림. 주면 `defaultOpen` 은 무시된다. */
  open?: boolean;
  /** 비제어 모드의 처음 열림. 기본 접힘. */
  defaultOpen?: boolean;
  /** 머리말을 누를 때. 다음 열림 값을 받는다. */
  onOpenChange?: (open: boolean) => void;
  /** 머리말 글자 크기. `sm` 은 캡션 · 좁은 패널용. */
  size?: DisclosureSize;
  disabled?: boolean;
  className?: string;
};

export default function Disclosure({
  summary,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  size = "md",
  disabled = false,
  className = "",
}: DisclosureProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = open ?? internal;
  const panelId = useId();

  const toggle = () => {
    if (disabled) return;
    const next = !isOpen;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <div className={`wds-disclosure ${className}`.trim()}>
      <button
        type="button"
        className={`wds-disclosure-trigger inline-flex items-center gap-4px select-none ${size === "sm" ? "text-sm" : "text-base"}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        onClick={toggle}
      >
        {/* 열림 표시는 화살표 하나다. 접힘 → 오른쪽, 펼침 → 아래. 색은 글자를 따른다(currentColor). */}
        <svg className="wds-disclosure-chevron shrink-0" width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{summary}</span>
      </button>
      {/* 접혔을 때는 내용을 그리지 않는다. 숨긴 채 두면 탭 이동이 보이지 않는 칸으로 들어간다. */}
      {isOpen && (
        <div id={panelId} className="wds-disclosure-panel">
          {children}
        </div>
      )}
    </div>
  );
}

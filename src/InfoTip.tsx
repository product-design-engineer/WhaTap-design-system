import type { ReactNode } from "react";
import Tooltip, { type TooltipPlacement } from "./Tooltip";

/**
 * InfoTip — Composite. 글자 옆에 붙는 **ⓘ 아이콘 버튼**과 [[Tooltip]] 의 묶음.
 *
 * ## Purpose
 * 값 · 라벨 · 문장에 보조 설명을 달 때 트리거를 하나로 정한다. 원 안에 영문 i 가 든 16px 버튼이고,
 * hover · focus 하면 툴팁이 열린다.
 *
 * ## When to use
 * - 라벨이나 값 옆에 «왜 이런 값인지» 를 한두 문장으로 덧붙일 때.
 * - 「외 N」 처럼 접어 둔 목록의 나머지를 보여 줄 때.
 * - 폼 칸 · 읽기 칸 · 표 머리 · 문단 끝 어디서나 같은 모양으로.
 *
 * ## When NOT to use
 * - 아이콘만 있는 버튼의 이름표 → 그 버튼에 [[Tooltip]] 을 직접 씌운다([[ToolbarIconButton]] 은 내장).
 * - 사람이 꼭 읽어야 하는 경고 · 차단 이유 → 본문에 [[Notice]] 로. 숨기면 안 읽는다.
 * - 누르면 무언가 실행되는 자리 → [[Button]]. InfoTip 은 열어 보기만 한다.
 *
 * ## Composition rules
 * - **툴팁 트리거를 밑줄(점선 · 실선)로 표현하지 않는다.** 밑줄은 링크로 읽히고, 어디까지가 트리거인지
 *   경계가 흐리다. 설명이 붙는 글자는 밑줄 없이 두고 그 바로 뒤에 InfoTip 을 둔다(patterns §16).
 * - 글자와 사이 4px(`gap: 4px` 줄 안에 함께 둔다). 글자 줄 높이 가운데에 맞춘다.
 * - 색은 `--color-text-tertiary`, hover · focus 에 `--color-text-secondary`. 포커스 링은 brand-blue 2px.
 * - `label` 은 스크린리더 이름이다. 생략하면 「도움말」. 툴팁 본문과 같은 문장을 넣지 않는다 —
 *   본문은 `aria-describedby` 로 따로 읽힌다.
 * - 버튼이 폼 안에 있어도 제출하지 않는다(`type="button"`).
 *
 * @example
 * ```tsx
 * <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
 *   한계 금액 200,000원
 *   <InfoTip content="종량제 사용량 한계는 기본 크레딧이 소진된 후 누적 사용액에 적용됩니다." />
 * </span>
 * ```
 */
export type InfoTipProps = {
  /** 툴팁 본문 — 1-2 문장. 줄을 가르려면 `<br />`. */
  content: ReactNode;
  /** 스크린리더 이름. default 「도움말」. */
  label?: string;
  /** 툴팁 배치 — default top. */
  placement?: TooltipPlacement;
  /** 강제 표시 (Storybook · 디자인 확인용). */
  open?: boolean;
  className?: string;
};

export default function InfoTip({ content, label = "도움말", placement = "top", open, className }: InfoTipProps) {
  return (
    <Tooltip content={content} placement={placement} open={open}>
      <button type="button" aria-label={label} className={`wds-info-tip ${className ?? ""}`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6 5.3v3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="6" cy="3.6" r="0.7" fill="currentColor" />
        </svg>
      </button>
    </Tooltip>
  );
}

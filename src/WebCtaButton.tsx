/**
 * WebCtaButton — 마케팅 사이트 CTA 버튼.
 *
 * ## Purpose
 * whatap.io 마케팅 페이지(랜딩·제품·사례 등)에서 쓰는 행동 유도(CTA) 버튼.
 * 제품 UI 의 [[Button]] 과 별개다 — 제품은 밀도가 높고 sm~xl(20~36px) 사이즈를 쓰지만,
 * 마케팅은 시선을 끌어야 하므로 md~lg(50~60px) 사이즈에 오른쪽 화살표가 붙는다.
 *
 * ## Spec
 * 원본 Webflow 의 `.primary-button` · `.line-button-blue` 를 React 컴포넌트로 올린 것이다.
 * variant × size 조합으로 패딩·높이·글자 크기가 결정된다.
 *
 * | variant   | 용도                         | 배경            | 글자          |
 * |-----------|------------------------------|-----------------|---------------|
 * | filled    | 1차 CTA (무료로 시작하기 등)  | brand-blue 채움 | 흰색          |
 * | outline   | 2차 CTA (문서 보기 등)        | 투명 + 보더     | brand-blue    |
 * | white     | 어두운 배경 위 CTA            | 흰색            | brand-blue    |
 *
 * | size | 높이   | 글자   | 용도            |
 * |------|--------|--------|-----------------|
 * | sm   | 36px   | 14px   | 네비게이션 인라인 |
 * | md   | 50px   | 16px   | 섹션 내         |
 * | lg   | 60px   | 20px   | 히어로 CTA      |
 *
 * ## When to use
 * - 마케팅 페이지의 주요 행동 유도: "무료로 시작하기", "도입 문의", "체험하기" 등.
 * - 히어로 슬라이드, 피처 섹션, 배너 등에서 링크 목적지로 이동할 때.
 * - `<a>` 로 렌더되므로 SPA 라우터 링크에도 `renderAs` 로 교체 가능.
 *
 * ## When NOT to use
 * - 로그인 후 제품 UI 의 버튼 → [[Button]].
 * - AI 위젯 그라데이션 토글 → [[TriggerButton]].
 * - 텍스트 링크 (밑줄만) → `<a>` 직접 사용.
 * - icon-only 버튼 → 인라인 OK.
 *
 * ## Composition rules
 * - 색은 토큰만 — `--color-brand-blue-web` · `--color-brand-blue-web-deep` · `--color-white`.
 * - 화살표 아이콘은 기본으로 켜진다. `arrow={false}` 로 끌 수 있다.
 * - 한 섹션에 filled 는 하나. 나머지는 outline 또는 white.
 * - `href` 가 필수다. 클릭 핸들러만 필요하면 `href="#"` + `onClick`.
 * - `renderAs` 로 SPA 라우터 컴포넌트를 주입할 수 있다.
 *
 * @example
 * ```tsx
 * <WebCtaButton href="/signup" size="lg">
 *   무료로 시작하기
 * </WebCtaButton>
 * <WebCtaButton href="/docs" variant="outline" size="md">
 *   문서 보기
 * </WebCtaButton>
 * <WebCtaButton href="/demo" variant="white" size="lg">
 *   WhaTap AI 체험하기
 * </WebCtaButton>
 * ```
 */
import type { ReactNode, AnchorHTMLAttributes, ElementType } from "react";

export type WebCtaVariant = "filled" | "outline" | "white";
export type WebCtaSize = "sm" | "md" | "lg";
export type WebCtaRounded = "pill" | "rect";
export type WebCtaWidth = "hug" | "full";

export type WebCtaButtonProps = {
  /** 시각 variant. filled=채움(1차), outline=보더(2차), white=흰색(어두운 배경). */
  variant?: WebCtaVariant;
  /** 사이즈 — sm(36px) · md(50px) · lg(60px). */
  size?: WebCtaSize;
  /** 모서리 — pill(99px, 기본) · rect(4px). */
  rounded?: WebCtaRounded;
  /** 너비 — hug(콘텐츠 맞춤, 기본) · full(부모 100%). */
  width?: WebCtaWidth;
  /** 오른쪽 화살표 표시 여부. 기본 true. */
  arrow?: boolean;
  /** 이동 목적지. */
  href: string;
  /** SPA 라우터 링크 컴포넌트 주입용. 기본 "a". */
  renderAs?: ElementType;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">;

function ArrowIcon() {
  return (
    <svg
      className="wds-web-cta-arrow"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.167 10h11.666M10.833 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WebCtaButton({
  variant = "filled",
  size = "lg",
  rounded = "pill",
  width = "hug",
  arrow = true,
  href,
  renderAs: Tag = "a",
  className = "",
  children,
  ...rest
}: WebCtaButtonProps) {
  const cls = [
    "wds-web-cta",
    `wds-web-cta--${variant}`,
    `wds-web-cta--${size}`,
    rounded === "rect" ? "wds-web-cta--rect" : "",
    `wds-web-cta--${width}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <Tag href={href} className={cls} {...rest}>
      <span className="wds-web-cta-label">{children}</span>
      {arrow && <ArrowIcon />}
    </Tag>
  );
}

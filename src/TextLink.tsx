import type { MouseEventHandler, ReactNode } from "react";

/**
 * TextLink — 문장 안에서 다음 동선을 바로 여는 링크. Primitives layer.
 *
 * ## Purpose
 * 안내 문장에는 사람이 «다음에 어디로 가야 하는지» 가 이미 적혀 있다 — 「플랜 관리자에게 요청」,
 * 「mysql-v2-test 플랜」. 그 낱말을 그냥 글자로 두면 사람은 읽고 나서 메뉴를 다시 찾아간다.
 * 동선이 예측되는 낱말 자체를 링크로 만들어 읽은 자리에서 바로 이동하게 한다.
 * `href` 를 주면 `<a>`, `onClick` 만 주면 `<button type="button">` 으로 그린다 — 모양은 같다.
 *
 * ## When to use
 * - 안내 · 경고 문장 안에서 가리키는 대상이 화면으로 존재할 때 (플랜 · 프로젝트 · 관리자 · 설정 화면).
 * - 문장이 「~에서 ~하세요」 처럼 이동을 시킬 때, 그 「~」 자리.
 * - [[AiCard]] `tone` 안내 카드 · [[Notice]] 의 설명 줄 안.
 *
 * ## When NOT to use
 * - 카드의 주 행동(누르면 무언가 실행되는 것) → [[Button]]. 링크는 이동만 한다.
 * - 보조 설명을 열어 보는 자리 → [[InfoTip]]. 밑줄 · 파란 글자는 이동으로 읽힌다.
 * - 문장 전체 · 「여기」「자세히」 같은 빈 낱말. 링크 글자만 읽어도 어디로 가는지 알아야 한다.
 * - 표 행 · 카드 전체를 누르는 자리 → 그 행/카드의 클릭으로.
 *
 * ## Composition rules
 * - **링크는 문장 속 명사구에 건다.** 「플랜 관리자」 처럼 도착지를 부르는 낱말. 조사 · 동사는 링크 밖.
 * - 같은 카드에 [[Button]] 이 같은 곳으로 보내면 링크를 걸지 않는다 — 한 도착지에 입구 둘은 «다른 곳» 으로 읽힌다.
 * - 한 문장에 링크 2개까지. 그보다 많으면 문장이 메뉴가 된다.
 * - 글자 크기 · 굵기는 둘러싼 문장을 따른다(`font: inherit`) — 제목 안이면 굵게, 설명 안이면 보통. 색은 `--color-text-link` 하나 — 톤 표면 위에서도 4.5:1.
 * - 밑줄은 hover · focus 에만. 포커스 링은 brand-blue 2px.
 * - 새 창(`external`)은 제품 밖 문서로 갈 때만 — `rel="noopener noreferrer"` 가 함께 붙는다.
 *
 * @example
 * ```tsx
 * <p>
 *   내가 만든 플랜이 없으면 <TextLink href="/account/plans">플랜 관리자</TextLink>에게 범위 추가를 요청해 주세요.
 * </p>
 * <TextLink onClick={openPlan}>mysql-v2-test 외 1</TextLink>
 * ```
 */
export type TextLinkProps = {
  /** 링크 글자 — 도착지를 부르는 명사구. */
  children: ReactNode;
  /** 이동할 주소. 주면 `<a>` 로 그린다. */
  href?: string;
  /** 라우터 이동 등 코드로 옮길 때. `href` 없이 주면 `<button>` 으로 그린다. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** 제품 밖 문서 — 새 창으로 연다. `href` 와 함께만. */
  external?: boolean;
  /** 외부 className. */
  className?: string;
};

export default function TextLink({ children, href, onClick, external = false, className }: TextLinkProps) {
  const cls = `wds-text-link ${className ?? ""}`;
  if (href !== undefined) {
    return (
      <a
        className={cls}
        href={href}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

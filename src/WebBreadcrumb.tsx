/**
 * WebBreadcrumb — 마케팅 사이트 브레드크럼 내비게이션.
 *
 * ## Purpose
 * whatap.io 마케팅 페이지 상단에서 현재 위치를 보여주는 경로 탐색 컴포넌트.
 * 홈을 제외한 **모든 페이지에 필수** 적용하는 공통 정책(2026-06-30).
 *
 * ## Spec
 * 원본 Webflow 의 `.breadcrumb-nav` · `.breadcrum-link` 를 React 컴포넌트로 올린 것이다.
 * 구분자는 `/`, 마지막 항목은 현재 페이지(링크 없음).
 *
 * | 항목       | 값              |
 * |------------|-----------------|
 * | 높이       | 40px (태블릿 36px) |
 * | 글자 크기   | caption (13px)  |
 * | 글자 색    | gray-600        |
 * | 구분자     | `/` opacity 0.4 |
 *
 * ## When to use
 * - 홈을 제외한 모든 마케팅 페이지 최상단.
 * - 제품·사례·리소스·뉴스·정책·지원 등.
 *
 * ## When NOT to use
 * - 홈 페이지 (`/ko`).
 * - 제품 UI 내부 (SaaS 앱).
 *
 * ## Composition rules
 * - `items` 배열: `{ label, href }`. `href`가 null이면 현재 페이지(텍스트만).
 * - 첫 항목의 `href`가 생략되면 자동으로 `"/ko"`(홈) 링크.
 * - `renderLink` prop으로 SPA 라우터 링크 교체 가능.
 * - CSS 클래스 `wds-web-breadcrumb` 로 스타일링. 컨테이너 포함.
 *
 * @example
 * ```tsx
 * // 기본 — string 배열
 * <WebBreadcrumb items={["와탭랩스", "고객 사례"]} />
 *
 * // 링크 지정
 * <WebBreadcrumb
 *   items={[
 *     { label: "와탭랩스", href: "/ko" },
 *     { label: "고객 사례", href: "/ko/case" },
 *     { label: "LG유플러스", href: null },
 *   ]}
 * />
 *
 * // SPA 라우터 연동
 * <WebBreadcrumb
 *   items={[{ label: "와탭랩스", href: "/ko" }, { label: "프라이싱", href: null }]}
 *   renderLink={(href, children) => <Link to={href}>{children}</Link>}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type WebBreadcrumbItem = { label: string; href: string | null };

export type WebBreadcrumbProps = {
  /** 경로 항목. string 배열이면 마지막만 현재 페이지(링크 없음), 첫 항목은 홈 링크. */
  items: (string | WebBreadcrumbItem)[];
  /** 링크 지정 (string[] 호출 시). items[i]에 대응하는 href. 미지정이면 첫 항목만 "/ko". */
  links?: (string | null)[];
  /** SPA 라우터 링크 렌더. 기본은 `<a>`. */
  renderLink?: (href: string, children: ReactNode) => ReactNode;
  /** 외부 className. */
  className?: string;
};

export default function WebBreadcrumb({
  items,
  links,
  renderLink,
  className = "",
}: WebBreadcrumbProps) {
  const resolved: WebBreadcrumbItem[] = items.map((item, i) => {
    if (typeof item === "object") return item;
    return {
      label: item,
      href: links?.[i] ?? (i === 0 ? "/ko" : null),
    };
  });

  const render = renderLink ?? ((href: string, children: ReactNode) => (
    <a href={href}>{children}</a>
  ));

  return (
    <nav className={`wds-web-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <div className="wds-web-section-container">
        <ol className="wds-web-breadcrumb-list">
          {resolved.map((item, i) => (
            <li key={i} className="wds-web-breadcrumb-item">
              {i > 0 && <span className="wds-web-breadcrumb-sep" aria-hidden="true">/</span>}
              {item.href
                ? render(item.href, item.label)
                : <span aria-current="page">{item.label}</span>}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

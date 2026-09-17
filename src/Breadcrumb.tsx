import type { CSSProperties, ReactNode } from "react";

export type BreadcrumbItem = {
  label: string;
  /** 링크로 만들 주소. 없으면 글자만 그린다. 마지막 항목은 href 가 있어도 링크로 만들지 않는다. */
  href?: string | null;
};

/**
 * Breadcrumb — 페이지가 사이트 어디에 있는지 보이는 한 줄 띠.
 *
 * ## Purpose
 * 제품·사례·리소스·약관처럼 계층이 있는 화면의 맨 위에서 현재 위치를 알린다.
 * 마지막 항목이 현재 페이지이며 링크가 아니다.
 *
 * ## When to use
 * - 마케팅 사이트의 하위 페이지 상단(히어로 바로 위)
 * - 목록 → 상세로 들어온 화면에서 되돌아갈 길을 보일 때
 *
 * ## When NOT to use
 * - 최상위 페이지(홈) → 계층이 없으므로 그리지 않는다
 * - 단계가 있는 작업 흐름 → 브레드크럼이 아니라 스텝 표시를 쓴다
 * - 제품 대시보드의 화면 전환 → [[SubHeaderBar]] 를 쓴다
 *
 * ## Composition rules
 * - `items` 가 비면 아무것도 그리지 않는다 — 빈 띠가 여백을 한 겹 만들지 않게.
 * - 링크 부품은 소비앱이 정한다(`renderLink`). 기본은 평범한 `<a>` 다.
 *   해시 라우터·SPA 라우터를 쓰는 앱은 자기 Link 를 넘긴다.
 * - 높이 40px(모바일 36px) 고정. 안의 글자는 세로 가운데.
 * - 색·글자 크기는 마케팅 계열 토큰을 쓴다(`--color-web-*` · `--text-web-*`).
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[{ label: "홈", href: "/ko" }, { label: "제품", href: "/ko/products" }, { label: "APM" }]}
 *   renderLink={(href, cls, children) => <A href={href} className={cls}>{children}</A>}
 * />
 * ```
 */
export default function Breadcrumb({
  items,
  renderLink,
}: {
  items: BreadcrumbItem[];
  /** 소비앱의 라우터 링크를 끼우는 자리. 주지 않으면 `<a href>` 로 그린다. */
  renderLink?: (href: string, style: CSSProperties, children: ReactNode) => ReactNode;
}) {
  if (items.length === 0) return null;

  const bar: CSSProperties = {
    borderBottom: "1px solid var(--color-web-gray-100)",
    backgroundColor: "var(--color-white)",
    height: 40,
    display: "flex",
  };
  const container: CSSProperties = {
    width: "100%",
    maxWidth: "var(--container-web-max)",
    height: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "var(--container-web-pad)",
    paddingRight: "var(--container-web-pad)",
    position: "relative",
  };
  const menu: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  };
  const link: CSSProperties = {
    height: "100%",
    color: "var(--color-web-gray-600)",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
    fontSize: "var(--text-web-sm)",
    textDecoration: "none",
    display: "flex",
  };
  const current: CSSProperties = {
    ...link,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "var(--font-weight-bold)" as CSSProperties["fontWeight"],
  };

  return (
    <section style={{ zIndex: 1 }}>
      <div style={bar} role="banner" aria-label="Breadcrumb">
        <div style={container}>
          <div style={menu}>
            {items.map((it, i) => {
              const last = i === items.length - 1;
              return (
                <span key={`${it.label}-${i}`} style={{ display: "contents" }}>
                  {i > 0 && <Chevron />}
                  {it.href && !last
                    ? renderLink
                      ? renderLink(it.href, link, it.label)
                      : <a href={it.href} style={link}>{it.label}</a>
                    : <div style={last ? current : link}>{it.label}</div>}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 항목 사이의 꺾쇠. 장식이므로 aria-hidden. */
function Chevron() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ width: 10, marginLeft: 10, marginRight: 10, flex: "none" }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

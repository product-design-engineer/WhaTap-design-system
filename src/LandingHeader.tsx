/**
 * LandingHeader — Composite layer. 마케팅 사이트의 sticky 상단 바.
 *
 * ## Purpose
 * 랜딩·블로그·리소스 등 **로그인 전 공개 페이지**가 공유하는 60px 헤더. 좌측은 로고(+제품
 * 라벨), 우측은 nav · 테마 토글 · 로그인 · 가입 CTA. 스크롤 시 본문이 비치도록 반투명
 * 배경 + `backdrop-filter` 를 쓴다.
 *
 * ## When to use
 * - 제품 셸(사이드바) 없이 뷰포트 전폭을 쓰는 공개 페이지의 상단 바.
 * - 같은 헤더를 여러 페이지(랜딩·목록·상세)가 공유해야 할 때.
 *
 * ## When NOT to use
 * - 로그인 후 제품 화면의 헤더 → [[PageHeader]] (48px, [[DashboardLayout]] 의 `header` 슬롯).
 * - 뒤로가기/브레드크럼 보조 네비 행 → [[SubHeaderBar]].
 * - 시간·프리셋 등 데이터 필터 → `OptionbarPage` / [[FilterBar]].
 *
 * ## Composition rules
 * - 링크 목록·CTA·로고는 **전부 prop 으로 받는다.** 마케팅 문구와 목적지는 제품마다 다르므로
 *   컴포넌트 안에 상수로 두지 않는다.
 * - 테마 토글은 `themeToggle` 슬롯으로 주입 — 테마 상태는 페이지가 소유한다(루트의
 *   `data-theme` 와 로고 반전이 페이지 전체에 걸리기 때문). [[ThemeToggle]] 을 넣으면 된다.
 * - 색은 토큰 (`--color-header-translucent` · `--color-text-*` · `--color-border-default`).
 *   CTA 그라디언트만 `--color-brand-blue` → `--color-whatap-purple` 고정.
 * - 640px 미만에서는 nav 가 햄버거 시트로 접히고 로고가 심볼만 남는다. 1024px 미만에서는
 *   제품 라벨이 숨는다 — CTA 두 개가 들어갈 자리를 뺏기 때문이다.
 * - 페이지에서 인라인 `<header>` 로 재구현 금지. 한쪽만 고쳐져 갈라진 전례가 있다.
 * - **조상에 `overflow-x: hidden` 을 두면 sticky 가 죽는다.** `hidden` 은 스크롤 컨테이너를
 *   만들어, 헤더가 뷰포트가 아니라 그 컨테이너를 기준으로 붙기 때문이다. 가로 넘침을 잘라야
 *   하면 `overflow-x: clip` 을 쓴다 — 잘라내되 스크롤 컨테이너를 만들지 않는다. 소비앱에서
 *   실제로 이것 때문에 헤더가 스크롤에 밀려 올라갔다.
 *
 * @example
 * ```tsx
 * <LandingHeader
 *   logo={<img src="/icons/whatap-logo.svg" alt="WhaTap" height={20} />}
 *   logoCompact={<img src="/icons/whatap-symbol.svg" alt="WhaTap" height={24} />}
 *   productLabel="URL Monitoring"
 *   currentPath="/resource"
 *   nav={[
 *     { label: "Blog", href: "/blog" },
 *     { label: "Docs", href: "https://docs.whatap.io/", newTab: true },
 *     { label: "Resources", href: "/resource" },
 *   ]}
 *   themeToggle={<ThemeToggle value={theme} onChange={setTheme} />}
 *   signIn={{ label: "Sign in", href: "/login" }}
 *   cta={{ label: "Get started free", href: "/signup" }}
 * />
 * ```
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

export type LandingHeaderNavItem = {
  label: string;
  href: string;
  /** 사이트 바깥으로 나가는 링크만 true. 같은 사이트는 현재 탭을 유지한다. */
  newTab?: boolean;
  /** 계측 등 부가 동작. 이동은 href 가 담당한다. */
  onClick?: () => void;
};

export type LandingHeaderAction = {
  label: string;
  href: string;
  onClick?: () => void;
};

export type LandingHeaderProps = {
  /** 로고 — 640px 이상에서 노출. 보통 워드마크. */
  logo: ReactNode;
  /** 640px 미만에서 대신 노출할 축약 로고(심볼). 없으면 `logo` 를 그대로 쓴다. */
  logoCompact?: ReactNode;
  /** 로고 옆 제품 이름. 1024px 이상에서만 노출. */
  productLabel?: string;
  /** 로고 클릭 목적지. 기본 `/`. */
  homeHref?: string;
  /** 상단 메뉴. 비우면 nav 와 햄버거가 모두 사라진다. */
  nav?: LandingHeaderNavItem[];
  /** 현재 경로 — 일치하는 메뉴에 `aria-current="page"` 를 준다. */
  currentPath?: string;
  /** 테마 토글 슬롯. 테마 상태는 페이지가 소유한다. */
  themeToggle?: ReactNode;
  /** 640px 미만에서 쓸 축약 테마 토글. 없으면 `themeToggle` 이 항상 노출된다. */
  themeToggleCompact?: ReactNode;
  /** 로그인 링크 (라벨 · 주소 · 부가 onClick). 테마 토글 오른쪽 텍스트 링크. 없으면 생략. */
  signIn?: LandingHeaderAction;
  /** 맨 오른쪽 주 행동 링크 (예: 「무료 체험」, `wds-landing-header-cta`). 없으면 생략. */
  cta?: LandingHeaderAction;
  /** 루트 `<header>`(`wds-landing-header`)에 덧붙는 클래스 — 배치(위치 · 여백)용. 색 · 크기 override 금지. */
  className?: string;
};

export default function LandingHeader({
  logo,
  logoCompact,
  productLabel,
  homeHref = "/",
  nav = [],
  currentPath,
  themeToggle,
  themeToggleCompact,
  signIn,
  cta,
  className,
}: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // 시트 닫기 — Escape · 헤더 바깥 클릭 · 640px 이상으로 넓어질 때.
  // 넓어질 때도 닫는 이유: CSS 로 숨기기만 하면 다시 좁아졌을 때 열린 채로 나타난다.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 640px)");
    const onMq = () => { if (mq.matches) setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      mq.removeEventListener("change", onMq);
    };
  }, [menuOpen]);

  const current = (href: string) => (currentPath === href ? { "aria-current": "page" as const } : {});
  const target = (item: LandingHeaderNavItem) =>
    item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <header
      ref={headerRef}
      className={`wds-landing-header${className ? ` ${className}` : ""}`}
      data-menu-open={menuOpen ? "true" : "false"}
    >
      <div className="wds-landing-header-inner">
        <a href={homeHref} className="wds-landing-header-brand text-xl font-bold">
          {logoCompact ? (
            <>
              <span className="sm-hidden">{logoCompact}</span>
              <span className="sm-only">{logo}</span>
            </>
          ) : (
            logo
          )}
          {productLabel && (
            <span className="wds-landing-header-product">
              <span aria-hidden className="wds-landing-header-divider" />
              <span className="text-md font-medium">{productLabel}</span>
            </span>
          )}
        </a>

        <div className="wds-landing-header-actions">
          {nav.length > 0 && (
            <nav className="wds-landing-header-nav">
              {nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...target(item)}
                  {...current(item.href)}
                  onClick={item.onClick}
                  className="wds-landing-header-navlink text-md font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {themeToggle && (
            themeToggleCompact ? (
              <>
                <span className="sm-only">{themeToggle}</span>
                <span className="sm-hidden">{themeToggleCompact}</span>
              </>
            ) : (
              themeToggle
            )
          )}

          {signIn && (
            <a
              href={signIn.href}
              onClick={signIn.onClick}
              className="wds-landing-header-signin text-md font-medium"
            >
              {signIn.label}
            </a>
          )}

          {cta && (
            <a href={cta.href} onClick={cta.onClick} className="wds-landing-header-cta text-md">
              {cta.label}
            </a>
          )}

          {nav.length > 0 && (
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="wds-landing-header-sheet"
              onClick={() => setMenuOpen((v) => !v)}
              className="wds-landing-header-iconbtn wds-landing-header-menubtn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                {menuOpen ? (
                  <><line x1="3.5" y1="3.5" x2="12.5" y2="12.5" /><line x1="12.5" y1="3.5" x2="3.5" y2="12.5" /></>
                ) : (
                  <><line x1="2.5" y1="4.5" x2="13.5" y2="4.5" /><line x1="2.5" y1="8" x2="13.5" y2="8" /><line x1="2.5" y1="11.5" x2="13.5" y2="11.5" /></>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {menuOpen && nav.length > 0 && (
        <div id="wds-landing-header-sheet" className="wds-landing-header-sheet">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...target(item)}
              {...current(item.href)}
              onClick={() => { item.onClick?.(); setMenuOpen(false); }}
              className="wds-landing-header-navlink text-md font-medium"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

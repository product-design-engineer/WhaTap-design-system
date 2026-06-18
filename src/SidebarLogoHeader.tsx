/**
 * SidebarLogoHeader — Chrome / Foundation. [[Sidebar]] 최상단 48px 로고 헤더.
 *
 * ## Purpose
 * 사이드바 최상단의 48px 로고 영역을 렌더. [[PageHeader]](48px)와 동일 높이로 정렬.
 * `collapsed=false` 면 풀 로고(126×24), `collapsed=true` 면 심볼(24×24)만 표시.
 *
 * ## When to use
 * - [[Sidebar]] 최상단에서 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 WhaTap 로고 헤더**가 필요한 경우 (예: 로그인 페이지, 모바일 헤더).
 * - collapsed(40px) · 펼침(240px) **양쪽 모두** 표시 — `collapsed` prop 으로 자동 전환.
 *
 * ## When NOT to use
 * - **페이지 헤더**(타이틀 + AI 버튼 + 알림) → [[PageHeader]] / [[PageHeaderAiInline]].
 * - **조직/프로젝트 스위처** → [[SidebarOrgSwitcher]] / [[SidebarProjectSwitcher]].
 * - **로고만 단독** (사이드바 chrome 없이) — 직접 `<img>` 사용.
 *
 * ## Composition rules
 * - 높이 48px 고정 (`h-48px box-border`) — PageHeader 와 행 정렬 보장.
 * - 펼침 시 `width: 240px`, collapsed 시 `width: 40px` — 부모 Sidebar 의 `width` 를 따름.
 * - 배경은 `bg-card`, 보더는 `border-r border-b` 토큰 — 인라인 hex 금지.
 * - 아이콘은 표준 경로 (`/icons/whatap-logo.svg`, `/icons/whatap-symbol.svg`).
 *
 * @example
 * ```tsx
 * <SidebarLogoHeader collapsed={false} width={240} />
 * <SidebarLogoHeader collapsed={true} width={40} />
 * ```
 */

const icon = (name: string) => `/icons/${name}`;

export default function SidebarLogoHeader({
  collapsed = false,
  width = 240,
}: {
  /** true면 심볼(24px)만, false면 풀 로고(126×24). */
  collapsed?: boolean;
  /** 헤더 폭 — Sidebar의 현재 width와 동기화. */
  width?: number;
}) {
  return (
    <div
      className="flex items-center h-48px box-border shrink-0 bg-card border-r border-b border-color-var-color-border-default"
      style={{
        width,
        justifyContent: collapsed ? "center" : "flex-start",
        paddingInline: collapsed ? 0 : 8,
      }}
    >
      {collapsed ? (
        <img
          alt="WhaTap"
          src={icon("whatap-symbol.svg")}
          style={{ width: 24, height: 24 }}
        />
      ) : (
        <img
          alt="WhaTap"
          src={icon("whatap-logo.svg")}
          style={{ width: 126, height: 24 }}
        />
      )}
    </div>
  );
}

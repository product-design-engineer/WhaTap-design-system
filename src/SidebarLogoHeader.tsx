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
 * - collapsed(Min, 80px) · 펼침(240px) **양쪽 모두** 표시 — `collapsed` prop 으로 자동 전환.
 *
 * ## When NOT to use
 * - **페이지 헤더**(타이틀 + AI 버튼 + 알림) → [[PageHeader]] / [[PageHeaderAiInline]].
 * - **조직/프로젝트 스위처** → [[SidebarOrgSwitcher]] / [[SidebarProjectSwitcher]].
 * - **로고만 단독** (사이드바 chrome 없이) — 직접 `<img>` 사용.
 *
 * ## Composition rules
 * - 높이 48px 고정 (`h-48px box-border`) — PageHeader 와 행 정렬 보장.
 * - 펼침 시 `width: 240px`, collapsed 시 `width: 80px` — 부모 Sidebar 의 `width` 를 따름.
 * - 배경은 `bg-card`, 보더는 `border-r border-b` 토큰 — 인라인 hex 금지.
 * - 아이콘은 표준 경로 (`/icons/whatap-logo.svg`, `/icons/whatap-symbol.svg`).
 * - `onToggle` 주입 시 사이드바(패널) 토글 버튼을 렌더 — 펼침이면 로고 우측, collapsed 면
 *   심볼 우측에 나란히. 아이콘은 접힘/펼침 동일(회전 없음), 미주입 시 로고/심볼만(기존 standalone 용법).
 *
 * @example
 * ```tsx
 * <SidebarLogoHeader collapsed={false} width={240} onToggle={collapse} />
 * <SidebarLogoHeader collapsed={true} width={80} onToggle={expand} />
 * <SidebarLogoHeader collapsed={false} width={240} />   // 토글 없는 로고 전용
 * ```
 */

const icon = (name: string) => `/icons/${name}`;

export default function SidebarLogoHeader({
  collapsed = false,
  width = 240,
  onToggle,
}: {
  /** true면 심볼(24px)만, false면 풀 로고(126×24). */
  collapsed?: boolean;
  /** 헤더 폭 — Sidebar의 현재 width와 동기화. */
  width?: number;
  /** 접기/펴기 토글 핸들러. 주입 시 헤더에 사이드바(패널) 토글 버튼을 렌더(미주입 시 로고 전용). */
  onToggle?: () => void;
}) {
  const toggleButton = onToggle ? (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
      title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
      className="flex items-center justify-center shrink-0 cursor-pointer hover-bg-surface-100"
      style={{ width: 24, height: 24, borderRadius: 4 }}
    >
      {/* sidebar(패널) 아이콘 — 접힘/펼침 동일, 회전 없이 토글 전용 */}
      <img
        alt=""
        src={icon("sidebar.svg")}
        style={{ width: 16, height: 16 }}
      />
    </button>
  ) : null;

  return (
    <div
      className="flex items-center h-48px box-border shrink-0 bg-card border-r border-b border-color-var-color-border-default"
      style={{
        width,
        justifyContent: collapsed ? "center" : "space-between",
        paddingInline: collapsed ? 0 : 8,
        gap: collapsed ? 8 : 0,
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
      {toggleButton}
    </div>
  );
}

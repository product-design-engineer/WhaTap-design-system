import type { ProfileMenuItem } from "./PageHeader";

/**
 * PageHeaderProfileMenuItem — Chrome / Parts. [[PageHeader]] 프로필(아바타) 드롭다운의 한 항목(행).
 *
 * ## Purpose
 * 프로필 드롭다운 메뉴의 단일 항목을 렌더 — 라벨만 표시하는 좌측정렬 버튼.
 * [[PageHeader]] 의 `profileMenu.map` 인라인 마크업을 한 곳으로 모은 순수 UI 컴포넌트.
 * 드롭다운 열림/닫힘 제어는 부모([[PageHeader]])가 보유하고, 이 컴포넌트는 항목 1건만 그린다.
 *
 * ## When to use
 * - [[PageHeader]] 가 `profileMenu.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 프로필 메뉴 항목 외형이 필요한 다른 드롭다운 목록 표면.
 *
 * ## When NOT to use
 * - 알림(벨) 드롭다운 항목(도트 포함) → [[PageHeaderNotificationItem]].
 * - 사이드바 메뉴 행 → [[SidebarMenuItem]].
 *
 * ## Composition rules
 * - 데이터(`ProfileMenuItem`)와 `onClick` 만 주입 — 행 외형/정렬은 이 컴포넌트가 책임.
 * - 드롭다운 닫기 등 상태 제어는 부모가 `onClick` 핸들러로 전달 (이 컴포넌트는 상태 비보유).
 * - 색·배경은 토큰/기정의 클래스 (`text-primary` · `hover-bg-surface-100`) — 새 클래스 금지.
 *
 * @example
 * ```tsx
 * {profileMenu.map((it) => (
 *   <PageHeaderProfileMenuItem
 *     key={it.label}
 *     item={it}
 *     onClick={() => { setProfileOpen(false); it.onClick?.(); }}
 *   />
 * ))}
 * ```
 */
export default function PageHeaderProfileMenuItem({
  item,
  onClick,
}: {
  item: ProfileMenuItem;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left px-14px py-8px text-md text-primary tracking-default cursor-pointer hover-bg-surface-100 whitespace-nowrap"
      style={{ fontFamily: "var(--font-family-korean)" }}
    >
      {item.label}
    </button>
  );
}

/**
 * BottomRailItem — Chrome / Foundation. [[Sidebar]] 좌측 40px 제품 레일 하단의 유틸 아이콘 항목.
 *
 * ## Purpose
 * 제품 레일(40px 폭) 하단에 쌓이는 유틸 아이콘 칸을 렌더. 40px×32px 칸 + 20px 아이콘.
 * 사용자 추가 · 테마 전환 · 전체화면 등 글로벌 유틸 액션.
 * collapsed/펼침 무관하게 항상 표시 — [[ProductRailItem]] 과 함께 레일의 상시 가시 요소.
 *
 * ## When to use
 * - [[Sidebar]] 가 `BOTTOM_RAIL_ICONS.map` 으로 항목마다 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 유틸 아이콘 칸**이 필요한 경우 (예: 플로팅 툴바).
 * - collapsed(40px) · 펼침(240px) **양쪽 모두** 표시 — 이 컴포넌트 자체는 상태 불변.
 *
 * ## When NOT to use
 * - **상단 제품 아이콘 칸** (40px 정사각 + active 강조) → [[ProductRailItem]].
 * - **사이드바 본문 메뉴 행** → [[SidebarMenuItem]].
 * - **조직/프로젝트 스위처** → [[SidebarOrgSwitcher]] / [[SidebarProjectSwitcher]].
 * - `hideProductRail=true` 화면 — Sidebar 가 레일 전체를 숨김.
 *
 * ## Composition rules
 * - 아이콘 파일명(`name`)만 주입 — 칸 크기(40px×32px)/hover 는 이 컴포넌트가 책임.
 * - hover 는 토큰 (`hover-bg-surface-100`) — 인라인 hex 금지.
 * - 아이콘은 표준 경로(`/icons/*`).
 * - active 강조 없음 (ProductRailItem 과 차이) — 유틸 액션은 토글 상태가 아니라 즉시 실행.
 *
 * @example
 * ```tsx
 * {BOTTOM_RAIL_ICONS.map((name) => (
 *   <BottomRailItem key={name} name={name} />
 * ))}
 * ```
 */

const icon = (name: string) => `/icons/${name}`;

export default function BottomRailItem({
  name,
  onClick,
}: {
  /** 유틸 아이콘 파일명 (e.g. "bottom-theme.svg"). 표준 경로(`/icons/*`)로 참조. */
  name: string;
  /** 클릭 핸들러. 미지정 시 정적. */
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex h-32px items-center justify-center shrink-0 w-40px cursor-pointer hover-bg-surface-100"
    >
      <img alt="" className="size-20px" src={icon(name)} />
    </div>
  );
}

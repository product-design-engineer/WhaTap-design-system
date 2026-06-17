/**
 * BottomRailItem — Chrome / Foundation. [[Sidebar]] 좌측 40px 제품 레일 하단의 유틸 아이콘 항목.
 *
 * ## Purpose
 * 제품 레일(40px 폭) 하단에 쌓이는 유틸 아이콘 칸을 렌더. 인라인으로 흩어져 있던
 * `BOTTOM_RAIL_ICONS.map` 본문을 한 곳으로 모은 것 — 40px×32px 칸 + 20px 아이콘.
 *
 * ## When to use
 * - [[Sidebar]] 가 `BOTTOM_RAIL_ICONS.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 하단 레일 유틸 칸 외형이 필요한 다른 네비게이션 표면.
 *
 * ## When NOT to use
 * - 상단 제품 아이콘 칸(40px 정사각 + active 강조) → [[ProductRailItem]].
 * - 사이드바 본문 메뉴 행 → [[SidebarMenuItem]].
 *
 * ## Composition rules
 * - 아이콘 파일명(`name`)만 주입 — 칸 크기/hover 는 이 컴포넌트가 책임.
 * - 색·hover 는 토큰 (`hover-bg-surface-100`) — 인라인 hex 금지.
 * - 아이콘은 표준 경로(`/icons/*`).
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

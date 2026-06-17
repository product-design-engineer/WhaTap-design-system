/**
 * ProductRailItem — Chrome / Foundation. [[Sidebar]] 좌측 40px 제품 레일의 한 항목(40px 정사각).
 *
 * ## Purpose
 * 제품 레일(40px 폭)의 단일 제품 아이콘 칸을 렌더. 인라인으로 흩어져 있던
 * `PRODUCT_ICONS.map` 본문을 한 곳으로 모은 것 — 40px 정사각 + 24px 아이콘,
 * `active` 면 라이트블루 배경(`--color-brand-blue-bg`)으로 강조.
 *
 * ## When to use
 * - [[Sidebar]] 가 `PRODUCT_ICONS.map` 으로 제품마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 제품 레일 칸 외형이 필요한 다른 네비게이션 표면.
 *
 * ## When NOT to use
 * - 사이드바 본문 메뉴 행 → [[SidebarMenuItem]].
 * - 레일 하단 유틸 아이콘(32px) → [[BottomRailItem]].
 *
 * ## Composition rules
 * - 아이콘 파일명(`name`)만 주입 — 칸 크기/active 강조는 이 컴포넌트가 책임.
 * - 강조 배경은 토큰 (`--color-brand-blue-bg`) — 인라인 hex 금지.
 * - 아이콘은 표준 경로(`/icons/*`).
 *
 * @example
 * ```tsx
 * {PRODUCT_ICONS.map((name) => {
 *   const key = name.replace("product-", "").replace(".svg", "");
 *   return <ProductRailItem key={name} name={name} active={key === activeProduct} />;
 * })}
 * ```
 */

const icon = (name: string) => `/icons/${name}`;

export default function ProductRailItem({
  name,
  active = false,
  onClick,
}: {
  /** 제품 아이콘 파일명 (e.g. "product-gpu.svg"). 표준 경로(`/icons/*`)로 참조. */
  name: string;
  /** active 강조 (라이트블루 배경). 기본 false. */
  active?: boolean;
  /** 클릭 핸들러(제품 전환). 미지정 시 정적. */
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-center shrink-0 size-40px cursor-pointer hover-bg-surface-100"
      style={
        active
          ? { backgroundColor: "var(--color-brand-blue-bg)" }
          : undefined
      }
    >
      <img alt="" className="size-24px" src={icon(name)} />
    </div>
  );
}

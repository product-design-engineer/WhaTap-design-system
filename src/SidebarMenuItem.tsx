import type { MenuItem } from "./Sidebar";

/**
 * SidebarMenuItem — Chrome / Foundation. [[Sidebar]] 본문 메뉴 트리의 한 항목(행).
 *
 * ## Purpose
 * 사이드바(240px 펼침 상태) 본문의 단일 메뉴 행을 렌더. `MenuItem` 데이터 한 건을 받아
 * 세 형태 중 하나로 그린다 — 인라인으로 흩어져 있던 행 마크업을 한 곳으로 모은 것:
 *   1. **단일 항목** (`children` 없음) — 아이콘 + 라벨 (caret 없음). `active` 면 라이트블루 배경 강조.
 *   2. **확장 항목** (`children` 배열 있음) — 아이콘 + 라벨 + caret(▾, `expanded` 면 180° 회전).
 *   3. **자식 목록** (`expanded` && children.length>0) — 들여쓴 하위 행. `active` 자식은 bold.
 *
 * ## When to use
 * - [[Sidebar]] 가 `menu.map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 사이드바와 동일한 메뉴 행 외형이 필요한 다른 네비게이션 표면.
 *
 * ## When NOT to use
 * - collapsed(40px) 제품 레일 아이콘 → Sidebar 내부 레일이 별도 처리.
 * - 헤더/탭 등 비-사이드바 네비 → 해당 Chrome 컴포넌트 사용.
 *
 * ## Composition rules
 * - 데이터(`MenuItem`)만 주입 — 행 외형/들여쓰기/active 강조는 이 컴포넌트가 책임.
 * - 색·배경은 토큰 (`--color-brand-blue-bg` · `text-primary/secondary` · `hover-bg-surface-100`) — 인라인 hex 금지.
 * - 펼침 토글은 데이터(`expanded`)로 제어 — 행 자체는 표현용(상태 비보유).
 * - 아이콘은 표준 경로(`/icons/*`).
 *
 * @example
 * ```tsx
 * {menu.map((item) => <SidebarMenuItem key={item.label} item={item} />)}
 * ```
 */

const icon = (name: string) => `/icons/${name}`;
const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";
const NOTO_LIGHT = "'Noto Sans', sans-serif";

export default function SidebarMenuItem({ item }: { item: MenuItem }) {
  const hasChildren = Array.isArray(item.children);

  // 단일 항목 (펼침/접힘 caret 없음, e.g. "보고서")
  if (!hasChildren) {
    return (
      <div
        onClick={item.onClick}
        className="flex h-32px items-center overflow-clip p-8px shrink-0 w-full cursor-pointer hover-bg-surface-100"
        style={item.active ? { backgroundColor: "var(--color-brand-blue-bg)" } : undefined}
      >
        <div className="flex items-center shrink-0 size-20px justify-center">
          <img alt="" className="size-16px" src={icon(item.icon)} />
        </div>
        <div className="flex gap-4px items-center shrink-0">
          <p
            className={`text-md font-bold tracking-default whitespace-nowrap leading-none ${item.active ? "text-primary" : "text-secondary"}`}
            style={{ fontFamily: NOTO_SANS }}
          >
            {item.label}
          </p>
        </div>
      </div>
    );
  }

  // 확장 가능 항목 (caret-down, expanded 면 180° 회전)
  return (
    <div className="contents">
      <button className="flex flex-col items-start shrink-0 w-full cursor-pointer">
        <div className="flex h-32px items-center justify-between overflow-clip px-8px py-6px shrink-0 w-full hover-bg-surface-100">
          <div className="flex gap-4px items-start shrink-0">
            <div className="shrink-0 size-16px flex items-center justify-center">
              <img alt="" className="size-16px" src={icon(item.icon)} />
            </div>
            <p
              className="text-md font-bold text-secondary tracking-default whitespace-nowrap leading-none text-left"
              style={{ fontFamily: NOTO_SANS }}
            >
              {item.label}
            </p>
          </div>
          <div className="shrink-0 size-16px flex items-center justify-center">
            <img
              alt=""
              src={icon("caret-down.svg")}
              style={{
                width: 8,
                height: 5,
                transform: item.expanded ? "rotate(180deg)" : undefined,
              }}
            />
          </div>
        </div>
      </button>
      {item.expanded && (item.children?.length ?? 0) > 0 && (
        <div className="flex flex-col items-start shrink-0 w-full">
          {item.children!.map((c) => (
            <div
              key={c.label}
              onClick={c.onClick}
              className={
                c.active
                  ? "flex gap-4px h-28px items-center overflow-clip pl-28px pr-8px py-4px shrink-0 w-full cursor-pointer hover-bg-surface-100"
                  : "flex h-28px items-center overflow-clip pl-28px pr-8px py-4px shrink-0 w-full cursor-pointer hover-bg-surface-100"
              }
            >
              {c.active ? (
                <p
                  className="text-md font-bold text-primary tracking-default whitespace-pre leading-none"
                  style={{ fontFamily: NOTO_SANS }}
                >
                  {c.label}
                </p>
              ) : (
                <div className="flex gap-4px items-center shrink-0">
                  <p
                    className="text-md text-secondary tracking-default whitespace-nowrap leading-none"
                    style={{ fontFamily: NOTO_LIGHT, fontWeight: "var(--font-weight-regular)" }}
                  >
                    {c.label}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

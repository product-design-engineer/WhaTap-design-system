import { useState } from "react";
import type { MenuItem } from "./Sidebar";
import Tooltip from "./Tooltip";

/**
 * SidebarMenuItem — Chrome / Foundation. [[Sidebar]] 본문 메뉴 트리의 한 항목(행).
 *
 * ## Purpose
 * 사이드바(240px 펼침 상태) 본문의 단일 메뉴 행을 렌더. `MenuItem` 데이터 한 건을 받아
 * 세 형태 중 하나로 그린다:
 *   1. **단일 항목** (`children` 없음) — 아이콘 + 라벨 (caret 없음). `active` 면 라이트블루 배경 강조.
 *   2. **확장 항목** (`children` 배열 있음) — 아이콘 + 라벨 + caret(▾, 펼침이면 180° 회전). 행을 누르면 접히고 펴진다.
 *   3. **자식 목록** (`expanded` && children.length>0) — 들여쓴 하위 행(28px). `active` 자식은 bold + 라이트블루 배경(`--color-brand-blue-bg`) 강조 — 단일 항목과 동일 규칙.
 * `iconOnly`(Min/collapsed 사이드바용) 면 라벨·caret·자식 없이 32px 행 중앙에 아이콘만 렌더.
 * 자신 또는 자식 중 active 가 있으면 라이트블루 배경 강조, 라벨은 [[Tooltip]](placement right,
 * portal 이라 Sidebar 루트 overflow-hidden 에 잘리지 않음)으로 대체.
 *
 * ## When to use
 * - [[Sidebar]] 가 `menu.map` 으로 항목마다 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 메뉴 행 외형**이 필요한 경우 (예: 검색 결과 메뉴 트리, 사이트맵 팝오버).
 * - 메뉴 트리 1단계(부모 + children) 렌더 — 이 컴포넌트 하나가 부모 행 + 자식 목록을 모두 담당.
 *
 * ## When NOT to use
 * - **제품 레일 아이콘** → [[ProductRailItem]] (40px 폭 × 32px 높이, active 강조).
 * - **레일 하단 유틸 아이콘** → [[BottomRailItem]] (40px×32px).
 * - **조직/프로젝트 스위처** → [[SidebarOrgSwitcher]] / [[SidebarProjectSwitcher]].
 * - **헤더/탭 등 비-사이드바 네비** → [[PageHeader]] / [[Tabs]] 등 해당 Chrome 컴포넌트.
 * - **2단계 이상 중첩 메뉴** — 현재 1단계(부모→자식)만 지원. 깊은 트리는 구조 분리 필요.
 *
 * ## Composition rules
 * - 데이터(`MenuItem`)만 주입 — 행 외형(높이 32px/28px · 들여쓰기 · active 강조)은 이 컴포넌트가 책임.
 * - **글자 두께: 기본(비활성)=regular(`--font-weight-regular`), active 만 bold + `text-primary`.** 그룹 부모 라벨도 기본 regular.
 * - 색·배경은 토큰 (`--color-brand-blue-bg` · `text-primary/secondary` · `hover-bg-surface-100`) — 인라인 hex 금지.
 * - **펼침은 기본으로 이 컴포넌트가 갖는다.** `expanded` 는 «초기값» 이고, 부모 행을 누르면 스스로
 *   접히고 펴진다. 호출부가 아무것도 주지 않아도 caret 이 동작한다 — caret 이 보이는데 눌리지 않으면
 *   사용자는 화면이 고장난 것으로 읽는다.
 * - **현재 위치에 따라 펼침을 통제해야 하면 `onToggle` 을 준다.** 주는 순간 제어 모드가 되어 펼침은
 *   `expanded` 가 정하고 이 컴포넌트는 상태를 갖지 않는다. 「지금 보고 있는 화면의 부모는 항상
 *   펼쳐 둔다」 같은 규칙은 그 화면이 알고 있으므로 호출부가 가져가는 것이 맞다.
 * - 아이콘은 표준 경로(`/icons/*`).
 * - 자식 행은 `pl-28px` 들여쓰기 — 부모 아이콘(20px) + gap(8px) 정렬.
 *
 * @example
 * ```tsx
 * {menu.map((item) => <SidebarMenuItem key={item.label} item={item} />)}
 * ```
 */

const icon = (name: string) => `/icons/${name}`;
const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";
const NOTO_LIGHT = "'Noto Sans', sans-serif";

export default function SidebarMenuItem({
  item,
  iconOnly = false,
}: {
  item: MenuItem;
  /** Min(collapsed) 사이드바용 — 라벨·caret·자식 숨기고 아이콘만 32px 행 중앙 렌더. 라벨은 [[Tooltip]]. */
  iconOnly?: boolean;
}) {
  const hasChildren = Array.isArray(item.children);
  /* 3단 메뉴(묶음 제목이 있는 경우) 의 화면 행은 한 단계 더 들여쓴다. */
  const leafPad = item.children?.some((c) => c.group) ? "pl-38px" : "pl-28px";

  /* 펼침 상태 — 호출부가 `onToggle` 을 주면 제어 모드(펼침은 `expanded` 가 정함), 없으면 이 안에서
     갖는다. `expanded` 는 그 경우 초기값이다. 값이 뒤에 바뀌어도 사용자가 손으로 접은 것을
     되돌리지 않는다(그게 「사용자가 접었는데 라우팅 한 번에 다시 펴진다」를 막는다). */
  const controlled = typeof item.onToggle === "function";
  const [selfExpanded, setSelfExpanded] = useState(item.expanded ?? false);
  const isExpanded = controlled ? (item.expanded ?? false) : selfExpanded;
  const toggle = () => {
    if (controlled) item.onToggle!(!isExpanded);
    else setSelfExpanded((v) => !v);
  };

  // 아이콘 전용 행 (Min 사이드바) — 자식 active 도 부모 아이콘 강조로 승격.
  // 라벨은 우측 Tooltip — portal+fixed 라 Sidebar 루트 overflow-hidden 에 안 잘림.
  if (iconOnly) {
    const isActive = item.active || item.children?.some((c) => c.active);
    return (
      <Tooltip content={item.label} placement="right" block>
        <div
          onClick={item.onClick}
          className="flex h-32px items-center justify-center overflow-clip shrink-0 w-full cursor-pointer hover-bg-surface-100"
          style={isActive ? { backgroundColor: "var(--color-brand-blue-bg)" } : undefined}
        >
          <img alt={item.label} className="size-16px" src={icon(item.icon)} />
        </div>
      </Tooltip>
    );
  }

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
            className={`text-md tracking-default whitespace-nowrap leading-none ${item.active ? "font-bold text-primary" : "text-secondary"}`}
            style={
              item.active
                ? { fontFamily: NOTO_SANS }
                : { fontFamily: NOTO_LIGHT, fontWeight: "var(--font-weight-regular)" }
            }
          >
            {item.label}
          </p>
        </div>
      </div>
    );
  }

  // 확장 가능 항목 (caret-down, 펼침이면 180° 회전) — 행을 누르면 토글
  return (
    <div className="contents">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isExpanded}
        className="flex flex-col items-start shrink-0 w-full cursor-pointer"
      >
        <div className="flex h-32px items-center justify-between overflow-clip px-8px py-6px shrink-0 w-full hover-bg-surface-100">
          <div className="flex gap-4px items-start shrink-0">
            <div className="shrink-0 size-16px flex items-center justify-center">
              <img alt="" className="size-16px" src={icon(item.icon)} />
            </div>
            <p
              className="text-md text-secondary tracking-default whitespace-nowrap leading-none text-left"
              style={{ fontFamily: NOTO_LIGHT, fontWeight: "var(--font-weight-regular)" }}
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
                transform: isExpanded ? "rotate(180deg)" : undefined,
              }}
            />
          </div>
        </div>
      </button>
      {isExpanded && (item.children?.length ?? 0) > 0 && (
        <div className="flex flex-col items-start shrink-0 w-full">
          {/* 묶음 제목이 하나라도 있으면 화면 행은 한 단계 더 들어간다(3단 메뉴). */}
          {item.children!.map((c) =>
            c.group ? (
              /* 묶음 제목 — 누를 수 없고, 뒤따르는 형제가 이 묶음의 구성원이다. */
              <div
                key={c.label}
                className="flex h-28px items-center overflow-clip pl-18px pr-8px py-4px shrink-0 w-full"
              >
                <p
                  className="text-md font-medium text-tertiary tracking-default whitespace-nowrap leading-none"
                  style={{ fontFamily: NOTO_SANS }}
                >
                  {c.label}
                </p>
              </div>
            ) : (
            <div
              key={c.label}
              onClick={c.onClick}
              className={
                c.active
                  ? `flex gap-4px h-28px items-center overflow-clip ${leafPad} pr-8px py-4px shrink-0 w-full cursor-pointer hover-bg-surface-100`
                  : `flex h-28px items-center overflow-clip ${leafPad} pr-8px py-4px shrink-0 w-full cursor-pointer hover-bg-surface-100`
              }
              style={c.active ? { backgroundColor: "var(--color-brand-blue-bg)" } : undefined}
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
            )
          )}
        </div>
      )}
    </div>
  );
}

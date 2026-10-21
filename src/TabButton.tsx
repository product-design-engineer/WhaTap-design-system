import { forwardRef, type KeyboardEvent } from "react";
import type { TabsItem, TabsVariant } from "./Tabs";

/**
 * TabButton — Chrome / Parts. [[Tabs]] 한 칸(탭 트리거 버튼 1개).
 *
 * ## Purpose
 * [[Tabs]] 의 두 variant(`segmented` · `large`)에 흩어져 있던 동일 구조의 탭 버튼
 * 마크업을 한 곳으로 모은 것. `TabsItem` 한 건과 선택/비활성 상태를 받아 버튼 1개를 그린다:
 *   - 좌측 아이콘 슬롯(있을 때만) + 라벨.
 *   - `selected` / `disabled` 에 따른 색·배경 토큰 전환.
 *   - `large` variant 는 활성 시 하단 underline overlay(1px overlap)를 덧그린다.
 *
 * ## When to use
 * - [[Tabs]] 가 `items.map` 으로 각 탭을 렌더할 때(기본 용법). 보통 단독 사용하지 않음.
 * - [[Tabs]] 의 탭 버튼 모양(아이콘 슬롯 · 선택/비활성 · large 밑줄)을 고치거나 Figma 와 대조할 때 — 탭 버튼 한 개의 정본이 여기다.
 *
 * ## When NOT to use
 * - 탭이 아닌 일반 버튼 → `Button`.
 * - tablist 컨테이너·활성 인디케이터·키보드 이동 로직 → 부모 [[Tabs]] 가 보유.
 *
 * ## Composition rules
 * - 표현용(상태 비보유). 선택/비활성/콜백은 모두 부모가 prop 으로 주입.
 * - 색·배경은 토큰만 — 인라인 hex 금지(`whatap-ds.css` 기정의 클래스 사용, 새 클래스 금지).
 * - `ref` 는 부모의 키보드 포커스 이동을 위해 버튼 요소로 forward.
 * - JSX/className 은 원본 [[Tabs]] map 본문과 동일 — 순수 추출.
 *
 * @example
 * ```tsx
 * {items.map((it, i) => (
 *   <TabButton
 *     key={it.value}
 *     ref={(el) => { tabRefs.current[i] = el; }}
 *     item={it}
 *     variant="segmented"
 *     selected={it.value === value}
 *     spec={spec}
 *     id={`${groupId}-tab-${it.value}`}
 *     fullWidth={fullWidth}
 *     onClick={() => !it.disabled && onChange(it.value)}
 *     onKeyDown={(e) => handleKey(e, i)}
 *   />
 * ))}
 * ```
 */

export type TabButtonSpec = {
  h: number;
  padX: number;
  gap: number;
  text: string;
};

export type TabButtonProps = {
  /** 렌더할 탭 항목 데이터. */
  item: TabsItem;
  /** 시각 variant — 부모 [[Tabs]] 와 동일. */
  variant: TabsVariant;
  /** 현재 활성 탭인지. */
  selected: boolean;
  /** 사이즈 spec(높이/패딩/gap/text 클래스) — 부모 SIZE[size]. */
  spec: TabButtonSpec;
  /** ARIA 연결용 id. */
  id: string;
  /** 전체 폭 모드 — true 면 flex-1 균등 분배. */
  fullWidth: boolean;
  /** 클릭 핸들러 — 부모가 disabled 가드 후 onChange 호출. */
  onClick: () => void;
  /** 키보드 핸들러 — 부모의 ArrowLeft/Right·Home/End 이동. */
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
};

const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { item: it, variant, selected, spec, id, fullWidth, onClick, onKeyDown },
  ref,
) {
  if (variant === "segmented") {
    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        id={id}
        aria-selected={selected}
        aria-disabled={it.disabled || undefined}
        tabIndex={selected ? 0 : -1}
        disabled={it.disabled}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={`inline-flex shrink-0 items-center justify-center rounded-5px transition-colors ${
          spec.text
        } ${spec.gap === 4 ? "gap-1" : "gap-1_5"} ${fullWidth ? "flex-1" : ""} ${
          selected
            ? "bg-card text-primary shadow-xs font-medium"
            : it.disabled
            ? "cursor-not-allowed text-disabled"
            : "text-tertiary hover:text-primary"
        }`}
        style={{
          height: spec.h - 4, // p-2px 빼고 안쪽 높이
          paddingInline: spec.padX - 4,
          border: 0,
        }}
      >
        {it.icon !== undefined && it.icon !== null && (
          <span className="inline-flex shrink-0 items-center" aria-hidden>
            {it.icon}
          </span>
        )}
        <span>{it.label}</span>
      </button>
    );
  }

  /* ─── large variant — 하단 underline ─── */
  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      id={id}
      aria-selected={selected}
      aria-disabled={it.disabled || undefined}
      tabIndex={selected ? 0 : -1}
      disabled={it.disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`relative inline-flex shrink-0 items-center justify-center transition-colors ${
        spec.text
      } ${spec.gap === 4 ? "gap-1" : "gap-1_5"} ${fullWidth ? "flex-1" : ""} ${
        selected
          ? "text-color-var-color-brand-blue font-medium"
          : it.disabled
          ? "cursor-not-allowed text-disabled"
          : "text-tertiary hover:text-primary"
      }`}
      style={{
        height: spec.h,
        paddingInline: spec.padX,
        border: 0,
        background: "transparent",
      }}
    >
      {it.icon !== undefined && it.icon !== null && (
        <span className="inline-flex shrink-0 items-center" aria-hidden>
          {it.icon}
        </span>
      )}
      <span>{it.label}</span>
      {/* 활성 underline — 보더 색 위에 1px overlap */}
      {selected && (
        <span
          aria-hidden
          className="absolute left-0 right-0 bottom-1px h-2px bg-color-var-color-brand-blue"
        />
      )}
    </button>
  );
});

export default TabButton;

import Checkbox from "./Checkbox";
import type { FilterDropdownOption } from "./FilterDropdown";

/**
 * FilterDropdownOptionItem — Primitives layer. [[FilterDropdown]] options 모드의 한 옵션 행.
 *
 * ## Purpose
 * FilterDropdown 패널 본문에서 `options.map` 으로 흩어져 있던 단일 옵션 행
 * (Checkbox + 라벨 + 우측 count) 을 한 곳으로 모은 것. 행 하나가 `FilterDropdownOption`
 * 한 건을 받아 체크박스 + 라벨 truncate + count `<span>` 으로 렌더.
 *
 * ## When to use
 * - [[FilterDropdown]] 가 options 모드에서 옵션마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 동일한 다중 선택 옵션 행 외형이 필요한 다른 드롭다운 표면.
 *
 * ## When NOT to use
 * - 자유 children 모드 패널 본문 → 사용자가 직접 구성.
 * - 단일 선택 옵션 행 → Select / Combobox 내부 요소.
 *
 * ## Composition rules
 * - 데이터(`FilterDropdownOption`)만 주입 — 체크 상태/토글은 props 로 위임 (`checked`·`onToggle`).
 * - Checkbox 는 DS 컴포넌트 — 이 행이 직접 import.
 * - count 는 `undefined`/`null` 이 아닐 때만 우측 `<span>` 으로 표시.
 *
 * @example
 * ```tsx
 * <FilterDropdownOptionItem
 *   option={{ value: "disk", label: "Disk", count: 12 }}
 *   checked={value.includes("disk")}
 *   onToggle={() => toggleOption("disk")}
 * />
 * ```
 */

export type FilterDropdownOptionItemProps = {
  /** 옵션 데이터 — value / label / count / disabled. */
  option: FilterDropdownOption;
  /** 체크 상태 (controlled). */
  checked: boolean;
  /** 체크박스 토글 콜백. */
  onToggle: () => void;
};

export default function FilterDropdownOptionItem({
  option,
  checked,
  onToggle,
}: FilterDropdownOptionItemProps) {
  return (
    <Checkbox
      size="md"
      checked={checked}
      disabled={option.disabled}
      onChange={onToggle}
    >
      <span className="inline-flex w-full items-center justify-between gap-2 text-base text-primary">
        <span className="truncate">{option.label}</span>
        {option.count !== undefined && option.count !== null && (
          <span className="shrink-0 text-sm text-tertiary">{option.count}</span>
        )}
      </span>
    </Checkbox>
  );
}

import FilterChip from "./FilterChip";

/**
 * FilterChipItem — Chrome / Parts. [[FilterBar]] 의 "선택됨" row 한 항목(closable 칩).
 *
 * ## Purpose
 * FilterBar 의 selected chips row 에서 선택된 필터 한 건을 closable FilterChip 으로 렌더.
 * 인라인으로 흩어져 있던 `selectedChipItems.map` 한 항목의 마크업을 한 곳으로 모은 것 —
 * 라벨은 `"<dropdownLabel>: <optionLabel>"` 형태, 우측 × 로 개별 제거.
 *
 * ## When to use
 * - [[FilterBar]] 가 selectedChipItems 를 `map` 으로 항목마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - 선택된 필터를 closable 칩으로 나열하는 동일 외형이 필요한 다른 표면.
 *
 * ## When NOT to use
 * - dropdown 트리거 칩 (count 표시, 토글) → FilterBar 의 FilterDropdown trigger (FilterChip 직접).
 * - 정적 라벨 (제거 불가) → `Chip`.
 * - 단일 필터 칩 일반 사용 → `FilterChip` 직접.
 *
 * ## Composition rules
 * - 데이터(`item`)만 주입 — 칩 외형/라벨 조합/sm 사이즈는 이 컴포넌트가 책임.
 * - 제거 동작은 콜백(`onRemove`)으로 위임 — 어떤 dropdown 의 값을 지울지는 부모가 결정.
 * - 시각/동작은 selected closable FilterChip(size="sm") 과 동일 — 변형 없음.
 *
 * @example
 * ```tsx
 * {selectedChipItems.map((it) => (
 *   <FilterChipItem
 *     key={`${it.dKey}-${it.value}`}
 *     item={it}
 *     onRemove={() => {
 *       const d = dropdowns.find((x) => x.key === it.dKey);
 *       if (d) d.onChange(d.value.filter((v) => v !== it.value));
 *     }}
 *   />
 * ))}
 * ```
 */

export type FilterChipItemData = {
  /** 출처 dropdown 식별자. */
  dKey: string;
  /** 출처 dropdown 라벨 (예: "카테고리"). */
  dLabel: string;
  /** 선택된 옵션 value. */
  value: string;
  /** 선택된 옵션 라벨. */
  label: string;
};

export type FilterChipItemProps = {
  /** 선택된 필터 한 건의 데이터. */
  item: FilterChipItemData;
  /** × 클릭 시 호출 — 부모가 해당 값 제거를 수행. */
  onRemove: () => void;
};

export default function FilterChipItem({ item, onRemove }: FilterChipItemProps) {
  return (
    <FilterChip
      size="sm"
      selected
      closable
      onClose={onRemove}
    >
      {item.dLabel}: {item.label}
    </FilterChip>
  );
}

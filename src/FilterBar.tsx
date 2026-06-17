/**
 * FilterBar — Chrome layer.
 *
 * ## Purpose
 * 페이지 상단의 검색·필터·액션 묶음 영역. 통합 이벤트 목록·카탈로그·룰 목록 같은
 * 큰 데이터 표 페이지의 헤더 부근에 자리. 이번 디자인 시스템 작업의 *마지막*
 * 컴포넌트 — Primitives 9 종 (TextField/FilterChip/FilterDropdown 등) 을 조립.
 *
 * ## When to use
 * - 통합 이벤트 목록 페이지 (검색 + 카테고리/심각도 필터 + 시간 윈도우)
 * - 카탈로그·룰 목록 페이지 헤더
 * - 자유 형식 영역의 검색·필터 통합점
 *
 * ## When NOT to use
 * - 단일 검색만 → `TextField` (leadingIcon=search, clearable)
 * - 단일 dropdown 만 → `FilterDropdown` 직접
 * - 페이지 전체 라우팅 → `Sidebar`
 *
 * ## Composition rules
 * - 슬롯 3개: `search` (좌측) / `dropdowns` (중간) / `actions` (우측)
 * - dropdowns 는 config 배열로 받고 FilterChip 트리거 + FilterDropdown 자동 생성
 * - `showSelectedChips`: 별도 row 에 선택된 항목을 closable FilterChip 으로 노출
 * - `showResetAll`: 1+ dropdown 에 선택 있을 때 "전체 초기화" 버튼 노출
 * - 가로 wrap — 좁은 화면에서 자연 줄바꿈
 *
 * ## Composition graph
 * ```
 * FilterBar
 *  ├─ TextField (search slot — 외부 주입)
 *  ├─ for each dropdown:
 *  │   FilterDropdown
 *  │    └─ trigger: FilterChip (자동 생성, count 표시)
 *  ├─ actions (자유 ReactNode — TimeRangeSelector / Button 등)
 *  └─ (showSelectedChips) FilterChip[selected closable] row
 * ```
 *
 * @example
 * ```tsx
 * <FilterBar
 *   search={
 *     <TextField size="sm" leadingIcon={<SearchIcon />} value={q} onChange={setQ}
 *                placeholder="제목, 메시지, 프로젝트" clearable />
 *   }
 *   dropdowns={[
 *     { key: "category", label: "카테고리", options: CATEGORIES, value: cat, onChange: setCat },
 *     { key: "severity", label: "심각도",   options: SEVERITIES, value: sev, onChange: setSev },
 *   ]}
 *   actions={<><TimeRangeSelector ... /><Button>새로고침</Button></>}
 *   showSelectedChips
 *   showResetAll
 *   onResetAll={() => { setCat([]); setSev([]); setQ(""); }}
 * />
 * ```
 */
import type { ReactNode } from "react";
import FilterChip from "./FilterChip";
import FilterChipItem from "./FilterChipItem";
import type { ChipSize } from "./Chip";
import FilterDropdown, { type FilterDropdownOption } from "./FilterDropdown";

export type FilterBarSize = "sm" | "md" | "lg";

export type FilterBarDropdownConfig = {
  /** 식별자 (key prop + selected chip 의 group 표시). */
  key: string;
  /** 트리거 라벨 (예: "카테고리", "심각도"). */
  label: string;
  /** 옵션 배열. */
  options: FilterDropdownOption[];
  /** 선택된 value 배열 (controlled). */
  value: string[];
  /** 변경 콜백 (다중 선택). */
  onChange: (next: string[]) => void;
  /** dropdown placement — default bottom-start. */
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** dropdown 패널 width — default 240. */
  width?: number;
};

export type FilterBarProps = {
  /** 좌측 검색 슬롯 — TextField 등 ReactNode. */
  search?: ReactNode;
  /** 중간 dropdown 묶음 — FilterChip 트리거 + FilterDropdown 자동 생성. */
  dropdowns?: FilterBarDropdownConfig[];
  /** 우측 actions — TimeRangeSelector·Button 등 자유 ReactNode. */
  actions?: ReactNode;
  /** 선택된 dropdown 값을 별도 row 에 closable FilterChip 으로 노출. */
  showSelectedChips?: boolean;
  /** "전체 초기화" 버튼 노출 — 1+ dropdown 에 선택 있을 때만. */
  showResetAll?: boolean;
  /** "전체 초기화" 클릭 콜백. 기본 동작은 모든 dropdown.onChange([]) 호출 후 추가 동작. */
  onResetAll?: () => void;
  /** 내부 FilterChip 트리거 사이즈 — sm(20px) / md(24px, default) / lg(32px). */
  size?: ChipSize;
  /** 외부 className. */
  className?: string;
};

export default function FilterBar({
  search,
  dropdowns = [],
  actions,
  showSelectedChips = false,
  showResetAll = false,
  onResetAll,
  size = "md",
  className = "",
}: FilterBarProps) {
  const totalSelected = dropdowns.reduce((acc, d) => acc + d.value.length, 0);

  const handleResetAll = () => {
    dropdowns.forEach((d) => d.onChange([]));
    onResetAll?.();
  };

  // selected chips — 별도 row. 각 칩의 label = "<dropdownLabel>: <optionLabel>"
  const selectedChipItems: { dKey: string; dLabel: string; value: string; label: string }[] = [];
  if (showSelectedChips) {
    dropdowns.forEach((d) => {
      d.value.forEach((v) => {
        const opt = d.options.find((o) => o.value === v);
        if (opt) {
          selectedChipItems.push({
            dKey: d.key,
            dLabel: d.label,
            value: v,
            label: opt.label,
          });
        }
      });
    });
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* main row — 가로 wrap. */}
      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <div className="shrink-0 min-w-0" style={{ minWidth: 280 }}>
            {search}
          </div>
        )}
        {dropdowns.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {dropdowns.map((d) => (
              <FilterDropdown
                key={d.key}
                trigger={
                  <FilterChip
                    size={size}
                    selected={d.value.length > 0}
                    count={d.value.length || undefined}
                  >
                    {d.label}
                  </FilterChip>
                }
                title={d.label}
                options={d.options}
                value={d.value}
                onChange={d.onChange}
                placement={d.placement ?? "bottom-start"}
                width={d.width ?? 240}
              />
            ))}
          </div>
        )}
        {/* 우측 actions — 자동으로 우측 정렬 (flex-1 spacer 가 사이를 채움) */}
        {actions && (
          <>
            <div className="flex-1" />
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </>
        )}
      </div>

      {/* selected chips row — showSelectedChips && 선택 있음 시 노출 */}
      {showSelectedChips && selectedChipItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-tertiary">선택됨:</span>
          {selectedChipItems.map((it) => (
            <FilterChipItem
              key={`${it.dKey}-${it.value}`}
              item={it}
              onRemove={() => {
                const d = dropdowns.find((x) => x.key === it.dKey);
                if (d) d.onChange(d.value.filter((v) => v !== it.value));
              }}
            />
          ))}
          {showResetAll && totalSelected > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-sm font-medium text-tertiary hover:text-secondary"
              style={{
                background: "transparent",
                border: 0,
                padding: "0 4px",
                cursor: "pointer",
                marginInlineStart: 4,
              }}
            >
              전체 초기화
            </button>
          )}
        </div>
      )}

      {/* resetAll — selectedChips 가 꺼졌을 때도 main row 옆에 보여야 하면 */}
      {!showSelectedChips && showResetAll && totalSelected > 0 && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-sm font-medium text-tertiary hover:text-secondary"
            style={{
              background: "transparent",
              border: 0,
              padding: "0 4px",
              cursor: "pointer",
            }}
          >
            전체 초기화 ({totalSelected})
          </button>
        </div>
      )}
    </div>
  );
}

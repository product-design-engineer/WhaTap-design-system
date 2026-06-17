import type { CSSProperties, ReactNode } from "react";
import type { DataTableColumn } from "./DataTable";

/**
 * DataTableRow — [[DataTable]] 본문의 단일 데이터 행(row) + 셀(cell) 렌더.
 *
 * ## Purpose
 * generic `<T>` 행 한 건을 받아 CSS grid 한 줄로 그린다 — DataTable 의 `rows.map`
 * 인라인에 흩어져 있던 행+셀 마크업(셀 정렬/numeric 폰트/render prop)을 한 곳으로 모은 것.
 * 표현용(상태 비보유) — 트랙 정의·정렬 정책·density 토큰은 부모가 계산해 prop 으로 주입.
 *
 * ## When to use
 * - [[DataTable]] 이 `rows.map` 으로 행마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 * - DataTable 과 동일한 행 외형이 필요한 다른 grid 표면.
 *
 * ## When NOT to use
 * - 헤더 행 → DataTable 내부에서 별도 인라인 렌더(셀 외형이 다름).
 * - 단일 값/메트릭 표시 → 인라인 텍스트.
 *
 * ## Composition rules
 * - 트랙(`gridTemplate`)·정렬(`colAlign`)·density 토큰(`rowText`/`rowHeight`/`rowPadding`)은
 *   부모(DataTable)가 계산해 주입 — 행은 받은 값을 그대로 적용만.
 * - 셀 내용: `column.render` 가 있으면 우선, 없으면 `row[column.key]`.
 * - `numeric` 셀은 Roboto numeric 폰트, 그 외 Noto Sans. 색·border 는 토큰 사용.
 * - 행 클릭은 `onRowClick`(데이터+인덱스) 으로 위임 — 없으면 hover 효과만.
 *
 * @example
 * ```tsx
 * {rows.map((row, ri) => (
 *   <DataTableRow
 *     key={ri}
 *     row={row}
 *     rowIndex={ri}
 *     columns={columns}
 *     gridTemplate={gridTemplate}
 *     colAlign={colAlign}
 *     rowText={tokens.rowText}
 *     rowHeight={tokens.rowHeight}
 *     rowPadding={tokens.rowPadding}
 *     onRowClick={onRowClick}
 *   />
 * ))}
 * ```
 */
export type DataTableRowProps<T> = {
  row: T;
  rowIndex: number;
  columns: DataTableColumn<T>[];
  /** grid-template-columns 값 — 부모가 계산한 트랙 정의. */
  gridTemplate: string;
  /** 컬럼별 정렬 결정 함수 — 부모의 정렬 정책. */
  colAlign: (c: DataTableColumn<T>) => "left" | "right" | "center";
  /** density 토큰 — 셀 텍스트 스타일. */
  rowText: string;
  /** density 토큰 — 셀 line-height. */
  rowHeight: string;
  /** density 토큰 — 행 패딩/gap. */
  rowPadding: string;
  /** 행 클릭 핸들러. 없으면 hover 효과만. */
  onRowClick?: (row: T, idx: number) => void;
};

export default function DataTableRow<T>({
  row,
  rowIndex,
  columns,
  gridTemplate,
  colAlign,
  rowText,
  rowHeight,
  rowPadding,
  onRowClick,
}: DataTableRowProps<T>) {
  return (
    <div
      className={`grid items-center border-t border-color-var-color-border-default ${rowPadding} ${onRowClick ? "cursor-pointer" : ""} hover-bg-surface-100`}
      style={{ gridTemplateColumns: gridTemplate }}
      onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
    >
      {columns.map((c, ci) => {
        const content: ReactNode = c.render
          ? c.render(row, rowIndex)
          : ((row as Record<string, unknown>)[c.key] as ReactNode);
        const style: CSSProperties = {
          fontFamily: c.numeric
            ? "Roboto, 'Noto Sans', sans-serif"
            : "'Noto Sans', 'Noto Sans KR', sans-serif",
          textAlign: colAlign(c),
        };
        return (
          <span
            key={ci}
            className={`${rowText} ${rowHeight} tracking-default truncate min-w-0`}
            style={style}
            title={typeof content === "string" ? content : undefined}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}

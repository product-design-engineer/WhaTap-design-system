/**
 * DataTable — 컬럼/행을 prop 으로 받는 generic grid 데이터 테이블.
 *
 * ## Purpose
 * `columns`(컬럼 정의) + `rows`(행 데이터)를 받아 CSS grid 기반 테이블을 렌더하는
 * side-effect free generic 컴포넌트. 모든 모니터링 페이지에서 컬럼/density 만 바꿔 재활용.
 * `render` 로 셀 커스텀, `onRowClick` 으로 행 클릭(없으면 hover 효과만) 지원.
 *
 * ## When to use
 * - 세션/프로세스/SQL 등 표 형태의 모니터링 데이터 목록.
 * - 컬럼 너비·정렬·density 정책을 일관되게 적용해야 하는 테이블 전반.
 *
 * ## When NOT to use
 * - 단일 값/메트릭 표시 → 인라인 텍스트(예: OptionbarPage 의 ValueDisplay).
 * - 행 선택·검색 등 폼 입력 chrome → [[TextField]] 등 별도 primitive 와 조합.
 *
 * ## Composition rules
 * - density: `"compact"`(헤더 text-xs / 셀 text-sm, 8/6px 패딩) ·
 *   `"default"`(헤더 text-base / 셀 text-md, 12/10px 패딩). 기본 `"default"`.
 * - 컬럼 너비: `width`(px/CSS) 고정 트랙이 `flex`(fr) 가변 트랙보다 우선
 *   (`width` 지정 시 `flex` 무시). 정형 컬럼(No/시각/상태/액션)은 `width` 권장.
 * - 정렬: 명시 `align` 이 최우선 → header 가 "No" 면 center → `numeric` 이면 right →
 *   그 외 text 는 left. `numeric=true` 셀은 Roboto numeric 폰트.
 * - 색·border 는 토큰(var(--color-border-default)/var(--color-surface-50)) 사용.
 *
 * @example
 * ```tsx
 * <DataTable
 *   density="compact"
 *   columns={[
 *     { key: "no", header: "No", width: 40 },
 *     { key: "name", header: "세션", flex: 2 },
 *     { key: "cpu", header: "CPU", width: 80, numeric: true },
 *   ]}
 *   rows={sessions}
 *   onRowClick={(row) => openDetail(row)}
 * />
 * ```
 */
import type { ReactNode } from "react";
import DataTableRow from "./DataTableRow";

export type DataTableColumn<T> = {
  /** rows[i][key]가 cell content (render 미지정 시) */
  key: string;
  header: ReactNode;
  /** grid-template-columns 의 fr 값 — 컬럼 너비 비율 (가변 컬럼). `width` 지정 시 무시. */
  flex?: number;
  /** 고정 트랙 너비 — 정형 컬럼(No / 시각 / 상태 / 액션 등). number=px, string=CSS 길이. */
  width?: number | string;
  align?: "left" | "right" | "center";
  /** true면 Roboto numeric font (수치 컬럼) */
  numeric?: boolean;
  /** 커스텀 셀 렌더러 — render 가 있으면 key 무시 */
  render?: (row: T, idx: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  density?: "compact" | "default";
  /** 행 클릭 핸들러. 없으면 hover 효과만. */
  onRowClick?: (row: T, idx: number) => void;
};

export default function DataTable<T>({
  columns,
  rows,
  density = "default",
  onRowClick,
}: DataTableProps<T>) {
  /** 트랙 크기 — `width` 고정(px/CSS) 우선, 없으면 `flex`fr (기본 1fr). */
  const gridTemplate = columns
    .map((c) =>
      c.width != null
        ? typeof c.width === "number"
          ? `${c.width}px`
          : c.width
        : `${c.flex ?? 1}fr`,
    )
    .join(" ");

  /** 정렬 정책 — "No" 컬럼은 center, 그 외 numeric=right / text=left. 명시 align 이 최우선. */
  const colAlign = (c: DataTableColumn<T>): "left" | "right" | "center" => {
    if (c.align) return c.align;
    if (typeof c.header === "string" && c.header.trim() === "No") return "center";
    return c.numeric ? "right" : "left";
  };

  const tokens =
    density === "compact"
      ? {
          headerText: "text-xs font-bold text-secondary",
          rowText: "text-sm text-primary",
          rowPadding: "px-8px py-6px gap-6px",
          rowHeight: "leading-snug",
        }
      : {
          headerText: "text-base font-bold text-tertiary",
          rowText: "text-md text-primary",
          rowPadding: "px-12px py-10px gap-10px",
          rowHeight: "leading-normal",
        };

  return (
    <div className="flex flex-col rounded-4px border border-color-var-color-border-default bg-card overflow-hidden">
      {/* 헤더 행 */}
      <div
        className={`grid items-center bg-color-var-color-surface-50 ${tokens.rowPadding}`}
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((c, ci) => (
          <span
            key={ci}
            className={`${tokens.headerText} tracking-default leading-none truncate`}
            style={{
              fontFamily: "var(--font-family-korean)",
              textAlign: colAlign(c),
            }}
          >
            {c.header}
          </span>
        ))}
      </div>

      {/* 데이터 행 */}
      {rows.map((row, ri) => (
        <DataTableRow
          key={ri}
          row={row}
          rowIndex={ri}
          columns={columns}
          gridTemplate={gridTemplate}
          colAlign={colAlign}
          rowText={tokens.rowText}
          rowHeight={tokens.rowHeight}
          rowPadding={tokens.rowPadding}
          onRowClick={onRowClick}
        />
      ))}
    </div>
  );
}

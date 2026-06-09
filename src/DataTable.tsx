/**
 * DataTable — 모든 모니터링 페이지에서 재활용 가능한 generic 데이터 테이블.
 *
 * 컬럼 정의(`columns`)와 행 데이터(`rows`)를 prop으로 받아 grid 기반 테이블 렌더링.
 * density: "compact" (DB 세션 테이블처럼 10px 헤더 / 11px 셀)
 *          "default" (Process TOP5 패널처럼 12px 헤더 / 13px 셀)
 *
 * 컬럼 너비:
 *   - `flex` (number)   → 가변 트랙 (fr). 남는 공간을 비율로 분배. (예: 메시지·이름)
 *   - `width` (px/CSS)  → 고정 트랙. 내용 폭이 정형인 컬럼(No / 시각 / 상태 / 액션)에 사용해
 *                         가변 컬럼이 넓어져도 흔들리지 않게 고정. `width` 지정 시 `flex` 무시.
 *
 * 정책 (feedback-common-components-catalog / feedback-decision-priorities):
 *   재활용 가능, side-effect free — 새 페이지에서는 컬럼/density만 교체.
 *
 * 정렬 정책 (feedback-data-table-alignment):
 *   - 텍스트 컬럼   → left
 *   - 숫자 컬럼     → right (numeric)
 *   - "No" 컬럼     → center (행 순번 — header 가 "No" 면 헤더/셀 모두 가운데 정렬)
 *   명시적 `align` prop 은 위 기본값을 항상 override.
 */
import type { CSSProperties, ReactNode } from "react";

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
          rowPadding: "px-[8px] py-[6px] gap-[6px]",
          rowHeight: "leading-snug",
        }
      : {
          headerText: "text-base font-bold text-tertiary",
          rowText: "text-md text-primary",
          rowPadding: "px-[12px] py-[10px] gap-[10px]",
          rowHeight: "leading-normal",
        };

  return (
    <div className="flex flex-col rounded-[4px] border border-[color:var(--color-border-default)] bg-white overflow-hidden">
      {/* 헤더 행 */}
      <div
        className={`grid items-center bg-[color:var(--color-surface-50)] ${tokens.rowPadding}`}
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
        <div
          key={ri}
          className={`grid items-center border-t border-[color:var(--color-border-default)] ${tokens.rowPadding} ${onRowClick ? "cursor-pointer" : ""} hover:bg-gray-50`}
          style={{ gridTemplateColumns: gridTemplate }}
          onClick={onRowClick ? () => onRowClick(row, ri) : undefined}
        >
          {columns.map((c, ci) => {
            const content: ReactNode = c.render
              ? c.render(row, ri)
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
                className={`${tokens.rowText} ${tokens.rowHeight} tracking-default truncate min-w-0`}
                style={style}
                title={typeof content === "string" ? content : undefined}
              >
                {content}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

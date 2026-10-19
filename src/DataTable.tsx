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
 * - 행 강조: **테이블을 인라인 재구현하지 말고** `rowClassName`(문자열 또는 `(row,idx)=>class`)
 *   으로 행 단위 클래스를 주입 — 기존 행 클래스에 append(하위호환). 강조 색은 토큰 클래스로.
 * - 세로 스크롤: 받은 높이에 행이 다 안 들어가면 **잘리지 않고 본문이 세로로 스크롤**되며 헤더는
 *   위에 붙어 남는다. 높이는 부모가 준다(flex 열에서 남은 칸) — 따로 정하려면 `maxHeight`
 *   (`200` · `"100%"`). 표를 `overflow-auto` 래퍼로 감싸 스크롤을 만들지 말 것 — 헤더까지 같이
 *   밀려 올라가 무슨 열인지 잃는다.
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
  /**
   * 헤더를 눌러 이 컬럼으로 정렬할 수 있음. `sort`·`onSortChange` 와 함께 쓴다.
   * 정렬은 표가 하지 않는다 — 어느 컬럼으로 어느 방향인지만 알리고, 실제 재정렬은 호출측 몫이다.
   * (서버 정렬·페이지네이션과 섞일 때 표가 자기 판단으로 순서를 바꾸면 화면과 데이터가 어긋난다.)
   */
  sortable?: boolean;
  /** true면 Roboto numeric font (수치 컬럼) */
  numeric?: boolean;
  /** 커스텀 셀 렌더러 — render 가 있으면 key 무시 */
  render?: (row: T, idx: number) => ReactNode;
  /**
   * 셀이 잘렸을 때 [[Tooltip]] 으로 보여줄 **전체 값**.
   *
   * 미지정이면 문자열 셀은 자기 값을 그대로 쓴다. `render` 로 만든 셀(뱃지·강조가 섞인 셀)은
   * 텍스트를 자동으로 알 수 없으므로 여기에 원문을 넘겨야 한다 — 안 넘기면 잘린 값을 확인할
   * 방법이 사라진다.
   *
   * 툴팁은 **실제로 넘칠 때만** 뜬다(scrollWidth 측정). 안 잘린 셀까지 뜨면 표를 훑는 동안
   * 툴팁이 계속 튀어나와 방해만 된다.
   */
  tooltip?: (row: T, idx: number) => ReactNode;
};

/** 정렬 상태 — 어느 컬럼(key)을 어느 방향으로. */
export type DataTableSort = { key: string; dir: "asc" | "desc" };

export type DataTableProps<T> = {
  /** 컬럼 정의 — 순서대로 헤더와 셀 트랙(width 고정 · flex fr)을 만든다. */
  columns: DataTableColumn<T>[];
  /** 행 데이터 — 한 원소가 한 행. 셀 값은 컬럼 `key` 로 읽거나 `render` 가 그린다. */
  rows: T[];
  /** 현재 정렬 상태. `sortable` 컬럼 헤더에 방향 표식이 뜬다. */
  sort?: DataTableSort;
  /**
   * 정렬 변경 콜백. 같은 컬럼을 다시 누르면 방향이 뒤집혀 들어온다.
   * 미지정이면 헤더는 눌리지 않는다(표식만 표시).
   */
  onSortChange?: (next: DataTableSort) => void;
  /** 밀도 — default(**기본**, 헤더 12px · 행 13px · 패딩 12/10) / compact(헤더 10px · 행 11px · 패딩 8/6, 100+ 행 raw log 전용). */
  density?: "compact" | "default";
  /** 행 클릭 핸들러. 없으면 hover 효과만. */
  onRowClick?: (row: T, idx: number) => void;
  /**
   * 행 단위 강조/커스텀 클래스 (선택, 하위호환). 문자열(전 행 공통) 또는 `(row, idx) => class`.
   * 기존 행 클래스(grid·border·hover)에 **append** 되므로 강조 배경 등은 소비자가 클래스로 주입.
   * 선택 행 강조 예: `rowClassName={(_, i) => (i === selected ? "bg-color-var-color-surface-100" : undefined)}`
   * (DS 제공 배경 클래스: `bg-color-var-color-surface-50/100`, `bg-color-var-color-brand-blue`. 소비 앱 자체 클래스도 가능.)
   */
  rowClassName?: string | ((row: T, idx: number) => string | undefined);
  /**
   * 표 전체(헤더 포함)의 최대 높이. 넘치면 본문이 세로로 스크롤되고 헤더는 붙어 남는다.
   * number=px, string=CSS 길이(`"100%"` 는 부모 높이를 채움 — 부모 높이가 정해져 있어야 한다).
   * 미지정이면 부모가 준 높이를 따른다 — 그 높이에 다 안 들어가도 잘리지 않고 스크롤된다.
   */
  maxHeight?: number | string;
};

export default function DataTable<T>({
  columns,
  rows,
  density = "default",
  sort,
  onSortChange,
  onRowClick,
  rowClassName,
  maxHeight,
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
    <div
      className="wds-data-table flex flex-col rounded-4px border border-color-var-color-border-default bg-card"
      style={maxHeight != null ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } : undefined}
    >
      {/* 헤더 행 — 본문이 스크롤돼도 위에 붙어 남는다(.wds-data-table-head). 스크롤 영역 **안**에
          두는 이유: 밖에 두면 세로 스크롤바 폭만큼 본문 열이 헤더 열과 어긋난다. */}
      <div
        className={`wds-data-table-head grid items-center bg-color-var-color-surface-50 ${tokens.rowPadding}`}
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((c, ci) => {
          const active = sort?.key === c.key;
          const clickable = !!(c.sortable && onSortChange);
          const align = colAlign(c);
          return (
            <span
              key={ci}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-sort={
                c.sortable ? (active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none") : undefined
              }
              onClick={
                clickable
                  ? () => onSortChange!({ key: c.key, dir: active && sort!.dir === "desc" ? "asc" : "desc" })
                  : undefined
              }
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSortChange!({ key: c.key, dir: active && sort!.dir === "desc" ? "asc" : "desc" });
                      }
                    }
                  : undefined
              }
              className={`${tokens.headerText} tracking-default leading-none truncate flex items-center gap-4px${
                clickable ? " cursor-pointer hover-text-color-var-color-text-primary" : ""
              }${active ? " text-primary" : ""}`}
              style={{
                fontFamily: "var(--font-family-korean)",
                textAlign: align,
                justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
              }}
            >
              {c.header}
              {c.sortable && <SortCaret dir={active ? sort!.dir : undefined} />}
            </span>
          );
        })}
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
          className={typeof rowClassName === "function" ? rowClassName(row, ri) : rowClassName}
        />
      ))}
    </div>
  );
}

/**
 * 정렬 방향 표식 — 활성 컬럼만 진하고, 정렬 가능한 나머지는 옅게 남아 「여기도 누를 수 있다」를 말한다.
 * 표식을 활성 컬럼에만 그리면 어느 헤더가 눌리는지 눌러 보기 전엔 알 수 없다.
 */
function SortCaret({ dir }: { dir?: "asc" | "desc" }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0"
      style={{
        transform: dir === "asc" ? "rotate(180deg)" : undefined,
        opacity: dir ? 1 : 0.35,
      }}
    >
      <path
        d="M3 4.5 L6 7.5 L9 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

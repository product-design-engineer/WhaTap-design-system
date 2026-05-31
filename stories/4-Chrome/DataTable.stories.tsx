import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@whatap/design-system";
import type { DataTableColumn } from "@whatap/design-system/DataTable";

/**
 * Stories for [[DataTable]] — 모니터링 페이지의 재활용 generic 데이터 테이블.
 */
const meta: Meta = {
  title: "Chrome/DataTable",
  // generic 컴포넌트 — Meta 에는 component 미지정, 각 story 의 render 에서 구체 row type 으로 사용
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**Grid 기반 generic 데이터 테이블.** 컬럼 정의 + 행 데이터 prop 으로 받아 렌더링. " +
          "`density` (compact/default), `align` per 컬럼, `numeric` 컬럼은 Roboto + 우측 정렬, `render` 로 셀 커스텀. " +
          "정렬 정책 (feedback-data-table-alignment): 텍스트 → left, 숫자 → right, **header 가 \"No\" 인 컬럼 → center** " +
          "(행 순번; 헤더/셀 모두 가운데). 명시적 `align` prop 이 항상 override. " +
          "너비 정책: **정형 컬럼(No·시각·상태·액션) → `width`(px 고정)**, **가변 컬럼(이름·메시지) → `flex`(fr)** — " +
          "정보량 많은 컬럼에 더 큰 `flex`.",
      },
    },
  },
};
export default meta;

/* ─── Sample data ─────────────────────────────────────── */

type DbSessionRow = {
  instance: string;
  conName: string;
  sid: number;
  serial: number;
  status: string;
  cpuSec: number;
};
const DB_SESSIONS: DbSessionRow[] = [
  { instance: "oracle_dnx_01", conName: "TRADE_APP", sid: 142, serial: 33421, status: "ACTIVE", cpuSec: 12.4 },
  { instance: "oracle_dnx_02", conName: "BATCH_JOB", sid: 88, serial: 9821, status: "INACTIVE", cpuSec: 0.0 },
  { instance: "oracle_dnx_01", conName: "ADMIN", sid: 207, serial: 12090, status: "ACTIVE", cpuSec: 2.1 },
  { instance: "oracle_dnx_03", conName: "REPORT_GEN", sid: 65, serial: 7012, status: "ACTIVE", cpuSec: 45.7 },
];
const DB_COLS: DataTableColumn<DbSessionRow>[] = [
  { key: "instance", header: "Instance", flex: 2 },
  { key: "conName", header: "Connection", flex: 2 },
  { key: "sid", header: "SID", flex: 1, numeric: true },
  { key: "serial", header: "Serial#", flex: 1, numeric: true },
  { key: "status", header: "Status", flex: 1 },
  { key: "cpuSec", header: "CPU (sec)", flex: 1, numeric: true,
    render: (r) => r.cpuSec.toFixed(1),
  },
];

type ProcessRow = { name: string; max: string; avg: string; count: string; servers: string };
const PROCESS_TOP: ProcessRow[] = [
  { name: "java", max: "82.4", avg: "45.2", count: "12", servers: "web-01, web-02, app-01" },
  { name: "nginx", max: "12.1", avg: "8.3", count: "5", servers: "lb-01, lb-02" },
  { name: "postgres", max: "67.9", avg: "32.5", count: "3", servers: "db-01" },
];
const PROCESS_COLS: DataTableColumn<ProcessRow>[] = [
  { key: "name", header: "Name", flex: 2 },
  { key: "max", header: "Max(%)", flex: 1, numeric: true },
  { key: "avg", header: "Avg(%)", flex: 1, numeric: true },
  { key: "count", header: "Count", flex: 1, numeric: true },
  { key: "servers", header: "Servers", flex: 3 },
];

/* ─── Stories ─────────────────────────────────────────── */

type Story = StoryObj<typeof DataTable<DbSessionRow>>;

/** Default density — Process TOP5 패널 스타일 (12px 헤더 / 13px 셀). */
export const DefaultDensity: StoryObj = {
  render: () => <DataTable<ProcessRow> columns={PROCESS_COLS} rows={PROCESS_TOP} density="default" />,
};

/** Compact density — DB 세션 테이블 스타일 (10px 헤더 / 11px 셀). */
export const CompactDensity: StoryObj = {
  render: () => <DataTable<DbSessionRow> columns={DB_COLS} rows={DB_SESSIONS} density="compact" />,
};

/** Empty rows — header 만, 데이터 없음. */
export const EmptyRows: StoryObj = {
  render: () => <DataTable<DbSessionRow> columns={DB_COLS} rows={[]} density="compact" />,
};

/** Custom cell render — status 컬럼에 컬러 dot. */
export const CustomCellRender: StoryObj = {
  render: () => {
    const cols: DataTableColumn<DbSessionRow>[] = [
      ...DB_COLS.slice(0, 4),
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (r) => (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: r.status === "ACTIVE" ? "#00B442" : "#adadad",
              }}
            />
            {r.status}
          </span>
        ),
      },
      DB_COLS[5],
    ];
    return <DataTable<DbSessionRow> columns={cols} rows={DB_SESSIONS} density="compact" />;
  },
};

/**
 * "No" 컬럼 center 정렬 정책 — header 가 "No" 면 별도 `align` 없이도 헤더/셀이 가운데 정렬.
 * (텍스트 컬럼 left, 숫자 컬럼 right 와 대비)
 */
export const NoColumnCentered: StoryObj = {
  render: () => {
    const cols: DataTableColumn<DbSessionRow>[] = [
      // header "No" — align 미지정이지만 정책에 의해 center
      { key: "no", header: "No", flex: 0.6, numeric: true, render: (_r, i) => i + 1 },
      ...DB_COLS,
    ];
    return <DataTable<DbSessionRow> columns={cols} rows={DB_SESSIONS} density="compact" />;
  },
};

/**
 * 너비 정책 — 정형 컬럼은 `width`(px 고정), 가변 컬럼은 `flex`(fr).
 * No(고정 52) · SID/Serial(고정) 은 흔들리지 않고, Instance/Connection(가변)이 남는 폭을 흡수.
 * 정보량 많은 Connection 에 더 큰 flex 부여.
 */
export const FixedAndFlexWidth: StoryObj = {
  render: () => {
    const cols: DataTableColumn<DbSessionRow>[] = [
      { key: "no", header: "No", width: 52, numeric: true, render: (_r, i) => i + 1 },
      { key: "instance", header: "Instance", flex: 1.5 },
      { key: "conName", header: "Connection", flex: 3 },
      { key: "sid", header: "SID", width: 72, numeric: true },
      { key: "serial", header: "Serial#", width: 96, numeric: true },
      { key: "cpuSec", header: "CPU (sec)", width: 96, numeric: true, render: (r) => r.cpuSec.toFixed(1) },
    ];
    return <DataTable<DbSessionRow> columns={cols} rows={DB_SESSIONS} density="compact" />;
  },
};

/** Row 클릭 핸들러 — onRowClick. */
export const InteractiveRows: StoryObj = {
  render: () => (
    <DataTable<DbSessionRow>
      columns={DB_COLS}
      rows={DB_SESSIONS}
      density="compact"
      onRowClick={(row) => alert(`Clicked: ${row.instance} / SID ${row.sid}`)}
    />
  ),
};

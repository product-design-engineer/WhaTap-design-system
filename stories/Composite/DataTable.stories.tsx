import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Chip, DataTable } from "@whatap/design-system";
import type { DataTableColumn, DataTableSort } from "@whatap/design-system";

/**
 * Stories for [[DataTable]] — 모니터링 페이지의 재활용 generic 데이터 테이블.
 */
const meta: Meta = {
  title: "Composite/DataTable",
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
          "너비 정책: **정형 컬럼(No·시각·상태·실행) → `width`(px 고정)**, **가변 컬럼(이름·메시지) → `flex`(fr)** — " +
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
                background: r.status === "ACTIVE" ? "var(--color-status-success)" : "var(--color-text-disabled)",
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

/**
 * Row 강조 (rowClassName) — **테이블 인라인 재구현 없이** 행 단위 강조.
 * 클릭한 행을 선택 상태로 유지(surface-100 배경). `rowClassName` 은 기존 행 클래스에 append 되며,
 * 문자열(전 행 공통) 또는 `(row, idx) => class` 함수를 받는다(하위호환 — 미지정 시 기존과 동일).
 */
export const RowHighlight: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState(0);
    return (
      <DataTable<DbSessionRow>
        columns={DB_COLS}
        rows={DB_SESSIONS}
        density="compact"
        onRowClick={(_r, i) => setSelected(i)}
        rowClassName={(_r, i) => (i === selected ? "bg-color-var-color-surface-100" : undefined)}
      />
    );
  },
};

/* ─── 세로 스크롤 — 받은 높이에 다 안 들어갈 때 ─────────────── */

type MemberRow = {
  name: string;
  badge?: { label: string; tone: "primary" | "critical" | "neutral" };
  deleted?: boolean;
  email: string;
  org: string;
  addedAt: string;
  usage: number;
};
const MEMBERS: MemberRow[] = [
  { name: "정우성", badge: { label: "플랜 1개 이상", tone: "primary" }, email: "jung@whatap.io", org: "(주) 와탭랩스/서비스개발", addedAt: "2026-05-02 14:22", usage: 12410 },
  { name: "오경호", badge: { label: "플랜 1개 이상", tone: "primary" }, email: "kyungho.oh@whatap.io", org: "(주) 와탭랩스/플랫폼", addedAt: "2026-04-14 09:12", usage: 6240 },
  { name: "이준호", badge: { label: "플랜 1개 이상", tone: "primary" }, email: "lee@whatap.io", org: "(주) 와탭랩스/서비스개발", addedAt: "2026-04-14 11:31", usage: 5220 },
  { name: "김서연", email: "kim@whatap.io", org: "(주) 와탭랩스/플랫폼", addedAt: "2026-04-14 10:04", usage: 4960 },
  { name: "박다인", badge: { label: "플랜 1개 이상", tone: "primary" }, email: "park@whatap.io", org: "(주) 와탭랩스/서비스개발", addedAt: "2026-05-02 13:47", usage: 3880 },
  { name: "한지민", email: "han@whatap.io", org: "(주) 와탭랩스/플랫폼/SRE", addedAt: "2026-06-11 15:08", usage: 2410 },
  { name: "신동하", badge: { label: "삭제된 계정", tone: "critical" }, deleted: true, email: "shin@whatap.io", org: "(주) 와탭랩스/서비스개발", addedAt: "2026-05-02 17:05", usage: 1120 },
  { name: "조민석", badge: { label: "초대 대기", tone: "neutral" }, email: "cho@whatap.io", org: "(주) 와탭랩스/데이터", addedAt: "2026-08-11 16:44", usage: 0 },
];
const MEMBER_COLS: DataTableColumn<MemberRow>[] = [
  {
    key: "name", header: "계정", sortable: true, tooltip: (r) => r.name,
    render: (r) => (
      <span className="flex items-center gap-8px min-w-0">
        <span className={r.deleted ? "text-tertiary" : undefined} style={r.deleted ? { textDecoration: "line-through" } : undefined}>{r.name}</span>
        {r.badge && <Chip variant="soft" tone={r.badge.tone} size="md">{r.badge.label}</Chip>}
      </span>
    ),
  },
  { key: "email", header: "메일", render: (r) => <span className="text-tertiary">{r.email}</span>, tooltip: (r) => r.email },
  { key: "org", header: "소속", render: (r) => <span className="text-tertiary">{r.org}</span>, tooltip: (r) => r.org },
  { key: "addedAt", header: "추가 일시", sortable: true, render: (r) => <span className="text-tertiary">{r.addedAt}</span> },
  { key: "usage", header: "이번 주기 사용량", sortable: true, align: "left", render: (r) => `${r.usage.toLocaleString()} 크레딧` },
  {
    key: "action", header: "", align: "right",
    render: () => <Button variant="outline" tone="primary" size="sm">플랜에서 제외</Button>,
  },
];

/**
 * 세로 스크롤 — `maxHeight` 로 높이를 정한 경우. 8행이 200px 에 다 안 들어가므로 본문이
 * 세로로 스크롤되고 **헤더는 위에 붙어 남는다**. 예전에는 넘친 행이 잘려 보이지 않았다.
 */
export const VerticalScroll: StoryObj = {
  render: () => {
    const [sort, setSort] = useState<DataTableSort>({ key: "usage", dir: "desc" });
    return (
      <DataTable<MemberRow>
        columns={MEMBER_COLS}
        rows={MEMBERS}
        sort={sort}
        onSortChange={setSort}
        maxHeight={200}
      />
    );
  },
};

/**
 * 세로 스크롤 — 부모가 높이를 준 경우(`maxHeight` 없음). 카드 안 flex 열에서 필터 줄 아래
 * 남은 칸을 표가 차지한다. 그 칸보다 행이 많으면 표 안에서 스크롤된다 — 표를
 * `overflow-auto` 래퍼로 감쌀 필요가 없다(감싸면 헤더까지 같이 밀려 올라간다).
 */
export const VerticalScrollInFlexParent: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-12px bg-card rounded-4px p-16px" style={{ height: 280 }}>
      <span className="text-lg font-bold text-primary">플랜 멤버</span>
      <DataTable<MemberRow> columns={MEMBER_COLS} rows={MEMBERS} />
    </div>
  ),
};

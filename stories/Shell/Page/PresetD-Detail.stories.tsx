import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DashboardLayout, PageHeader, OptionbarPage, SubHeaderBar,
  Tabs, MiniLineChart, ToolbarIconButton,
  DataTable, WhaTapAiWidget,
  type TabsItem,
} from "@whatap/design-system";
import type { DataTableColumn } from "@whatap/design-system";

/**
 * **프리셋 D — 상세 페이지.**
 *
 * 단일 대상(인스턴스·서버)을 탭으로 나눠 심층 분석하는 패턴.
 * Sidebar + PageHeader + OptionbarPage + Tabs + MiniLineChart 그리드 + DataTable + AI 위젯.
 *
 * `docs/GUIDE.md` "프리셋 D" 코드 템플릿과 1:1 대응.
 */

/* ─── Mock data ──────────────────────────────────────── */

const DETAIL_TABS = [
  { value: "overview",    label: "개요" },
  { value: "performance", label: "성능" },
  { value: "events",      label: "이벤트" },
];

const CPU_DATA     = [45, 52, 48, 67, 78, 72, 65];
const MEM_DATA     = [62, 64, 63, 68, 71, 69, 66];
const DISK_DATA    = [12, 15, 18, 22, 28, 25, 20];
const NETWORK_DATA = [34, 38, 42, 56, 48, 44, 40];

type TimeRow = { time: string; cpu: number; mem: number; tps: number; disk: number };

const TIME_ROWS: TimeRow[] = [
  { time: "14:30:00", cpu: 65, mem: 66, tps: 1_234, disk: 20 },
  { time: "14:25:00", cpu: 72, mem: 69, tps: 1_102, disk: 25 },
  { time: "14:20:00", cpu: 78, mem: 71, tps: 1_423, disk: 28 },
  { time: "14:15:00", cpu: 67, mem: 68, tps: 987,   disk: 22 },
  { time: "14:10:00", cpu: 48, mem: 63, tps: 856,   disk: 18 },
  { time: "14:05:00", cpu: 52, mem: 64, tps: 912,   disk: 15 },
  { time: "14:00:00", cpu: 45, mem: 62, tps: 789,   disk: 12 },
];

const TIME_COLS: DataTableColumn<TimeRow>[] = [
  { key: "time", header: "시각",     width: 150,
    render: (r) => <span className="font-numeric tabular-nums">{r.time}</span>,
  },
  { key: "cpu",  header: "CPU %",   width: 96, numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.cpu}%</span>,
  },
  { key: "mem",  header: "MEM %",   width: 96, numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.mem}%</span>,
  },
  { key: "tps",  header: "TPS",     width: 96, numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.tps.toLocaleString()}</span>,
  },
  { key: "disk", header: "Disk MB/s", width: 96, numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.disk}</span>,
  },
];

/* ─── Tab panels ─────────────────────────────────────── */

const OverviewPanel = () => (
  <div className="wds-page-content">
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
      <MiniLineChart title="CPU Usage"    values={CPU_DATA}     unit="%" showTopStat />
      <MiniLineChart title="Memory"       values={MEM_DATA}     unit="%" showTopStat color="var(--color-whatap-purple)" />
      <MiniLineChart title="Disk I/O"     values={DISK_DATA}    unit="MB/s" color="var(--color-chart-series-2)" />
      <MiniLineChart title="Network"      values={NETWORK_DATA} unit="Mbps" color="var(--color-status-success)" />
    </div>
    <DataTable<TimeRow> columns={TIME_COLS} rows={TIME_ROWS} density="default" />
  </div>
);

const PerformancePanel = () => (
  <div style={{ padding: 24, fontFamily: "'Noto Sans', sans-serif" }}>
    <h4 className="text-md font-medium text-primary mb-2">성능 상세</h4>
    <p className="text-sm text-secondary">
      Lock Wait · Full Scan · Long Query 등 DB 성능 지표를 분석합니다.
      (이 탭은 데모 콘텐츠입니다)
    </p>
  </div>
);

const EventsPanel = () => (
  <div style={{ padding: 24, fontFamily: "'Noto Sans', sans-serif" }}>
    <h4 className="text-md font-medium text-primary mb-2">이벤트 이력</h4>
    <p className="text-sm text-secondary">
      해당 인스턴스에서 발생한 알림·이벤트 이력을 표시합니다.
      (이 탭은 데모 콘텐츠입니다)
    </p>
  </div>
);

/* ─── 모드 행(SubHeaderBar) 자원 ─────────────────────── */

const FILTER_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2,2 L2,3.95 L11.05,13.67 L11.05,22 L12.99,20.56 L12.99,13.67 L22,3.95 L22,2 L2,2 Z M5.45,5 L18.61,5 L12.01,12 L5.45,5 Z" />
  </svg>
);

const PRINT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16,0 L16,4 L20,4 L20,14 L16,14 L16,20 L4,20 L4,14 L0,14 L0,4 L4,4 L4,0 L16,0 Z M14,14 L6,14 L6,18 L14,18 L14,14 Z M18,6 L2,6 L2,12 L18,12 L18,6 Z M6,8 L6,10 L4,10 L4,8 L6,8 Z M14,2 L6,2 L6,4 L14,4 L14,2 Z" />
  </svg>
);

const SHARE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M6.8,12 L10.8,8 L6.8,4 L5.672,5.128 L7.736,7.2 L0,7.2 L0,8.8 L7.736,8.8 L5.672,10.872 L6.8,12 Z M0,0 L0,4.8 L1.6,4.8 L1.6,1.6 L14.4,1.6 L14.4,14.4 L1.6,14.4 L1.6,11.2 L0,11.2 L0,16 L16,16 L16,0 L0,0 Z"
      transform="translate(2 2)"
    />
  </svg>
);

const MODE_TABS: TabsItem[] = [
  { value: "edit",   label: "수정 모드" },
  { value: "admin",  label: "관리자" },
  { value: "view",   label: "뷰 모드" },
  { value: "filter", label: "필터", icon: FILTER_ICON },
];

const PAGE_TOOLS = [
  { key: "print",    label: "인쇄",        icon: PRINT_ICON },
  { key: "settings", label: "설정",        icon: "menu-settings.svg" },
  { key: "share",    label: "공유/내보내기", icon: SHARE_ICON },
];

/* ─── Meta ───────────────────────────────────────────── */

const meta: Meta = {
  title: "Shell/Page/D — 상세 페이지",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**프리셋 D — 상세 페이지.** Sidebar + PageHeader + OptionbarPage + Tabs + MiniLineChart 그리드 + DataTable + WhaTapAiWidget.\n\n" +
          "인스턴스 상세, 서버 상세 등 하나의 대상을 탭으로 나눠 깊이 있게 보여주는 패턴.\n\n" +
          "**포함 컴포넌트:** DashboardLayout · PageHeader · OptionbarPage · Tabs · MiniLineChart · DataTable · WhaTapAiWidget\n\n" +
          "**핵심 기능:** 탭 전환(개요/성능/이벤트) + 차트 2x2 그리드 + 시계열 테이블 + AI 위젯 토글.",
      },
    },
  },
  decorators: [(Story) => (<div style={{ height: 720 }}><Story /></div>)],
};
export default meta;

/* ─── Story ──────────────────────────────────────────── */

/** Example — 탭 전환 + 차트 그리드 + DataTable + AI 위젯. */
export const Example: StoryObj = {
  render: () => {
    const Demo = () => {
      const [aiActive, setAiActive] = useState(false);
      const [activeTab, setActiveTab] = useState("overview");

      return (
        <DashboardLayout
          widgetOpen={aiActive}
          activeProduct="db"
          header={
            <>
              <PageHeader
                title="인스턴스 상세"
                aiActive={aiActive}
                onAiToggle={() => setAiActive((v) => !v)}
              />
              <OptionbarPage
                instanceLabel="DMX-3-12-949"
                instanceStatus="ok"
                databaseLabel="ORA11K"
              />
            </>
          }
          main={
            <div>
              <div style={{ padding: "0 16px" }}>
                <Tabs
                  items={DETAIL_TABS}
                  value={activeTab}
                  onChange={setActiveTab}
                  variant="large"
                  aria-label="인스턴스 상세 탭"
                />
              </div>
              {activeTab === "overview" && <OverviewPanel />}
              {activeTab === "performance" && <PerformancePanel />}
              {activeTab === "events" && <EventsPanel />}
            </div>
          }
        >
          <WhaTapAiWidget
            open={aiActive}
            onClose={() => setAiActive(false)}
            pageHighlight="인스턴스 상세"
          />
        </DashboardLayout>
      );
    };
    return <Demo />;
  },
};

/**
 * Example — **SubHeaderBar 모드 행 적용형.**
 *
 * 위 `Example` 과 본문(탭 패널·차트·테이블)은 동일하고 헤더 영역만 다르다:
 * 1. `PageHeader`(48px) 아래 [[SubHeaderBar]](40px) 모드 행 — `left` 슬롯에 모드 [[Tabs]],
 *    `right` 슬롯에 [[ToolbarIconButton]] 3개(인쇄·설정·공유). LIVE 타이머는 아래 옵션바가 보유.
 * 2. [[OptionbarPage]] 는 DS 기본값(`layout="inline"` + `size="sm"`) 그대로 — 타이틀이 값 좌측에
 *    붙고 컨트롤이 24px 로, 행 자체는 40px 고정이라 바로 위 40px 모드 행과 리듬이 맞는다.
 *
 * 페이지에서 `px py border-b` inline `<div>` 로 툴바를 재구현하지 않고 슬롯 조합으로만 구성한 예.
 */
export const ExampleSubHeaderModeRow: StoryObj = {
  render: () => {
    const Demo = () => {
      const [aiActive, setAiActive] = useState(false);
      const [activeTab, setActiveTab] = useState("overview");
      const [mode, setMode] = useState("view");

      return (
        <DashboardLayout
          widgetOpen={aiActive}
          activeProduct="db"
          header={
            <>
              <PageHeader
                title="인스턴스 상세"
                aiActive={aiActive}
                onAiToggle={() => setAiActive((v) => !v)}
              />
              <SubHeaderBar
                left={
                  <Tabs
                    variant="large"
                    items={MODE_TABS}
                    value={mode}
                    onChange={setMode}
                    aria-label="페이지 모드"
                  />
                }
                right={
                  <>
                    {/* LIVE 타이머는 아래 OptionbarPage "시간" 항목이 이미 보유 — 중복 배치 금지.
                        모드 행 + LIVE 를 한 줄에 합치는 형태는 Primitives/SubHeaderBar → DashboardModeRow 참조. */}
                    {PAGE_TOOLS.map((t) => (
                      <ToolbarIconButton
                        key={t.key}
                        icon={t.icon}
                        label={t.label}
                        tooltipPlacement="bottom"
                      />
                    ))}
                  </>
                }
              />
              <OptionbarPage
                instanceLabel="DMX-3-12-949"
                instanceStatus="ok"
                databaseLabel="ORA11K"
              />
            </>
          }
          main={
            <div>
              <div style={{ padding: "0 16px" }}>
                <Tabs
                  items={DETAIL_TABS}
                  value={activeTab}
                  onChange={setActiveTab}
                  variant="large"
                  aria-label="인스턴스 상세 탭"
                />
              </div>
              {activeTab === "overview" && <OverviewPanel />}
              {activeTab === "performance" && <PerformancePanel />}
              {activeTab === "events" && <EventsPanel />}
            </div>
          }
        >
          <WhaTapAiWidget
            open={aiActive}
            onClose={() => setAiActive(false)}
            pageHighlight="인스턴스 상세"
          />
        </DashboardLayout>
      );
    };
    return <Demo />;
  },
};

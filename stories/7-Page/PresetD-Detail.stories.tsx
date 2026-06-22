import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DashboardLayout, PageHeader, OptionbarPage,
  Tabs, MiniLineChart,
  DataTable, WhaTapAiWidget,
} from "@whatap/design-system";
import type { DataTableColumn } from "@whatap/design-system/DataTable";

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
  <div style={{ padding: 16 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
      <MiniLineChart title="CPU Usage"    values={CPU_DATA}     unit="%" showTopStat />
      <MiniLineChart title="Memory"       values={MEM_DATA}     unit="%" showTopStat color="#8B52FF" />
      <MiniLineChart title="Disk I/O"     values={DISK_DATA}    unit="MB/s" color="#FF8800" />
      <MiniLineChart title="Network"      values={NETWORK_DATA} unit="Mbps" color="#00B442" />
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

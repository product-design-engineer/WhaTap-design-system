import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DashboardLayout, PageHeader, OptionbarPage,
  DataTable, Chip, WhaTapAiWidget,
} from "@whatap/design-system";
import type { DataTableColumn } from "@whatap/design-system/DataTable";

/**
 * **프리셋 A — 기본 대시보드.**
 *
 * 가장 일반적인 WhaTap 모니터링 페이지 패턴.
 * Sidebar + PageHeader + OptionbarPage + DataTable + AI 위젯.
 *
 * `docs/GUIDE.md` "프리셋 A" 코드 템플릿과 1:1 대응.
 */

/* ─── Mock data ──────────────────────────────────────── */

type Row = {
  no: number;
  name: string;
  tps: number;
  cpu: number;
  mem: number;
  status: "정상" | "경고" | "위험";
};

const ROWS: Row[] = [
  { no: 1, name: "gpu-prod-01",    tps: 1_423, cpu: 78, mem: 62, status: "정상" },
  { no: 2, name: "gpu-prod-02",    tps: 892,   cpu: 92, mem: 88, status: "위험" },
  { no: 3, name: "gpu-staging-01", tps: 234,   cpu: 23, mem: 31, status: "정상" },
  { no: 4, name: "gpu-dev-01",     tps: 56,    cpu: 45, mem: 52, status: "경고" },
  { no: 5, name: "gpu-prod-03",    tps: 1_102, cpu: 67, mem: 71, status: "정상" },
  { no: 6, name: "gpu-batch-01",   tps: 0,     cpu: 2,  mem: 8,  status: "정상" },
];

const STATUS_TONE: Record<string, "warning" | "critical" | undefined> = {
  "경고": "warning",
  "위험": "critical",
};

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "no",     header: "No",       width: 52,  numeric: true, render: (r) => r.no },
  { key: "name",   header: "인스턴스",    flex: 2 },
  { key: "tps",    header: "TPS",      width: 96,  numeric: true,
    render: (r) => (
      <span className={`font-numeric tabular-nums${r.tps === 0 ? " text-disabled" : ""}`}>
        {r.tps.toLocaleString()}
      </span>
    ),
  },
  { key: "cpu",    header: "CPU %",    width: 96,  numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.cpu}%</span>,
  },
  { key: "mem",    header: "MEM %",    width: 96,  numeric: true,
    render: (r) => <span className="font-numeric tabular-nums">{r.mem}%</span>,
  },
  { key: "status", header: "상태",      width: 96,
    render: (r) => <Chip size="md" tone={STATUS_TONE[r.status]}>{r.status}</Chip>,
  },
];

/* ─── Meta ───────────────────────────────────────────── */

const meta: Meta = {
  title: "Shell/Page/A — 기본 대시보드",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**프리셋 A — 기본 대시보드.** Sidebar + PageHeader + OptionbarPage + DataTable + WhaTapAiWidget.\n\n" +
          "가장 기본적인 모니터링 페이지 뼈대. `docs/GUIDE.md` 프리셋 A 참조.\n\n" +
          "**포함 컴포넌트:** DashboardLayout · PageHeader · OptionbarPage · DataTable · Chip · WhaTapAiWidget\n\n" +
          "**AI 위젯 토글:** 헤더의 WhaTap AI 버튼 클릭 → 사이드바 240→40px 축소 + 우측 위젯 패널.",
      },
    },
  },
  decorators: [(Story) => (<div style={{ height: 720 }}><Story /></div>)],
};
export default meta;

/* ─── Story ──────────────────────────────────────────── */

/** Example — AI 토글 + 사이드바 축소 + DataTable 인터랙션. */
export const Example: StoryObj = {
  render: () => {
    const Demo = () => {
      const [aiActive, setAiActive] = useState(false);

      return (
        <DashboardLayout
          widgetOpen={aiActive}
          activeProduct="db"
          header={
            <>
              <PageHeader
                title="GPU 모니터링"
                aiActive={aiActive}
                onAiToggle={() => setAiActive((v) => !v)}
              />
              <OptionbarPage
                instanceLabel="gpu-prod-01"
                instanceStatus="ok"
                databaseLabel="GPU-A100"
              />
            </>
          }
          main={
            <div style={{ padding: 16 }}>
              <DataTable<Row>
                columns={COLUMNS}
                rows={ROWS}
                density="default"
                onRowClick={(row) => alert(`선택: ${row.name} (TPS ${row.tps.toLocaleString()})`)}
              />
            </div>
          }
        >
          <WhaTapAiWidget
            open={aiActive}
            onClose={() => setAiActive(false)}
            pageHighlight="GPU 모니터링"
          />
        </DashboardLayout>
      );
    };
    return <Demo />;
  },
};

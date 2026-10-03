import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DashboardLayout, PageHeader, OptionbarPage,
  DataTable, Chip, WhaTapAiWidget,
} from "@whatap/design-system";
import type { DataTableColumn } from "@whatap/design-system";

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
  title: "Shell/PageDashboard",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**프리셋 A — 기본 대시보드.** Sidebar + PageHeader + OptionbarPage + DataTable + WhaTapAiWidget.\n\n" +
          "가장 기본적인 모니터링 페이지 뼈대. `docs/GUIDE.md` 프리셋 A 참조.\n\n" +
          "**포함 컴포넌트:** DashboardLayout · PageHeader · OptionbarPage · DataTable · Chip · WhaTapAiWidget\n\n" +
          "**AI 위젯 토글:** 헤더의 WhaTap AI 버튼 클릭 → 사이드바 240→40px 축소 + 우측 위젯 패널.\n\n" +
          "✅ **Do** — 새 모니터링 페이지는 이 뼈대에서 시작 · 본문 의미 단위(테이블·차트)를 각각 `bg-card` 블록으로 감싸기 · " +
          "거터는 `--wds-page-px` 하나로(헤더·옵션바·본문이 같은 선에 정렬) · AI 진입점은 PageHeader 의 토글로\n\n" +
          "❌ **Don't** — 헤더/옵션바를 인라인 `<div>` 로 재구현 · 회색 바닥에 테이블을 맨몸으로 배치 · " +
          "본문 패딩에 매직넘버(`padding:16`) — `.wds-page-content` 사용 · AI 위젯이 열렸다고 헤더 항목을 숨기기" +
          "(page-header-invariant 위반)\n\n" +
          // ↓ 이 두 섹션은 build-components-json 이 whenToUse/whenNotToUse 로 읽는다 —
          //   컴포넌트 이름을 모르는 사람이 «하려는 일»로 검색해 이 프리셋에 도달하는 축이다.
          "## When to use\n" +
          "- 목록·지표를 한 화면에서 훑는 일반 모니터링 페이지 — 인스턴스·세션·프로세스·알림 목록.\n" +
          "- 조회 조건(기간·대상)을 옵션바에서 바꿔 가며 표를 보는 화면.\n" +
          "- AI 를 «필요할 때 여는» 보조 도구로 두는 화면(진입점은 PageHeader 토글).\n\n" +
          "## When NOT to use\n" +
          "- 화면 본문 자체가 대화인 AI 모드 화면 → 프리셋 B.\n" +
          "- 하나의 대상을 탭으로 나눠 깊이 보는 상세 → 프리셋 D.\n" +
          "- 노드-엣지 관계 탐색 → Shell/Page/TopologyOverview.",
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
            <div className="wds-page-content">
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

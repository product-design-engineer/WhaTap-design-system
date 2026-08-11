import { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Chip,
  DataTable,
  TopologyCanvas,
  TopologyMinimap,
  TopologyToolbar,
  TopologyZoomControl,
  type DataTableColumn,
  type TopologyDirection,
  type TopologyGraph,
  type TopologyView,
} from "@whatap/design-system";

/**
 * Shell/Page — 토폴로지 Overview 합성 템플릿.
 *
 * 조회 조건(툴바) → 캔버스(+미니맵·줌) → 하단 상세 드로어의 3단 구성을 한 화면으로 조립한다.
 * **페이지가 모든 상태의 주인**이다 — 툴바·캔버스·미니맵·줌 컨트롤은 전부 controlled 라
 * 어느 하나도 자기 사본을 들고 있지 않는다.
 *
 * 이 스토리는 토폴로지 프리미티브의 **도그푸딩 대상**이다. 여기서 인라인으로 무언가를
 * 새로 그려야 한다면 그건 빠진 컴포넌트가 있다는 신호다.
 */
const meta: Meta = {
  title: "Shell/Page/TopologyOverview",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const BASE_GRAPH: TopologyGraph = {
  nodes: [
    {
      id: "redis-a",
      label: "Redis-Master",
      children: [
        { id: "az-a1", label: "US-east-1b", metric: "150 kbps", trend: "up" },
        { id: "az-a2", label: "US-east-1b", metric: "150 kbps", trend: "up" },
      ],
    },
    { id: "sdk", label: "sdkclient.eng", metric: "150 kbps", trend: "up", tone: "ok" },
    { id: "ssm", label: "aws-ssm.com", metric: "150 kbps", trend: "up", tone: "alert" },
    {
      id: "redis-b",
      label: "Redis-Master",
      children: [
        { id: "az-b1", label: "US-east-1b", metric: "150 kbps", trend: "up" },
        { id: "az-b2", label: "US-east-1b", metric: "150 kbps", trend: "up" },
      ],
    },
    {
      id: "redis-c",
      label: "Redis-Master",
      children: [
        { id: "az-c1", label: "US-east-1b", metric: "150 kbps", trend: "up" },
        { id: "az-c2", label: "US-east-1b", metric: "150 kbps", trend: "up" },
      ],
    },
  ],
  edges: [
    { from: "az-a1", to: "sdk", label: "23 kbps" },
    { from: "az-a2", to: "ssm", label: "23 kbps" },
    { from: "sdk", to: "az-b1", label: "23 kbps" },
    { from: "ssm", to: "az-b2", label: "23 kbps", tone: "alert" },
    { from: "sdk", to: "az-b2", label: "5 kbps" },
    { from: "az-b1", to: "az-c1", label: "77 kbps" },
    { from: "az-b2", to: "az-c2", label: "37 kbps" },
    { from: "az-c1", to: "sdk", label: "13 kbps" },
  ],
};

type FlowRow = {
  from: string;
  to: string;
  status: "경보" | "주의" | "정상";
  current: number;
};

const ROWS: FlowRow[] = [
  { from: "sdkeng-client-sip", to: "5-16-app.agent.datadog.com", status: "경보", current: 510 },
  { from: "sawmill:dev", to: "sdkeng-client-sip-proxy:dev", status: "경보", current: 214 },
  { from: "ad.au1.twilio.com", to: "5-16-0-app.agent.datadog.com", status: "주의", current: 127 },
  { from: "sdkeng-client-sip", to: "sdkeng-client-sip-proxy:dev", status: "주의", current: 83 },
  { from: "aws-ssm.com", to: "us-east-1b.redis", status: "정상", current: 42 },
];

const TONE = { 경보: "critical", 주의: "warning", 정상: "success" } as const;

const COLUMNS: DataTableColumn<FlowRow>[] = [
  { key: "from", header: "From", flex: 2 },
  { key: "to", header: "To", flex: 3 },
  {
    key: "status",
    header: "상태",
    width: 96,
    render: (r) => (
      <Chip size="md" tone={TONE[r.status]} variant="soft">
        {r.status}
      </Chip>
    ),
  },
  {
    key: "current",
    header: "현재 (kbps)",
    width: 120,
    numeric: true,
    render: (r) => <span className="text-md font-numeric tabular-nums">{r.current}</span>,
  },
];

const METRIC_OPTIONS = [
  { value: "throughput", label: "처리량" },
  { value: "latency", label: "응답시간" },
  { value: "errors", label: "에러" },
];

const CANVAS_W = 1180;
const CANVAS_H = 460;

function TopologyOverviewPage() {
  const [graph, setGraph] = useState(BASE_GRAPH);
  const [view, setView] = useState<TopologyView>({ x: 0, y: 0, scale: 1 });
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [metric, setMetric] = useState("throughput");
  const [direction, setDirection] = useState<TopologyDirection>("in");

  const toggle = useCallback((id: string) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, collapsed: !n.collapsed } : n)),
    }));
  }, []);

  const reset = useCallback(() => {
    setGraph(BASE_GRAPH);
    setView({ x: 0, y: 0, scale: 1 });
    setQuery("");
    setDirection("in");
  }, []);

  // 검색어는 표에만 적용한다 — 캔버스에서 노드를 걸러내면 연결이 끊긴 그래프가 되어
  // "안 보이는 것"과 "연결이 없는 것"을 구분할 수 없다.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROWS;
    return ROWS.filter((r) => `${r.from} ${r.to}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="bg-bg w-full min-h-screen">
      <div className="wds-page-content flex flex-col gap-16px">
        {/* 컨트롤 행은 카드로 감싸지 않는다 — TextField·Select·Switch·Button 이 이미 각자
            bg-card 표면을 갖고 있어서 한 번 더 감싸면 카드 위 카드가 된다(레퍼런스도 동일). */}
        <div data-ds-policy-ok="컨트롤 행 — 각 컨트롤이 자체 카드 표면 보유">
          <TopologyToolbar
            query={query}
          onQueryChange={setQuery}
          editing={editing}
          onEditingChange={setEditing}
          metric={metric}
          onMetricChange={setMetric}
          metricOptions={METRIC_OPTIONS}
          direction={direction}
            onDirectionChange={setDirection}
            onReset={reset}
          />
        </div>

        {/* 캔버스는 --color-card 로 감싸지 않는다 — 토폴로지 캔버스는 page/card 위의
            **세 번째 표면 층**(--color-topology-canvas-*)이고, 그게 이 화면의 카드 역할이다. */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ height: CANVAS_H }}
          data-ds-policy-ok="토폴로지 캔버스 — 자체 표면 층(page/card 와 별개)"
        >
          <TopologyCanvas
            graph={graph}
            view={view}
            onViewChange={setView}
            onToggle={toggle}
            className="w-full h-full"
          />
          <div className="absolute left-16px bottom-16px flex flex-col gap-8px">
            <TopologyMinimap
              graph={graph}
              view={view}
              viewportWidth={CANVAS_W}
              viewportHeight={CANVAS_H}
            />
            <TopologyZoomControl
              scale={view.scale}
              onScaleChange={(scale) => setView((v) => ({ ...v, scale }))}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl p-16px">
          <p className="text-lg font-bold text-primary mb-12px">흐름 상세</p>
          <DataTable columns={COLUMNS} rows={rows} density="default" />
        </div>
      </div>
    </div>
  );
}

/** 기본 — 툴바·캔버스·미니맵·줌·상세 표가 하나의 상태를 공유한다. */
export const Default: Story = { render: () => <TopologyOverviewPage /> };

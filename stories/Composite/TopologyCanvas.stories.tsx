import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TopologyCanvas,
  TopologyMinimap,
  TopologyZoomControl,
  type TopologyGraph,
  type TopologyView,
} from "@whatap/design-system";

/**
 * Stories for [[TopologyCanvas]] — 배치·라우팅·pan/zoom 을 담당하는 토폴로지 뷰포트.
 *
 * 뷰포트 상태는 controlled 라 스토리가 소유한다. 미니맵·줌 컨트롤이 **같은 상태**를 읽는
 * 구성을 그대로 보여준다 — 이 셋이 상태를 나눠 가지면 반드시 어긋난다.
 */
const meta: Meta<typeof TopologyCanvas> = {
  title: "Composite/TopologyCanvas",
  component: TopologyCanvas,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof TopologyCanvas>;

const GRAPH: TopologyGraph = {
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
    { id: "ssm", label: "aws-ssm.com", metric: "150 kbps", trend: "up" },
    {
      id: "redis-b",
      label: "Redis-Master",
      children: [
        { id: "az-b1", label: "US-east-1b", metric: "150 kbps", trend: "up" },
        { id: "az-b2", label: "US-east-1b", metric: "150 kbps", trend: "up" },
      ],
    },
  ],
  edges: [
    { from: "az-a1", to: "sdk", label: "23 kbps" },
    { from: "az-a2", to: "ssm", label: "23 kbps" },
    { from: "sdk", to: "az-b1", label: "23 kbps" },
    { from: "ssm", to: "az-b2", label: "23 kbps", tone: "alert" },
    { from: "sdk", to: "az-b2", label: "5 kbps" },
  ],
};

const W = 900;
const H = 460;

/** 캔버스 + 미니맵 + 줌 컨트롤이 하나의 뷰포트 상태를 공유하는 표준 구성. */
function Workspace({ graph = GRAPH }: { graph?: TopologyGraph }) {
  const [view, setView] = useState<TopologyView>({ x: 0, y: 0, scale: 1 });
  const [g, setG] = useState(graph);

  const toggle = (id: string) =>
    setG((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, collapsed: !n.collapsed } : n)),
    }));

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <TopologyCanvas
        graph={g}
        view={view}
        onViewChange={setView}
        onToggle={toggle}
        className="w-full h-full"
      />
      <div className="absolute left-16px bottom-16px flex flex-col gap-8px">
        <TopologyMinimap graph={g} view={view} viewportWidth={W} viewportHeight={H} />
        <TopologyZoomControl
          scale={view.scale}
          onScaleChange={(scale) => setView((v) => ({ ...v, scale }))}
        />
      </div>
    </div>
  );
}

/** 기본 — 그룹 2개 + 중계 노드 2개. 노드 뱃지를 눌러 접고 펼 수 있다. */
export const Default: Story = { render: () => <Workspace /> };

/** 그룹이 접힌 상태 — 자식이 사라지고 그룹이 리프 크기로 줄어든다. */
export const Collapsed: Story = {
  render: () => (
    <Workspace
      graph={{
        ...GRAPH,
        nodes: GRAPH.nodes.map((n) => (n.children ? { ...n, collapsed: true } : n)),
      }}
    />
  ),
};

/** 경보 경로 — alert tone 엣지·노드가 강조색으로 추적 가능하다. */
export const AlertPath: Story = {
  render: () => (
    <Workspace
      graph={{
        nodes: GRAPH.nodes.map((n) => (n.id === "ssm" ? { ...n, tone: "alert" as const } : n)),
        edges: GRAPH.edges.map((e) =>
          e.from === "az-a2" || e.to === "az-b2" ? { ...e, tone: "alert" as const } : e,
        ),
      }}
    />
  ),
};

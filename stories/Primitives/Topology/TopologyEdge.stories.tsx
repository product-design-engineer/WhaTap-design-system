import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyEdge, TopologyPort, layoutTopology, type LaidOutEdge } from "@whatap/design-system";

/**
 * Stories for [[TopologyEdge]] — 직교 연결선 + 값 라벨.
 *
 * 경로(`d`)는 [[layoutTopology]] 가 라우팅한 결과를 그대로 쓴다. 스토리가 `d` 를 손으로
 * 쓰면 라우터가 바뀌어도 카탈로그는 옛 모양을 계속 보여주게 된다.
 */
const meta: Meta<typeof TopologyEdge> = {
  title: "Primitives/Topology/TopologyEdge",
  component: TopologyEdge,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof TopologyEdge>;

/** 배치 엔진에서 엣지를 꺼내 SVG 프레임에 그린다. */
function EdgeFrame({
  graph,
  index = 0,
  showPorts = true,
  ...rest
}: {
  graph: Parameters<typeof layoutTopology>[0];
  index?: number;
  showPorts?: boolean;
} & Omit<React.ComponentProps<typeof TopologyEdge>, "edge">) {
  const l = layoutTopology(graph);
  const edge: LaidOutEdge | undefined = l.edges[index];
  if (!edge) return <p className="text-sm">엣지 없음</p>;
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, var(--color-topology-canvas-from), var(--color-topology-canvas-to))",
        borderRadius: "var(--radius-xl)",
        display: "inline-block",
      }}
    >
      <svg width={l.width} height={l.height} role="img" aria-label="엣지 예시">
        <TopologyEdge edge={edge} {...rest} />
        {showPorts && (
          <>
            <TopologyPort x={edge.source.x} y={edge.source.y} tone={edge.tone === "alert" ? "alert" : "default"} />
            <TopologyPort x={edge.target.x} y={edge.target.y} tone={edge.tone === "alert" ? "alert" : "default"} />
          </>
        )}
      </svg>
    </div>
  );
}

const twoNodes = { nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }] };

/** 같은 높이 — 꺾임 없는 직선. */
export const Straight: Story = {
  render: () => (
    <EdgeFrame graph={{ ...twoNodes, edges: [{ from: "a", to: "b", label: "23 kbps" }] }} />
  ),
};

/** 높이 차 — 중간 x 에서 한 번 꺾이는 직교 경로. 라벨은 가장 긴 수평 구간 위. */
export const Stepped: Story = {
  render: () => (
    <EdgeFrame
      graph={{
        nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }, { id: "c", label: "c" }],
        edges: [
          { from: "a", to: "b", label: "23 kbps" },
          { from: "a", to: "c", label: "5 kbps" },
        ],
      }}
      index={1}
    />
  ),
};

/** tone=alert — 경보 경로. 캔버스 전체에서 눈으로 추적할 수 있게 강조색. */
export const Alert: Story = {
  render: () => (
    <EdgeFrame
      graph={{ ...twoNodes, edges: [{ from: "a", to: "b", label: "20 kbps", tone: "alert" }] }}
    />
  ),
};

/** 라벨 없음 — 선만. */
export const NoLabel: Story = {
  render: () => <EdgeFrame graph={{ ...twoNodes, edges: [{ from: "a", to: "b" }] }} />,
};

/**
 * 역방향 엣지 — target 이 왼쪽이라 노드 아래로 우회한다.
 * (직선으로 이으면 두 노드 박스를 관통한다.)
 */
export const Backward: Story = {
  render: () => (
    <EdgeFrame
      graph={{
        ...twoNodes,
        edges: [
          { from: "a", to: "b" },
          { from: "b", to: "a", label: "120 kbps" },
        ],
      }}
      index={1}
    />
  ),
};

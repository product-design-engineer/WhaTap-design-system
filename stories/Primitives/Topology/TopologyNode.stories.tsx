import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyNode, layoutTopology, type LaidOutNode } from "@whatap/design-system";

/**
 * Stories for [[TopologyNode]] — 토폴로지 캔버스 위의 노드 한 개.
 *
 * 좌표는 컴포넌트가 아니라 [[layoutTopology]] 가 정한다. 여기서도 그 규칙을 그대로 지켜
 * 실제 배치 결과에서 노드를 하나씩 꺼내 보여준다 — 스토리가 좌표를 손으로 적으면
 * 캔버스와 다른 것을 보여주게 된다.
 */
const meta: Meta<typeof TopologyNode> = {
  title: "Primitives/Topology/TopologyNode",
  component: TopologyNode,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: 320,
          height: 220,
          background:
            "linear-gradient(135deg, var(--color-topology-canvas-from), var(--color-topology-canvas-to))",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TopologyNode>;

/** 배치 엔진을 1회 돌려 원하는 노드를 꺼낸다 — 좌표 하드코딩 방지. */
function laidOut(spec: Parameters<typeof layoutTopology>[0]["nodes"], id: string): LaidOutNode {
  const l = layoutTopology({ nodes: spec, edges: [] });
  const n = l.nodes.find((n) => n.id === id);
  if (!n) throw new Error(`${id} 미배치`);
  // 스토리 프레임 좌상단으로 당겨 붙인다(캔버스 패딩 제거).
  return { ...n, x: 16, y: 16 };
}

/** 리프 노드 — 뱃지 + 타이틀 + 지표 + 추세. 레퍼런스의 기본 카드. */
export const Leaf: Story = {
  args: {
    node: laidOut([{ id: "a", label: "US-east-1b", metric: "150 kbps", trend: "up" }], "a"),
  },
};

/** 지표 없음 — 타이틀만. 부제 줄이 사라지고 타이틀이 세로 중앙에 온다. */
export const LabelOnly: Story = {
  args: { node: laidOut([{ id: "a", label: "sdkclient.eng" }], "a") },
};

/** tone=ok — 정상 연결을 나타내는 초록 뱃지. */
export const ToneOk: Story = {
  args: {
    node: laidOut([{ id: "a", label: "sdkclient.eng", metric: "150 kbps", trend: "up", tone: "ok" }], "a"),
  },
};

/** tone=alert — 경보 경로 위의 노드. 엣지 강조색과 같은 계열. */
export const ToneAlert: Story = {
  args: {
    node: laidOut([{ id: "a", label: "aws-ssm.com", metric: "150 kbps", trend: "down", tone: "alert" }], "a"),
  },
};

/** 접힌 그룹 — `+` 글리프. 리프와 같은 크기로 줄어든다. */
export const CollapsedGroup: Story = {
  args: {
    node: laidOut(
      [
        {
          id: "g",
          label: "Redis-Master",
          collapsed: true,
          children: [{ id: "c1", label: "US-east-1b" }],
        },
      ],
      "g",
    ),
  },
};

/**
 * 펼친 그룹 컨테이너 — 헤더만 그리고 본문은 비운다.
 * 실제 캔버스에서는 자식 노드가 이 위에 형제로 겹쳐 놓인다(여기서는 컨테이너만).
 */
export const GroupContainer: Story = {
  args: {
    node: laidOut(
      [
        {
          id: "g",
          label: "Redis-Master",
          children: [
            { id: "c1", label: "US-east-1b", metric: "150 kbps", trend: "up" },
            { id: "c2", label: "US-east-1b", metric: "150 kbps", trend: "up" },
          ],
        },
      ],
      "g",
    ),
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopologyMinimap } from "@whatap/design-system";
import type { TopologyGraph } from "@whatap/design-system";

/**
 * Stories for [[TopologyMinimap]] — 그래프 전체와 «지금 보고 있는 사각형».
 *
 * 좌표는 여기서 계산하지 않는다 — [[layoutTopology]] 를 그대로 한 번 더 돌려 축척만 줄인다.
 * 그래서 캔버스와 미니맵이 어긋날 수 없다. `view` 는 캔버스와 **같은 상태**를 받는다.
 */
const meta: Meta<typeof TopologyMinimap> = {
  title: "Primitives/TopologyMinimap",
  component: TopologyMinimap,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof TopologyMinimap>;

const GRAPH: TopologyGraph = {
  nodes: [
    { id: "web", label: "Web", metric: "1.2k tps" },
    { id: "api", label: "API", metric: "980 tps" },
    { id: "auth", label: "Auth" },
    { id: "redis", label: "Redis", tone: "alert", metric: "92 ms", trend: "up" },
    { id: "pg", label: "Postgres", tone: "ok" },
  ],
  edges: [
    { from: "web", to: "api" },
    { from: "api", to: "auth" },
    { from: "api", to: "redis", tone: "alert" },
    { from: "api", to: "pg" },
  ],
};

/** 전체가 보이는 상태(배율 1) — 뷰포트 사각형이 그래프를 모두 덮는다. */
export const Default: Story = {
  args: { graph: GRAPH, view: { x: 0, y: 0, scale: 1 }, viewportWidth: 640, viewportHeight: 360 },
};

/** 확대해 일부만 보는 상태 — 사각형이 줄어 «어디를 보고 있는지»가 드러난다. */
export const ZoomedIn: Story = {
  args: { graph: GRAPH, view: { x: -120, y: -40, scale: 1.8 }, viewportWidth: 640, viewportHeight: 360 },
};

/** 폭만 주면 높이는 **그래프 종횡비**로 정해진다 — 고정 높이면 넓적한 그래프에서 아래가 빈다. */
export const NarrowWidth: Story = {
  args: { graph: GRAPH, view: { x: 0, y: 0, scale: 1 }, viewportWidth: 640, viewportHeight: 360, width: 120 },
};

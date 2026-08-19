/**
 * topology — 노드-엣지 토폴로지 그래프 계열.
 *
 * 배치는 `layoutTopology`(순수 함수)가, 렌더는 프리미티브가 담당한다.
 * 좌표 계산과 렌더를 분리해 둔 이유: 배치 규칙을 브라우저 없이 유닛 테스트로 고정하기 위함.
 */
export { default as TopologyNode } from "./TopologyNode";
export { default as TopologyEdge } from "./TopologyEdge";
export { default as TopologyPort } from "./TopologyPort";
export { default as TopologyCollapseToggle } from "./TopologyCollapseToggle";
export { default as TopologyZoomControl } from "./TopologyZoomControl";
export { default as TopologyMinimap } from "./TopologyMinimap";

export { default as TopologyCanvas, clampScale, TOPOLOGY_ZOOM } from "./TopologyCanvas";
export type { TopologyView } from "./TopologyCanvas";

export { default as TopologyToolbar } from "./TopologyToolbar";
export type { TopologyDirection } from "./TopologyToolbar";

export { layoutTopology, roundedPolyline, METRICS as TOPOLOGY_METRICS } from "./layout";
export type {
  TopologyGraph,
  TopologyNodeSpec,
  TopologyEdgeSpec,
  TopologyLayout,
  LaidOutNode,
  LaidOutEdge,
} from "./layout";

export { TOPOLOGY_BADGE_BG, TOPOLOGY_PORT_FILL, TOPOLOGY_EDGE_STROKE } from "./_tokens";
export type { TopologyTone } from "./_tokens";

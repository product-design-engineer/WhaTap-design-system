import { TOPOLOGY_PORT_FILL, type TopologyTone } from "./_tokens";

/**
 * TopologyPort — Primitives. 노드 경계에서 엣지가 물리는 지점을 표시하는 원형 도트.
 *
 * ## Purpose
 * 연결선이 노드의 어느 지점에 붙는지 눈에 보이게 만든다. 선만 있으면 노드 모서리에서
 * 시작·끝이 흐려져 어느 노드에 연결됐는지 읽기 어렵다. tone 으로 그 연결의 상태
 * (정상/경보)를 알린다.
 *
 * ## When to use
 * - [[TopologyCanvas]] 가 엣지마다 `source`/`target` 두 지점에 렌더하는 **기본 용법**.
 * - [[TopologyCanvas]] 의 연결점 모양(정상 · 경보 tone)을 고치거나 Figma 와 대조할 때.
 *
 * ## When NOT to use
 * - 상태만 나타내는 목록 앞 점 → `Chip` 의 dot 또는 status dot 유틸.
 * - 차트 데이터 포인트 → 차트 컴포넌트 자체의 마커.
 *
 * ## Composition rules
 * - **SVG 좌표계 안에서만 쓴다** — `<circle>` 을 렌더하므로 `<svg>` 밖에서는 아무것도 그려지지 않는다.
 *   엣지와 같은 `<svg>` 에 넣어야 좌표가 1:1로 맞는다.
 * - 반경은 캔버스 줌과 무관하게 고정(=줌은 부모 transform 이 담당).
 * - 색은 `TOPOLOGY_PORT_FILL` 의 **유틸 클래스** — `fill` 을 presentation attribute 로 박지 않는다.
 *
 * @example
 * ```tsx
 * <circle … />  // ↓ 엣지와 같은 <svg> 안에서
 * <TopologyPort x={edge.source.x} y={edge.source.y} tone={edge.tone === "alert" ? "alert" : "default"} />
 * ```
 */
export default function TopologyPort({
  x,
  y,
  tone = "default",
  radius = 5,
}: {
  x: number;
  y: number;
  tone?: TopologyTone;
  /** 도트 반경(px). 기본 5 — 레퍼런스 기준. */
  radius?: number;
}) {
  return <circle cx={x} cy={y} r={radius} className={TOPOLOGY_PORT_FILL[tone]} />;
}

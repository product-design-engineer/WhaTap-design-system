import { TOPOLOGY_EDGE_STROKE } from "./_tokens";
import type { LaidOutEdge } from "./layout";

/**
 * TopologyEdge — Primitives. 노드 두 개를 잇는 직교 연결선과 그 위의 값 라벨.
 *
 * ## Purpose
 * [[layoutTopology]] 가 라우팅한 경로(`d`)를 그리고, 라벨이 있으면 경로에서 가장 긴 구간의
 * 중앙에 얹는다. 세로 구간에 놓일 때는 -90° 로 세워 선을 따라 읽히게 한다.
 * `tone="alert"` 는 경보 경로를 캔버스 전체에서 눈으로 추적할 수 있게 강조색으로 그린다.
 *
 * ## When to use
 * - [[TopologyCanvas]] 가 `layout.edges.map` 으로 엣지마다 렌더하는 **기본 용법**.
 *
 * ## When NOT to use
 * - 곡선/유기적 연결(마인드맵 등) — 이 컴포넌트는 직교 경로 전용이다.
 * - 단순 구분선 → `border-*` 토큰.
 *
 * ## Composition rules
 * - **`<svg>` 안에서만 쓴다.** 노드(HTML)와 같은 좌표 원점을 공유해야 선이 카드에 정확히 물린다 —
 *   캔버스가 `<svg>` 와 노드 레이어를 같은 크기·같은 위치로 겹쳐 놓는 것이 전제다.
 * - **`fontSize` 에 단위를 반드시 붙인다**(`11px`). 단위를 빼면 user-space 단위가 되어
 *   viewBox 스케일에 딸려 커진다 — DS 정책.
 * - 라벨 뒤에 배경판을 깔지 않는다(레퍼런스와 동일). 대신 선에서 `labelOffset` 만큼 띄운다.
 * - 색은 `TOPOLOGY_EDGE_STROKE` 의 **유틸 클래스** — `stroke`/`fill` 을 presentation
 *   attribute 로 박지 않는다. 라벨 색도 `.fill-text-tertiary`.
 *
 * @example
 * ```tsx
 * <svg width={layout.width} height={layout.height}>
 *   {layout.edges.map((e, i) => <TopologyEdge key={i} edge={e} />)}
 * </svg>
 * ```
 */
export default function TopologyEdge({
  edge,
  labelOffset = 10,
}: {
  /** [[layoutTopology]] 가 라우팅한 엣지. */
  edge: LaidOutEdge;
  /** 라벨을 선에서 띄우는 거리(px). */
  labelOffset?: number;
}) {
  const strokeClass = TOPOLOGY_EDGE_STROKE[edge.tone];
  const { x, y, angle } = edge.labelAt;
  // 수평 구간이면 선 위로, 세로 구간이면 선 왼쪽으로 띄운다.
  const lx = angle === 0 ? x : x - labelOffset;
  const ly = angle === 0 ? y - labelOffset : y;

  return (
    <g>
      <path
        d={edge.d}
        fill="none"
        className={strokeClass}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {edge.label && (
        <text
          x={lx}
          y={ly}
          fontSize="11px"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-text-tertiary"
          transform={angle === -90 ? `rotate(-90 ${lx} ${ly})` : undefined}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

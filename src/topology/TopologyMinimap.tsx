import { useMemo } from "react";
import { layoutTopology, type TopologyGraph } from "./layout";
import type { TopologyView } from "./TopologyCanvas";

/**
 * TopologyMinimap — Primitives. 그래프 전체를 축소해 보여주고 현재 보이는 영역을 표시한다.
 *
 * ## Purpose
 * 확대된 캔버스에서 "지금 전체 중 어디를 보고 있는지"를 알려준다. 노드를 단순 사각형으로
 * 축소해 그리고, 그 위에 현재 뷰포트 사각형을 겹친다.
 *
 * ## When to use
 * - pan/zoom 이 있는 [[TopologyCanvas]] 옆(보통 좌하단)에.
 * - 그래프가 한 화면을 넘어 확대해서 볼 때 — 지금 보는 영역이 전체 중 어디인지 잃지 않게.
 *
 * ## When NOT to use
 * - 노드가 한 화면에 다 들어오는 작은 그래프 — 미니맵이 같은 그림을 두 번 보여줄 뿐이다.
 *
 * ## Composition rules
 * - **뷰포트 사각형은 `view` 에서 역산한다** — 캔버스와 같은 상태를 읽으므로 따로 계산하거나
 *   저장하지 않는다. 두 곳에서 계산하면 반드시 어긋난다.
 * - 노드는 색·라벨 없이 형태만 — 미니맵은 위치 감각을 주는 것이지 내용을 읽는 곳이 아니다.
 * - 색은 유틸 클래스. 인라인에는 축척으로 계산한 좌표·크기만 남는다.
 *
 * @example
 * ```tsx
 * <TopologyMinimap graph={graph} view={view} viewportWidth={w} viewportHeight={h} />
 * ```
 */
export default function TopologyMinimap({
  graph,
  view,
  viewportWidth,
  viewportHeight,
  width = 168,
  height,
}: {
  graph: TopologyGraph;
  /** 캔버스와 공유하는 뷰포트 상태. */
  view: TopologyView;
  /** 캔버스가 화면에서 차지하는 실제 폭/높이(px) — 보이는 영역 계산에 필요. */
  viewportWidth: number;
  viewportHeight: number;
  width?: number;
  /** 미지정 시 **그래프 종횡비**로 정한다 — 고정 높이면 넓적한 그래프에서 아래가 크게 빈다. */
  height?: number;
}) {
  const layout = useMemo(() => layoutTopology(graph), [graph]);
  const h = height ?? clampHeight((width * layout.height) / layout.width);
  // 전체 그래프를 미니맵 안에 담는 축척(가로·세로 중 더 빡빡한 쪽 기준).
  const k = Math.min(width / layout.width, h / layout.height);

  // 캔버스 좌상단(0,0)에 보이는 그래프 좌표 = (-view.x / scale, -view.y / scale)
  // 뷰포트가 그래프보다 크면 사각형이 미니맵 밖으로 삐져나가므로 미니맵 안으로 자른다.
  const x0 = Math.max(0, (-view.x / view.scale) * k);
  const y0 = Math.max(0, (-view.y / view.scale) * k);
  const x1 = Math.min(width, ((-view.x + viewportWidth) / view.scale) * k);
  const y1 = Math.min(h, ((-view.y + viewportHeight) / view.scale) * k);
  const vx = x0;
  const vy = y0;
  const vw = Math.max(0, x1 - x0);
  const vh = Math.max(0, y1 - y0);

  return (
    <div className="bg-card rounded-lg shadow-xs p-8px">
      <svg width={width} height={h} role="img" aria-label="토폴로지 미니맵">
        {layout.nodes.map((n) => (
          <rect
            key={n.id}
            x={n.x * k}
            y={n.y * k}
            width={n.width * k}
            height={n.height * k}
            rx={2}
            className={n.isGroup && !n.collapsed ? "fill-topology-port" : "fill-topology-node"}
          />
        ))}
        <rect
          x={vx}
          y={vy}
          width={vw}
          height={vh}
          className="fill-none stroke-topology-viewport"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}

/** 너무 납작하거나 너무 높아지지 않게 자른다 — 미니맵은 위치 감각용이지 그래프 재현이 아니다. */
function clampHeight(h: number): number {
  return Math.round(Math.min(140, Math.max(56, h)));
}

import { useCallback, useMemo, useRef, type PointerEvent, type WheelEvent } from "react";
import TopologyNode from "./TopologyNode";
import TopologyEdge from "./TopologyEdge";
import TopologyPort from "./TopologyPort";
import { layoutTopology, clampScale, type TopologyGraph } from "./layout";

/** 캔버스 뷰포트 상태 — 이동(px) + 배율. */
export type TopologyView = { x: number; y: number; scale: number };

/* 배율 상수·clamp 는 `layout`(계층 없는 순수 모듈)이 소유한다 — 줌 컨트롤이 캔버스를
   값으로 import 하지 않도록. 기존 호출부 호환을 위해 여기서 다시 내보낸다. */
export { TOPOLOGY_ZOOM, clampScale } from "./layout";

/**
 * TopologyCanvas — Composite. 그래프를 배치·라우팅해 그리고 pan/zoom 을 처리하는 뷰포트.
 *
 * ## Purpose
 * `graph` 를 받아 [[layoutTopology]] 로 좌표를 구한 뒤, 엣지(`<svg>`)와 노드(HTML)를
 * **같은 원점·같은 크기**로 겹쳐 그린다. 두 레이어가 하나의 transform 을 공유하므로
 * 확대·이동해도 선이 카드에서 떨어지지 않는다.
 *
 * ## When to use
 * - 토폴로지를 보여주는 모든 화면의 본문 (Shell 페이지가 조립해 쓴다).
 *
 * ## When NOT to use
 * - 노드 하나만 보여줄 때 → [[TopologyNode]] 직접 사용.
 * - 자유 배치(드래그로 노드를 옮기는 편집 모드) — 이 캔버스는 좌표를 레이아웃 엔진이
 *   소유한다는 전제 위에 있다. 편집 모드는 좌표가 데이터가 되므로 별도 구조가 필요하다.
 *
 * ## Metrics
 * - ✅ 대상 간 호출 · 연결 관계 — 서비스 호출 · 네트워크 흐름(엣지 두께 = 트래픽량) · 노드 상태
 * - ❌ 관계가 없는 대상 목록의 수치 비교 → [[BarList]]
 *
 * ## Composition rules
 * - **뷰포트 상태는 controlled** (`view` + `onViewChange`). 미니맵·줌 컨트롤이 같은 상태를
 *   공유해야 하므로 캔버스가 혼자 들고 있으면 안 된다.
 * - Primitives([[TopologyNode]]·[[TopologyEdge]]·[[TopologyPort]])만 import 한다 —
 *   Composite 끼리 import 금지 규칙을 지킨다.
 * - 색은 유틸 클래스(`.bg-topology-canvas` / `.bg-topology-grid`). 인라인 style 에 남는 것은
 *   transform·크기 같은 기하값뿐이다.
 * - 도트 그리드는 **transform 안쪽 레이어**에 있다 — 겉면에 두면 줌해도 격자가 안 커져
 *   배율감이 사라진다.
 * - 엣지 `<svg>` 는 `pointer-events: none` — 선이 노드 클릭을 가로채면 안 된다.
 *
 * @example
 * ```tsx
 * const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
 * <TopologyCanvas graph={graph} view={view} onViewChange={setView} onToggle={toggle} />
 * ```
 */
export default function TopologyCanvas({
  graph,
  view,
  onViewChange,
  onToggle,
  className = "",
}: {
  graph: TopologyGraph;
  /** 뷰포트 상태(controlled). */
  view: TopologyView;
  onViewChange: (next: TopologyView) => void;
  /** 그룹 노드 접기/펼치기 — id 를 돌려준다. */
  onToggle?: (id: string) => void;
  className?: string;
}) {
  // 그래프가 바뀔 때만 재계산 — 이동/확대는 transform 이라 레이아웃과 무관하다.
  const layout = useMemo(() => layoutTopology(graph), [graph]);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // 노드/버튼 위에서 시작한 드래그는 무시 — 캔버스 여백에서만 이동한다.
      if ((e.target as HTMLElement).closest("[data-topology-node]")) return;
      drag.current = { px: e.clientX, py: e.clientY, ox: view.x, oy: view.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [view.x, view.y],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      onViewChange({ ...view, x: d.ox + (e.clientX - d.px), y: d.oy + (e.clientY - d.py) });
    },
    [onViewChange, view],
  );

  const endDrag = useCallback(() => {
    drag.current = null;
  }, []);

  const onWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      // 커서 아래 지점을 고정한 채 확대 — 그러지 않으면 확대할수록 보던 곳이 화면 밖으로 밀린다.
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const next = clampScale(view.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
      const k = next / view.scale;
      onViewChange({ x: cx - (cx - view.x) * k, y: cy - (cy - view.y) * k, scale: next });
    },
    [onViewChange, view],
  );

  return (
    <div
      className={`relative overflow-hidden bg-topology-canvas cursor-grab ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
    >
      <div
        className="absolute top-0 left-0 bg-topology-grid"
        style={{
          width: layout.width,
          height: layout.height,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* 엣지 레이어 — 노드와 같은 원점·같은 크기. pointer-events 없음. */}
        <svg
          width={layout.width}
          height={layout.height}
          className="absolute top-0 left-0 pointer-events-none"
          aria-hidden="true"
        >
          {layout.edges.map((e, i) => (
            <TopologyEdge key={`${e.from}-${e.to}-${i}`} edge={e} />
          ))}
          {layout.edges.map((e, i) => (
            <g key={`p-${e.from}-${e.to}-${i}`}>
              <TopologyPort x={e.source.x} y={e.source.y} tone={e.tone === "alert" ? "alert" : "default"} />
              <TopologyPort x={e.target.x} y={e.target.y} tone={e.tone === "alert" ? "alert" : "default"} />
            </g>
          ))}
        </svg>

        {/* 노드 레이어 — 그룹 컨테이너가 먼저, 자식이 위에 겹친다(레이아웃 출력 순서 그대로). */}
        {layout.nodes.map((n) => (
          <div key={n.id} data-topology-node={n.id} className="display-contents">
            <TopologyNode node={n} onToggle={onToggle ? () => onToggle(n.id) : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}



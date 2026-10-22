import TopologyCollapseToggle from "./TopologyCollapseToggle";
import type { LaidOutNode } from "./layout";

/**
 * TopologyNode — Primitives. 토폴로지 캔버스 위의 노드 한 개(리프 카드 또는 그룹 컨테이너).
 *
 * ## Purpose
 * [[layoutTopology]] 가 계산한 좌표에 노드를 **절대 배치**해 그린다. 두 형태를 한 컴포넌트가 담당:
 *   1. **리프 카드** — 좌측 컬러 뱃지 + 타이틀 + 지표(`150 kbps`) + 추세 화살표.
 *   2. **그룹 컨테이너** (`isGroup && !collapsed`) — 헤더(뱃지+타이틀)만 그리고 본문은 비운다.
 *      자식 노드는 캔버스가 **형제로 따로 렌더**하며 이 컨테이너 위에 겹쳐 놓인다.
 * 접힌 그룹(`collapsed`)은 리프 카드와 동일한 크기·외형으로 줄어든다.
 *
 * ## When to use
 * - [[TopologyCanvas]] 가 `layout.nodes.map` 으로 노드마다 렌더하는 **기본 용법**.
 * - 범례·문서에서 노드 외형 한 개만 보여줄 때 (좌표를 0,0 으로 주면 된다).
 *
 * ## When NOT to use
 * - 목록/표의 행 → [[DataTableRow]].
 * - 캔버스 밖 카드 → [[AiCard]] 또는 `bg-card` 블록.
 * - 연결선·포트 → [[TopologyEdge]] / [[TopologyPort]].
 *
 * ## Composition rules
 * - **좌표를 스스로 계산하지 않는다.** `node` 는 [[layoutTopology]] 출력을 그대로 받는다 —
 *   컴포넌트가 위치를 보정하기 시작하면 미니맵·엣지 라우팅과 좌표계가 어긋난다.
 * - **색은 유틸 클래스만** (`.bg-topology-node` / `.bg-topology-group` / `.text-tertiary`).
 *   인라인 style 에 남는 것은 레이아웃 엔진이 계산한 좌표·크기뿐이다 — 그건 색이 아니라 데이터다.
 * - `--color-card` 로 표면을 대체하지 말 것 — 캔버스는 카드 위가 아니라 자체 바닥 위의 층이다.
 * - 지표 텍스트는 `.font-numeric .tabular-nums` — 값이 바뀔 때 자릿수가 흔들리지 않게.
 * - 그룹 컨테이너는 `pointer-events` 를 헤더에만 둔다. 본문까지 먹으면 그 위에 겹친 자식
 *   노드의 클릭이 막힌다.
 *
 * @example
 * ```tsx
 * {layout.nodes.map((n) => (
 *   <TopologyNode key={n.id} node={n} onToggle={() => toggle(n.id)} />
 * ))}
 * ```
 */
export default function TopologyNode({
  node,
  onToggle,
}: {
  /** [[layoutTopology]] 가 배치한 노드. 좌표·크기·그룹 여부를 모두 담고 있다. */
  node: LaidOutNode;
  /** 그룹 접기/펼치기. 리프 노드에는 전달하지 않아도 된다. */
  onToggle?: () => void;
}) {
  // 인라인에 남는 유일한 것 — 레이아웃 엔진이 계산한 기하값(색 아님).
  const frame = { left: node.x, top: node.y, width: node.width, height: node.height };

  if (node.isGroup && !node.collapsed) {
    return (
      <div
        // pointer-events-none: 본문이 클릭을 먹으면 위에 겹친 자식 노드가 눌리지 않는다.
        className="absolute bg-topology-group rounded-xl shadow-xs pointer-events-none"
        style={frame}
      >
        <div className="flex items-center h-40px pointer-events-auto">
          <TopologyCollapseToggle collapsed={false} tone={node.tone} onToggle={onToggle} />
          <p className="text-md font-bold text-primary px-12px leading-none truncate">
            {node.label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute flex items-stretch bg-topology-node rounded-xl shadow-md overflow-hidden"
      style={frame}
    >
      <TopologyCollapseToggle
        // 리프는 펼칠 것이 없으므로 항상 `+`(레퍼런스와 동일). `−` 는 "펼쳐진 그룹"의 기호라
        // 리프에 쓰면 접을 수 있다는 거짓 신호가 된다.
        collapsed={node.isGroup ? node.collapsed : true}
        tone={node.tone}
        interactive={node.isGroup}
        onToggle={onToggle}
      />
      <div className="flex flex-col justify-center gap-2px px-12px min-w-0">
        <p className="text-md font-bold text-primary leading-none truncate">{node.label}</p>
        {node.metric && (
          <span className="flex items-center gap-4px text-sm text-tertiary">
            <span className="font-numeric tabular-nums">{node.metric}</span>
            {node.trend && <TrendArrow direction={node.trend} />}
          </span>
        )}
      </div>
    </div>
  );
}

/** 지표 추세 화살표 — ↗ / ↘. 색은 상속(currentColor)받아 지표 텍스트와 같은 톤을 유지한다. */
function TrendArrow({ direction }: { direction: "up" | "down" }) {
  const d = direction === "up" ? "M3 9 L9 3 M5 3 L9 3 L9 7" : "M3 3 L9 9 M9 5 L9 9 L5 9";
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

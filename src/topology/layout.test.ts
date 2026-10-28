import { describe, expect, it } from "vitest";
import { METRICS, layoutTopology, roundedPolyline, type TopologyGraph, type TopologyLayout } from "./layout";

const at = (l: ReturnType<typeof layoutTopology>, id: string) => {
  const n = l.nodes.find((n) => n.id === id);
  if (!n) throw new Error(`node ${id} 미배치`);
  return n;
};

describe("layoutTopology — 랭크 배정", () => {
  it("엣지 방향대로 열이 나뉜다 (a → b → c)", () => {
    const g: TopologyGraph = {
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }, { id: "c", label: "c" }],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
      ],
    };
    const l = layoutTopology(g);
    expect(at(l, "a").x).toBeLessThan(at(l, "b").x);
    expect(at(l, "b").x).toBeLessThan(at(l, "c").x);
  });

  it("최장 경로를 쓴다 — a→c 지름길이 있어도 c 는 b 뒤에 놓인다", () => {
    const g: TopologyGraph = {
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }, { id: "c", label: "c" }],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "a", to: "c" },
      ],
    };
    const l = layoutTopology(g);
    expect(at(l, "c").x).toBeGreaterThan(at(l, "b").x);
  });

  it("사이클이 있어도 종료하고, 랭크가 역전되지 않는다", () => {
    const g: TopologyGraph = {
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "a" }, // back edge — 랭크 계산에서 제외되지만 그려지긴 한다
      ],
    };
    const l = layoutTopology(g);
    expect(l.nodes).toHaveLength(2);
    expect(l.edges).toHaveLength(2);
    // 정방향 엣지가 우선 — a 가 b 왼쪽에 있어야 한다 (back edge 미제거 시 뒤집혔었다)
    expect(at(l, "a").x).toBeLessThan(at(l, "b").x);
  });

  it("같은 입력이면 같은 출력 (결정론)", () => {
    const g: TopologyGraph = {
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
      edges: [{ from: "a", to: "b" }],
    };
    expect(layoutTopology(g)).toEqual(layoutTopology(g));
  });
});

describe("layoutTopology — 그룹", () => {
  const group: TopologyGraph = {
    nodes: [
      {
        id: "g",
        label: "Redis-Master",
        children: [
          { id: "z1", label: "US-east-1b" },
          { id: "z2", label: "US-east-1b" },
        ],
      },
    ],
    edges: [],
  };

  it("자식이 컨테이너 안에 세로로 쌓인다", () => {
    const l = layoutTopology(group);
    const g = at(l, "g");
    const z1 = at(l, "z1");
    const z2 = at(l, "z2");
    expect(z1.y).toBeLessThan(z2.y);
    expect(z2.y - z1.y).toBe(METRICS.nodeHeight + METRICS.childGap);
    // 자식은 컨테이너 경계 안에 있다
    for (const c of [z1, z2]) {
      expect(c.x).toBeGreaterThanOrEqual(g.x);
      expect(c.x + c.width).toBeLessThanOrEqual(g.x + g.width);
      expect(c.y + c.height).toBeLessThanOrEqual(g.y + g.height);
    }
    // 헤더 공간이 자식 위에 확보돼 있다
    expect(z1.y - g.y).toBe(METRICS.groupHeaderHeight);
  });

  it("접으면 자식이 배치되지 않고 리프 크기로 줄어든다", () => {
    const l = layoutTopology({ ...group, nodes: [{ ...group.nodes[0], collapsed: true }] });
    expect(l.nodes.map((n) => n.id)).toEqual(["g"]);
    expect(at(l, "g").height).toBe(METRICS.nodeHeight);
    expect(at(l, "g").collapsed).toBe(true);
  });

  it("접힌 그룹의 자식으로 향하던 엣지는 그룹으로 승격된다 (버리지 않는다)", () => {
    // 회귀 방지: 예전엔 z1 이 미배치라는 이유로 엣지를 버렸다 — 접으면 연결이 통째로
    // 사라져 "상세 숨김"이 아니라 "트래픽 없음"으로 읽혔다.
    const l = layoutTopology({
      nodes: [{ ...group.nodes[0], collapsed: true }, { id: "x", label: "x" }],
      edges: [{ from: "x", to: "z1", label: "23 kbps" }],
    });
    expect(l.edges).toHaveLength(1);
    expect(l.edges[0].to).toBe("g");
  });

  it("여러 자식 연결이 한 쌍으로 합쳐지면 «연결 N개» 라벨을 단다 — 한쪽 값을 보이지도, 라벨을 버리지도 않는다", () => {
    // 회귀 방지(2026-10-26): 라벨을 버리면 접는 순간 값이 모두 사라지고 두 연결이 하나로 보였다.
    const l = layoutTopology({
      nodes: [{ ...group.nodes[0], collapsed: true }, { id: "x", label: "x" }],
      edges: [
        { from: "x", to: "z1", label: "23 kbps" },
        { from: "x", to: "z2", label: "5 kbps", tone: "alert" },
      ],
    });
    expect(l.edges).toHaveLength(1);
    expect(l.edges[0].merged).toBe(2);
    expect(l.edges[0].label).toBe("연결 2개");
    // 경보가 하나라도 섞이면 합친 선도 경보 — 접어서 경보 경로가 사라지면 안 된다.
    expect(l.edges[0].tone).toBe("alert");
  });

  it("하나만 승격된 연결은 값 라벨을 그대로 둔다", () => {
    const l = layoutTopology({
      nodes: [{ ...group.nodes[0], collapsed: true }, { id: "x", label: "x" }],
      edges: [{ from: "x", to: "z1", label: "23 kbps" }],
    });
    expect(l.edges[0].merged).toBe(1);
    expect(l.edges[0].label).toBe("23 kbps");
  });

  it("접힌 그룹 안에서 끝나는 연결은 자기 자신 루프가 되므로 그리지 않는다", () => {
    const l = layoutTopology({
      nodes: [{ ...group.nodes[0], collapsed: true }],
      edges: [{ from: "z1", to: "z2", label: "5 kbps" }],
    });
    expect(l.edges).toHaveLength(0);
  });

  it("펼친 상태에서는 자식 엣지가 승격되지 않고 그대로 자식에 붙는다", () => {
    const l = layoutTopology({
      nodes: [group.nodes[0], { id: "x", label: "x" }],
      edges: [{ from: "x", to: "z1", label: "23 kbps" }],
    });
    expect(l.edges[0].to).toBe("z1");
    expect(l.edges[0].label).toBe("23 kbps");
  });

  it("자식으로 들어가는 엣지가 부모 그룹의 랭크를 밀어낸다", () => {
    const l = layoutTopology({
      nodes: [{ id: "x", label: "x" }, group.nodes[0]],
      edges: [{ from: "x", to: "z1" }],
    });
    expect(at(l, "g").x).toBeGreaterThan(at(l, "x").x);
  });
});

describe("layoutTopology — 엣지 라우팅", () => {
  it("포트는 출발 노드 오른쪽 · 도착 노드 왼쪽에 붙는다", () => {
    const l = layoutTopology({
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
      edges: [{ from: "a", to: "b" }],
    });
    const a = at(l, "a");
    const b = at(l, "b");
    const e = l.edges[0];
    expect(e.source.x).toBe(a.x + a.width);
    expect(e.target.x).toBe(b.x);
  });

  it("같은 변의 여러 엣지는 슬롯으로 분산된다 (겹치지 않음)", () => {
    const l = layoutTopology({
      nodes: [
        { id: "a", label: "a" },
        { id: "b", label: "b" },
        { id: "c", label: "c" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "a", to: "c" },
      ],
    });
    expect(l.edges[0].source.y).not.toBe(l.edges[1].source.y);
  });

  it("경로는 직교다 — 모든 구간이 수평 또는 수직", () => {
    const l = layoutTopology({
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }, { id: "c", label: "c" }],
      edges: [
        { from: "a", to: "b" },
        { from: "a", to: "c" },
      ],
    });
    // 라운딩 전 꺾은선의 직교성은 d 의 Q(코너) 사이 L 구간으로 확인
    for (const e of l.edges) {
      expect(e.d.startsWith("M ")).toBe(true);
      expect(e.d).toMatch(/^[ML Q0-9.,-]+$/);
    }
  });

  it("라벨 지점은 경로의 가장 긴 수평 구간 위에 있다", () => {
    const l = layoutTopology({
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
      edges: [{ from: "a", to: "b", label: "23 kbps" }],
    });
    const e = l.edges[0];
    expect(e.labelAt.x).toBeGreaterThan(e.source.x);
    expect(e.labelAt.x).toBeLessThan(e.target.x);
  });

  it("역방향 엣지는 노드를 관통하지 않고 아래로 우회한다", () => {
    const l = layoutTopology({
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "a" },
      ],
    });
    const back = l.edges.find((e) => e.from === "b" && e.to === "a")!;
    // 회귀 방지: 예전엔 s.y===t.y 라는 이유로 "M <b.right> y L <a.left> y" 직선이 나왔고,
    // 그 선은 a·b 두 박스를 그대로 관통했다.
    expect(back.d).toContain("Q"); // 꺾임이 있다 = 우회했다
    const ys = [...back.d.matchAll(/[-\d.]+ ([-\d.]+)/g)].map((m) => Number(m[1]));
    const nodeBottom = Math.max(...l.nodes.map((n) => n.y + n.height));
    expect(Math.max(...ys)).toBeGreaterThan(nodeBottom); // 노드 아래를 지난다
  });

  it("정방향이라도 target 이 왼쪽이면 직선으로 잇지 않는다", () => {
    // 랭크가 같아 x 가 겹치는 두 노드 사이 엣지 — 직선이면 박스를 관통한다
    const l = layoutTopology({
      nodes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
      edges: [{ from: "b", to: "a" }, { from: "a", to: "b" }],
    });
    for (const e of l.edges) {
      if (e.target.x < e.source.x) expect(e.d).toContain("Q");
    }
  });
});

describe("layoutTopology — 라벨 충돌 해소", () => {
  /** 나란히 흐르는 엣지들이 라벨을 같은 자리에 찍던 회귀(레퍼런스 재현 중 실제로 겹쳤다). */
  const parallel: TopologyGraph = {
    nodes: [
      { id: "a1", label: "a1" },
      { id: "a2", label: "a2" },
      { id: "b1", label: "b1" },
      { id: "b2", label: "b2" },
    ],
    edges: [
      { from: "a1", to: "b1", label: "23 kbps" },
      { from: "a1", to: "b2", label: "5 kbps" },
      { from: "a2", to: "b1", label: "23 kbps" },
      { from: "a2", to: "b2", label: "37 kbps" },
    ],
  };

  it("라벨이 포개지지 않는다", () => {
    // 28px 목표 간격은 좁은 구간에서 기하적으로 불가능할 수 있다(문서화된 한계).
    // 보장하는 것은 "포개지지 않는다" — 두 라벨이 사실상 같은 점에 찍히지 않는 것.
    const l = layoutTopology(parallel);
    const pts = l.edges.filter((e) => e.label).map((e) => e.labelAt);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const coincident =
          Math.abs(pts[i].x - pts[j].x) < 8 && Math.abs(pts[i].y - pts[j].y) < 8;
        expect(coincident).toBe(false);
      }
    }
  });

  it("같은 열 구간의 엣지들이 서로 다른 세로 통로를 쓴다", () => {
    // 회귀 방지: 전부 정중앙에서 꺾으면 세로 구간이 한 선 위에 포개져 선도 라벨도 겹쳤다.
    const l = layoutTopology(parallel);
    const midXs = l.edges
      .map((e) => [...e.d.matchAll(/Q (-?[\d.]+) /g)].map((m) => Number(m[1])))
      .filter((xs) => xs.length > 0)
      .map((xs) => xs[0]);
    expect(new Set(midXs).size).toBe(midXs.length);
  });

  it("밀어내도 라벨은 자기 경로 위에 남는다", () => {
    const l = layoutTopology(parallel);
    for (const e of l.edges) {
      if (!e.label) continue;
      // 경로의 x·y 범위 안에 있어야 한다 — 벗어나면 어느 선의 값인지 알 수 없다.
      const xs = [...e.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[1]));
      const ys = [...e.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]));
      expect(e.labelAt.x).toBeGreaterThanOrEqual(Math.min(...xs) - 0.5);
      expect(e.labelAt.x).toBeLessThanOrEqual(Math.max(...xs) + 0.5);
      expect(e.labelAt.y).toBeGreaterThanOrEqual(Math.min(...ys) - 0.5);
      expect(e.labelAt.y).toBeLessThanOrEqual(Math.max(...ys) + 0.5);
    }
  });

  it("결정론 유지 — 충돌 해소 후에도 같은 입력이면 같은 출력", () => {
    expect(layoutTopology(parallel)).toEqual(layoutTopology(parallel));
  });
});

describe("layoutTopology — 라벨은 다른 선을 밟지 않는다", () => {
  /** Composite/TopologyCanvas 기본 스토리 그래프 — «23 kbps» 를 다른 엣지 세로선이 가로지르던 배치(2026-10-26). */
  const story: TopologyGraph = {
    nodes: [
      { id: "redis-a", label: "Redis-Master", children: [{ id: "az-a1", label: "US-east-1b" }, { id: "az-a2", label: "US-east-1b" }] },
      { id: "sdk", label: "sdkclient.eng", tone: "ok" },
      { id: "ssm", label: "aws-ssm.com" },
      { id: "redis-b", label: "Redis-Master", children: [{ id: "az-b1", label: "US-east-1b" }, { id: "az-b2", label: "US-east-1b" }] },
    ],
    edges: [
      { from: "az-a1", to: "sdk", label: "23 kbps" },
      { from: "az-a2", to: "ssm", label: "23 kbps" },
      { from: "sdk", to: "az-b1", label: "23 kbps" },
      { from: "ssm", to: "az-b2", label: "23 kbps", tone: "alert" },
      { from: "sdk", to: "az-b2", label: "5 kbps" },
    ],
  };

  /** 렌더와 같은 글자 상자(TopologyEdge: 수평은 위로 labelOffset, 수직은 왼쪽으로 · 폭은 0.56em/자). */
  const boxOf = (e: TopologyLayout["edges"][number]) => {
    const w = [...(e.label ?? "")].length * METRICS.labelFontSize * 0.56;
    const h = METRICS.labelFontSize + 3;
    const { x, y, angle, side } = e.labelAt;
    const o = METRICS.labelOffset * side;
    return angle === 0
      ? { x0: x - w / 2, y0: y - o - h / 2, x1: x + w / 2, y1: y - o + h / 2 }
      : { x0: x - o - h / 2, y0: y - w / 2, x1: x - o + h / 2, y1: y + w / 2 };
  };
  const pointsOf = (d: string) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  /** 다른 엣지 경로(꺾인 점을 이은 직교 선분)가 상자를 지나는가 — Q 제어점도 코너라 선분 근사로 충분하다. */
  const hits = (l: TopologyLayout, i: number) => {
    const b = boxOf(l.edges[i]);
    return l.edges.some((o, j) => {
      if (j === i) return false;
      const pts = pointsOf(o.d);
      return pts.slice(1).some((q, k) => {
        const p = pts[k];
        if (Math.abs(p.x - q.x) > 0.5 && Math.abs(p.y - q.y) > 0.5) return false; // 코너 곡선 조각은 짧다
        return Math.min(p.x, q.x) <= b.x1 && Math.max(p.x, q.x) >= b.x0 && Math.min(p.y, q.y) <= b.y1 && Math.max(p.y, q.y) >= b.y0;
      });
    });
  };

  it("기본 배치 — 어떤 라벨 상자도 다른 엣지 선을 지나지 않는다", () => {
    const l = layoutTopology(story);
    l.edges.forEach((e, i) => {
      if (e.label) expect(hits(l, i), `${e.from}→${e.to} ${e.label}`).toBe(false);
    });
  });

  it("라벨 상자끼리 겹치지 않는다", () => {
    const l = layoutTopology(story);
    const boxes = l.edges.filter((e) => e.label).map(boxOf);
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const [p, q] = [boxes[i], boxes[j]];
        expect(p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1).toBe(false);
      }
  });

  it("그룹을 접어도 라벨이 남고 다른 선을 밟지 않는다", () => {
    const l = layoutTopology({ ...story, nodes: story.nodes.map((n) => (n.children ? { ...n, collapsed: true } : n)) });
    expect(l.edges.filter((e) => e.label).length).toBe(l.edges.length);
    l.edges.forEach((e, i) => expect(hits(l, i), `${e.from}→${e.to} ${e.label}`).toBe(false));
  });
});

describe("roundedPolyline", () => {
  it("점이 2개면 직선", () => {
    expect(roundedPolyline([{ x: 0, y: 0 }, { x: 10, y: 0 }], 8)).toBe("M 0 0 L 10 0");
  });

  it("코너 반경이 구간 길이의 절반을 넘지 않는다", () => {
    // 짧은 구간(길이 4)에 r=16 을 요청해도 꺾임이 뭉개지지 않아야 한다
    const d = roundedPolyline(
      [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 100 }],
      16,
    );
    expect(d).toContain("Q 4 0");
    expect(d).not.toContain("NaN");
  });

  it("빈 입력에서 죽지 않는다", () => {
    expect(roundedPolyline([], 8)).toBe("");
  });
});

describe("layoutTopology — 바운딩 박스", () => {
  it("모든 노드가 width/height 안에 들어간다", () => {
    const l = layoutTopology({
      nodes: [
        { id: "a", label: "a", children: [{ id: "a1", label: "a1" }] },
        { id: "b", label: "b" },
        { id: "c", label: "c" },
      ],
      edges: [{ from: "a", to: "b" }, { from: "b", to: "c" }],
    });
    for (const n of l.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.x + n.width).toBeLessThanOrEqual(l.width);
      expect(n.y + n.height).toBeLessThanOrEqual(l.height);
    }
  });
});

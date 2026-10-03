import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useMemo } from "react";
import componentsData from "../docs/components.json";

/**
 * Gallery — 비주얼 컴포넌트 인덱스.
 *
 * 141개 컴포넌트를 3-Layer(Primitives · Composite · Shell) 별 카드 그리드로 보여준다.
 * 각 카드는 컴포넌트 이름 · 한 줄 요약 · 서브그룹 배지를 담고, 클릭하면 해당 스토리 문서로
 * 이동한다. `components.json`(자동 생성)을 읽으므로 컴포넌트가 추가되면 자동 등장한다.
 *
 * ## When to use
 * - 전체 컴포넌트를 한눈에 훑을 때
 * - 이름은 모르고 계층·용도로 찾을 때
 *
 * ## When NOT to use
 * - 토큰을 찾을 때 → Tokens 카탈로그
 * - 전역 정책을 볼 때 → Overview
 */

type Component = {
  name: string;
  layer: string;
  title: string;
  storyId: string;
  docsUrl: string;
  sourceFile: string;
  summary: string;
  purpose?: string;
};

const allComponents = (componentsData as { components: Component[] }).components;

/** sourceFile + title 에서 서브그룹 추출 */
function getSubgroup(comp: Component): string | null {
  // Widget: src/widget/ 에 있는 컴포넌트
  if (comp.sourceFile?.startsWith("src/widget/")) return "Widget";
  // Topology: title 에 Topology 포함
  if (comp.title.includes("Topology")) return "Topology";
  // Web: title 에 Web 포함
  if (comp.title.includes("Web")) return "Web";
  // Page: title 에 Page 포함
  if (comp.title.includes("Page/")) return "Page";
  return null;
}

/** summary 첫 문장만 추출 (60자 제한) */
function shortSummary(summary: string): string {
  if (!summary) return "";
  // ** 마크다운 제거
  const clean = summary.replace(/\*\*/g, "").replace(/\[\[(\w+)\]\]/g, "$1");
  const first = clean.split(/[.。—]/)[0].trim();
  if (first.length > 65) return first.slice(0, 62) + "…";
  return first;
}

const LAYERS = [
  { key: "Primitives", label: "Primitives", hint: "자체 렌더 리프. 다른 DS 컴포넌트를 import하지 않는다." },
  { key: "Composite", label: "Composite", hint: "Primitives를 1단계 조합한 컴포넌트." },
  { key: "Shell", label: "Shell", hint: "Composite + Primitives를 최종 조립하는 진입점." },
] as const;

const SUBGROUP_COLORS: Record<string, { bg: string; fg: string }> = {
  Widget: { bg: "var(--color-status-info-soft)", fg: "var(--color-status-info)" },
  Web: { bg: "var(--color-status-success-soft)", fg: "var(--color-status-success)" },
  Topology: { bg: "var(--color-status-warning-soft)", fg: "var(--color-status-warning)" },
  Page: { bg: "var(--color-status-error-soft)", fg: "var(--color-status-error)" },
};

const Badge = ({ subgroup }: { subgroup: string }) => {
  const colors = SUBGROUP_COLORS[subgroup] ?? {
    bg: "var(--color-surface-50)",
    fg: "var(--color-text-secondary)",
  };
  return (
    <span
      className="text-xs font-bold"
      style={{
        display: "inline-block",
        padding: "1px 6px",
        borderRadius: 4,
        background: colors.bg,
        color: colors.fg,
        lineHeight: "18px",
        flex: "0 0 auto",
      }}
    >
      {subgroup}
    </span>
  );
};

const ComponentCard = ({ comp }: { comp: Component }) => {
  const subgroup = getSubgroup(comp);
  return (
    <a
      href={`/?path=/docs/${comp.storyId}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: 16,
        borderRadius: 8,
        border: "1px solid var(--color-border-default)",
        background: "var(--color-card)",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.15s, box-shadow 0.15s",
        minHeight: 88,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-brand-blue)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-default)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="text-md font-bold text-primary" style={{ minWidth: 0 }}>
          {comp.name}
        </span>
        {subgroup && <Badge subgroup={subgroup} />}
      </div>
      <span
        className="text-sm text-secondary"
        style={{ lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {shortSummary(comp.summary)}
      </span>
    </a>
  );
};

const meta: Meta = {
  title: "Gallery",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**비주얼 컴포넌트 인덱스.** 3-Layer 별 카드 그리드로 전체 컴포넌트를 한눈에 보여줍니다.\n\n" +
          "## When to use\n" +
          "- 전체 컴포넌트를 한눈에 훑을 때 — 이름은 모르고 계층·서브그룹으로 찾을 때.\n\n" +
          "## When NOT to use\n" +
          "- 토큰을 찾을 때 → Tokens 카탈로그\n" +
          "- 전역 정책을 볼 때 → Overview",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const ByLayer: Story = {
  name: "계층별 갤러리",
  render: () => {
    const [search, setSearch] = useState("");
    const [activeSubgroup, setActiveSubgroup] = useState<string | null>(null);

    const filtered = useMemo(() => {
      return allComponents.filter((c) => {
        // Tokens 는 갤러리에서 제외
        if (c.layer === "Tokens") return false;
        const q = search.toLowerCase();
        if (q && !c.name.toLowerCase().includes(q) && !c.summary.toLowerCase().includes(q)) return false;
        if (activeSubgroup) {
          const sg = getSubgroup(c);
          if (activeSubgroup === "SaaS") return !sg;
          return sg === activeSubgroup;
        }
        return true;
      });
    }, [search, activeSubgroup]);

    const subgroups = ["SaaS", "Widget", "Web", "Topology"];

    return (
      <div className="bg-bg" style={{ padding: 24, minHeight: "100vh" }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="text-2xl font-bold text-primary" style={{ margin: "0 0 4px" }}>
            Component Gallery
          </h1>
          <p className="text-base text-secondary" style={{ margin: 0 }}>
            {allComponents.filter((c) => c.layer !== "Tokens").length}개 컴포넌트 — Primitives · Composite · Shell
          </p>
        </div>

        {/* 검색 + 필터 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="컴포넌트 검색…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-base text-primary"
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--color-border-default)",
              background: "var(--color-card)",
              outline: "none",
              width: 240,
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {subgroups.map((sg) => {
              const isActive = activeSubgroup === sg;
              return (
                <button
                  key={sg}
                  onClick={() => setActiveSubgroup(isActive ? null : sg)}
                  className="text-sm font-medium"
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: isActive
                      ? "1px solid var(--color-brand-blue)"
                      : "1px solid var(--color-border-default)",
                    background: isActive ? "var(--color-status-info-soft)" : "var(--color-card)",
                    color: isActive ? "var(--color-brand-blue)" : "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {sg === "SaaS" ? "SaaS (기본)" : sg}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-tertiary">
            {filtered.length}개 표시
          </span>
        </div>

        {/* 계층별 그리드 */}
        {LAYERS.map(({ key, label, hint }) => {
          const items = filtered.filter((c) => c.layer === key);
          if (items.length === 0) return null;
          return (
            <section key={key} style={{ marginBottom: 40 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <h2 className="text-xl font-bold text-primary" style={{ margin: 0 }}>
                    {label}
                  </h2>
                  <span className="text-sm font-numeric text-tertiary">{items.length}</span>
                </div>
                <p className="text-sm text-tertiary" style={{ margin: "2px 0 0" }}>{hint}</p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 10,
                }}
              >
                {items.map((c) => (
                  <ComponentCard key={c.storyId} comp={c} />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-base text-tertiary" style={{ textAlign: "center", padding: 40 }}>
            일치하는 컴포넌트가 없습니다.
          </p>
        )}
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   #4 — 계층 의존 다이어그램
   ═══════════════════════════════════════════════════════════════════════════ */

const layerCounts = LAYERS.map(({ key, label }) => ({
  key,
  label,
  count: allComponents.filter((c) => c.layer === key).length,
}));
const tokenCount = allComponents.filter((c) => c.layer === "Tokens").length;

const LayerBox = ({
  label,
  count,
  y,
  color,
}: {
  label: string;
  count: number;
  y: number;
  color: string;
}) => (
  <g transform={`translate(0, ${y})`}>
    <rect x={60} y={0} width={200} height={52} rx={8} fill={color} opacity={0.12} stroke={color} strokeWidth={1.5} />
    <text x={160} y={22} textAnchor="middle" fill="var(--color-text-primary)" fontSize="14px" fontWeight={700}>
      {label}
    </text>
    <text x={160} y={40} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="12px">
      {count} components
    </text>
  </g>
);

const Arrow = ({ y1, y2 }: { y1: number; y2: number }) => (
  <g>
    <line x1={160} y1={y1} x2={160} y2={y2} stroke="var(--color-border-strong)" strokeWidth={1.5} markerEnd="url(#arrowhead)" />
  </g>
);

export const DependencyDiagram: Story = {
  name: "계층 의존 다이어그램",
  render: () => (
    <div className="bg-bg" style={{ padding: 24 }}>
      <h2 className="text-xl font-bold text-primary" style={{ margin: "0 0 4px" }}>
        3-Layer Dependency
      </h2>
      <p className="text-sm text-secondary" style={{ margin: "0 0 20px", width: "100%", lineHeight: 1.6 }}>
        화살표는 <strong>import 방향</strong>. 역방향 import 는 <code>lint:layers</code> 게이트가 차단한다.
        Composite 끼리의 import 도 금지 — 필요하면 Shell 로 승격.
      </p>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* SVG 다이어그램 */}
        <svg width={320} height={340} style={{ flex: "0 0 auto" }}>
          <defs>
            <marker id="arrowhead" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="var(--color-border-strong)" />
            </marker>
          </defs>

          {/* Tokens */}
          <g transform="translate(0, 0)">
            <rect x={60} y={0} width={200} height={44} rx={8} fill="var(--color-surface-50)" stroke="var(--color-border-default)" strokeWidth={1} strokeDasharray="4 3" />
            <text x={160} y={18} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12px" fontWeight={600}>
              Tokens (meta)
            </text>
            <text x={160} y={34} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="11px">
              {tokenCount} entries · 295 vars
            </text>
          </g>

          <Arrow y1={44} y2={64} />
          <LayerBox label="Primitives" count={layerCounts[0].count} y={68} color="var(--color-status-info)" />

          <Arrow y1={120} y2={140} />
          <LayerBox label="Composite" count={layerCounts[1].count} y={144} color="var(--color-status-warning)" />

          <Arrow y1={196} y2={216} />
          <LayerBox label="Shell" count={layerCounts[2].count} y={220} color="var(--color-status-error)" />

          {/* 금지 표시 — Composite ↔ Composite */}
          <g transform="translate(270, 156)">
            <line x1={0} y1={0} x2={0} y2={30} stroke="var(--color-status-error)" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={6} y={18} fill="var(--color-status-error)" fontSize="10px" fontWeight={700}>
              Composite ↔ Composite 금지
            </text>
          </g>

          {/* 역방향 금지 */}
          <text x={30} y={110} fill="var(--color-status-error)" fontSize="10px" fontWeight={700} textAnchor="end" transform="rotate(-90, 30, 110)">
            역방향 금지
          </text>
        </svg>

        {/* 규칙 요약 */}
        <div style={{ flex: "1 1 300px" }}>
          <table className="text-base" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {["계층", "import 가능", "금지"].map((h) => (
                  <th
                    key={h}
                    className="text-sm font-bold text-secondary"
                    style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--color-border-strong)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { layer: "Primitives", can: "Tokens", cant: "Composite · Shell" },
                { layer: "Composite", can: "Primitives · Tokens", cant: "다른 Composite · Shell" },
                { layer: "Shell", can: "전 계층", cant: "—" },
              ].map((r) => (
                <tr key={r.layer}>
                  <td className="text-base font-medium text-primary" style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)" }}>
                    {r.layer}
                  </td>
                  <td className="text-sm text-primary" style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)" }}>
                    {r.can}
                  </td>
                  <td className="text-sm" style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border-soft)", color: "var(--color-status-error)" }}>
                    {r.cant}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   #2 — "뭘 만드나" 레시피 페이지
   ═══════════════════════════════════════════════════════════════════════════ */

type Recipe = {
  title: string;
  description: string;
  components: string[];
  code: string;
};

const RECIPES: Recipe[] = [
  {
    title: "기본 대시보드 페이지",
    description: "사이드바 + 헤더 + 옵션바 + 데이터 테이블. 가장 일반적인 SaaS 페이지 구성.",
    components: ["DashboardLayout", "PageHeader", "OptionbarPage", "DataTable", "FilterBar"],
    code: `<DashboardLayout
  activeProduct="apm"
  header={<PageHeader title="트랜잭션 목록" />}
  main={
    <>
      <OptionbarPage items={[...]} />
      <FilterBar filters={[...]} />
      <DataTable columns={cols} data={rows} />
    </>
  }
/>`,
  },
  {
    title: "AI 통합 페이지",
    description: "헤더에 AI 프롬프트 내장 + 우측 AI 위젯 패널. 2-step → 1-step 진입.",
    components: ["DashboardLayout", "PageHeaderAiInline", "WhaTapAiWidget", "AiCard", "AiReasoning"],
    code: `<DashboardLayout
  activeProduct="db"
  widgetOpen={aiActive}
  header={
    <PageHeaderAiInline
      title="DB / oracle"
      onPromptSubmit={(q) => setAiActive(true)}
    />
  }
  main={<MyContent />}
>
  <WhaTapAiWidget open={aiActive} onClose={() => setAiActive(false)} />
</DashboardLayout>`,
  },
  {
    title: "AI 응답 메시지",
    description: "위젯 안의 AI 응답 카드. tone 으로 의미를 구분하고 primitive 를 조합.",
    components: ["AiCard", "AiSectionHeading", "AiBulletList", "AiToneBadge", "AiCaption"],
    code: `<AiCard delay={0}>
  <AiSectionHeading tone="critical">CPU 과부하 감지</AiSectionHeading>
  <AiCaption>최근 30분 기준</AiCaption>
  <AiBulletList items={[
    "node-03 CPU 98% — GC 과다",
    "node-07 CPU 91% — 쿼리 병목",
  ]} />
  <AiToneBadge tone="critical">즉시 조치 필요</AiToneBadge>
</AiCard>`,
  },
  {
    title: "필터 + 테이블",
    description: "FilterBar 로 조건을 걸고 DataTable 로 결과를 보여주는 패턴.",
    components: ["FilterBar", "FilterDropdown", "DataTable", "Chip", "Pagination"],
    code: `<FilterBar
  filters={[
    { key: "status", label: "상태", type: "multi",
      options: ["active","warning","critical"] },
    { key: "host", label: "호스트", type: "search" },
  ]}
  onFilter={setFilters}
/>
<DataTable columns={cols} data={filtered} />
<Pagination total={total} page={page} onChange={setPage} />`,
  },
  {
    title: "삭제 확인 (삭제 등 위험한 실행)",
    description: "patterns P1 — 되돌릴 수 없는 실행에는 반드시 확인 Modal. 버튼 라벨은 동작 이름.",
    components: ["Button", "Modal"],
    code: `<Button tone="critical" size="sm" onClick={() => setConfirm(true)}>
  삭제
</Button>

<Modal
  open={confirm}
  onClose={() => setConfirm(false)}
  size="sm"
  title="알림 규칙 삭제"
  footer={<>
    <Button variant="basic" onClick={() => setConfirm(false)}>취소</Button>
    <Button variant="contained" tone="critical" onClick={remove}>삭제</Button>
  </>}
>
  「CPU 90% 초과」 규칙을 삭제합니다. 되돌릴 수 없습니다.
</Modal>`,
  },
  {
    title: "토폴로지 뷰",
    description: "노드 그래프를 캔버스에 렌더. 줌/미니맵/툴바 포함.",
    components: ["TopologyCanvas", "TopologyToolbar", "TopologyNode", "TopologyEdge", "TopologyMinimap"],
    code: `<div style={{ position: "relative", height: 600 }}>
  <TopologyToolbar onSearch={...} onZoom={...} />
  <TopologyCanvas
    nodes={nodes}
    edges={edges}
    onNodeClick={handleNodeClick}
  />
  <TopologyMinimap />
</div>`,
  },
];

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-card border border-color-var-color-border-default rounded-8px"
      style={{ padding: 20, marginBottom: 12 }}
    >
      <h3 className="text-lg font-bold text-primary" style={{ margin: "0 0 4px" }}>
        {recipe.title}
      </h3>
      <p className="text-base text-secondary" style={{ margin: "0 0 10px", lineHeight: 1.6 }}>
        {recipe.description}
      </p>

      {/* 사용 컴포넌트 칩 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {recipe.components.map((name) => {
          const comp = allComponents.find((c) => c.name === name);
          return (
            <a
              key={name}
              href={comp ? `/?path=/docs/${comp.storyId}` : undefined}
              className="text-xs font-bold"
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 4,
                background: "var(--color-status-info-soft)",
                color: "var(--color-brand-blue)",
                textDecoration: "none",
                lineHeight: "18px",
              }}
            >
              {name}
            </a>
          );
        })}
      </div>

      {/* 코드 토글 */}
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium"
        style={{
          padding: "4px 10px",
          borderRadius: 4,
          border: "1px solid var(--color-border-default)",
          background: "var(--color-card)",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
        }}
      >
        {open ? "코드 닫기" : "코드 보기"}
      </button>
      {open && (
        <pre
          className="text-sm"
          style={{
            marginTop: 10,
            padding: 14,
            borderRadius: 6,
            background: "var(--color-surface-100)",
            border: "1px solid var(--color-border-default)",
            overflow: "auto",
            lineHeight: 1.6,
            color: "var(--color-text-primary)",
          }}
        >
          <code>{recipe.code}</code>
        </pre>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   #5 — 컴포넌트 관계도 (양방향 링크)
   ═══════════════════════════════════════════════════════════════════════════ */

type CompJson = Component & {
  compositionRules?: string[];
  whenToUse?: string[];
  whenNotToUse?: string[];
};

/** wikilink 패턴을 파싱해 참조 맵을 구축 */
function buildRelationMap() {
  const comps = (componentsData as { components: CompJson[] }).components;
  const refPattern = /\[\[(\w+)\]\]/g;

  const uses = new Map<string, Set<string>>();
  const usedBy = new Map<string, Set<string>>();

  // 전 컴포넌트 초기화
  for (const c of comps) {
    uses.set(c.name, new Set());
    usedBy.set(c.name, new Set());
  }

  const nameSet = new Set(comps.map((c) => c.name));

  for (const c of comps) {
    const fields = [
      c.summary ?? "",
      ...(c.compositionRules ?? []),
      ...(c.whenToUse ?? []),
      ...(c.whenNotToUse ?? []),
    ].join(" ");

    let match;
    while ((match = refPattern.exec(fields)) !== null) {
      const ref = match[1];
      if (ref !== c.name && nameSet.has(ref)) {
        uses.get(c.name)!.add(ref);
        usedBy.get(ref)!.add(c.name);
      }
    }
  }

  return { uses, usedBy };
}

const { uses: usesMap, usedBy: usedByMap } = buildRelationMap();

const RelationChip = ({ name, isCurrent }: { name: string; isCurrent: boolean }) => {
  const comp = allComponents.find((c) => c.name === name);
  if (isCurrent) {
    return (
      <span
        className="text-xs font-bold"
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: 4,
          background: "var(--color-brand-blue)",
          // raw-color-ok: contained 버튼 — tone 원색 배경 위 고정 흰색 전경.
          color: "#fff",
          lineHeight: "18px",
        }}
      >
        {name}
      </span>
    );
  }
  return (
    <a
      href={comp ? `/?path=/docs/${comp.storyId}` : undefined}
      className="text-xs font-medium"
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        background: "var(--color-surface-50)",
        color: "var(--color-text-primary)",
        textDecoration: "none",
        lineHeight: "18px",
        border: "1px solid var(--color-border-default)",
      }}
    >
      {name}
    </a>
  );
};

export const Relations: Story = {
  name: "컴포넌트 관계도",
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // 관계가 있는 컴포넌트만
    const withRelations = useMemo(() => {
      return allComponents.filter((c) => {
        const u = usesMap.get(c.name);
        const ub = usedByMap.get(c.name);
        return (u && u.size > 0) || (ub && ub.size > 0);
      });
    }, []);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      if (!q) return withRelations;
      return withRelations.filter(
        (c) => c.name.toLowerCase().includes(q) || [...(usesMap.get(c.name) ?? [])].some((r) => r.toLowerCase().includes(q))
      );
    }, [search, withRelations]);

    // 선택된 컴포넌트 상세
    const detail = selected
      ? {
          uses: [...(usesMap.get(selected) ?? [])].sort(),
          usedBy: [...(usedByMap.get(selected) ?? [])].sort(),
        }
      : null;

    // 가장 많이 참조되는 상위 10
    const topReferenced = useMemo(() => {
      return [...usedByMap.entries()]
        .map(([name, set]) => ({ name, count: set.size }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }, []);

    return (
      <div className="bg-bg" style={{ padding: 24, minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="text-2xl font-bold text-primary" style={{ margin: "0 0 4px" }}>
            Component Relations
          </h1>
          <p className="text-base text-secondary" style={{ margin: 0, width: "100%", lineHeight: 1.6 }}>
            <code>compositionRules</code> · <code>summary</code> 의 <code>{"[[컴포넌트명]]"}</code> 참조를 파싱한 양방향 관계도.
            컴포넌트를 클릭하면 "이 컴포넌트가 쓰는 것" / "이걸 쓰는 컴포넌트"를 보여줍니다.
            <br />
            <strong>{withRelations.length}</strong>개 컴포넌트에 관계가 있고,
            총 <strong>{[...usesMap.values()].reduce((s, set) => s + set.size, 0)}</strong>개 단방향 엣지.
          </p>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* 좌측 — 리스트 */}
          <div style={{ flex: "0 0 320px" }}>
            <input
              type="text"
              placeholder="컴포넌트 검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-base text-primary"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--color-border-default)",
                background: "var(--color-card)",
                outline: "none",
                width: "100%",
                marginBottom: 12,
              }}
            />
            <div style={{ maxHeight: 520, overflow: "auto" }}>
              {filtered.map((c) => {
                const isActive = selected === c.name;
                const usesCount = usesMap.get(c.name)?.size ?? 0;
                const usedByCount = usedByMap.get(c.name)?.size ?? 0;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelected(isActive ? null : c.name)}
                    className="text-sm"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "none",
                      background: isActive ? "var(--color-status-info-soft)" : "transparent",
                      color: isActive ? "var(--color-brand-blue)" : "var(--color-text-primary)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                    <span className="text-xs text-tertiary" style={{ flex: "0 0 auto" }}>
                      {usesCount}↗ {usedByCount}↙
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우측 — 상세 or 허브 요약 */}
          <div style={{ flex: "1 1 400px" }}>
            {detail && selected ? (
              <div
                className="bg-card border border-color-var-color-border-default rounded-8px"
                style={{ padding: 20 }}
              >
                <h3 className="text-lg font-bold text-primary" style={{ margin: "0 0 14px" }}>
                  {selected}
                </h3>

                {detail.uses.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p className="text-sm font-bold text-secondary" style={{ margin: "0 0 6px" }}>
                      이 컴포넌트가 쓰는 것 ({detail.uses.length})
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {detail.uses.map((name) => (
                        <RelationChip key={name} name={name} isCurrent={false} />
                      ))}
                    </div>
                  </div>
                )}

                {detail.usedBy.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-secondary" style={{ margin: "0 0 6px" }}>
                      이걸 쓰는 컴포넌트 ({detail.usedBy.length})
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {detail.usedBy.map((name) => (
                        <RelationChip key={name} name={name} isCurrent={false} />
                      ))}
                    </div>
                  </div>
                )}

                {detail.uses.length === 0 && detail.usedBy.length === 0 && (
                  <p className="text-sm text-tertiary">관계가 없습니다.</p>
                )}
              </div>
            ) : (
              /* 허브 노드 요약 */
              <div
                className="bg-card border border-color-var-color-border-default rounded-8px"
                style={{ padding: 20 }}
              >
                <h3 className="text-lg font-bold text-primary" style={{ margin: "0 0 4px" }}>
                  허브 컴포넌트 TOP 10
                </h3>
                <p className="text-sm text-tertiary" style={{ margin: "0 0 14px" }}>
                  가장 많이 참조되는 컴포넌트. 좌측 리스트에서 클릭하면 상세를 봅니다.
                </p>
                <table className="text-base" style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      {["컴포넌트", "참조됨 (usedBy)", "계층"].map((h) => (
                        <th
                          key={h}
                          className="text-sm font-bold text-secondary"
                          style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--color-border-strong)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topReferenced.map((d) => {
                      const comp = allComponents.find((c) => c.name === d.name);
                      return (
                        <tr
                          key={d.name}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelected(d.name)}
                        >
                          <td
                            className="text-base font-medium text-primary"
                            style={{ padding: "6px 10px", borderBottom: "1px solid var(--color-border-soft)" }}
                          >
                            {d.name}
                          </td>
                          <td className="text-base font-numeric" style={{ padding: "6px 10px", borderBottom: "1px solid var(--color-border-soft)" }}>
                            {d.count}
                          </td>
                          <td className="text-sm text-tertiary" style={{ padding: "6px 10px", borderBottom: "1px solid var(--color-border-soft)" }}>
                            {comp?.layer}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   #6 — 다크모드 비교 프리뷰
   ═══════════════════════════════════════════════════════════════════════════ */

/** 대표 컴포넌트를 라이트/다크 나란히 iframe 으로 렌더 */
const PREVIEW_COMPONENTS = [
  { name: "Button", storyId: "primitives-button--default" },
  { name: "Chip", storyId: "primitives-chip--default" },
  { name: "TextField", storyId: "primitives-textfield--default" },
  { name: "Select", storyId: "primitives-select--default" },
  { name: "Switch", storyId: "primitives-switch--default" },
  { name: "Toast", storyId: "primitives-toast--default" },
  { name: "Modal", storyId: "primitives-modal--default" },
  { name: "DataTable", storyId: "composite-datatable--default" },
  { name: "PageHeader", storyId: "composite-pageheader--default" },
  { name: "Sidebar", storyId: "composite-sidebar--default" },
  { name: "Card", storyId: "primitives-ai-card--default" },
  { name: "Reasoning", storyId: "composite-ai-reasoning--default" },
  // storyId는 title에서 생성: "Primitives/Ai/Card" → "primitives-ai-card"
  { name: "ThemeToggle", storyId: "composite-themetoggle--default" },
  { name: "FilterBar", storyId: "composite-filterbar--default" },
];

const DarkCompareCard = ({ name, storyId }: { name: string; storyId: string }) => {
  const base = `/iframe.html?id=${storyId}&viewMode=story&dsGuard=off`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span className="text-md font-bold text-primary">{name}</span>
        <a
          href={`/?path=/docs/${storyId.replace(/--default$/, "--docs")}`}
          className="text-xs text-tertiary"
          style={{ textDecoration: "none" }}
        >
          docs
        </a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, borderRadius: 8, border: "1px solid var(--color-border-default)" }}>
        <div style={{ position: "relative" }}>
          <span
            className="text-xs font-bold"
            style={{
              position: "absolute",
              top: 4,
              left: 8,
              zIndex: 1,
              padding: "1px 6px",
              borderRadius: 3,
              background: "var(--color-surface-50)",
              color: "var(--color-text-tertiary)",
            }}
          >
            Light
          </span>
          <iframe
            src={`${base}&globals=theme:light`}
            title={`${name} light`}
            style={{ width: "100%", height: 280, border: "none", pointerEvents: "none" }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <span
            className="text-xs font-bold"
            style={{
              position: "absolute",
              top: 4,
              left: 8,
              zIndex: 1,
              padding: "1px 6px",
              borderRadius: 3,
              background: "var(--color-surface-100)",
              color: "var(--color-text-tertiary)",
            }}
          >
            Dark
          </span>
          <iframe
            src={`${base}&globals=theme:dark`}
            title={`${name} dark`}
            style={{ width: "100%", height: 280, border: "none", pointerEvents: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export const DarkModeCompare: Story = {
  name: "라이트 / 다크 비교",
  parameters: { test: { disable: true } },  // iframe 14개 로드 → CI timeout 방지
  render: () => (
    <div className="bg-bg" style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="text-2xl font-bold text-primary" style={{ margin: "0 0 4px" }}>
          Light / Dark Compare
        </h1>
        <p className="text-base text-secondary" style={{ margin: 0, width: "100%", lineHeight: 1.6 }}>
          대표 컴포넌트 {PREVIEW_COMPONENTS.length}개를 라이트/다크로 나란히 프리뷰.
          토큰이 올바르게 적용됐으면 <code>.dark</code> 전환만으로 자연스럽게 바뀌어야 합니다.
          <br />
          <em className="text-sm text-tertiary">iframe 렌더라 로딩이 약간 걸릴 수 있습니다.</em>
        </p>
      </div>
      {PREVIEW_COMPONENTS.map((c) => (
        <DarkCompareCard key={c.storyId} name={c.name} storyId={c.storyId} />
      ))}
    </div>
  ),
};

export const Recipes: Story = {
  name: "화면 유형별 레시피",
  render: () => (
    <div className="bg-bg" style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="text-2xl font-bold text-primary" style={{ margin: "0 0 4px" }}>
          Recipes
        </h1>
        <p className="text-base text-secondary" style={{ margin: 0, width: "100%", lineHeight: 1.6 }}>
          자주 만드는 화면 유형별로 어떤 컴포넌트를 사용하는지 보여줍니다.
          컴포넌트 칩을 누르면 해당 문서로 이동합니다.
        </p>
      </div>
      {RECIPES.map((r) => (
        <RecipeCard key={r.title} recipe={r} />
      ))}
    </div>
  ),
};

import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

/**
 * WhaTap Design System — 호스팅 MCP 서버.
 *
 * 배포된 정적 Storybook(카탈로그)을 런타임에 fetch 해 도구를 제공 → 재빌드 없이 항상 최신.
 * dev 서버 불필요. 라이브 테스트/렌더(run-story-tests 등)는 로컬 addon-mcp 전용.
 */
const BASE =
  process.env.CATALOG_BASE ?? "https://whatap-design-system-storybook.vercel.app";

type StoryEntry = {
  id: string;
  title: string;
  name: string;
  importPath: string;
  type?: string;
};

async function fetchIndex(): Promise<Record<string, StoryEntry>> {
  const r = await fetch(`${BASE}/index.json`, { cache: "no-store" });
  if (!r.ok) throw new Error(`index.json ${r.status}`);
  const d = await r.json();
  return d.entries ?? {};
}

async function fetchText(path: string): Promise<string> {
  const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.text();
}

/* ── 규칙 카탈로그 (components.json) ─────────────────────────────────────────
 * `scripts/build-components-json.mjs` 가 src docstring + 스토리에서 생성해
 * `/design-system/components.json` 으로 서빙된다. 이게 없던 동안 `get_component` 는
 * title·import·스토리 URL 만 돌려줬고, 소스에 잘 쓰인 「When NOT to use」가 소비 AI 에게는
 * 존재하지 않는 정보였다. 배포가 낡아 404 여도 기존 응답은 유지되도록 null 로 흘린다. */
type ComponentDoc = {
  name: string;
  layer: string;
  title: string;
  storyId: string;
  sourceFile: string | null;
  importFrom: string;
  summary: string | null;
  purpose: string | null;
  whenToUse: string[];
  whenNotToUse: string[];
  compositionRules: string[];
  do: string[];
  dont: string[];
  example: string | null;
  props: { name: string; required: boolean; type: string; description: string | null }[];
  stories: { name: string; id: string; note: string | null }[];
};

async function fetchComponentDocs(): Promise<Map<string, ComponentDoc> | null> {
  try {
    const r = await fetch(`${BASE}/design-system/components.json`, { cache: "no-store" });
    if (!r.ok) return null;
    const d = (await r.json()) as { components: ComponentDoc[] };
    return new Map(d.components.map((c) => [c.title, c]));
  } catch {
    return null;
  }
}

const list = (items: string[]) => items.map((s) => `- ${s}`).join("\n");

/** 규칙 섹션 — Do/Don't 를 먼저 둔다. AI 가 위에서부터 읽고 코드를 쓰기 시작하기 때문. */
function rulesBlock(c: ComponentDoc): string[] {
  const out: string[] = [];
  if (c.purpose) out.push(``, `## Purpose`, c.purpose);
  if (c.do.length) out.push(``, `## ✅ Do`, list(c.do));
  if (c.dont.length) out.push(``, `## ❌ Don't`, list(c.dont));
  if (c.compositionRules.length) out.push(``, `## Composition rules`, list(c.compositionRules));
  if (c.props.length)
    out.push(
      ``,
      `## Props (${c.props.length})`,
      ...c.props.map(
        (p) => `- \`${p.name}\`${p.required ? "" : "?"}: \`${p.type}\`${p.description ? ` — ${p.description}` : ""}`,
      ),
    );
  if (c.example) out.push(``, `## Example`, "```tsx", c.example, "```");
  return out;
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_design_catalog",
      "WhaTap 디자인 시스템 전체 카탈로그(DESIGN.md 합본) 반환 — AI 컨텍스트 주입용.",
      {},
      async () => text(await fetchText("/design-system/DESIGN.md")),
    );

    server.tool(
      "get_tokens",
      "WhaTap 디자인 시스템 토큰 카탈로그(색·타입·톤) 반환.",
      {},
      async () => text(await fetchText("/design-system/tokens.md")),
    );

    server.tool(
      "list_components",
      "WhaTap 디자인 시스템 컴포넌트 목록(제목 · docs id) 반환.",
      {},
      async () => {
        const entries = await fetchIndex();
        const byTitle = new Map<string, string>();
        for (const e of Object.values(entries)) {
          if (e.type === "docs") byTitle.set(e.title, e.id);
        }
        const lines = [...byTitle.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([title, id]) => `- ${title}  (id: ${id})`);
        return text(`# WhaTap DS Components (${lines.length})\n\n${lines.join("\n")}`);
      },
    );

    server.tool(
      "get_component",
      "특정 컴포넌트의 **사용 규칙**(Purpose · ✅Do · ❌Don't · Composition rules) + props + import 경로 + 스토리 변형 반환. " +
        "컴포넌트를 쓰기 전에 이 도구를 먼저 부를 것. id 는 list_components 의 docs id(예: composite-pageheader) 또는 컴포넌트 제목.",
      { id: z.string().describe("docs id (예: chrome-subheaderbar) 또는 컴포넌트 제목") },
      async ({ id }) => {
        const entries = await fetchIndex();
        const key = id.toLowerCase();
        // 1) id/제목으로 한 항목(hit) 찾기 → 2) 같은 title 의 전체 그룹(docs + stories) 수집.
        const hit = Object.values(entries).find(
          (e) =>
            e.id === id ||
            e.id.replace(/--(docs|[a-z0-9-]+)$/, "") === key ||
            e.title.toLowerCase() === key ||
            e.title.toLowerCase().endsWith("/" + key),
        );
        if (!hit) return text(`'${id}' 에 해당하는 컴포넌트를 찾지 못했습니다. list_components 로 확인하세요.`);
        const title = hit.title;
        const group = Object.values(entries).filter((e) => e.title === title);
        const stories = group.filter((e) => e.type === "story");
        const docs = group.find((e) => e.type === "docs");
        const doc = (await fetchComponentDocs())?.get(title) ?? null;
        const lines = [
          `# ${title}`,
          ``,
          `import { ${doc?.name ?? title.split("/").pop()} } from "${doc?.importFrom ?? hit.importPath}";`,
          `프리뷰/문서: ${BASE}/?path=/docs/${docs?.id ?? hit.id}`,
          ...(doc?.sourceFile ? [`소스: ${doc.sourceFile}`] : []),
          ...(doc ? rulesBlock(doc) : [``, `⚠️ 규칙 카탈로그(components.json)를 불러오지 못했습니다 — 배포가 낡았을 수 있습니다.`]),
          ``,
          `## Stories (${stories.length})`,
          ...stories.map((s) => {
            const note = doc?.stories.find((x) => x.id === s.id)?.note;
            return `- ${s.name}${note ? ` — ${note}` : ""}  →  ${BASE}/iframe.html?id=${s.id}`;
          }),
        ];
        return text(lines.join("\n"));
      },
    );

    server.tool(
      "get_do_dont",
      "전 컴포넌트의 ✅Do / ❌Don't 만 모은 요약 — 작업 시작 시 컨텍스트에 한 번에 주입용. layer 로 좁힐 수 있다(Primitives · Composite · Shell).",
      {
        layer: z
          .enum(["Primitives", "Composite", "Shell", "all"])
          .optional()
          .describe("계층 필터. 미지정이면 전부."),
      },
      async ({ layer }) => {
        const docs = await fetchComponentDocs();
        if (!docs) return text("규칙 카탈로그(components.json)를 불러오지 못했습니다. get_design_catalog 를 사용하세요.");
        const picked = [...docs.values()].filter(
          (c) => (!layer || layer === "all" || c.layer === layer) && (c.do.length || c.dont.length),
        );
        const body = picked.map((c) =>
          [
            `## ${c.title}`,
            ...(c.do.length ? [`✅ ${c.do.join(" · ")}`] : []),
            ...(c.dont.length ? [`❌ ${c.dont.join(" · ")}`] : []),
          ].join("\n"),
        );
        return text(
          [
            `# WhaTap DS — Do / Don't (${picked.length}${layer && layer !== "all" ? ` · ${layer}` : ""})`,
            ``,
            `상세(props · example · 프리뷰)는 get_component(id).`,
            ``,
            ...body,
          ].join("\n\n"),
        );
      },
    );

    server.tool(
      "search_components",
      "의도·키워드로 컴포넌트 검색 — 이름뿐 아니라 **규칙 본문**(purpose · when to use · when NOT to use · Do/Don't · props · 스토리)까지 본다. 한국어 의도 질의가 목적: '삭제 확인', '알림 목록', '즉시 반영 설정'. 매칭된 필드와 그 문장을 함께 돌려주므로 왜 걸렸는지 알 수 있다. 관련 정책/패턴(patterns.md)도 함께 반환한다.",
      { query: z.string().describe("검색어 — 컴포넌트명 또는 하려는 일(의도). 공백으로 여러 낱말 = AND") },
      async ({ query }) => {
        const q = query.trim().toLowerCase();
        if (!q) return text("검색어가 비었습니다.");
        const tokens = q.split(/\s+/).filter(Boolean);

        /* 필드별 가중치 — **whenToUse 를 이름 다음으로 높게** 둔다. 개발자는 컴포넌트 이름을
           모르는 상태로 "무엇을 하려는지"로 찾아오고, 그 축의 정본이 whenToUse 다.
           (교체 전 이 도구는 title·스토리 name·id 만 봤다 → 한국어 의도 질의는 전부 무매칭이었고
            폴백으로 DESIGN.md 를 grep 했는데 그건 120종 중 51종이 없는 손유지 합본이었다.) */
        const FIELDS: { key: string; w: number; of: (c: ComponentDoc) => string[] }[] = [
          { key: "name", w: 6, of: (c) => [c.name, c.title] },
          { key: "whenToUse", w: 5, of: (c) => c.whenToUse },
          { key: "purpose", w: 4, of: (c) => [c.summary ?? "", c.purpose ?? ""] },
          { key: "do", w: 4, of: (c) => c.do },
          { key: "whenNotToUse", w: 3, of: (c) => [...c.whenNotToUse, ...c.dont] },
          { key: "rules", w: 2, of: (c) => c.compositionRules },
          { key: "props", w: 2, of: (c) => c.props.map((p) => `${p.name} ${p.description ?? ""}`) },
          { key: "story", w: 1, of: (c) => c.stories.map((s) => `${s.name} ${s.note ?? ""}`) },
        ];

        const docs = await fetchComponentDocs();

        /* 규칙 카탈로그가 없을 때(배포 낡음/404)만 옛 title·id 매칭으로 내려앉는다. */
        if (!docs) {
          const entries = await fetchIndex();
          const hits = [...new Set(Object.values(entries).map((e) => e.title))].filter((t) =>
            t.toLowerCase().includes(q),
          );
          return text(
            [
              `# '${query}' 검색 (제한 모드 — components.json 없음)`,
              ``,
              ...(hits.length ? hits.map((t) => `- ${t}`) : ["결과 없음."]),
              ``,
              `규칙 본문 검색이 비활성입니다. 전체 목록은 list_components.`,
            ].join("\n"),
          );
        }

        /* 낱말별 희소성 가중(IDF) — 흔한 낱말이 순위를 지배하는 것을 막는다.
           실측: '삭제 확인' 에서 «확인» 은 카탈로그 전반에 흔하고 «삭제» 는 Modal 에만 가깝다.
           가중이 없으면 «확인» 을 여러 필드에서 맞힌 카드들이 위로 오고 정작 Modal 이 3위로
           밀렸다 — 질의를 좁힌 낱말이 순위에 반영되지 않으면 검색이 넓힐수록 나빠진다. */
        const all = [...docs.values()];
        const hay = (c: ComponentDoc) =>
          FIELDS.flatMap((f) => f.of(c)).join("   ").toLowerCase();
        const haystacks = new Map(all.map((c) => [c.title, hay(c)]));
        const idf = new Map(
          tokens.map((t) => {
            const df = all.filter((c) => haystacks.get(c.title)!.includes(t)).length;
            return [t, 1 / Math.log2(2 + df)];
          }),
        );

        /** covered = 질의 낱말 중 몇 개를 덮었는가. OR 모드의 1순위 정렬 키다. */
        type Hit = { c: ComponentDoc; score: number; covered: number; where: string[]; snippet: string | null };
        const scoreOf = (c: ComponentDoc, needles: string[]): Hit | null => {
          let score = 0;
          const where = new Set<string>();
          let snippet: string | null = null;
          for (const n of needles) {
            let best = 0;
            for (const f of FIELDS) {
              for (const raw of f.of(c)) {
                if (!raw || !raw.toLowerCase().includes(n)) continue;
                where.add(f.key);
                if (f.w > best) best = f.w;
                /* 스니펫은 **이름 아닌 필드**에서 뽑는다 — 이름 일치는 이미 제목에 보인다. */
                if (!snippet && f.key !== "name") snippet = `${f.key}: ${raw.replace(/\s+/g, " ").trim()}`;
              }
            }
            if (!best) return null; // AND — 낱말 하나라도 어디에도 없으면 탈락
            score += best * (idf.get(n) ?? 1);
          }
          return { c, score, covered: needles.length, where: [...where], snippet };
        };

        let hits = [...docs.values()].map((c) => scoreOf(c, tokens)).filter((h): h is Hit => h !== null);
        let mode = "";
        if (!hits.length && tokens.length > 1) {
          /* AND 무매칭 → 낱말 단위 OR 로 완화(질의가 문장처럼 길 때).
             단 **흔한 낱말은 버린다.** 한국어 질의는 '되돌릴 수 없는' 처럼 조사·의존명사가
             섞여 들어오고, '수' 한 글자는 카탈로그 79종에 걸려 결과를 전부 덮었다(실측).
             카탈로그 30% 이상에 등장하는 낱말은 질의를 좁히지 못하므로 순위에서 제외한다 —
             단 전부 흔하면 원래 낱말들로 되돌린다(결과 0 보다 낫다). */
          const rare = tokens.filter((t) => {
            const df = all.filter((c) => haystacks.get(c.title)!.includes(t)).length;
            return df <= all.length * 0.3;
          });
          const useTokens = rare.length ? rare : tokens;
          hits = useTokens
            .flatMap((t) => [...docs.values()].map((c) => scoreOf(c, [t])).filter((h): h is Hit => h !== null))
            .reduce<Hit[]>((acc, h) => {
              const prev = acc.find((a) => a.c.title === h.c.title);
              if (prev) { prev.score += h.score; prev.covered += h.covered; prev.where = [...new Set([...prev.where, ...h.where])]; prev.snippet ??= h.snippet; }
              else acc.push(h);
              return acc;
            }, []);
          mode = " · 부분 일치(OR)";
        }
        /* **덮은 낱말 수가 1순위.** 한 낱말을 여러 필드에서 맞힌 것보다 여러 낱말을 맞힌 쪽이
           질의에 가깝다 — '되돌릴 수 없는 액션' 에서 «액션» 만 맞힌 카드가 위로 오는 것을 막는다. */
        hits.sort((a, b) => b.covered - a.covered || b.score - a.score || a.c.title.localeCompare(b.c.title));
        const top = hits.slice(0, 15);

        /* 정책·패턴은 **폴백이 아니라 덧붙임**이다. "삭제"는 Modal(컴포넌트)과
           「파괴적 액션 확인」(패턴) 둘 다 필요하고, 둘 중 하나만 오면 반쪽 답이 된다. */
        type PatternHit = { heading: string; line: string; score: number };
        let patternHits: PatternHit[] = [];
        try {
          const md = await fetchText("/design-system/patterns.md");
          const secs = new Map<string, PatternHit>();
          let heading = "";
          for (const ln of md.split("\n")) {
            const h = ln.match(/^#{2,3}\s+(.+?)\s*$/);
            if (h) heading = h[1].trim();
            if (!heading) continue;
            const lower = ln.toLowerCase();
            const hl = heading.toLowerCase();
            /* 제목 일치가 본문 일치보다 훨씬 강한 신호다 — 본문은 산문이라 흔한 낱말이
               스치기만 해도 걸린다("… 저장/삭제 …" 한 줄 때문에 무관한 절이 올라왔다). */
            const inHead = tokens.filter((t) => hl.includes(t)).length;
            const inBody = h ? 0 : tokens.filter((t) => lower.includes(t)).length;
            if (!inHead && !inBody) continue;
            const s = inHead * 4 + inBody;
            const prev = secs.get(heading);
            if (!prev) secs.set(heading, { heading, line: h ? "" : ln.replace(/\s+/g, " ").trim().slice(0, 140), score: s });
            else {
              prev.score = Math.max(prev.score, s);
              if (!prev.line && !h) prev.line = ln.replace(/\s+/g, " ").trim().slice(0, 140);
            }
          }
          patternHits = [...secs.values()].sort((a, b) => b.score - a.score).slice(0, 5);
        } catch {
          /* patterns.md 미배포 — 컴포넌트 결과만 돌려준다. */
        }

        if (!top.length && !patternHits.length)
          return text(
            `'${query}' 결과 없음. 낱말을 줄여 보거나(예: '삭제 확인' → '삭제'), 전체 목록은 list_components · 정책 전문은 get_design_catalog.`,
          );

        const out = [`# '${query}' 검색 결과${mode}`];
        if (top.length) {
          out.push(``, `## 컴포넌트 (${hits.length}${hits.length > top.length ? ` 중 상위 ${top.length}` : ""})`);
          for (const h of top) {
            out.push(
              `- **${h.c.title}** (id: ${h.c.storyId} · ${h.c.layer} · match: ${h.where.join("/")})`,
              ...(h.snippet ? [`  ↳ ${h.snippet.slice(0, 160)}`] : []),
            );
          }
        }
        if (patternHits.length) {
          out.push(``, `## 관련 패턴·정책 (${patternHits.length})`);
          for (const p of patternHits)
            out.push(`- **${p.heading}** — patterns.md${p.line ? `\n  ↳ ${p.line}` : ""}`);
          out.push(``, `패턴 전문은 get_design_catalog (DESIGN.md 합본) 의 Patterns 절.`);
        }
        out.push(``, `상세 규칙은 get_component(id · 또는 컴포넌트명), 프리뷰는 get_preview_url(storyId).`);
        return text(out.join("\n"));
      },
    );

    server.tool(
      "get_preview_url",
      "스토리 id 로 배포된 정적 Storybook 프리뷰(iframe) URL 과 문서 URL 반환.",
      { storyId: z.string().describe("스토리 id (예: chrome-subheaderbar--default)") },
      async ({ storyId }) =>
        text(
          [
            `preview(iframe): ${BASE}/iframe.html?id=${storyId}`,
            `docs:           ${BASE}/?path=/docs/${storyId.split("--")[0]}--docs`,
          ].join("\n"),
        ),
    );
  },
  {},
  { basePath: "" },
);

export { handler as GET, handler as POST, handler as DELETE };

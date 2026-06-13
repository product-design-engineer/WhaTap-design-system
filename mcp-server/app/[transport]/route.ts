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
      "특정 컴포넌트의 스토리 변형 · import 경로 반환. id 는 list_components 의 docs id(예: chrome-subheaderbar) 또는 컴포넌트 제목.",
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
        const lines = [
          `# ${title}`,
          ``,
          `import path: ${hit.importPath}`,
          `프리뷰/문서: ${BASE}/?path=/docs/${docs?.id ?? hit.id}`,
          ``,
          `## Stories (${stories.length})`,
          ...stories.map((s) => `- ${s.name}  →  ${BASE}/iframe.html?id=${s.id}`),
        ];
        return text(lines.join("\n"));
      },
    );

    server.tool(
      "search_components",
      "키워드로 컴포넌트/스토리 검색 — title · 스토리 name · id 부분일치(대소문자 무시). 예: 'table', 'ai', '헤더', 'prompt'.",
      { query: z.string().describe("검색 키워드 (부분일치)") },
      async ({ query }) => {
        const entries = await fetchIndex();
        const q = query.trim().toLowerCase();
        if (!q) return text("검색어가 비었습니다.");
        const byTitle = new Map<string, StoryEntry[]>();
        for (const e of Object.values(entries)) {
          const g = byTitle.get(e.title) ?? [];
          g.push(e);
          byTitle.set(e.title, g);
        }
        const hits: { title: string; id: string; stories: number; where: string }[] = [];
        for (const [title, group] of byTitle) {
          const titleMatch = title.toLowerCase().includes(q);
          const idName = group.map((g) => `${g.name} ${g.id}`).join(" ").toLowerCase();
          if (titleMatch || idName.includes(q)) {
            const docs = group.find((g) => g.type === "docs");
            hits.push({
              title,
              id: docs?.id ?? group[0].id,
              stories: group.filter((g) => g.type === "story").length,
              where: titleMatch ? "title" : "story/id",
            });
          }
        }
        // title 일치 우선, 그다음 가나다/알파벳 순
        hits.sort((a, b) => (a.where === b.where ? a.title.localeCompare(b.title) : a.where === "title" ? -1 : 1));
        if (hits.length === 0) {
          // 폴백: title/id 무매칭(주로 한국어 키워드) → DESIGN.md 본문에서 키워드가 등장하는 카탈로그 섹션 반환.
          try {
            const design = await fetchText("/design-system/DESIGN.md");
            const sections = new Set<string>();
            let heading = "";
            // 컴포넌트형 헤딩만(공백 없는 단일 PascalCase 단어) — 문서 구조 헤딩("핵심 규칙", "Type Scale" 등) 제외.
            const isComponentHeading = (h: string) => /^[A-Za-z][A-Za-z0-9]+$/.test(h);
            for (const ln of design.split("\n")) {
              const h = ln.match(/^#{2,3}\s+(.+)/);
              if (h) heading = h[1].trim();
              if (heading && isComponentHeading(heading) && ln.toLowerCase().includes(q)) sections.add(heading);
            }
            const arr = [...sections].slice(0, 20);
            if (arr.length > 0)
              return text(
                [
                  `# '${query}' 본문 검색 — 컴포넌트 ${arr.length}`,
                  ``,
                  ...arr.map((s) => `- ${s}`),
                  ``,
                  `(영문 id 직접 매칭 없음 → DESIGN.md 본문에서 키워드가 등장하는 컴포넌트. get_component(id) 로 상세.)`,
                ].join("\n"),
              );
          } catch {
            /* 폴백 실패 시 아래 기본 메시지 */
          }
          return text(`'${query}' 검색 결과 없음. 전체 목록은 list_components, 본문은 get_design_catalog 참고.`);
        }
        const lines = [
          `# '${query}' 검색 결과 (${hits.length})`,
          ``,
          ...hits.map((h) => `- ${h.title}  (id: ${h.id} · stories ${h.stories} · match: ${h.where})`),
          ``,
          `상세는 get_component(id), 프리뷰는 get_preview_url(storyId).`,
        ];
        return text(lines.join("\n"));
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

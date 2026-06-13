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

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
  /** 개발 스펙(docstring `## Spec` 절 원문 markdown) — 치수 · 토큰 · 상태 · 데이터 계약. 없으면 null. */
  spec?: string | null;
  /** 차트가 맞는 지표(fit) · 쓰면 안 되는 지표(avoid) — docstring `## Metrics`. 차트가 아니면 null. */
  metrics?: { fit: string[]; avoid: string[] } | null;
  /** 차트 색 규칙 — docstring `## Color`(역할 · 상한 · 고정 · 금지 + 적힌 토큰). 차트가 아니면 null. */
  color?: { role: string[]; limit: string[]; fixed: string[]; avoid: string[]; tokens: string[] } | null;
  /** 데이터가 비거나 이상할 때 — docstring `## States`. 차트가 아니면 null. */
  states?: { empty: string[]; missing: string[]; zero: string[]; overflow: string[] } | null;
  /** 개수 · 크기 · 라벨 한계 — docstring `## Limits`. 차트가 아니면 null. */
  limits?: { count: string[]; size: string[]; label: string[] } | null;
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

/* ── 토큰 카탈로그 (tokens.json) ─────────────────────────────────────────────
 * `scripts/build-tokens-json.mjs` 가 `whatap-ds.css` 의 선언 + 그 위 `@role/@use/@avoid`
 * 주석에서 생성한다. 이게 없던 동안 `get_tokens` 는 tokens.md 산문을 그대로 돌려줬고,
 * 런타임 토큰 197개 중 그 문서에 이름이라도 있는 것은 55개였다 — 컴포넌트는 고를 수 있는데
 * 그 안을 채우는 원자를 고를 근거가 없었다. */
type TokenDoc = {
  name: string;
  tier: "Global" | "Semantic" | "Component";
  group: string;
  value: string;
  dark: string | null;
  aliasOf: string | null;
  role: string | null;
  use: string | null;
  avoid: string | null;
  utilities: string[];
  usedBy: string[];
  related: string[];
};

async function fetchTokenDocs(): Promise<TokenDoc[] | null> {
  try {
    const r = await fetch(`${BASE}/design-system/tokens.json`, { cache: "no-store" });
    if (!r.ok) return null;
    const d = (await r.json()) as { tokens: TokenDoc[] };
    return d.tokens ?? null;
  } catch {
    return null;
  }
}

/** 토큰 한 줄 요약 — 이름·값·다크·역할. 소비자가 쓸 표면(유틸 클래스)을 반드시 붙인다. */
function tokenLine(t: TokenDoc): string {
  const util = t.utilities.length ? ` · 유틸 \`${t.utilities.slice(0, 3).join("` `")}\`` : "";
  const dark = t.dark ? ` · 다크 \`${t.dark}\`` : " · 테마 불변";
  return `- \`${t.name}\` (${t.tier}) — ${t.role ?? "(역할 미기술)"}\n  \`${t.value}\`${dark}${util}`;
}

const list = (items: string[]) => items.map((s) => `- ${s}`).join("\n");

/** 규칙 섹션 — Do/Don't 를 먼저 둔다. AI 가 위에서부터 읽고 코드를 쓰기 시작하기 때문. */
function rulesBlock(c: ComponentDoc): string[] {
  const out: string[] = [];
  if (c.purpose) out.push(``, `## Purpose`, c.purpose);
  /* 차트는 «어떤 지표에 쓰나» 가 고르는 첫 기준이라 Do 보다 먼저 둔다. */
  if (c.metrics?.fit.length) out.push(``, `## 📈 맞는 지표`, list(c.metrics.fit));
  if (c.metrics?.avoid.length) out.push(``, `## 🚫 쓰면 안 되는 지표`, list(c.metrics.avoid));
  /* 차트 색은 «어떤 토큰을 몇 개까지 어떤 순서로» 가 정해져 있다 — 지표 다음, Do 보다 먼저. */
  if (c.color?.role.length) {
    out.push(``, `## 🎨 색`, list([...c.color.role.map((s) => `역할: ${s}`), ...c.color.limit.map((s) => `상한: ${s}`), ...c.color.fixed.map((s) => `고정: ${s}`), ...c.color.avoid.map((s) => `금지: ${s}`)]));
  }
  /* 빈 데이터 · 빠진 값 · 0 · 범위 밖을 차트가 어떻게 그리는지 — 화면이 따로 빈 상태를 만들지 않게. */
  if (c.states?.empty.length) {
    out.push(``, `## 🫙 데이터가 비거나 이상할 때`, list([...c.states.empty.map((s) => `빈: ${s}`), ...c.states.missing.map((s) => `빠짐: ${s}`), ...c.states.zero.map((s) => `0: ${s}`), ...c.states.overflow.map((s) => `넘침: ${s}`)]));
  }
  if (c.limits?.count.length) {
    out.push(``, `## 📏 한계`, list([...c.limits.count.map((s) => `개수: ${s}`), ...c.limits.size.map((s) => `크기: ${s}`), ...c.limits.label.map((s) => `라벨: ${s}`)]));
  }
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
  if (c.spec) out.push(``, `## Spec (개발 스펙)`, c.spec);
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
      "토큰 카탈로그 — 이름 · 값 · 다크 값 · **역할/권장/금지** · 유틸 클래스 · 사용 컴포넌트. tier(Global/Semantic/Component) 또는 group('color-text', 'shadow-md' …)으로 좁힐 수 있다. 산문 전문이 필요하면 get_design_catalog.",
      {
        tier: z.enum(["Global", "Semantic", "Component", "all"]).optional()
          .describe("계층 필터. UI 컴포넌트는 Semantic 만 참조해야 한다."),
        group: z.string().optional().describe("그룹 접두(예: 'color-text', 'wds', 'shadow')"),
      },
      async ({ tier, group }) => {
        const all = await fetchTokenDocs();
        if (!all) return text(await fetchText("/design-system/tokens.md"));
        const picked = all.filter(
          (t) =>
            (!tier || tier === "all" || t.tier === tier) &&
            (!group || t.name.includes(group) || t.group.startsWith(group)),
        );
        if (!picked.length) return text(`조건에 맞는 토큰 없음 (tier=${tier ?? "all"} group=${group ?? "-"}).`);
        const byTier = ["Semantic", "Component", "Global"].filter((x) => picked.some((t) => t.tier === x));
        const out = [`# WhaTap 토큰 (${picked.length}${group ? ` · ${group}` : ""})`];
        for (const x of byTier) {
          out.push(``, `## ${x}`, ...picked.filter((t) => t.tier === x).map(tokenLine));
        }
        out.push(
          ``,
          `**규칙** — UI 컴포넌트는 Semantic 만 참조한다(Global 직접 참조 금지). 인라인 주입 시 TS 토큰은 \`.value\`(hex) 가 아니라 \`.cssVar\` 를 쓴다 — 다크가 따라오지 않는다.`,
          `의도로 찾으려면 search_tokens("경고 배경"), 컴포넌트 규칙은 get_component.`,
        );
        return text(out.join("\n"));
      },
    );

    server.tool(
      "search_tokens",
      "의도로 토큰을 찾는다 — '경고 배경', '카드 위 보조 텍스트', '모달 그림자', '표 수치 서체'. 역할·권장·금지 문구까지 검색하고, 그 토큰을 쓰는 유틸 클래스와 실제 사용 컴포넌트를 함께 돌려준다.",
      { query: z.string().describe("하려는 일(의도) 또는 토큰 이름 일부") },
      async ({ query }) => {
        const all = await fetchTokenDocs();
        if (!all) return text("토큰 카탈로그(tokens.json)를 불러오지 못했습니다. get_tokens 를 사용하세요.");
        const q = query.trim().toLowerCase();
        if (!q) return text("검색어가 비었습니다.");
        const tokens = q.split(/\s+/).filter(Boolean);

        /* 가중치 — 역할(role)이 가장 강하다. 이름 일치는 이미 아는 사람의 질의이고,
           의도 질의는 role/use 에 걸린다. avoid 매칭도 싣는다 — 「쓰지 말 것」을 찾는
           질의("본문에 쓰면 안 되는 색")에 답할 수 있어야 한다. */
        const FIELDS: { key: string; w: number; of: (t: TokenDoc) => string[] }[] = [
          { key: "role", w: 5, of: (t) => [t.role ?? ""] },
          { key: "name", w: 4, of: (t) => [t.name, t.group] },
          { key: "use", w: 4, of: (t) => [t.use ?? ""] },
          { key: "avoid", w: 2, of: (t) => [t.avoid ?? ""] },
          { key: "utility", w: 2, of: (t) => t.utilities },
          { key: "usedBy", w: 1, of: (t) => t.usedBy },
        ];
        const score = (t: TokenDoc, needles: string[]) => {
          let sc = 0;
          const where = new Set<string>();
          for (const n of needles) {
            let best = 0;
            for (const f of FIELDS)
              for (const raw of f.of(t))
                if (raw && raw.toLowerCase().includes(n)) {
                  where.add(f.key);
                  if (f.w > best) best = f.w;
                }
            if (!best) return null;
            sc += best;
          }
          return { t, sc, where: [...where] };
        };
        let hits = all.map((t) => score(t, tokens)).filter((h): h is NonNullable<typeof h> => h !== null);
        let mode = "";
        if (!hits.length && tokens.length > 1) {
          hits = all
            .map((t) => {
              const partial = tokens.map((n) => score(t, [n])).filter(Boolean) as NonNullable<ReturnType<typeof score>>[];
              if (!partial.length) return null;
              /* 덮은 낱말 수를 점수 앞에 둔다 — '보조 텍스트' 에서 «텍스트» 한 낱말만
                 강하게 맞힌 토큰이 두 낱말을 약하게 맞힌 토큰보다 위로 오면 안 된다. */
              return {
                t,
                sc: partial.reduce((a, b) => a + b.sc, 0),
                covered: partial.length,
                where: [...new Set(partial.flatMap((p) => p.where))],
              };
            })
            .filter((h): h is NonNullable<typeof h> => h !== null);
          mode = " · 부분 일치";
        }
        hits.sort(
          (a, b) =>
            ((b as { covered?: number }).covered ?? 1) - ((a as { covered?: number }).covered ?? 1) ||
            b.sc - a.sc ||
            a.t.name.localeCompare(b.t.name),
        );
        const top = hits.slice(0, 12);
        if (!top.length)
          return text(`'${query}' 토큰 결과 없음. 낱말을 줄여 보거나 get_tokens(group: 'color-text') 로 훑어보세요.`);

        const out = [`# '${query}' 토큰 (${hits.length}${hits.length > top.length ? ` 중 상위 ${top.length}` : ""}${mode})`, ``];
        for (const h of top) {
          out.push(tokenLine(h.t) + `  \n  match: ${h.where.join("/")}`);
          if (h.t.use) out.push(`  ✅ ${h.t.use}`);
          if (h.t.avoid) out.push(`  ❌ ${h.t.avoid}`);
          if (h.t.usedBy.length) out.push(`  쓰는 곳: ${h.t.usedBy.slice(0, 5).join(", ")}`);
        }
        out.push(``, `컴포넌트 선택은 search_components, 정책 전문은 get_design_catalog.`);
        return text(out.join("\n"));
      },
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
      { id: z.string().describe("docs id (예: composite-pageheader) · 컴포넌트 제목 · 또는 컴포넌트 이름(예: CountryFlag · WhaTapAiWidget)") },
      async ({ id }) => {
        const [entries, docMap] = await Promise.all([fetchIndex(), fetchComponentDocs()]);
        const key = id.toLowerCase();
        const bare = key.replace(/\s+/g, "");
        // 제목의 마지막 이름 조각 — "Primitives/Web · CountryFlag" → "countryflag".
        // 마케팅(`Web · X`) 제목은 끝이 "/countryflag" 가 아니어서 이름만으로는 못 찾았다(2026-10-02 확인).
        const leaf = (title: string) =>
          (title.split("/").pop() ?? title).split("·").pop()!.trim().toLowerCase().replace(/\s+/g, "");
        const all = Object.values(entries);
        // 1) id/제목으로 한 항목(hit) 찾기 → 2) 같은 title 의 전체 그룹(docs + stories) 수집.
        let hit = all.find(
          (e) =>
            e.id === id ||
            e.id.replace(/--(docs|[a-z0-9-]+)$/, "") === key ||
            e.title.toLowerCase() === key ||
            e.title.toLowerCase().endsWith("/" + key),
        );
        if (!hit) {
          // 3) 이름으로 — 제목의 마지막 조각, 그다음 components.json 의 컴포넌트 이름
          //    (제목과 이름이 다른 경우: Shell/Ai/Widget ↔ WhaTapAiWidget).
          const byLeaf = new Set(all.filter((e) => leaf(e.title) === bare).map((e) => e.title));
          const byName = new Set(
            [...(docMap?.values() ?? [])].filter((c) => c.name.toLowerCase() === bare).map((c) => c.title),
          );
          const titles = [...(byLeaf.size ? byLeaf : byName)];
          if (titles.length > 1) {
            return text(
              [`'${id}' 이(가) 여러 컴포넌트에 해당합니다 — 제목으로 다시 부르세요:`, ...titles.map((t) => `- ${t}`)].join("\n"),
            );
          }
          if (titles.length === 1) hit = all.find((e) => e.title === titles[0]);
        }
        if (!hit) return text(`'${id}' 에 해당하는 컴포넌트를 찾지 못했습니다. list_components 로 확인하세요.`);
        const title = hit.title;
        const group = all.filter((e) => e.title === title);
        const stories = group.filter((e) => e.type === "story");
        const docs = group.find((e) => e.type === "docs");
        const doc = docMap?.get(title) ?? null;
        const lines = [
          `# ${title}`,
          ``,
          // 소스 파일이 없는 항목(CSS 클래스 컴포넌트 · 스토리 안 합성 템플릿 — 27종)은 import 할 것이 없다.
          // 예전에는 스토리 파일 경로를 import 처럼 내보내 AI 가 존재하지 않는 import 를 썼다.
          doc && !doc.importFrom
            ? `import 없음 — 소스 컴포넌트가 아니다(CSS 클래스 또는 스토리 안 합성 템플릿). 마크업은 아래 스토리를 본다.`
            : `import { ${doc?.name ?? title.split("/").pop()} } from "${doc?.importFrom ?? hit.importPath}";`,
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
           모르는 상태로 "무엇을 하려는지"로 찾아오고, 그 기준의 정본이 whenToUse 다.
           (교체 전 이 도구는 title·스토리 name·id 만 봤다 → 한국어 의도 질의는 전부 무매칭이었고
            폴백으로 DESIGN.md 를 grep 했는데 그건 120종 중 51종이 없는 손유지 합본이었다.) */
        const FIELDS: { key: string; w: number; of: (c: ComponentDoc) => string[] }[] = [
          { key: "name", w: 6, of: (c) => [c.name, c.title] },
          { key: "whenToUse", w: 5, of: (c) => c.whenToUse },
          /* «응답시간 차트» 처럼 지표 이름으로 찾아오는 질의 — 맞는 지표를 의도와 같은 무게로. */
          { key: "metrics", w: 5, of: (c) => c.metrics?.fit ?? [] },
          { key: "purpose", w: 4, of: (c) => [c.summary ?? "", c.purpose ?? ""] },
          { key: "do", w: 4, of: (c) => c.do },
          { key: "whenNotToUse", w: 3, of: (c) => [...c.whenNotToUse, ...c.dont, ...(c.metrics?.avoid ?? [])] },
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
        /* 토큰도 함께 — 컴포넌트를 골랐어도 그 안을 채울 원자를 모르면 인라인 hex 로 샌다.
           질의가 이미 의도이므로 같은 낱말로 토큰 카탈로그를 훑어 상위 몇 개만 붙인다. */
        const tokenHits: string[] = [];
        try {
          const all = await fetchTokenDocs();
          if (all) {
            const scored = all
              .map((t) => {
                const hay = `${t.name} ${t.role ?? ""} ${t.use ?? ""} ${t.utilities.join(" ")}`.toLowerCase();
                const n = tokens.filter((q) => hay.includes(q)).length;
                return { t, n };
              })
              .filter((x) => x.n > 0)
              .sort((a, b) => b.n - a.n || a.t.name.localeCompare(b.t.name))
              .slice(0, 4);
            for (const { t } of scored) tokenHits.push(tokenLine(t));
          }
        } catch {
          /* 토큰 카탈로그 미배포 — 컴포넌트/패턴 결과만 */
        }

        if (patternHits.length) {
          out.push(``, `## 관련 패턴·정책 (${patternHits.length})`);
          for (const p of patternHits)
            out.push(`- **${p.heading}** — patterns.md${p.line ? `\n  ↳ ${p.line}` : ""}`);
          out.push(``, `패턴 전문은 get_design_catalog (DESIGN.md 합본) 의 Patterns 절.`);
        }
        if (tokenHits.length) {
          out.push(``, `## 관련 토큰 (${tokenHits.length})`, ...tokenHits, ``, `토큰만 더 보려면 search_tokens("${query}").`);
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

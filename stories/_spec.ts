import componentsData from "../docs/components.json";

/**
 * 컴포넌트 docstring `## Spec` 절(개발 스펙)을 스토리 Docs 설명 끝에 붙인다.
 * 정본은 소스 docstring 하나다 — `pnpm build:design` 이 `components.json` 의 `spec` 으로 뽑고,
 * 같은 값을 DS MCP `get_component` 와 이 Docs 탭이 읽는다. 스토리에 스펙을 다시 적지 않는다.
 */
export function withSpec(name: string, intro: string): string {
  const list = (Array.isArray(componentsData) ? componentsData : (componentsData as { components?: unknown[] }).components ?? []) as {
    name: string;
    spec?: string | null;
  }[];
  const spec = list.find((c) => c.name === name)?.spec;
  return spec ? `${intro}\n\n### 개발 스펙\n\n${spec}` : intro;
}

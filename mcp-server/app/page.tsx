export default function Home() {
  return (
    <main>
      <h1>WhaTap Design System — Hosted MCP</h1>
      <p>
        dev 서버 없이 연결되는 디자인 시스템 MCP 서버입니다. 배포된 정적 카탈로그를 소스로 DS 지식·문서·코드·프리뷰 도구를 제공합니다.
      </p>
      <h2>엔드포인트</h2>
      <pre><code>{`<이 사이트 URL>/mcp   (streamable HTTP)`}</code></pre>
      <h2>연결 예시</h2>
      <pre><code>{`# Claude Code
claude mcp add --transport http whatap-ds <이 사이트 URL>/mcp

# Cursor — .cursor/mcp.json
{ "mcpServers": { "whatap-ds": { "url": "<이 사이트 URL>/mcp" } } }`}</code></pre>
      <h2>도구</h2>
      <ul>
        <li><code>get_design_catalog</code> — 전체 카탈로그(DESIGN.md)</li>
        <li><code>list_components</code> — 컴포넌트 목록</li>
        <li><code>get_component</code> — 특정 컴포넌트 문서·스토리·import</li>
        <li><code>get_tokens</code> — 토큰 카탈로그</li>
        <li><code>get_preview_url</code> — 스토리 프리뷰/문서 URL</li>
      </ul>
      <p>
        라이브 테스트·렌더 도구는 로컬 <code>storybook dev</code> 의 addon-mcp(<code>localhost:5181/mcp</code>)에서 제공됩니다.
      </p>
    </main>
  );
}

import { Controls, Description, Markdown, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import componentsData from '../docs/components.json';

/**
 * 모든 autodocs 페이지의 틀 — Storybook 기본 순서(Title · Subtitle · Description · Primary · Controls · Stories)에
 * **「어떤 지표에 쓰나」** 블록 하나를 더한다(설명 바로 아래).
 *
 * 정본은 컴포넌트 docstring `## Metrics`(✅ 맞는 지표 · ❌ 쓰면 안 되는 지표) 하나다. `pnpm build:design` 이
 * `components.json` `metrics` 로 뽑고, 같은 값을 MCP `get_component` 와 이 블록이 읽는다 — 스토리에 다시 적지 않는다.
 * 차트 스토리는 `description.component` 로 docstring 설명을 덮어쓰므로, 이 블록이 없으면 사람은 지표를 볼 수 없었다
 * (2026-10-23 사용자 «사람이 보는 스토리북에도 적용»). `metrics` 가 없는 컴포넌트에서는 아무것도 그리지 않는다.
 *
 * 그 아래 **「무엇을 어떤 색으로」** 블록 — docstring `## Colors`(patterns §17 역할 · 토큰, 2026-10-27). 같은 경로로
 * `components.json` `colors` 를 읽는다. 없으면 그리지 않는다.
 */
type Entry = {
  title: string;
  metrics?: { fit: string[]; avoid: string[] } | null;
  colors?: { role: string | null; text: string }[] | null;
};
const entries = ((componentsData as { components?: Entry[] }).components ?? []) as Entry[];

/** `[[Name]]` 위키 링크는 Docs 에서 이름 글자로만 둔다. */
const plain = (s: string) => s.replace(/\[\[([^\]]+)\]\]/g, '$1');

function MetricsBlock() {
  const { csfFile } = useOf('meta', ['meta']);
  const metrics = entries.find((e) => e.title === csfFile.meta.title)?.metrics;
  if (!metrics?.fit.length) return null;
  const md = [
    '### 어떤 지표에 쓰나',
    '',
    '**✅ 맞는 지표**',
    '',
    ...metrics.fit.map((m) => `- ${plain(m)}`),
    ...(metrics.avoid.length ? ['', '**❌ 쓰면 안 되는 지표**', '', ...metrics.avoid.map((m) => `- ${plain(m)}`)] : []),
  ].join('\n');
  return <Markdown>{md}</Markdown>;
}

function ColorsBlock() {
  const { csfFile } = useOf('meta', ['meta']);
  const colors = entries.find((e) => e.title === csfFile.meta.title)?.colors;
  if (!colors?.length) return null;
  const md = [
    '### 무엇을 어떤 색으로',
    '',
    ...colors.map((c) => `- ${c.role ? `**${c.role}** — ` : ''}${plain(c.text)}`),
    '',
    '역할은 patterns §17 «차트 색» 의 낱말이다. 바탕은 데이터 색이 아닌 자리(트랙 · 값 없음 · 남은 몫).',
  ].join('\n');
  return <Markdown>{md}</Markdown>;
}

export default function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <MetricsBlock />
      <ColorsBlock />
      <Primary />
      <Controls />
      <Stories />
    </>
  );
}

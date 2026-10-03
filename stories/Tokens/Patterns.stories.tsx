import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Patterns",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.font.pattern.*` — 10 종 Named Typography Patterns.**\n\n" +
          "자주 사용되는 family/size/weight/lineHeight/tracking 조합을 named pattern 으로 토큰화. " +
          "AI agent 가 'section heading 만들어줘' 했을 때 정확한 조합을 매칭. " +
          "각 pattern 옆에 실제 prototype 사용 위치를 함께 표시.",
      },
    },
  },
};
export default meta;

type PatternKey = keyof typeof tokens.font.pattern;

function resolvePattern(key: PatternKey) {
  const p = tokens.font.pattern[key].value as {
    family: keyof typeof tokens.font.family;
    size: keyof typeof tokens.font.size;
    weight: keyof typeof tokens.font.weight;
    lineHeight: keyof typeof tokens.font.lineHeight;
    tracking: keyof typeof tokens.font.tracking;
    transform?: string;
  };
  return {
    fontFamily: tokens.font.family[p.family].value,
    fontSize: tokens.font.size[p.size].value,
    fontWeight: tokens.font.weight[p.weight].value,
    lineHeight: tokens.font.lineHeight[p.lineHeight].value,
    letterSpacing: tokens.font.tracking[p.tracking].value,
    textTransform: (p.transform as "uppercase" | undefined) ?? "none",
    spec: p,
  } as const;
}

const PATTERNS: { key: PatternKey; sample: string; usage: string }[] = [
  { key: "pageTitle", sample: "DB / oracle_dnx", usage: "PageHeader" },
  { key: "sectionHeading", sample: "🔴 핵심 이상 징후", usage: "AiSectionHeading" },
  { key: "caption", sample: "REASONING", usage: "AiCaption" },
  { key: "body", sample: "최근 5분 동안 httpc 가 압도적 dominant 입니다.", usage: "AiBulletList md · AiUserBubble" },
  { key: "bodySmall", sample: "분류 결과 — 즉시 조치 필요", usage: "AiBulletList sm · dim 본문" },
  { key: "label", sample: "고활용", usage: "AiToneBadge text" },
  { key: "metric", sample: "1,234,567", usage: "LiveTimer digit · AiMigPlan total" },
  { key: "chartLabel", sample: "13:34", usage: "MiniLineChart axis/peak" },
  { key: "tableHeaderCompact", sample: "Max(%)", usage: "DataTable compact 헤더" },
  { key: "tableCellCompact", sample: "82.4", usage: "DataTable compact 셀" },
];

export const Patterns: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {PATTERNS.map((p) => {
        const r = resolvePattern(p.key);
        const t = tokens.font.pattern[p.key];
        return (
          <div key={p.key} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "center", padding: 16, border: "1px solid var(--color-border-default)", borderRadius: 8, background: "var(--color-card)" }}>
            {/* 메타 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "var(--color-text-primary)", fontWeight: 700 }}>{p.key}</code>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 9, color: "var(--color-text-tertiary)", lineHeight: 1.4 }}>
                {r.spec.family} · {r.spec.size} · {r.spec.weight}
                <br />
                {r.spec.lineHeight} · {r.spec.tracking}{r.spec.transform ? " · " + r.spec.transform : ""}
              </code>
              <span style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: 10, color: "var(--color-brand-blue)", marginTop: 4 }}>{p.usage}</span>
            </div>
            {/* 미리보기 */}
            <div style={{ padding: 12, background: "var(--color-surface-50)", borderRadius: 4, color: "var(--color-text-primary)", ...r }}>
              {p.sample}
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 12, padding: 12, background: "var(--color-tone-surface-warning)", border: "1px solid var(--color-indicator-warning)", borderRadius: 6, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, fontFamily: tokens.font.family.korean.value, width: "100%" }}>
        💡 <strong>Description 메타</strong>: 각 pattern 의 <code>tokens.font.pattern[name].description</code> 으로 사용 의도 즉시 조회 가능. AI agent 가 코드 생성 시 이 description 을 lookup 하여 적합한 pattern 선택.
      </div>
    </div>
  ),
};

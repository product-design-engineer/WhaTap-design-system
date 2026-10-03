import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Font Weights",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.font.weight.*` — 3 단계 (Regular 400 / Medium 500 / Bold 700).**\n\n" +
          "한국어 본문 가독성 균형 — Light(<400) 은 화면 dpi 다양성에서 깨질 위험. " +
          "Black(900) 은 카드 chrome 안에서 과한 강조라 비채택.",
      },
    },
  },
};
export default meta;

const WEIGHTS = ["regular", "medium", "bold"] as const;

export const Weights: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {WEIGHTS.map((w) => {
        const t = tokens.font.weight[w];
        return (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16, border: "1px solid var(--color-border-default)", borderRadius: 8, background: "var(--color-card)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "var(--color-text-primary)", fontWeight: 700 }}>{w}</code>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 11, color: "var(--color-text-tertiary)" }}>{t.value}</code>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5, fontFamily: tokens.font.family.korean.value }}>{t.description}</div>
            {/* Korean sample */}
            <div style={{ marginTop: 8, padding: "8px 0", borderTop: "1px solid var(--color-surface-50)" }}>
              <div style={{ fontFamily: tokens.font.family.korean.value, fontSize: 16, color: "var(--color-text-primary)", fontWeight: t.value, lineHeight: 1.4 }}>
                WhaTap AI 어시스턴트 — 가나다라마바사
              </div>
              <div style={{ fontFamily: tokens.font.family.numeric.value, fontSize: 16, color: "var(--color-text-primary)", fontWeight: t.value, lineHeight: 1.4, marginTop: 4 }}>
                1,234,567 · 42.7% · ₩1,580,000
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ),
};

export const PracticalCombinations: StoryObj = {
  render: () => {
    const familyKr = tokens.font.family.korean.value;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: familyKr }}>
        <div>
          <code style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>regular (400)</code>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "4px 0", fontWeight: 400 }}>본문 default 텍스트 — AiBulletList, AiUserBubble 등 흔한 본문.</p>
        </div>
        <div>
          <code style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>medium (500)</code>
          <p style={{ fontSize: 20, color: "var(--color-text-primary)", margin: "4px 0", fontWeight: 500, letterSpacing: "-0.3px" }}>PageHeader 페이지 타이틀</p>
        </div>
        <div>
          <code style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>bold (700)</code>
          <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: "4px 0", fontWeight: 700, letterSpacing: "-0.1px" }}>AiSectionHeading — 핵심 이상 징후</p>
        </div>
      </div>
    );
  },
};

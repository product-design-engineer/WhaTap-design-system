import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Line Heights",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.font.lineHeight.*` — 6 단계.** none(1.0) 이 압도적으로 흔함 (175 회 callsite, " +
          "단일 라인 카드/배지/헤딩). 본문은 normal(1.4) · relaxed(1.5) 사용.",
      },
    },
  },
};
export default meta;

const LHS = ["none", "tight", "snug", "normal", "relaxed", "loose"] as const;
const SAMPLE_TEXT = "WhaTap AI 어시스턴트가 분석 중입니다. 잠시만 기다려 주세요. 데이터를 수집하고 있습니다. 곧 결과를 표시합니다.";

export const LineHeights: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, fontFamily: tokens.font.family.korean.value }}>
      {LHS.map((lh) => {
        const t = tokens.font.lineHeight[lh];
        return (
          <div key={lh} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 16, border: "1px solid #eaeaea", borderRadius: 8, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222", fontWeight: 700 }}>{lh}</code>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 11, color: "#757575" }}>{t.value}</code>
            </div>
            <div style={{ fontSize: 11, color: "#4c4c4c", lineHeight: 1.5 }}>{t.description}</div>
            <div style={{ marginTop: 8, padding: 12, background: "#f5f5f5", borderRadius: 4, fontSize: 13, color: "#222", lineHeight: t.value, letterSpacing: "-0.1px" }}>
              {SAMPLE_TEXT}
            </div>
          </div>
        );
      })}
    </div>
  ),
};

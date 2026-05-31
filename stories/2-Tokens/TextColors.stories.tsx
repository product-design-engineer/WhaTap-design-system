import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Text Colors",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.color.text.*` — 텍스트 hierarchy 4 단계.**\n\n" +
          "primary(#222, 154회) → secondary(#4c4c4c, 75회) → tertiary(#757575, 63회) → disabled(#adadad, 6회). " +
          "본문이 압도적으로 흔하므로 primary 가 다른 색을 합친 것보다 많이 쓰임.",
      },
    },
  },
};
export default meta;

const HIERARCHY = ["primary", "secondary", "tertiary", "disabled"] as const;

export const Hierarchy: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720, fontFamily: tokens.font.family.korean.value }}>
      {HIERARCHY.map((h) => {
        const t = tokens.color.text[h];
        return (
          <div key={h} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, border: "1px solid #eaeaea", borderRadius: 8, background: "#fff" }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: t.value, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222", fontWeight: 700 }}>{h}</code>
                <code style={{ fontFamily: "Roboto, monospace", fontSize: 11, color: "#757575" }}>{t.value}</code>
              </div>
              <div style={{ fontSize: 12, color: "#4c4c4c", lineHeight: 1.4 }}>{t.description}</div>
            </div>
            <div style={{ fontSize: 16, color: t.value, fontFamily: tokens.font.family.korean.value, fontWeight: h === "primary" ? 700 : 400, minWidth: 160, textAlign: "right" }}>
              WhaTap AI 어시스턴트
            </div>
          </div>
        );
      })}
    </div>
  ),
};

export const InCard: StoryObj = {
  render: () => (
    <div style={{ width: 440, padding: 16, background: "#fff", border: "1px solid #eaeaea", borderRadius: 8, fontFamily: tokens.font.family.korean.value, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: tokens.color.text.primary.value, letterSpacing: "-0.1px", lineHeight: 1 }}>
        🔴 핵심 이상 징후
      </div>
      <div style={{ fontSize: 13, color: tokens.color.text.secondary.value, letterSpacing: "-0.1px", lineHeight: 1.5 }}>
        httpc 응답시간 4,294ms — 압도적 dominant. method/sql/dbc/socket 은 정상 범위입니다.
      </div>
      <div style={{ fontSize: 11, color: tokens.color.text.tertiary.value, letterSpacing: "-0.1px", lineHeight: 1 }}>
        분석 시각 — 2026-05-28 14:32:18
      </div>
      <div style={{ fontSize: 12, color: tokens.color.text.disabled.value, letterSpacing: "-0.1px", lineHeight: 1 }}>
        (참고) 이 분석은 자동 실행되었습니다 — 비활성 정보
      </div>
    </div>
  ),
};

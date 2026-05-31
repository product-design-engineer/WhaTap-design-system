import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Tracking",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.font.tracking.*` — Letter-Spacing 4 단계.**\n\n" +
          "**한국어 본문 default 는 `-0.1px`** (사용 빈도 159 회 ⭐). Noto Sans KR 의 letter-spacing 이 " +
          "살짝 넓어 한국어가 분리되어 보이는 현상을 보정. caps(0.3px) 는 uppercase 영문 caption 가독성용.",
      },
    },
  },
};
export default meta;

const TRACKS = ["display", "metric", "default", "caps"] as const;
const SAMPLE_KO = "WhaTap AI 어시스턴트";
const SAMPLE_EN = "WhaTap AI Assistant";

export const Tracking: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
      {TRACKS.map((tr) => {
        const t = tokens.font.tracking[tr];
        const upper = tr === "caps";
        const sample = upper ? "REASONING" : SAMPLE_KO;
        return (
          <div key={tr} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, border: "1px solid #eaeaea", borderRadius: 8, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222", fontWeight: 700 }}>{tr}</code>
              <code style={{ fontFamily: "Roboto, monospace", fontSize: 11, color: "#757575" }}>{t.value}</code>
            </div>
            <div style={{ fontSize: 11, color: "#4c4c4c", lineHeight: 1.5, fontFamily: tokens.font.family.korean.value }}>{t.description}</div>
            <div style={{ padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
              <div style={{ fontFamily: tokens.font.family.korean.value, fontSize: 16, color: "#222", letterSpacing: t.value, textTransform: upper ? "uppercase" : "none", fontWeight: upper ? 700 : 400 }}>
                {sample}
              </div>
              <div style={{ fontFamily: tokens.font.family.numeric.value, fontSize: 16, color: "#222", letterSpacing: t.value, marginTop: 4, textTransform: upper ? "uppercase" : "none", fontWeight: upper ? 700 : 400 }}>
                {upper ? "REASONING" : SAMPLE_EN}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens } from "@whatap/design-system/widget";

const meta: Meta = {
  title: "Tokens/Type Scale",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**`tokens.font.size.*` — 11 단계 Type Scale (Hybrid).**\n\n" +
          "Dense (9~14px) 영역은 1px 정밀 — dashboard 정보 밀도 보존. " +
          "Display (16~48px) 영역은 4~16px 간격으로 인접 2배수에 가까운 통합. " +
          "현재 prototype 의 실제 사용 빈도 기반 — 12px(117회) · 13px(80회) · 11px(77회) 이 가장 흔함.",
      },
    },
  },
};
export default meta;

const SIZES = [
  { key: "chart" as const, range: "Dense" },
  { key: "xs" as const, range: "Dense" },
  { key: "sm" as const, range: "Dense" },
  { key: "base" as const, range: "Dense" },
  { key: "md" as const, range: "Dense" },
  { key: "lg" as const, range: "Dense" },
  { key: "xl" as const, range: "Display" },
  { key: "2xl" as const, range: "Display" },
  { key: "3xl" as const, range: "Display" },
  { key: "4xl" as const, range: "Display" },
  { key: "5xl" as const, range: "Display" },
];

export const ScaleOverview: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 980 }}>
      <div style={{ display: "grid", gridTemplateColumns: "80px 80px 110px 1fr", gap: 16, padding: "8px 16px", borderBottom: "1px solid #eaeaea", fontSize: 11, color: "#757575", fontFamily: "'Noto Sans', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        <span>토큰</span>
        <span>크기</span>
        <span>영역</span>
        <span>의도·용도</span>
      </div>
      {SIZES.map((s) => {
        const t = tokens.font.size[s.key];
        return (
          <div key={s.key} style={{ display: "grid", gridTemplateColumns: "80px 80px 110px 1fr", gap: 16, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f5f5f5" }}>
            <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222" }}>{s.key}</code>
            <span style={{ fontFamily: tokens.font.family.korean.value, fontSize: t.value, color: "#222", lineHeight: 1 }}>가나abc 123</span>
            <span style={{ fontSize: 11, color: s.range === "Dense" ? "#296CF2" : "#8B52FF", fontWeight: 700, fontFamily: "'Noto Sans', sans-serif" }}>{s.range}</span>
            <span style={{ fontSize: 12, color: "#4c4c4c", lineHeight: 1.4, fontFamily: "'Noto Sans', sans-serif" }}>
              <strong style={{ color: "#222" }}>{t.value}</strong> — {t.description}
            </span>
          </div>
        );
      })}
    </div>
  ),
};

export const SideBySideComparison: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", fontFamily: tokens.font.family.korean.value, color: "#222" }}>
      {SIZES.map((s) => (
        <div key={s.key} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <code style={{ width: 60, fontFamily: "Roboto, monospace", fontSize: 11, color: "#757575" }}>{s.key}</code>
          <code style={{ width: 50, fontFamily: "Roboto, monospace", fontSize: 11, color: "#757575" }}>{tokens.font.size[s.key].value}</code>
          <span style={{ fontSize: tokens.font.size[s.key].value, lineHeight: 1 }}>가나다 WhaTap AI</span>
        </div>
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * 마케팅 전용 디자인 토큰 카탈로그.
 *
 * tokens.css 의 --color-web-*, --text-marketing-*, --radius-web-*, --shadow-web-* 를 시각화.
 */
const meta: Meta = {
  title: "Tokens/Web · Marketing",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**마케팅 전용 토큰 카탈로그.** `--color-web-*` (표면·텍스트·보더·글로우), " +
          "`--text-marketing-*` (타이포그래피), `--radius-web-*`, `--shadow-web-*`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const Swatch = ({ token, dark }: { token: string; dark?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 6,
      background: `var(${token})`,
      border: "1px solid rgba(0,0,0,0.1)",
      flexShrink: 0,
    }} />
    <code style={{ fontSize: 13, color: dark ? "#fff" : "#333" }}>{token}</code>
  </div>
);

/** 표면 색상 — 다크 섹션/푸터/CTA 배경. */
export const SurfaceColors: Story = {
  render: () => (
    <div style={{ background: "#1a1a2e", padding: 24, borderRadius: 12 }}>
      {[
        "--color-web-surface-dark",
        "--color-web-surface-dark-alt",
        "--color-web-surface-footer",
        "--color-web-surface-cta-start",
        "--color-web-surface-cta-end",
      ].map((t) => <Swatch key={t} token={t} dark />)}
    </div>
  ),
};

/** 텍스트 색상 — 다크 표면 위 텍스트 계층. */
export const TextOnDark: Story = {
  render: () => (
    <div style={{ background: "#1a1a2e", padding: 24, borderRadius: 12 }}>
      {[
        "--color-web-text-on-dark",
        "--color-web-text-on-dark-muted",
        "--color-web-text-on-dark-subtle",
        "--color-web-text-on-dark-dim",
      ].map((t) => (
        <div key={t} style={{ padding: "8px 0" }}>
          <span style={{ color: `var(${t})`, fontSize: 16 }}>{t}</span>
        </div>
      ))}
    </div>
  ),
};

/** Radius 토큰. */
export const Radius: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {[
        { token: "--radius-web-xs", label: "xs (4px)" },
        { token: "--radius-web-sm", label: "sm (8px)" },
        { token: "--radius-web-md", label: "md (12px)" },
        { token: "--radius-web-lg", label: "lg (16px)" },
        { token: "--radius-web-pill", label: "pill (99px)" },
      ].map(({ token, label }) => (
        <div key={token} style={{ textAlign: "center" }}>
          <div style={{
            width: 80,
            height: 80,
            background: "var(--color-brand-blue)",
            borderRadius: `var(${token})`,
          }} />
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{label}</div>
          <code style={{ fontSize: 11 }}>{token}</code>
        </div>
      ))}
    </div>
  ),
};

/** Shadow 토큰. */
export const Shadows: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: 20 }}>
      {[
        { token: "--shadow-web-card", label: "card" },
        { token: "--shadow-web-card-hover", label: "card-hover" },
        { token: "--shadow-web-elevated", label: "elevated" },
      ].map(({ token, label }) => (
        <div key={token} style={{
          width: 160,
          height: 120,
          background: "#fff",
          borderRadius: 8,
          boxShadow: `var(${token})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
          <code style={{ fontSize: 11, color: "#888" }}>{token}</code>
        </div>
      ))}
    </div>
  ),
};

/** 타이포그래피 토큰 — marketing 스케일. */
export const Typography: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { token: "--text-marketing-display", label: "display" },
        { token: "--text-marketing-h1", label: "h1" },
        { token: "--text-marketing-h2", label: "h2" },
        { token: "--text-marketing-h3", label: "h3" },
        { token: "--text-marketing-h4", label: "h4" },
        { token: "--text-marketing-lead", label: "lead" },
        { token: "--text-marketing-body", label: "body" },
        { token: "--text-marketing-button", label: "button" },
        { token: "--text-marketing-nav", label: "nav" },
      ].map(({ token, label }) => (
        <div key={token} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <code style={{ fontSize: 11, color: "#888", width: 240, flexShrink: 0 }}>{token}</code>
          <span style={{ fontSize: `var(${token})`, fontWeight: 600 }}>{label} 와탭 모니터링</span>
        </div>
      ))}
    </div>
  ),
};

/** 브랜드 색상 — 마케팅 전용. */
export const BrandColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Swatch token="--color-brand-blue-web" />
      <Swatch token="--color-brand-blue-web-deep" />
    </div>
  ),
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle, type ThemeMode } from "@whatap/design-system";

/**
 * Stories for [[ThemeToggle]] — [[Switch]] 기반 라이트/다크 토글.
 *
 * `data-theme="dark|light"` 를 대상 엘리먼트에 세팅하면 DS 다크 토큰
 * (`.dark, [data-theme="dark"]`)이 cascade 되어 색이 전환됩니다.
 * 아래 데모는 글로벌(documentElement) 대신 **로컬 박스**에 적용해 그 안에서만 전환을 시연합니다.
 */
const meta: Meta<typeof ThemeToggle> = {
  title: "Composite/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: { size: { control: { type: "radio" }, options: ["sm", "md"] } },
};
export default meta;
type Story = StoryObj<typeof ThemeToggle>;

/** 로컬 박스에 data-theme 적용 — 박스 안 카드/텍스트가 토큰으로 라이트↔다크 전환. */
export const ScopedDemo: Story = {
  render: (args) => {
    const Demo = () => {
      const [box, setBox] = useState<HTMLElement | null>(null);
      const [mode, setMode] = useState<ThemeMode>("light");
      return (
        <div
          ref={setBox}
          style={{
            width: 320,
            padding: 20,
            borderRadius: "var(--radius-lg, 8px)",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border-default)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontFamily: "var(--font-family-korean)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
              테마: {mode}
            </span>
            {box && <ThemeToggle {...args} applyTo={box} onChange={setMode} />}
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: "var(--radius-md, 6px)",
              background: "var(--color-card)",
              border: "1px solid var(--color-border-default)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--color-text-primary)", marginBottom: 4 }}>
              카드 표면 (var(--color-card))
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              보조 텍스트 — 토큰이 data-theme 에 따라 전환됩니다.
            </div>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/** persistKey — localStorage 저장/복원 (documentElement 적용). 새로고침해도 유지. */
export const Persisted: Story = {
  args: { persistKey: "wds-theme-demo" },
};

/** sm 크기. */
export const Small: Story = {
  render: () => {
    const Demo = () => {
      const [box, setBox] = useState<HTMLElement | null>(null);
      return (
        <div ref={setBox} style={{ padding: 16, background: "var(--color-bg)", borderRadius: 8 }}>
          {box && <ThemeToggle size="sm" applyTo={box} />}
        </div>
      );
    };
    return <Demo />;
  },
};

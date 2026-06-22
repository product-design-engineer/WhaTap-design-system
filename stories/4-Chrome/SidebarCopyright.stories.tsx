import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarCopyright } from "@whatap/design-system";

/**
 * Stories for [[SidebarCopyright]] — Sidebar 하단 24px 저작권 푸터.
 */
const meta: Meta<typeof SidebarCopyright> = {
  title: "Primitives/SidebarCopyright",
  component: SidebarCopyright,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{ width: 240, background: "var(--color-card)", border: "1px solid var(--color-border-default)" }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SidebarCopyright>;

/** 기본 — 2026. */
export const Default: Story = {
  args: {},
};

/** 커스텀 연도. */
export const CustomYear: Story = {
  args: { year: 2025 },
};

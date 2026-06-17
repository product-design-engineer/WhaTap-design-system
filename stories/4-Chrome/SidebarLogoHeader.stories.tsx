import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarLogoHeader } from "@whatap/design-system";

/**
 * Stories for [[SidebarLogoHeader]] — Sidebar 최상단 48px 로고 헤더.
 *
 * 펼침(240px) 시 풀 로고, collapsed(40px) 시 심볼만.
 */
const meta: Meta<typeof SidebarLogoHeader> = {
  title: "Chrome/SidebarLogoHeader",
  component: SidebarLogoHeader,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof SidebarLogoHeader>;

/** 펼침 — 풀 로고 (126×24). */
export const Expanded: Story = {
  args: { collapsed: false, width: 240 },
};

/** Collapsed — 심볼 (24×24). */
export const Collapsed: Story = {
  args: { collapsed: true, width: 40 },
};

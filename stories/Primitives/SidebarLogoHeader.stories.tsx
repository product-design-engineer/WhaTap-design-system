import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarLogoHeader } from "@whatap/design-system";

/**
 * Stories for [[SidebarLogoHeader]] — Sidebar 최상단 48px 로고 헤더.
 *
 * 펼침(240px) 시 풀 로고, collapsed(Min, 80px) 시 심볼.
 * `onToggle` 주입 시 접기/펴기 chevron 이 로고/심볼 옆에 함께 렌더.
 */
const meta: Meta<typeof SidebarLogoHeader> = {
  title: "Primitives/SidebarLogoHeader",
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
  args: { collapsed: true, width: 80 },
};

/** 펼침 + 토글 — 로고 좌측, 접기 chevron(◂) 우측. */
export const ExpandedWithToggle: Story = {
  args: { collapsed: false, width: 240, onToggle: () => {} },
};

/** Collapsed + 토글 — 심볼과 펴기 chevron(▸)이 중앙에 공존. */
export const CollapsedWithToggle: Story = {
  args: { collapsed: true, width: 80, onToggle: () => {} },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarMenuItem, type MenuItem } from "@whatap/design-system";

/**
 * Stories for [[SidebarMenuItem]] — Sidebar 본문 메뉴 트리의 한 항목(행).
 *
 * 단일 / 확장(caret) / 자식 펼침 세 형태를 `MenuItem` 데이터로 제어.
 * 240px 폭 컨테이너로 감싸 실제 사이드바 본문 맥락을 재현.
 */
const meta: Meta<typeof SidebarMenuItem> = {
  title: "Chrome/SidebarMenuItem",
  component: SidebarMenuItem,
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
type Story = StoryObj<typeof SidebarMenuItem>;

/** 단일 항목 — children 없음, caret 없음. */
export const Single: Story = {
  args: { item: { icon: "menu-report.svg", label: "보고서" } as MenuItem },
};

/** 단일 항목 (active) — 라이트블루 배경 강조 + bold primary. */
export const SingleActive: Story = {
  args: { item: { icon: "menu-dashboard.svg", label: "대시보드", active: true } as MenuItem },
};

/** 확장 항목 (접힘) — caret-down, 자식 미표시. */
export const Expandable: Story = {
  args: {
    item: {
      icon: "menu-gpu.svg",
      label: "GPU",
      expanded: false,
      children: [{ label: "GPU 대시보드" }, { label: "GPU 트렌드" }],
    } as MenuItem,
  },
};

/** 확장 항목 (펼침) — caret 180° + 자식 목록, active 자식 bold. */
export const ExpandedWithActiveChild: Story = {
  args: {
    item: {
      icon: "menu-gpu.svg",
      label: "GPU",
      expanded: true,
      children: [
        { label: "GPU 대시보드" },
        { label: "GPU 목록" },
        { label: "GPU 트렌드", active: true },
        { label: "GPU 워크로드" },
      ],
    } as MenuItem,
  },
};

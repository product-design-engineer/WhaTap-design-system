import type { Meta, StoryObj } from "@storybook/react-vite";
import BottomRailItem from "../../src/BottomRailItem";

/**
 * Stories for [[BottomRailItem]] — Sidebar 좌측 40px 제품 레일 하단의 유틸 아이콘 항목.
 *
 * 40px×32px 칸 + 20px 아이콘. `name` 으로 아이콘을 제어.
 * 40px 폭 레일 컨테이너로 감싸 실제 사이드바 하단 레일 맥락을 재현.
 */
const meta: Meta<typeof BottomRailItem> = {
  title: "Chrome/Parts/BottomRailItem",
  component: BottomRailItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{ width: 40, background: "var(--color-card)", border: "1px solid var(--color-border-default)" }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof BottomRailItem>;

/** 기본 — 테마 토글 유틸 아이콘. */
export const Default: Story = {
  args: { name: "bottom-theme.svg" },
};

/** 다른 유틸 — 전체화면 아이콘. */
export const Fullscreen: Story = {
  args: { name: "bottom-fullscreen.svg" },
};

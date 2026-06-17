import type { Meta, StoryObj } from "@storybook/react-vite";
import ProductRailItem from "../../src/ProductRailItem";

/**
 * Stories for [[ProductRailItem]] — Sidebar 좌측 40px 제품 레일의 한 항목(40px 정사각).
 *
 * default / active(라이트블루 배경) 두 형태를 `name`/`active` 로 제어.
 * 40px 폭 레일 컨테이너로 감싸 실제 사이드바 제품 레일 맥락을 재현.
 */
const meta: Meta<typeof ProductRailItem> = {
  title: "Chrome/Parts/ProductRailItem",
  component: ProductRailItem,
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
type Story = StoryObj<typeof ProductRailItem>;

/** 기본 — active 아님. */
export const Default: Story = {
  args: { name: "product-app.svg" },
};

/** active — 라이트블루 배경 강조. */
export const Active: Story = {
  args: { name: "product-gpu.svg", active: true },
};

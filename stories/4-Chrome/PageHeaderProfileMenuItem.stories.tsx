import type { Meta, StoryObj } from "@storybook/react-vite";
import PageHeaderProfileMenuItem from "../../src/PageHeaderProfileMenuItem";

/**
 * Stories for [[PageHeaderProfileMenuItem]] — PageHeader 프로필(아바타) 드롭다운의 한 항목(행).
 *
 * 라벨만 표시하는 좌측정렬 버튼. 드롭다운 폭을 재현한 컨테이너로 감싸
 * 실제 프로필 메뉴 맥락을 보여준다.
 */
const meta: Meta<typeof PageHeaderProfileMenuItem> = {
  title: "Chrome/Parts/PageHeaderProfileMenuItem",
  component: PageHeaderProfileMenuItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div
        style={{
          minWidth: 200,
          background: "var(--color-card)",
          border: "1px solid var(--color-border-default)",
          borderRadius: 8,
          padding: "4px 0",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof PageHeaderProfileMenuItem>;

/** 기본 — 라벨 항목. */
export const Default: Story = {
  args: { item: { label: "엔터프라이즈 관리" } },
};

/** 다른 라벨. */
export const Logout: Story = {
  args: { item: { label: "로그아웃" } },
};

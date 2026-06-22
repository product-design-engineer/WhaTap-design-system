import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeaderPillButton, IcDocs, IcSupport } from "@whatap/design-system";

/**
 * Stories for [[HeaderPillButton]] — PageHeader 공용 알약형 버튼.
 *
 * Docs · 고객지원 등 48px 헤더 안의 pill 텍스트 버튼.
 */
const meta: Meta<typeof HeaderPillButton> = {
  title: "Primitives/HeaderPillButton",
  component: HeaderPillButton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof HeaderPillButton>;

/** Docs 버튼. */
export const Docs: Story = {
  args: { icon: <IcDocs />, children: "Docs" },
};

/** 고객지원 버튼. */
export const Support: Story = {
  args: { icon: <IcSupport />, children: "고객지원" },
};

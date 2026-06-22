import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarNewVersionButton } from "@whatap/design-system";

/**
 * Stories for [[OptionbarNewVersionButton]] — 옵션바 "신규 버전" CTA 버튼.
 */
const meta: Meta<typeof OptionbarNewVersionButton> = {
  title: "Primitives/OptionbarNewVersionButton",
  component: OptionbarNewVersionButton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof OptionbarNewVersionButton>;

/** 기본. */
export const Default: Story = {
  args: { href: "#", label: "신규 버전" },
};

/** 커스텀 라벨. */
export const CustomLabel: Story = {
  args: { href: "#", label: "New Dashboard" },
};

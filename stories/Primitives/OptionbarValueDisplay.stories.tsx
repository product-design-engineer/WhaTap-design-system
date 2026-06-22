import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarValueDisplay } from "@whatap/design-system";

/**
 * Stories for [[OptionbarValueDisplay]] — 옵션바 텍스트 전용 값 표시 (32px).
 */
const meta: Meta<typeof OptionbarValueDisplay> = {
  title: "Primitives/OptionbarValueDisplay",
  component: OptionbarValueDisplay,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof OptionbarValueDisplay>;

/** 기본. */
export const Default: Story = { args: { value: "ORA11K" } };

/** 긴 텍스트 — truncate + hover title. */
export const LongValue: Story = {
  args: { value: "oracle-rac-prod-cluster-01-very-long-name" },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

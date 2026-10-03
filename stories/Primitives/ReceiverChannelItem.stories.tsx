import type { Meta, StoryObj } from "@storybook/react-vite";
import ReceiverChannelItem from "../../src/widget/ReceiverChannelItem";

const meta: Meta<typeof ReceiverChannelItem> = {
  title: "Primitives/ReceiverChannelItem",
  component: ReceiverChannelItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**채널 행 (part)** — [[AiReceiverChannels]] 의 단일 `<li>`. 이모지 아이콘 + 라벨(+유료 배지) + 보조 정보 + 토글 핀(mock).",
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="flex flex-col" style={{ width: 360 }}>
        <Story />
      </ul>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ReceiverChannelItem>;

export const On: Story = {
  args: {
    channelKey: "email",
    icon: "✉️",
    label: "이메일",
    detail: "kyungho.oh@whatap.io",
    enabled: true,
    onToggle: () => {},
  },
};

export const Off: Story = {
  args: {
    channelKey: "sms",
    icon: "💬",
    label: "SMS",
    paid: true,
    enabled: false,
    onToggle: () => {},
  },
};

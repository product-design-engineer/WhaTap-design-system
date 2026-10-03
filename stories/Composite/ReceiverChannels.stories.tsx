import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiReceiverChannels } from "@whatap/design-system/widget";
import type { ChannelState } from "@whatap/design-system/widget";

const meta: Meta<typeof AiReceiverChannels> = {
  title: "Composite/ReceiverChannels",
  component: AiReceiverChannels,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**알림 수신 채널 카드** — email/sms/whatsapp/mobile 4채널 enable 토글. paid 채널 표시.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiReceiverChannels>;

const SAMPLE: ChannelState[] = [
  { key: "email", label: "이메일", detail: "kyungho.oh@whatap.io", enabled: true },
  { key: "mobile", label: "모바일 푸시", detail: "Wha-tap Kim (iOS)", enabled: true },
  { key: "sms", label: "SMS", detail: "010-****-1234", enabled: false, paid: true },
  { key: "whatsapp", label: "WhatsApp", detail: "+82 10 ****-1234", enabled: false, paid: true },
];

export const ReadOnly: Story = { args: { channels: SAMPLE } };

export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [channels, setChannels] = useState(SAMPLE);
      return (
        <AiReceiverChannels
          channels={channels}
          onToggle={(key, next) => setChannels((arr) => arr.map((c) => c.key === key ? { ...c, enabled: next } : c))}
        />
      );
    };
    return <Demo />;
  },
};

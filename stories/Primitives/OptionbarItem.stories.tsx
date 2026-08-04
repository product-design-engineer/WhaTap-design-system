import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarItem, OptionbarValueDisplay, LiveTimerCompact } from "@whatap/design-system";

/**
 * Stories for [[OptionbarItem]] — OptionbarPage 의 단일 옵션 항목 래퍼.
 */
const meta: Meta<typeof OptionbarItem> = {
  title: "Primitives/OptionbarItem",
  component: OptionbarItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof OptionbarItem>;

/** 타이틀 + 콘텐츠. */
export const Default: Story = {
  args: { title: "데이터베이스", children: <OptionbarValueDisplay value="ORA11K" /> },
};

/** 타이틀 없음 — 콘텐츠만. */
export const NoTitle: Story = {
  args: { title: "", children: <OptionbarValueDisplay value="N/A" /> },
};

/** `layout="stack"` — 타이틀 위 / 콘텐츠 아래 세로 스택(기본 아님). */
export const StackLayout: Story = {
  args: {
    title: "데이터베이스",
    layout: "stack",
    children: <OptionbarValueDisplay value="ORA11K" />,
  },
};

/** inline(기본) vs stack 비교. */
export const InlineVsStack: Story = {
  render: () => (
    <div className="flex flex-col gap-24px">
      <OptionbarItem title="시간">
        <LiveTimerCompact durationLabel="10분" />
      </OptionbarItem>
      <OptionbarItem title="시간" layout="stack">
        <LiveTimerCompact durationLabel="10분" />
      </OptionbarItem>
    </div>
  ),
};

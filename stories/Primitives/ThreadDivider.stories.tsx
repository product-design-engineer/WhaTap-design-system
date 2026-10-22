import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThreadDivider, UserBubble } from "@whatap/design-system/widget";

const meta: Meta<typeof ThreadDivider> = {
  title: "Primitives/ThreadDivider",
  component: ThreadDivider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**대화 스레드 경계선.** 양옆 1px `--color-border-default` 선 사이에 `text-base` · `text-tertiary` 글자. 대화 도중 재원 · 대상 같은 조건이 바뀐 자리에 한 줄 남긴다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ThreadDivider>;

export const Default: Story = { args: { children: "여기부터 SRE 플랜" } };
export const LineOnly: Story = { args: {} };

/** 스레드 안에서 — 바뀐 순간의 위치(앞 답 다음)에 선다. */
export const InThread: Story = {
  render: () => (
    <div className="flex flex-col gap-16px">
      <UserBubble>평균 응답시간이 튄 구간을 분석해줘.</UserBubble>
      <ThreadDivider>여기부터 SRE 플랜</ThreadDivider>
      <UserBubble>에러율은?</UserBubble>
    </div>
  ),
};

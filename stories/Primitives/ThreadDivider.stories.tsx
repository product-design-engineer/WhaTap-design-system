import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { ThreadDivider, UserBubble } from "@whatap/design-system/widget";

/**
 * Stories for [[ThreadDivider]] — AI 대화 스레드 안에서 «여기부터 조건이 바뀌었다» 를 가르는 가운데 글자 구분선.
 */
const meta: Meta<typeof ThreadDivider> = {
  title: "Primitives/ThreadDivider",
  component: ThreadDivider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**대화 스레드의 조건 경계 한 줄.** 양옆 1px 선 사이에 짧은 글자(「여기부터 SRE 플랜」). " +
          "토스트처럼 사라지지 않아 나중에 스레드를 훑을 때도 답이 된다. 답 하나의 끝맺음 선은 [[MessageActions]] 의 `divider`.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ThreadDivider>;

/** 기본 — 글자가 접근성 이름(separator)이 된다. */
export const Default: Story = {
  args: { children: "여기부터 SRE 플랜" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toHaveAttribute("aria-label", "여기부터 SRE 플랜");
  },
};

/** 글자 없음 — 선만 선다. 이때는 `label` 로 스크린리더 문장을 준다. */
export const LineOnly: Story = {
  args: { label: "세션 경계" },
};

/** 스레드 맥락 — 조건을 바꾼 순간(마지막 답 다음)에 끼운다. 위젯 셸과 같은 카드 바탕 위. */
export const InThread: Story = {
  render: () => (
    <div className="flex flex-col gap-16px bg-card" style={{ padding: 16 }}>
      <UserBubble>이번 달 비용 알려줘</UserBubble>
      <ThreadDivider>여기부터 SRE 플랜</ThreadDivider>
      <UserBubble>같은 질문, SRE 플랜 기준으로</UserBubble>
    </div>
  ),
};

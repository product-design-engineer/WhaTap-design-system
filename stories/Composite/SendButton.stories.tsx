import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SendButton } from "@whatap/design-system/widget";

const meta: Meta<typeof SendButton> = {
  title: "Composite/SendButton",
  component: SendButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**AI 위젯 입력창 송신 버튼.** input 텍스트 유무에 따라 활성(파랑 채움) / 비활성(회색 보더) 자동 전환. " +
          "32px 원형 버튼 + 상승 화살표 아이콘. `showCursor` 옵션으로 시연용 손가락 ripple.",
      },
    },
  },
  argTypes: {
    active:     { control: "boolean" },
    showCursor: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof SendButton>;

/** 비활성 — 입력 비어있을 때 (회색 보더, 클릭 불가). */
export const Inactive: Story = { args: { active: false } };

/** 활성 — 입력 텍스트 있을 때 (파랑 채움). */
export const Active: Story = { args: { active: true } };

/** 중단 — AI 가 답을 만드는 중. 같은 자리가 중단 버튼이 된다(늘 누를 수 있다). [[AiProgress]] 와 함께. */
export const Stop: Story = { args: { mode: "stop" } };

/** 시연용 — 자동 클릭 ripple 표시. */
export const WithCursor: Story = { args: { active: true, showCursor: true } };

/** 실제 입력창 시뮬레이션 — 텍스트 입력하면 활성. */
export const InInputContext: Story = {
  render: () => {
    const Demo = () => {
      const [input, setInput] = useState("");
      const active = input.trim().length > 0;
      return (
        <div className="flex items-center gap-2 p-2 border border-var-color-border-default rounded-lg bg-card" style={{ width: 360 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="어떤 작업을 함께 할까요?"
            className="flex-1 text-md text-primary outline-none"
            style={{ fontFamily: "var(--font-family-korean)" }}
          />
          <SendButton
            active={active}
            onClick={() => {
              if (active) {
                alert(`Send: ${input}`);
                setInput("");
              }
            }}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

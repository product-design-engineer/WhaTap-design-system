import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AiAssistantButton } from "@whatap/design-system/widget";

const meta: Meta<typeof AiAssistantButton> = {
  title: "WhaTap AI/Buttons/AssistantButton",
  component: AiAssistantButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**AI 위젯 토글 (그라데이션 보더 버튼).** PageHeader 우측의 'WhaTap AI' 버튼을 컴포넌트화. " +
          "`.ai-assistant-btn` CSS class 의 정교한 gradient border 애니메이션 재사용. " +
          "`aiActive=true` 시 `.is-active` 강조 상태.",
      },
    },
  },
  argTypes: {
    aiActive: { control: "boolean" },
    children: { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof AiAssistantButton>;

/** 기본 — 위젯 닫힘 상태. */
export const Default: Story = { args: { aiActive: false } };

/** Active — 위젯 열림 상태 (보더 그라데이션 채움). */
export const Active: Story = { args: { aiActive: true } };

/** 인터랙티브 — 클릭 토글. */
export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState(false);
      return (
        <div className="flex flex-col gap-3 items-center">
          <AiAssistantButton aiActive={active} onClick={() => setActive((v) => !v)} />
          <span className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>
            상태: <strong className="text-primary">{active ? "위젯 열림 (active)" : "위젯 닫힘"}</strong>
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

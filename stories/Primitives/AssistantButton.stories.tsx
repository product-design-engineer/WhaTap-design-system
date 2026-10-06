import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AssistantButton } from "@whatap/design-system/widget";

const meta: Meta<typeof AssistantButton> = {
  title: "Primitives/AssistantButton",
  component: AssistantButton,
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
type Story = StoryObj<typeof AssistantButton>;

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
          <AssistantButton aiActive={active} onClick={() => setActive((v) => !v)} />
          <span className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>
            상태: <strong className="text-primary">{active ? "위젯 열림 (active)" : "위젯 닫힘"}</strong>
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * 사이즈 — `md`(32px, 기본) / `sm`(24px).
 * `sm` 은 40px 배너([[SummaryBanner]])·툴바처럼 높이가 제한된 표면에 놓일 때 사용한다.
 * 아이콘 14px · 라벨 12px 로 함께 줄어든다.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <AssistantButton size="md">심층 분석하기</AssistantButton>
      <AssistantButton size="sm">심층 분석하기</AssistantButton>
    </div>
  ),
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarInstanceSelector } from "@whatap/design-system";

/**
 * Stories for [[OptionbarInstanceSelector]] — 옵션바 인스턴스 셀렉터.
 */
const meta: Meta<typeof OptionbarInstanceSelector> = {
  title: "Primitives/OptionbarInstanceSelector",
  component: OptionbarInstanceSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**OptionbarPage 인스턴스 셀렉터.** 180px 폭 + 좌측 상태 dot (ok/warn/error/idle) + 인스턴스 라벨 + 우측 chevron. " +
          "라이브 SaaS-PG OptionbarPage 의 '인스턴스' 항목 마크업 그대로.",
      },
    },
  },
  argTypes: {
    title: { description: "상단 제목. 기본 '인스턴스'.", control: "text" },
    width: { description: "셀렉터 너비 (px). 기본 180.", control: { type: "number", min: 120, max: 320, step: 10 } },
    label: { description: "선택된 인스턴스 라벨.", control: "text" },
    status: {
      description: "상태 dot 색 — ok(녹색)/warn(노랑)/error(빨강)/idle(회색).",
      control: { type: "radio" },
      options: ["ok", "warn", "error", "idle"],
    },
    open: { description: "드롭다운 열림 상태 (시각 표시).", control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof OptionbarInstanceSelector>;

/** OK 상태 — 정상 동작 인스턴스. */
export const Ok: Story = { args: { label: "DMX-3-12-949", status: "ok" } };

/** Warning — 주의 필요. */
export const Warn: Story = { args: { label: "DMX-3-12-950", status: "warn" } };

/** Error — 비정상/장애. */
export const Error: Story = { args: { label: "DMX-3-12-951", status: "error" } };

/** Idle — 비활성. */
export const Idle: Story = { args: { label: "DMX-3-12-952", status: "idle" } };

/** 인터랙티브 — open 토글. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <OptionbarInstanceSelector
          label="DMX-3-12-949"
          status="ok"
          open={open}
          onToggle={() => setOpen((v) => !v)}
        />
      );
    };
    return <Demo />;
  },
};

/** `size="md"` — 32px(기본은 sm 24px). 세로 공간이 넉넉한 자리. */
export const SizeMedium: Story = {
  args: { title: "", size: "md", label: "DMX-3-12-949", status: "ok" },
};

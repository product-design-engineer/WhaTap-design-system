import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "@whatap/design-system";

/**
 * Stories for [[DatePicker]] — 연·월·일 세 칸 + 달력 버튼.
 */
const meta: Meta<typeof DatePicker> = {
  title: "Primitives/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**날짜 하나를 세 칸으로 나눠 받는다.** 크기·테두리·radius 는 [[TextField]] 와 같은 spec(sm 24 / md 28 / lg 32) — " +
          "옵션 패널에서 한 줄에 서기 때문이다. 자릿수 폭은 [[DateTimeBlock]] 과 같은 컴포넌트 토큰을 써서 " +
          "나란히 서도 어긋나지 않는다. 구분자는 `/` (날짜 전용) — 시각이 붙는 [[DateTimeBlock]] 의 `-` 와 눈으로 갈린다. " +
          "달력 버튼은 트리거만 제공하고 패널은 호출측이 그린다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

/** 기본 — 달력 버튼 포함. */
export const Default: Story = {
  render: () => {
    const [v, setV] = useState("2026-08-19");
    return <DatePicker value={v} onChange={setV} onCalendarClick={() => {}} />;
  },
};

/** 달력 없이 세 칸만. */
export const WithoutCalendar: Story = {
  render: () => {
    const [v, setV] = useState("2026-08-19");
    return <DatePicker value={v} onChange={setV} />;
  },
};

/** 세 사이즈 — TextField 와 같은 24 / 28 / 32px. */
export const Sizes: Story = {
  render: () => {
    const [v, setV] = useState("2026-08-19");
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <DatePicker size="sm" value={v} onChange={setV} onCalendarClick={() => {}} />
        <DatePicker size="md" value={v} onChange={setV} onCalendarClick={() => {}} />
        <DatePicker size="lg" value={v} onChange={setV} onCalendarClick={() => {}} />
      </div>
    );
  },
};

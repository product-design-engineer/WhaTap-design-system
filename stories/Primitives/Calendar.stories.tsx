import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "@whatap/design-system";

/**
 * Stories for [[Calendar]] — 한 달 날짜 판.
 */
const meta: Meta<typeof Calendar> = {
  title: "Primitives/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**달력 버튼을 눌렀을 때 뜨는 날짜 판.** 한 달을 7열 격자로 보여 주고 날짜 하나를 고르게 한다. " +
          "고를 수 없는 날(종료일 뒤의 시작일 · 최대 조회 기간 밖 · 보관 기간 밖)은 **미리 흐리게 막는다** — 고른 뒤에 오류를 띄우지 않는다. " +
          "이번 달이 아닌 칸은 비워 둔다. 고른 날은 brand 바탕 + 흰 글자, 오늘은 brand 1px 테두리. " +
          "키보드: ← → 하루 · ↑ ↓ 일주일 · Enter 고르기 · Esc 닫기. 띄우는 자리는 부르는 쪽([[TimeRangeSelector]] 등)이 정한다.",
      },
    },
  },
  argTypes: {
    value: { description: "고른 날 `YYYY-MM-DD`.", control: "text" },
    min: { description: "고를 수 있는 가장 이른 날(포함).", control: "text" },
    max: { description: "고를 수 있는 가장 늦은 날(포함).", control: "text" },
    today: { description: "오늘 — 스토리 고정용. 생략하면 실제 오늘.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Calendar>;

/** 기본 — 고른 날과 오늘. */
export const Default: Story = {
  args: { value: "2026-10-26", today: "2026-10-28" },
};

/** 시작 시각 달력 — 종료일(10/26) 뒤는 고를 수 없다. 최대 조회 기간 31일 밖(9/25 이전)도 막는다. */
export const StartLimits: Story = {
  name: "막힌 날 · 시작 시각 달력",
  args: { value: "2026-10-20", min: "2026-09-25", max: "2026-10-26", today: "2026-10-28" },
};

/** 직접 눌러 보기 — 고르면 아래에 값이 바뀐다. */
export const Interactive: Story = {
  render: () => {
    const [v, setV] = useState("2026-10-26");
    return (
      <div className="flex flex-col gap-8px items-start">
        <Calendar value={v} onSelect={setV} today="2026-10-28" max="2026-10-28" />
        <span className="text-sm text-secondary">고른 날: {v}</span>
      </div>
    );
  },
};

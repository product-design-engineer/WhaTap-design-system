import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, DateTimeBlock } from "@whatap/design-system";

/**
 * Stories for [[DateTimeBlock]] — TimeRangeSelector 의 단일 datetime 입력 블록.
 *
 * `YYYY-MM-DD HH:MM` — numeric 폰트 + tabular-nums 자릿수 정렬.
 */
const meta: Meta<typeof DateTimeBlock> = {
  title: "Primitives/DateTimeBlock",
  component: DateTimeBlock,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
  },
  decorators: [
    (Story) => (
      <div style={{ border: "1px solid var(--color-border-divider)", borderRadius: 4, padding: "6px 8px", background: "var(--color-card)", display: "inline-flex" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DateTimeBlock>;

/** 시작 — 기본. */
export const Start: Story = {
  args: {
    parts: { year: "2026", month: "06", day: "17", hour: "14", minute: "30" },
    side: "start",
  },
};

/** 종료. */
export const End: Story = {
  args: {
    parts: { year: "2026", month: "06", day: "17", hour: "14", minute: "40" },
    side: "end",
  },
};

/** 한 자리 — padding 자동 적용 검증. */
export const SingleDigit: Story = {
  args: {
    parts: { year: "2026", month: "1", day: "5", hour: "9", minute: "3" },
    side: "start",
  },
};

function PartsChangeDemo() {
  const [minute, setMinute] = useState(30);
  const p2 = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-8px">
      <DateTimeBlock parts={{ year: "2026", month: "06", day: "17", hour: "14", minute: p2(minute % 60) }} side="start" />
      <Button size="sm" variant="outline" tone="primary" onClick={() => setMinute((m) => m + 5)}>
        +5분
      </Button>
    </div>
  );
}

/**
 * 값이 바뀌면 표시도 바뀐다 — «+5분» 을 누르면 분 칸이 따라 바뀐다.
 * 전에는 처음 받은 값에 멈춰 있었다(이전 · 다음 이동, «최근 N분» 재검색 뒤에도 옛 시각이 남음).
 */
export const PartsChange: Story = {
  render: () => <PartsChangeDemo />,
};

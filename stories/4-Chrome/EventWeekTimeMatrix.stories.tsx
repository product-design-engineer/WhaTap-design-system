import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventWeekTimeMatrix } from "@whatap/design-system";

/**
 * Stories for [[EventWeekTimeMatrix]] — 요일×시간 알림 수신 매트릭스.
 */
const meta: Meta<typeof EventWeekTimeMatrix> = {
  title: "Chrome/EventWeekTimeMatrix",
  component: EventWeekTimeMatrix,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**7 요일 × 24 시간 알림 수신 매트릭스.** 셀 ON = `tokens.color.surface.info.value` 배경 + `indicator.info` 도트. " +
          "OFF = 회색 격자. 시간 헤더는 6시간 간격(0/6/12/18). 이벤트 수신 설정 페이지 (`/events/settings`) 의 핵심 컴포넌트. " +
          "onToggle 미지정 시 read-only 표시.",
      },
    },
  },
  argTypes: {
    weekdays: { description: "7 × 24 boolean 그리드. weekdays[day][hour].", control: false },
    onToggle: { description: "셀 토글 콜백. 미지정 시 read-only.", control: false },
    dayLabels: { description: "요일 라벨 (기본: 월/화/수/목/금/토/일).", control: "object" },
    caption: { description: "위쪽 안내 캡션.", control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof EventWeekTimeMatrix>;

// Helpers
const allOff = (): boolean[][] => Array.from({ length: 7 }, () => Array(24).fill(false));
const allOn = (): boolean[][] => Array.from({ length: 7 }, () => Array(24).fill(true));
const businessHours = (): boolean[][] => Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => d < 5 && h >= 9 && h < 18),
);
const eveningWeekend = (): boolean[][] => Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => (d >= 5) || (h >= 18 || h < 6)),
);

/** 업무시간 — 평일 09–18시 ON, 그 외 OFF. */
export const BusinessHours: Story = {
  args: { weekdays: businessHours(), caption: "업무시간 (월–금 09:00–18:00) 알림 수신" },
};

/** 야간·주말 — 야근 모니터링 패턴. */
export const EveningAndWeekend: Story = {
  args: { weekdays: eveningWeekend(), caption: "야간(18시 이후) · 주말 알림 수신" },
};

/** 모두 OFF — 알림 정지 상태. */
export const AllOff: Story = {
  args: { weekdays: allOff(), caption: "모든 시간대 알림 OFF" },
};

/** 모두 ON — 24/7 수신. */
export const AllOn: Story = {
  args: { weekdays: allOn(), caption: "24/7 수신" },
};

/** 인터랙티브 — 셀 클릭으로 토글. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [grid, setGrid] = useState(businessHours());
      const toggle = (d: number, h: number, next: boolean) => {
        setGrid((prev) => prev.map((row, ri) => ri === d ? row.map((v, hi) => hi === h ? next : v) : row));
      };
      const onCount = grid.flat().filter(Boolean).length;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <EventWeekTimeMatrix weekdays={grid} onToggle={toggle} caption="셀 클릭으로 토글" />
          <div style={{ fontSize: 12, color: "#4c4c4c" }}>
            현재 ON 셀: <strong>{onCount}</strong> / 168
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

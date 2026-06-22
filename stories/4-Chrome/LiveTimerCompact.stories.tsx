import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LiveTimerCompact } from "@whatap/design-system";

/**
 * Stories for [[LiveTimerCompact]] — 32px LIVE 시계 + polling progress 토글.
 */
const meta: Meta<typeof LiveTimerCompact> = {
  title: "Primitives/LiveTimerCompact",
  component: LiveTimerCompact,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**라이브 시계 + polling progress 토글 (32px 높이).** 좌측 pause/play 박스 + 우측 timer 박스. " +
          "박스 전체 영역을 좌→우로 채우는 fill 이 cycle 마다 0% 리셋되어 polling 펄스 시각화. " +
          "`/application/slider` 라이브 마크업 verbatim — chained 보더 + 폰트 Roboto.",
      },
    },
  },
  argTypes: {
    time: {
      description: "시계 표시 문자열. 미지정 시 시스템 시각 자동 갱신.",
      control: "text",
    },
    paused: {
      description: "true 면 시계 + progress 정지.",
      control: "boolean",
    },
    refreshIntervalMs: {
      description: "polling 한 cycle (ms). 기본 5000.",
      control: { type: "number", min: 1000, max: 30000, step: 1000 },
    },
    durationLabel: {
      description: "녹색 알약 태그 라벨 ('10분', '30분' 등). 캘린더 자리에 표시.",
      control: "text",
    },
    showCalendar: {
      description: "캘린더 아이콘 표시. 기본 durationLabel 없을 때 true.",
      control: "boolean",
    },
  },
};
export default meta;
type Story = StoryObj<typeof LiveTimerCompact>;

/** 기본 — 시스템 시각 자동, 캘린더 표시, 5s polling. */
export const Default: Story = {
  args: {},
};

/** 일시정지 상태 — 시계 + progress 멈춤. ▶ 재생 아이콘 노출. */
export const Paused: Story = {
  args: { paused: true },
};

/** durationLabel 표시 — 캘린더 자리에 녹색 알약 ('10분'). */
export const With10MinLabel: Story = {
  args: { durationLabel: "10분" },
};

/** 30분 라벨 + 캘린더 동시. */
export const With30MinAndCalendar: Story = {
  args: { durationLabel: "30분", showCalendar: true },
};

/** 시각 고정 — 시연 / 스크린샷용. */
export const FixedTime: Story = {
  args: { time: "12:01:35" },
};

/** 인터랙티브 — pause/play 토글 가능. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [paused, setPaused] = useState(false);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <LiveTimerCompact paused={paused} onTogglePause={() => setPaused((p) => !p)} />
          <span style={{ fontSize: 12, color: "#4c4c4c" }}>
            상태: <strong>{paused ? "일시정지" : "재생"}</strong> · 좌측 박스 클릭으로 토글
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

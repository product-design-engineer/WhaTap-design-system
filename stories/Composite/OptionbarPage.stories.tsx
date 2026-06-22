import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarPage } from "@whatap/design-system";

/**
 * Stories for [[OptionbarPage]] — 페이지 우측 옵션 패널 (composite).
 */
const meta: Meta<typeof OptionbarPage> = {
  title: "Composite/OptionbarPage",
  component: OptionbarPage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**페이지 우측 옵션 패널 — composite chrome.** LiveTimerCompact + OptionbarInstanceSelector + " +
          "DataBase select + 신규 버전 button + PresetSelect 를 vertical stack 으로 묶음. DB / Server / APM " +
          "모든 모니터링 페이지에서 동일하게 사용.",
      },
    },
  },
  argTypes: {
    liveTime: { description: "LIVE 시계 표시 문자열. 미지정 시 시스템 시각.", control: "text" },
    durationLabel: { description: "LiveTimer duration 알약 ('10분', '30분').", control: "text" },
    paused: { description: "LiveTimer 일시정지 상태.", control: "boolean" },
    instanceLabel: { description: "선택된 인스턴스 라벨.", control: "text" },
    instanceStatus: {
      description: "인스턴스 상태 dot.",
      control: { type: "radio" },
      options: ["ok", "warn", "error", "idle"],
    },
    databaseLabel: { description: "데이터베이스 라벨 (단순 텍스트).", control: "text" },
    newVersionLabel: { description: "신규 버전 버튼 라벨.", control: "text" },
    presetLabel: { description: "프리셋 라벨.", control: "text" },
  },
  decorators: [(Story) => (<div style={{ width: 280 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof OptionbarPage>;

/** 라이브 기본값 — DB 모니터링 페이지 옵션바. */
export const DbMonitoring: Story = {
  args: {
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    newVersionLabel: "신규 버전",
    presetLabel: "Default",
  },
};

/** Warning 상태 — 인스턴스 status warn. */
export const InstanceWarning: Story = {
  args: {
    durationLabel: "30분",
    instanceLabel: "DMX-3-12-950",
    instanceStatus: "warn",
    databaseLabel: "ORA11K",
    presetLabel: "운영 — 주간",
  },
};

/** 일시정지 + Error — 셀렉터 error 색. */
export const PausedError: Story = {
  args: {
    paused: true,
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-951",
    instanceStatus: "error",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
  },
};

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
          "**페이지 상단 옵션바 행 — composite chrome.** LiveTimerCompact + OptionbarInstanceSelector + " +
          "DataBase 값 + PresetSelect 를 한 행으로 묶음. DB / Server / APM 모든 모니터링 페이지에서 동일하게 사용.\n\n" +
          "**기본값:** `layout=\"inline\"`(타이틀이 값 좌측) + `size=\"sm\"`(컨트롤 24px). 행 컨테이너는 " +
          "`size` 와 무관하게 **40px 고정** — SubHeaderBar·사이드바 스위처와 같은 40px 라인.\n\n" +
          "✅ **Do** — 기본값 그대로 사용 · 행 단위로 `size` 를 하나만 지정(하위 4종에 일괄 전달) · 세로 공간이 " +
          "넉넉한 자리에서만 `size=\"md\"`(32px) 또는 `layout=\"stack\"`\n\n" +
          "❌ **Don't** — 컨트롤마다 다른 `size` 지정(baseline 어긋남) · 행 높이를 padding 으로 만들기 · " +
          "inline `<div>` 로 옵션바 재구현 · 값 칩에 상태 톤 주기(값 칩은 `neutral` 만)",
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
    presetLabel: { description: "프리셋 라벨.", control: "text" },
    layout: {
      description: "항목 배치 — inline(타이틀을 값 좌측, **기본**) / stack(타이틀 위·값 아래).",
      control: { type: "radio" },
      options: ["stack", "inline"],
    },
    size: {
      description: "행 전체 chrome 높이 — sm(24px, 기본) / md(32px). 모든 하위 컨트롤에 일괄 전달.",
      control: { type: "radio" },
      options: ["sm", "md"],
    },
  },
  decorators: [(Story) => (<div style={{ width: 1080 }}><Story /></div>)],
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

/**
 * `size="md"` — 컨트롤만 32px 로 올린 변형. 행 자체는 40px 고정이라 라인은 그대로 유지된다.
 * (기본은 `layout="inline"` + `size="sm"`.)
 */
export const SizeMedium: Story = {
  args: {
    size: "md",
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
  },
};

/** `layout="stack"` — 타이틀 위·값 아래 세로 스택. 세로 폭이 넉넉한 자리에서만. */
export const StackLayout: Story = {
  decorators: [(Story) => (<div style={{ width: 280 }}><Story /></div>)],
  args: {
    layout: "stack",
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    presetLabel: "Default",
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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarPage } from "@whatap/design-system";

/**
 * Example / 합성 위젯 — **OptionbarPage** (복수 컴포넌트 합성).
 *
 * 합성 구성: `LiveTimerCompact` + `OptionbarInstanceSelector` + DataBase select + 신규버전 `Button` + `PresetSelect`
 * 를 vertical stack 으로 묶은 Composite chrome. DB / Server / APM 모니터링 페이지 우측 옵션 패널 용.
 * (컴포넌트 자체 레퍼런스는 `Chrome/OptionbarPage`.)
 */
const meta: Meta<typeof OptionbarPage> = {
  title: "Example/합성 위젯/OptionbarPage",
  component: OptionbarPage,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "surface-muted" } },
  decorators: [(Story) => (<div style={{ width: 280 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof OptionbarPage>;

/** DB 모니터링 페이지 옵션바 — 5개 컴포넌트 합성. */
export const Composition: Story = {
  args: {
    durationLabel: "10분",
    instanceLabel: "DMX-3-12-949",
    instanceStatus: "ok",
    databaseLabel: "ORA11K",
    newVersionLabel: "신규 버전",
    presetLabel: "Default",
  },
};

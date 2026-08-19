import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionbarItem, OptionbarValueDisplay, LiveTimerCompact } from "@whatap/design-system";

/**
 * Stories for [[OptionbarItem]] — OptionbarPage 의 단일 옵션 항목 래퍼.
 */
const meta: Meta<typeof OptionbarItem> = {
  title: "Primitives/OptionbarItem",
  component: OptionbarItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof OptionbarItem>;

/** 타이틀 + 콘텐츠. */
export const Default: Story = {
  args: { title: "데이터베이스", children: <OptionbarValueDisplay value="ORA11K" /> },
};

/** 타이틀 없음 — 콘텐츠만. */
export const NoTitle: Story = {
  args: { title: "", children: <OptionbarValueDisplay value="N/A" /> },
};

/** `layout="stack"` — 타이틀 위 / 콘텐츠 아래 세로 스택(기본 아님). */
export const StackLayout: Story = {
  args: {
    title: "데이터베이스",
    layout: "stack",
    children: <OptionbarValueDisplay value="ORA11K" />,
  },
};

/** inline(기본) vs stack 비교. */
export const InlineVsStack: Story = {
  render: () => (
    <div className="flex flex-col gap-24px">
      <OptionbarItem title="시간">
        <LiveTimerCompact durationLabel="10분" />
      </OptionbarItem>
      <OptionbarItem title="시간" layout="stack">
        <LiveTimerCompact durationLabel="10분" />
      </OptionbarItem>
    </div>
  ),
};

/**
 * `layout="auto"` — **행 폭이 넉넉하면 라벨을 값 왼쪽에**, 좁아지면 위로 접는다.
 *
 * 판단 기준은 뷰포트가 아니라 **행이 실제로 쓸 수 있는 폭**(container query)이다. 아래 두 상자는
 * 같은 컴포넌트이고 폭만 다르다 — 위(1040px)는 인라인, 아래(640px)는 스택으로 접힌다.
 * 실제 화면에서는 AI 위젯(480px)이 열려 행이 좁아지는 순간 아래 모양이 된다.
 */
export const AutoLayout: Story = {
  render: () => (
    <div className="flex flex-col gap-24px">
      {[1040, 640].map((w) => (
        <div key={w} className="flex flex-col gap-6px">
          <span className="text-sm text-tertiary">행 폭 {w}px</span>
          <div
            className="wds-optionbar-row flex flex-row items-center gap-12px flex-wrap bg-card"
            style={{ width: w, padding: 8 }}
          >
            <OptionbarItem title="시작일" layout="auto">
              <OptionbarValueDisplay value="2026 / 08 / 19" />
            </OptionbarItem>
            <OptionbarItem title="인스턴스" layout="auto">
              <OptionbarValueDisplay value="dmx-rac19-1" />
            </OptionbarItem>
            <OptionbarItem title="시간" layout="auto">
              <LiveTimerCompact durationLabel="10분" />
            </OptionbarItem>
          </div>
        </div>
      ))}
    </div>
  ),
};

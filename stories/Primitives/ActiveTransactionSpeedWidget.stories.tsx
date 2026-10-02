import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActiveTransactionSpeedWidget } from "@whatap/design-system";

/**
 * Stories for [[ActiveTransactionSpeedWidget]] — 실시간 트래픽 흐름 패널.
 *
 * bullet 생성과 수치 변동에 난수·타이머가 쓰인다. 감사·스냅샷이 흔들리지 않도록
 * 정지 상태(`paused`)를 기본 스토리로 두고, 움직이는 상태는 별도 스토리로 둔다.
 */
const meta: Meta<typeof ActiveTransactionSpeedWidget> = {
  title: "Primitives/ActiveTransactionSpeedWidget",
  component: ActiveTransactionSpeedWidget,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    spawnRate: { control: { type: "number", min: 1, max: 40, step: 1 } },
  },
  decorators: [(Story) => (<div style={{ width: 560, height: 300 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof ActiveTransactionSpeedWidget>;

/** 정지 — 수치·막대 배치를 확인하는 기준 상태. */
export const Paused: Story = {
  args: { paused: true },
};

/** 실시간 — bullet 이 좌→우로 흐르고 RPS/TPS 가 변동한다. */
export const Live: Story = {
  args: { paused: false, onOpenDetail: () => {} },
};

/** compact — 좁은 카드(Flex 보드 등). */
export const Compact: Story = {
  decorators: [(Story) => (<div style={{ width: 360, height: 220 }}><Story /></div>)],
  args: { compact: true, paused: true, baseRps: 40, baseTps: 42 },
};

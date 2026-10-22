import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpeedStat } from "@whatap/design-system";

/**
 * Stories for [[SpeedStat]] — 실시간 처리량 수치 하나.
 */
const meta: Meta<typeof SpeedStat> = {
  title: "Primitives/SpeedStat",
  component: SpeedStat,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**작은 라벨 위에 큰 숫자, 폭 고정.** 자릿수가 바뀌어도 가운데 그림이 흔들리지 않는다. " +
          "[[ActiveTransactionSpeedWidget]] 의 왼쪽 RPS(`start`) · 오른쪽 TPS(`end`).",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SpeedStat>;

/** 왼쪽 — RPS. */
export const Start: Story = { args: { label: "RPS", value: 113 } };

/** 오른쪽 — TPS, 바깥쪽 끝 정렬. */
export const End: Story = { args: { label: "TPS", value: 116, align: "end" } };

/** 좁은 카드 — compact. */
export const Compact: Story = { args: { label: "RPS", value: 40, compact: true } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetricStat } from "@whatap/design-system";

/**
 * Stories for [[MetricStat]] — 차트 옆에 서는 수치 하나.
 */
const meta: Meta<typeof MetricStat> = {
  title: "Primitives/MetricStat",
  component: MetricStat,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**작은 라벨 위에 큰 숫자, 폭 고정.** 자릿수가 바뀌어도 옆 그림이 흔들리지 않는다. 필요하면 단위(`unit`)와 " +
          "보조 줄(`caption` — 누구의 값인지)을 단다. [[ActiveTransactionSpeedWidget]] 의 RPS · TPS, " +
          "[[ActiveTransactionArc]] 의 Max TX · Agent 가 이것을 쓴다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof MetricStat>;

/** 왼쪽 — RPS. */
export const Start: Story = { args: { label: "RPS", value: 113 } };

/** 오른쪽 — TPS, 바깥쪽 끝 정렬. */
export const End: Story = { args: { label: "TPS", value: 116, align: "end" } };

/** 좁은 카드 — compact. */
export const Compact: Story = { args: { label: "RPS", value: 40, compact: true } };

/** 단위 + 보조 줄 — Max TX 「30초」 와 그 트랜잭션 이름. */
export const WithUnitAndCaption: Story = {
  args: { label: "Max TX", value: 30, unit: "초", caption: "TC-1-57-8094" },
};

/** 담는 열이 폭을 정할 때 — `width="auto"`. 보조 줄이 길면 말줄임(전체는 title). */
export const AutoWidth: Story = {
  render: () => (
    <div className="flex flex-col" style={{ width: 120, gap: 12 }}>
      <MetricStat label="Max TX" value={42} unit="초" caption="api-gateway-prod-very-long-name-01" width="auto" />
      <div className="flex" style={{ gap: 16 }}>
        <MetricStat label="Agent 활성" value={12} width="auto" />
        <MetricStat label="Agent 비활성" value={3} width="auto" />
      </div>
    </div>
  ),
};

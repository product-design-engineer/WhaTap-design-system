import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventTimeCell } from "@whatap/design-system";

/**
 * Stories for [[EventTimeCell]] — 요일 × 시간 매트릭스의 칸 하나.
 */
const meta: Meta<typeof EventTimeCell> = {
  title: "Primitives/EventTimeCell",
  component: EventTimeCell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**켜짐 · 꺼짐을 칠과 테두리로 함께 말한다.** `onClick` 이 없으면 읽기 전용. `legend` 면 버튼이 아닌 12 × 10 범례 견본. " +
          "[[EventWeekTimeMatrix]] 가 168칸과 범례를 이것으로 그린다.",
      },
    },
  },
  decorators: [(Story) => (<div className="grid" style={{ width: 24 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof EventTimeCell>;

/** 켜짐 — 누를 수 있다. */
export const On: Story = { args: { on: true, label: "월 09시 수신", onClick: () => {} } };

/** 꺼짐 — 누를 수 있다. */
export const Off: Story = { args: { on: false, label: "월 03시 미수신", onClick: () => {} } };

/** 읽기 전용 — `onClick` 없음. */
export const ReadOnly: Story = { args: { on: true, label: "월 09시 수신" } };

/** 범례 견본 — 켜짐 · 꺼짐. */
export const Legend: Story = {
  decorators: [(Story) => (<div className="flex items-center gap-10px"><Story /></div>)],
  render: () => (
    <>
      <span className="flex items-center gap-4px"><EventTimeCell on legend /><span className="text-xs text-secondary">수신</span></span>
      <span className="flex items-center gap-4px"><EventTimeCell on={false} legend /><span className="text-xs text-secondary">미수신</span></span>
    </>
  ),
};

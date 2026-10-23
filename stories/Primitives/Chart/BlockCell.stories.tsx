import type { Meta, StoryObj } from "@storybook/react-vite";
import { BlockCell } from "@whatap/design-system";

/**
 * Stories for [[BlockCell]] — 이름이 들어간 상태 칸 하나.
 */
const meta: Meta<typeof BlockCell> = {
  title: "Primitives/Chart/BlockCell",
  component: BlockCell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**상태 칸.** [[BlockGrid]] 의 칸. 색 · 글자색은 [[HexGrid]] 와 같은 상태 어휘(active · idle · warning · critical). " +
          "이름은 한 줄 말줄임 · 전체 이름은 title. 입체 장식은 그리지 않는다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 120 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof BlockCell>;

/** 상태 넷. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-4px">
      <BlockCell label="web-01" tone="active" />
      <BlockCell label="web-02" tone="idle" />
      <BlockCell label="web-03" tone="warning" />
      <BlockCell label="web-04" tone="critical" />
    </div>
  ),
};

/** 긴 이름 — 말줄임, 전체 이름은 title. */
export const LongName: Story = { args: { label: "EC2AMAZ-7Q1K2B9-production-api", tone: "critical" } };

/** 고를 수 있는 칸 — 버튼 · 포커스 링. */
export const Selectable: Story = { args: { label: "db-primary", tone: "warning", onSelect: () => {} } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatCard } from "@whatap/design-system";

/**
 * Stories for [[StatCard]] — 대시보드 상단 요약 바의 작은 지표 카드.
 */
const meta: Meta<typeof StatCard> = {
  title: "Primitives/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    tone: { control: { type: "select" }, options: ["neutral", "success", "warning", "critical", "info"] },
    trend: { control: { type: "select" }, options: [undefined, "up", "down", "stable"] },
    delay: { control: { type: "number", min: 0, max: 2000, step: 100 } },
  },
  decorators: [(Story) => (<div style={{ width: 200 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof StatCard>;

/** 기본 — 단위가 붙은 총량. */
export const Default: Story = {
  args: { label: "Total GPU", value: "16", unit: "ea", tone: "neutral" },
};

/** 트렌드 — 상승/하강/안정. */
export const WithTrend: Story = {
  args: { label: "Active", value: "8", tone: "success", trend: "up" },
};

/** 요약 바 — 3~6개를 수평으로 나열하는 실제 배치. */
export const SummaryBar: Story = {
  decorators: [(Story) => (<div style={{ width: 720 }}><Story /></div>)],
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <StatCard label="Total GPU" value="16" unit="ea" />
      <StatCard label="Active" value="8" tone="success" trend="up" />
      <StatCard label="Idle" value="5" tone="warning" trend="stable" />
      <StatCard label="Error" value="3" tone="critical" trend="down" />
    </div>
  ),
};

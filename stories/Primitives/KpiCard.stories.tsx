import type { Meta, StoryObj } from "@storybook/react-vite";
import { KpiCard } from "@whatap/design-system";

/**
 * Stories for [[KpiCard]] — 핵심 지표를 큰 숫자로 강조하는 카드.
 */
const meta: Meta<typeof KpiCard> = {
  title: "Primitives/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
  },
  argTypes: {
    delay: { control: { type: "number", min: 0, max: 2000, step: 100 } },
  },
  decorators: [(Story) => (<div style={{ width: 220, height: 96 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof KpiCard>;

/** 기본 — 값 + 단위. */
export const Default: Story = {
  args: { title: "Total VRAM Memory", value: "293.13", unit: "GiB" },
};

/** 단위 없음. */
export const WithoutUnit: Story = {
  args: { title: "Active Pods", value: "128" },
};

/** KPI 줄 — 4개를 같은 높이로 나열. */
export const KpiRow: Story = {
  decorators: [(Story) => (<div style={{ width: 900, height: 96 }}><Story /></div>)],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, height: "100%" }}>
      <KpiCard title="Total VRAM Memory" value="293.13" unit="GiB" />
      <KpiCard title="Avg GPU Utilization" value="32.72" unit="%" />
      <KpiCard title="Avg Temperature" value="61" unit="°C" />
      <KpiCard title="Power Draw" value="4.8" unit="kW" />
    </div>
  ),
};

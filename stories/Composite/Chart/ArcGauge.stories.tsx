import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArcGauge, RangeGauge, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[ArcGauge]] — 범위 안 지금 값 하나. RangeGauge 와 같은 계약의 둥근 판.
 */
const meta: Meta<typeof ArcGauge> = {
  title: "Composite/Chart/ArcGauge",
  component: ArcGauge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**호 게이지.** [[ChartArc]] 를 조합하고 가운데 값 · 양 끝 글자만 그린다. [[RangeGauge]] 와 같은 계약 — 채움 색 = 값이 든 임계 구간, " +
          "임계는 바깥 띠, 숫자는 천 단위 쉼표, 양 끝은 이름 + 값.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArcGauge>;

const TH = [
  { from: 80, tone: "warning" as const },
  { from: 90, tone: "critical" as const },
];

/** 기본 — 임계 아래. */
export const Default: Story = { args: { label: "CPU", value: 72.5, max: 100, unit: "%", thresholds: TH } };

/** 경고 · 위험. */
export const Tones: Story = {
  render: () => (
    <div className="flex gap-24px">
      <ArcGauge label="CPU" value={72.5} max={100} unit="%" thresholds={TH} />
      <ArcGauge label="Memory" value={84} max={100} unit="%" thresholds={TH} />
      <ArcGauge label="Disk" value={96.2} max={100} unit="%" thresholds={TH} />
    </div>
  ),
};

/** 단위가 있는 범위 — Request 대비. 양 끝 이름을 범위의 뜻으로. */
export const NamedRange: Story = {
  args: { label: "CPU Request", value: 1100, max: 2200, unit: "mi", minLabel: "Min", maxLabel: "Allocatable", thresholds: [{ from: 1760, tone: "warning" }, { from: 2090, tone: "critical" }] },
};

/** 같은 계약 — 정사각 칸은 호, 좁고 긴 칸은 막대. */
export const SameContractAsRangeGauge: Story = {
  render: () => (
    <div className="flex gap-8px items-start">
      <div style={{ width: 200 }}>
        <WidgetFrame title="CPU (칸 1×1)">
          <div className="flex justify-center">
            <ArcGauge label="CPU" value={84} max={100} unit="%" thresholds={TH} />
          </div>
        </WidgetFrame>
      </div>
      <div style={{ width: 320 }}>
        <WidgetFrame title="CPU (좁고 긴 칸)">
          <RangeGauge label="CPU" value={84} max={100} unit="%" thresholds={TH} />
        </WidgetFrame>
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArcGauge, RangeGauge, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE } from "../../_extremes";

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

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 상한(100) 초과. */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}\n\n관찰: 150 / 100 은 호가 끝에서 멈추고 숫자만 150 을 말한다.` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0</ExtremeLabel>
      <ArcGauge label="CPU" value={0} max={100} unit="%" thresholds={TH} />
      <ExtremeLabel>상한 초과 — 150 / 100</ExtremeLabel>
      <ArcGauge label="CPU" value={150} max={100} unit="%" thresholds={TH} />
    </div>
  ),
};

/** 데이터 없음 — NaN. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}\n\n⚠️ 결함: \`value\` 가 필수 숫자라 없음을 NaN 으로 넣게 되고, 가운데 숫자에 «NaN» 이 그대로 나온다.` } } },
  args: { label: "CPU", value: Number.NaN, max: 100, unit: "%", thresholds: TH },
};

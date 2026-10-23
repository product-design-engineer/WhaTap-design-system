import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetricGrid, RangeGauge, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[MetricGrid]] — 같은 대상의 관련 집계 값 줄. 한 줄 4칸까지 · 넘으면 줄바꿈 · 칸은 세 겹까지.
 */
const meta: Meta<typeof MetricGrid> = {
  title: "Composite/Chart/MetricGrid",
  component: MetricGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**숫자 칸 줄.** 칸마다 [[MetricStat]] · 칸 사이 세로 구분선. 한 줄 최대 4칸, 넘으면 줄바꿈(가로 스크롤 금지). " +
          "칸은 이름 · 값 + 단위 · 보조 한 줄 세 겹까지 — 하위 분해는 [[SegmentBar]] · [[BarList]] 로 떼어 낸다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetricGrid>;

/** K8S pod 수 — 값 셋. 좁은 칸에서도 이름이 한 줄(말줄임 · title). */
export const PodCount: Story = {
  args: { items: [{ label: "Available Pods", value: 6 }, { label: "Desired Pods", value: 6 }, { label: "Unavailable Pods", value: 0 }] },
  render: (args) => (
    <div style={{ width: 280 }}>
      <MetricGrid {...args} />
    </div>
  ),
};

/** 전력 — 보조 줄로 기간을 말한다. */
export const Power: Story = {
  args: {
    items: [
      { label: "최근 1시간", value: "1.00", unit: "kWh" },
      { label: "오늘 누적", value: "3.27", unit: "kWh" },
      { label: "어제 동시각", value: "0.00", unit: "kWh", caption: "수집 없음" },
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <MetricGrid {...args} />
    </div>
  ),
};

/** 6칸 — 한 줄 4칸 다음 줄바꿈(가로 스크롤 금지). */
export const Wraps: Story = {
  args: {
    compact: true,
    items: ["Total", "Allocated", "Idle", "Active", "Effective", "MIG"].map((l, i) => ({ label: l, value: [20, 16, 9, 1, 6, 12][i], caption: i === 0 ? "8 Physical" : undefined })),
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <MetricGrid {...args} />
    </div>
  ),
};

/** 숫자 줄 + 범위 막대 — 화면이 조합한다(Composite 끼리 import 하지 않는다). */
export const WithRangeGauge: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <WidgetFrame title="K8S pod 수">
        <div className="flex flex-col gap-8px">
          <MetricGrid items={[{ label: "Available", value: 6 }, { label: "Desired", value: 6 }, { label: "Unavailable", value: 0 }]} />
          <RangeGauge label="Available / Desired" value={6} max={6} maxLabel="Desired" />
        </div>
      </WidgetFrame>
    </div>
  ),
};

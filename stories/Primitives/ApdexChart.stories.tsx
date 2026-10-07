import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApdexChart, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[ApdexChart]] — Apdex × 100 을 만족 구간 띠 위에 선과 값으로.
 */
const meta: Meta<typeof ApdexChart> = {
  title: "Primitives/ApdexChart",
  component: ApdexChart,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "surface-muted" } },
  decorators: [(Story) => (<div style={{ width: 360, height: 200 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof ApdexChart>;

const X = ["16:09", "16:10", "16:11", "16:12", "16:13", "16:14"];
const TREND = [78, 76, 74, 75, 72, 70, 69, 71, 73, 72, 71, 71.2];

/** 기본 — 지금 71.2(Poor). 띠 높이는 표준 경계(94 · 85 · 70)에서 계산한다. */
export const Default: Story = { args: { value: 71.2, values: TREND, xLabels: X } };

/** 좋은 상태 — Excellent 구간. */
export const Excellent: Story = { args: { value: 96.4, values: [95, 96, 97, 96, 95, 96, 97, 96.4], xLabels: X } };

/** 대시보드 칸 — `frame={false}` 로 [[WidgetFrame]] 에 담는다. 구간 이름이 띠 안에 있어 범례를 따로 두지 않는다. */
export const InWidgetFrame: Story = {
  decorators: [(Story) => (<div style={{ width: 360, height: 232 }}><Story /></div>)],
  render: () => (
    <WidgetFrame title="Apdex" meta="× 100 · 최근 5분" onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
      <ApdexChart frame={false} value={71.2} values={TREND} xLabels={X} />
    </WidgetFrame>
  ),
};

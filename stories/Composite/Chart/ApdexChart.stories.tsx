import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApdexChart, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE } from "../../_extremes";

/**
 * Stories for [[ApdexChart]] — Apdex × 100 을 만족 구간 띠 위에 선과 값으로.
 */
const meta: Meta<typeof ApdexChart> = {
  title: "Composite/Chart/ApdexChart",
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
    <WidgetFrame title="Apdex" summary="× 100" onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
      <ApdexChart frame={false} value={71.2} values={TREND} xLabels={X} />
    </WidgetFrame>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 상한(100) 초과. */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  decorators: [(Story) => (<div style={{ width: 360 }}><Story /></div>)],
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}\n\n관찰: 값축이 50~100 고정이라 0 점 추이는 플롯 아래로 빠져 선이 보이지 않는다(가운데 숫자만 0). 120 은 Apdex 정의(0~100) 밖인데 그대로 받아 숫자는 120, 선은 100 에서 잘린다 — 입력 검증 없음.` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0</ExtremeLabel>
      <div style={{ height: 180 }}><ApdexChart value={0} values={X.map(() => 0)} xLabels={X} /></div>
      <ExtremeLabel>상한 초과 — 120</ExtremeLabel>
      <div style={{ height: 180 }}><ApdexChart value={120} values={X.map((_, i) => (i === X.length - 1 ? 120 : 90))} xLabels={X} /></div>
    </div>
  ),
};

/** 데이터 없음 — 추이 빈 배열. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}\n\n관찰: \`value\` 는 필수 숫자라 «없음» 을 표현할 수 없다 — 0 을 넣으면 실제 0점과 구별되지 않는다.` } } },
  args: { value: 0, values: [], xLabels: [] },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { RangeGauge, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE } from "../../_extremes";

/**
 * Stories for [[RangeGauge]] — 범위(min ~ Max) 안의 지금 값. 채움 · ▼ · 이름 붙은 양 끝 · 임계 띠.
 */
const meta: Meta<typeof RangeGauge> = {
  title: "Composite/Chart/RangeGauge",
  component: RangeGauge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**막대 게이지.** 채움 [[UsageGauge]] · 지금 값 [[ChartPeakMarker]](▼) 를 조합하고 임계 띠 · 범위 글자를 그린다. " +
          "양 끝은 이름과 값을 함께(`Min 0mi` · `Allocatable 2,200mi`) — 라벨 없는 숫자 · 잘린 캡션이 라이브의 결함이었다(§21). " +
          "채움 색은 지금 값이 든 임계 구간이 정한다.",
      },
    },
  },
  argTypes: {
    value: { description: "지금 값." },
    min: { description: "범위 아래 끝. 기본 0." },
    max: { description: "범위 위 끝 — 할당 · 한계 · 정원." },
    unit: { description: "값 뒤 단위." },
    label: { description: "스크린리더 이름." },
    minLabel: { description: "왼쪽 끝 이름. 기본 Min." },
    maxLabel: { description: "오른쪽 끝 이름. 기본 Max." },
    thresholds: { description: "임계 구간 `{ from, tone }[]` — 오름차순." },
    caption: { description: "막대 아래 설명(줄바꿈, 말줄임 없음)." },
  },
  decorators: [(Story) => <div style={{ width: 320, padding: "0 16px" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof RangeGauge>;

const TH = [
  { from: 1760, tone: "warning" as const },
  { from: 2090, tone: "critical" as const },
];

/** 기본 — 할당(Allocatable) 대비 Request. 임계 아래라 채움은 neutral. */
export const Default: Story = {
  args: { label: "CPU Request", value: 1100, max: 2200, unit: "mi", maxLabel: "Allocatable", thresholds: TH },
};

/** 경고 구간 — 채움 · ▼ 가 warning 으로. 띠가 «어디서부터» 를 따로 보인다. */
export const Warning: Story = {
  args: { label: "CPU Request", value: 1870, max: 2200, unit: "mi", maxLabel: "Allocatable", thresholds: TH },
};

/** 위험 구간. */
export const Critical: Story = {
  args: { label: "CPU Request", value: 2150, max: 2200, unit: "mi", maxLabel: "Allocatable", thresholds: TH },
};

/** 범위 밖 — 막대 · ▼ 는 끝에 멈추고 글자만 실제 값. */
export const OverRange: Story = {
  args: { label: "메모리 사용", value: 4600, max: 4096, unit: "MiB", maxLabel: "Limit", thresholds: [{ from: 3277, tone: "warning" }, { from: 3891, tone: "critical" }] },
};

/** 비율(%) · 캡션 — 캡션은 말줄임하지 않고 줄바꿈한다. */
export const PercentWithCaption: Story = {
  args: {
    label: "디스크 사용률",
    value: 72.5,
    max: 100,
    unit: "%",
    thresholds: [{ from: 80, tone: "warning" }, { from: 90, tone: "critical" }],
    caption: "/data 볼륨 · 경고 80% · 위험 90% — 기준은 프로젝트 경보 설정을 따른다",
  },
};

/** 대시보드 칸 — 큰 숫자 아래 막대(2.1 숫자 + 2.2 막대 게이지 조합). */
export const InWidgetFrame: Story = {
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  render: () => (
    <WidgetFrame title="K8S Request CPU">
      <div className="flex flex-col gap-8px">
        <div className="flex items-baseline gap-4px">
          <span className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-family-numeric)" }}>1,100</span>
          <span className="text-sm text-tertiary">mi</span>
        </div>
        <RangeGauge label="CPU Request" value={1100} max={2200} unit="mi" maxLabel="Allocatable" thresholds={TH} />
      </div>
    </WidgetFrame>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 상한 초과. */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}\n\n관찰: 상한을 넘으면 막대는 끝에서 멈추고 값 글자가 넘침을 말한다.` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0</ExtremeLabel>
      <RangeGauge label="CPU Request" value={0} max={2200} unit="mi" maxLabel="Allocatable" thresholds={TH} />
      <ExtremeLabel>상한 초과 — 3300 / 2200</ExtremeLabel>
      <RangeGauge label="CPU Request" value={3300} max={2200} unit="mi" maxLabel="Allocatable" thresholds={TH} />
    </div>
  ),
};

/** 데이터 없음 — NaN. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}\n\n⚠️ 결함: \`value\` 에 undefined 가 오면 \`toLocaleString\` 에서 그리기가 멈춘다(여기서는 넣지 않음). NaN 은 «NaN» 글자로 나온다.` } } },
  args: { label: "CPU Request", value: Number.NaN, max: 2200, unit: "mi", maxLabel: "Allocatable", thresholds: TH },
};

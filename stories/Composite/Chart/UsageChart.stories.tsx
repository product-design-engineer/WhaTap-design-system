import type { Meta, StoryObj } from "@storybook/react-vite";
import { UsageChart } from "@whatap/design-system/widget";
import { EXTREME_NOTE, wave } from "../../_extremes";

const meta: Meta<typeof UsageChart> = {
  title: "Composite/Chart/UsageChart",
  component: UsageChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component: "**시간대별 사용률 막대 차트** — 24 또는 N개 시점의 utilization. `highlightThreshold` 이상 막대는 critical 색.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof UsageChart>;

export const HourlyGpu: Story = {
  args: {
    caption: "Hourly GPU Utilization",
    values: [12, 18, 15, 22, 35, 48, 62, 78, 85, 92, 95, 88, 76, 65, 58, 52, 48, 45, 38, 28, 22, 18, 15, 12],
    highlightThreshold: 80,
  },
};

export const FlatLow: Story = {
  args: {
    caption: "Idle 시간대 사용률",
    values: Array(24).fill(5).map((v, i) => v + (i % 4)),
    highlightThreshold: 50,
  },
};

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 100점 위 상한(100%) 초과. */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}\n\n⚠️ 결함: 100칸이면 막대 폭이 줄지 않아 약 70칸 뒤가 카드 밖으로 잘린다 — 70번째의 250% 막대도 보이지 않는다. 시간 라벨은 칸 수와 무관하게 «0–23시» 로 고정. 0 은 바닥 대시로만 남는다.` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0 — 24칸</ExtremeLabel>
      <UsageChart caption="Hourly GPU Utilization" values={Array.from({ length: 24 }, () => 0)} highlightThreshold={80} />
      <ExtremeLabel>100칸 + 상한 초과(250%)</ExtremeLabel>
      <UsageChart caption="GPU Utilization" values={wave(0, 100, 50, 30).map((v, i) => (i === 70 ? 250 : v))} highlightThreshold={80} />
    </div>
  ),
};

/** 데이터 없음 — 빈 배열 · 전부 null. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}\n\n⚠️ 결함: undefined 칸에 마우스를 올리면 그리기가 멈춘다(여기서는 null 만 넣음).` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>빈 배열</ExtremeLabel>
      <UsageChart caption="Hourly GPU Utilization" values={[]} highlightThreshold={80} />
      <ExtremeLabel>24칸 모두 null</ExtremeLabel>
      <UsageChart caption="Hourly GPU Utilization" values={Array.from({ length: 24 }, () => null)} highlightThreshold={80} />
    </div>
  ),
};

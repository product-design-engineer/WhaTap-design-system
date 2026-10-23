import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompoundEye, WidgetFrame } from "@whatap/design-system";
import type { CompoundEyeServer } from "@whatap/design-system";

/**
 * Stories for [[CompoundEye]] — 서버 여럿을 원 칸 격자로. 이상한 모양의 칸을 먼저 찾고 툴팁으로 읽는다.
 */
const meta: Meta<typeof CompoundEye> = {
  title: "Composite/Chart/CompoundEye",
  component: CompoundEye,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**컴파운드아이**(라이브 서버 › 컴파운드아이 보존). 칸 [[CompoundEyeCell]] · 범례 [[ChartLegendItem]] · 툴팁 [[ChartTooltip]] 조합. " +
          "링 스케일은 하나(`networkScale`)이고 범례가 말한다 — 안쪽 원 50% · 100% 로 부채꼴을 읽는다. 상태는 칸 바탕만.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CompoundEye>;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const r = rng(5);
const SERVERS: CompoundEyeServer[] = Array.from({ length: 18 }, (_, i) => {
  const attack = i === 7;
  const hot = i === 3 || i === 12;
  return {
    name: attack ? "python-demo-attack" : `${["web", "api", "db", "batch"][i % 4]}-${String(i + 1).padStart(2, "0")}`,
    cpu: Math.round(hot ? 86 + r() * 10 : 15 + r() * 50),
    memory: Math.round(30 + r() * 50),
    disk: Math.round(attack ? 97 : 10 + r() * 50),
    rx: attack ? 140e6 : r() * 60e6,
    tx: attack ? 95e6 : r() * 30e6,
    status: attack ? "critical" : hot ? "warning" : "normal",
  };
});

/** 서버 18대 — 위험 하나(디스크 · 네트워크), 경고 둘(CPU). */
export const Grid: Story = {
  args: { servers: SERVERS, networkScale: 100e6 },
  render: (args) => (
    <div style={{ width: 760 }}>
      <CompoundEye {...args} />
    </div>
  ),
};

/** 작은 칸 · 1Gbps 스케일 — 링이 거의 비어 보이면 스케일이 크다는 뜻. */
export const SmallCells: Story = {
  args: { servers: SERVERS, networkScale: 1e9, cellSize: 72 },
  render: (args) => (
    <div style={{ width: 560 }}>
      <CompoundEye {...args} />
    </div>
  ),
};

/** 대시보드 칸. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 640, height: 420 }}>
      <WidgetFrame title="컴파운드아이" summary="서버 18대">
        <CompoundEye servers={SERVERS} cellSize={80} />
      </WidgetFrame>
    </div>
  ),
};

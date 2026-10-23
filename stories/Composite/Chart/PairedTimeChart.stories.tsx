import type { Meta, StoryObj } from "@storybook/react-vite";
import { PairedTimeChart, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[PairedTimeChart]] — 단위가 다른 두 지표를 시간축을 공유하는 두 칸으로(이중 축 대신, §19).
 */
const meta: Meta<typeof PairedTimeChart> = {
  title: "Composite/Chart/PairedTimeChart",
  component: PairedTimeChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**시간축 공유 두 칸.** 이중 Y축 대신 위 · 아래 칸 — 칸마다 Y축 하나, 축 제목 대신 칸 이름, 단위는 눈금 접미사. " +
          "칸 x · 시점 고르기 · 시간 범위를 공유해 같은 순간이 세로 한 줄로 읽힌다. 미래 구간은 빈칸(`count`), 수집 없음(`null`)은 «모름» 칸 · 선 끊김.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PairedTimeChart>;

/* 24시간 · 15분 칸 96개 중 지금(15:00)까지 60칸만 값이 있다 */
const N = 96;
const NOW = 60;
const active = Array.from({ length: NOW }, (_, i) => (i === 33 ? null : Math.round(400 + 600 * Math.max(0, Math.sin((i - 20) / 9)) + (i % 7) * 30)));
const tps = Array.from({ length: NOW }, (_, i) => (i === 33 ? null : Math.round(120 + 140 * Math.max(0, Math.sin((i - 22) / 9)) + (i % 5) * 6)));
const LABELS = ["00:00", "06:00", "12:00", "18:00", "24:00"];
const POINTS = Array.from({ length: N }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`);

/** 액티브 스택 — 액티브 트랜잭션(막대) × TPS(선). 미래 구간은 빈칸, 08:15 수집 없음은 «모름» 칸 · 선 끊김. */
export const ActiveStack: Story = {
  args: {
    count: N,
    xLabels: LABELS,
    pointLabels: POINTS,
    top: { label: "Active Transaction", kind: "bar", values: active, unit: "건" },
    bottom: { label: "TPS", kind: "line", values: tps },
  },
  render: (args) => (
    <div style={{ width: 640, height: 300, border: "1px solid var(--color-border-default)", borderRadius: 4, padding: "8px 0" }}>
      <PairedTimeChart {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` 로 [[WidgetFrame]] 에. 두 지표가 한 칸이다(같은 시간을 보기 위해). */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 560, height: 320 }}>
      <WidgetFrame title="액티브 스택" summary="오늘 · 15분 칸" onFullscreen={() => {}}>
        <PairedTimeChart
          count={N}
          xLabels={LABELS}
          pointLabels={POINTS}
          top={{ label: "Active Transaction", kind: "bar", values: active, unit: "건" }}
          bottom={{ label: "TPS", kind: "line", values: tps }}
          frame={false}
        />
      </WidgetFrame>
    </div>
  ),
};

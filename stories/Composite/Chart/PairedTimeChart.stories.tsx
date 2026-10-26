import type { Meta, StoryObj } from "@storybook/react-vite";
import { PairedTimeChart, WidgetFrame } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, names, wave } from "../../_extremes";

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

/* ─── 극단 사례 ─────────────────────────────────── */

/* 두 칸이 고정이라 «개체 100개» 는 없다 — 에이전트 100대의 합계를 한 칸으로 보인다. */
const EX_SUM = Array.from({ length: N }, (_, t) => Math.round(names().reduce((a, _n, i) => a + (wave(i, N, 6, 3)[t] ?? 0), 0)));

/** 극단 · 100개 — 칸은 둘로 고정, 에이전트 100대의 합계. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 이 차트는 위 · 아래 두 칸 고정이라 개체 100개를 계열로 펼치지 않는다 — 100대의 합계 · 평균을 칸 하나로 보인다. 개체별 비교는 Heatmap 으로.` } } },
  render: () => (
    <div style={{ width: 640, height: 300, border: "1px solid var(--color-border-default)", borderRadius: 4, padding: "8px 0" }}>
      <PairedTimeChart
        count={N}
        xLabels={LABELS}
        pointLabels={POINTS}
        top={{ label: `Active Transaction 합계 (${EXTREME_N}대)`, kind: "bar", values: EX_SUM, unit: "건" }}
        bottom={{ label: `TPS 평균 (${EXTREME_N}대)`, kind: "line", values: EX_SUM.map((v) => Math.round(v / EXTREME_N * 10) / 10) }}
      />
    </div>
  ),
};

/** 극단 · 데이터 없음 — 두 칸 모두 값 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 두 칸 값이 모두 비면 시간 범위(\`count\`) 전체가 빈 미래 칸으로 그려진다.` } } },
  render: () => (
    <div style={{ width: 640, height: 300, border: "1px solid var(--color-border-default)", borderRadius: 4, padding: "8px 0" }}>
      <PairedTimeChart count={N} xLabels={LABELS} pointLabels={POINTS} top={{ label: "Active Transaction", kind: "bar", values: [], unit: "건" }} bottom={{ label: "TPS", kind: "line", values: [] }} />
    </div>
  ),
};

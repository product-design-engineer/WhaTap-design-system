import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heatmap, HeatmapLegend } from "@whatap/design-system";
import { EXTREME_N, EXTREME_NOTE, names, scalar } from "../../_extremes";

/**
 * Stories for [[Heatmap]] — 시간 격자 위 지표 강도.
 */
const meta: Meta<typeof Heatmap> = {
  title: "Composite/Chart/Heatmap",
  component: Heatmap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**한 컴포넌트가 두 축척을 진다.** `month` 는 7열 요일 × 주 행(한 칸 = 하루), " +
          "`day` 는 12열 5분 × 24행(한 칸 = 5분). 축척이 바뀌면 라벨과 칸의 뜻이 함께 바뀐다. " +
          "`cells` 는 **정규화된 0~1 또는 null** — 원 단위 변환은 축 최댓값을 아는 호출측이 한다. " +
          "범례는 포함하지 않는다: [[HeatmapLegend]] 를 같은 폭으로 바로 아래 둔다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Heatmap>;

const seeded = (n: number, f: (i: number) => number | null) =>
  Array.from({ length: n }, (_, i) => f(i));

/** 월 축척 — 한 칸 = 하루. 오늘 이후는 데이터 없음. */
export const Month: Story = {
  render: () => {
    const [sel, setSel] = useState<number | undefined>(18);
    const cells = seeded(31, (i) => (i + 1 > 19 ? null : i + 1 >= 14 ? 0.24 : 0.05 + (i % 5) * 0.06));
    return (
      <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <Heatmap
          mode="month"
          cells={cells}
          offset={6}
          labels={cells.map((_, i) => String(i + 1))}
          selectedIndex={sel}
          onSelect={setSel}
        />
        <HeatmapLegend />
      </div>
    );
  },
};

/** 일 축척 — 한 칸 = 5분. 아직 오지 않은 시각은 비워 둔다. */
export const Day: Story = {
  render: () => {
    const [sel, setSel] = useState<number | undefined>();
    const cells = seeded(24 * 12, (i) => (i > 118 ? null : 0.05 + ((i * 7) % 40) / 100));
    return (
      <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <Heatmap mode="day" cells={cells} selectedIndex={sel} onSelect={setSel} />
        <HeatmapLegend />
      </div>
    );
  },
};

/** 전부 데이터 없음 — 수집이 끊긴 구간은 색이 아니라 빈 표면으로 남는다. */
export const NoData: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Heatmap mode="month" cells={seeded(31, () => null)} offset={6} labels={Array.from({ length: 31 }, (_, i) => String(i + 1))} />
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────────── */

/**
 * 극단 · 100개 — 칸 100개(month 축척 = 100일).
 *
 * 이 컴포넌트는 «행 = 개체, 열 = 시간» 모델이 없다(month · day 시간 격자 둘뿐). patterns §22 가 100개 비교에
 * 권하는 행렬을 여기서는 만들 수 없어, 같은 축척에 칸 100개를 넣은 모습을 보여 준다.
 */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 개체 행 모델이 없어 month 축척에 칸 100개(100일)를 넣었다 — 주 행이 15줄로 늘어난다.` } } },
  render: () => {
    const cells = seeded(EXTREME_N, (i) => scalar(i, 1));
    return (
      <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <Heatmap mode="month" cells={cells} offset={0} labels={names(EXTREME_N, "d").map((_, i) => String(i + 1))} />
        <HeatmapLegend />
      </div>
    );
  },
};

/** 극단 · 데이터 없음 — `cells={[]}`(빈 배열). 모두 null 인 `NoData` 와 다르다. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 빈 배열이면 요일 머리만 남는다.` } } },
  render: () => (
    <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
      <Heatmap mode="month" cells={[]} />
      <HeatmapLegend />
    </div>
  ),
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heatmap, HeatmapLegend } from "@whatap/design-system";

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

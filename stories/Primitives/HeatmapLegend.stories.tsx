import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeatmapLegend } from "@whatap/design-system";

/**
 * Stories for [[HeatmapLegend]] — 히트맵 색을 값으로 되읽는 범례.
 */
const meta: Meta<typeof HeatmapLegend> = {
  title: "Primitives/Chart · HeatmapLegend",
  component: HeatmapLegend,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**순차 스케일 그라디언트 + 라벨 + 눈금.** `label` 은 색이 무엇인지(지표 + 집계)를 말한다 — " +
          "눈금만 있으면 「0~100% 인데 무엇의 0~100%인가」 가 화면 밖에 남는다. 막대 배경은 " +
          "`--gradient-heatmap-scale` 토큰 하나를 쓴다 — 범례가 stop 을 다시 나열하면 [[HeatmapCell]] 과 어긋난다. " +
          "[[Heatmap]] 바로 아래, 같은 폭으로 둔다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof HeatmapLegend>;

/** 기본 — 지표 라벨 + 0/25/50/75/100%. */
export const Default: Story = { args: { label: "[XOS] CPU · 평균" } };

/** 라벨 없음 — 색의 뜻을 화면 다른 곳이 이미 말하고 있을 때만. */
export const WithoutLabel: Story = { args: {} };

/** 눈금 축약 + 단위 교체. */
export const CustomTicks: Story = {
  args: { label: "응답 시간 · 최대", ticks: [0, 50, 100], unit: "ms" },
};

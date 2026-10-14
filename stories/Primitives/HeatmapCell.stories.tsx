import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeatmapCell } from "@whatap/design-system";

/**
 * Stories for [[HeatmapCell]] — 값 하나를 색 한 칸으로 접는 히트맵 셀.
 */
const meta: Meta<typeof HeatmapCell> = {
  title: "Primitives/Chart · HeatmapCell",
  component: HeatmapCell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**정규화 0~1 값 → 순차 스케일 색.** stop 토큰(`--color-heatmap-*`) 사이를 `color-mix` 로 보간한다. " +
          "`value === null` 은 0 이 아니라 **데이터 없음** — 색을 쓰지 않고 빈 표면으로 남긴다. " +
          "선택은 배경이 아니라 테두리로 표시한다(배경은 이미 값이 쓰고 있다).",
      },
    },
  },
  argTypes: {
    value: { description: "정규화 값 0~1. null 이면 데이터 없음.", control: { type: "range", min: 0, max: 1, step: 0.01 } },
    label: { description: "셀 안 좌하단 마이크로 라벨(일자 등).", control: "text" },
    height: { description: "셀 높이(px).", control: "number" },
  },
};
export default meta;
type Story = StoryObj<typeof HeatmapCell>;

/** 낮은 값 — 스케일 왼쪽 끝(파랑). */
export const Low: Story = { args: { value: 0.05, height: 49, label: "3" } };

/** 중간 값 — 초록·노랑 구간. */
export const Mid: Story = { args: { value: 0.5, height: 49, label: "12" } };

/** 높은 값 — 스케일 오른쪽 끝(붉은색). */
export const High: Story = { args: { value: 0.95, height: 49, label: "27" } };

/** 데이터 없음 — 0 과 구분해 빈 표면으로 둔다. */
export const NoData: Story = { args: { value: null, height: 49, label: "31" } };

/** 선택 — 테두리로만 표시. */
export const Selected: Story = { args: { value: 0.62, height: 49, label: "19", selected: true, onClick: () => {} } };

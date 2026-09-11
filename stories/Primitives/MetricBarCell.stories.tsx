import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetricBarCell } from "@whatap/design-system";

/**
 * Stories for [[MetricBarCell]] — 수치 + 비율 막대 표 셀.
 */
const meta: Meta<typeof MetricBarCell> = {
  title: "Primitives/MetricBarCell",
  component: MetricBarCell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**표 안 수치 옆에 같은 값의 막대.** 행 사이 크기 비교를 암산하지 않게 한다. " +
          "`segments` 로 구간을 나눠 담으면 합은 같고 구성이 다른 수치(대기 이벤트별 비중)도 한 칸에서 갈라 보인다. " +
          "값이 없으면 `-` 만 두고 막대를 그리지 않는다 — 빈 막대는 0 으로 읽힌다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof MetricBarCell>;

/** 단일 색 막대. */
export const Single: Story = {
  args: { value: "27.81", segments: [{ ratio: 1, color: "var(--color-status-warning)" }] },
};

/** 구성비 — 대기 이벤트별로 갈라 담는다. */
export const Stacked: Story = {
  args: {
    value: "25.46",
    segments: [
      { ratio: 0.55, color: "var(--color-chart-series-5)" },
      { ratio: 0.35, color: "var(--color-gray-soft)" },
    ],
  },
};

/** 값 없음. */
export const Empty: Story = { args: { value: null } };

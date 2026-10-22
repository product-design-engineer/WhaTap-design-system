import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartCategoryAxis, ChartGrid, ChartValueAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartCategoryAxis]] — 범주 막대 아래 X축 이름.
 */
const meta: Meta<typeof ChartCategoryAxis> = {
  title: "Primitives/Chart · ChartCategoryAxis",
  component: ChartCategoryAxis,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**칸을 똑같이 나눠 가운데에, 칸 폭에서 말줄임.** 전체 이름은 `title` 로 남는다. 시간축([[ChartTimeAxis]])과 달리 " +
          "양 끝을 안쪽으로 붙이지 않는다 — 이름은 그 막대 바로 아래에 서야 짝이 읽힌다. 막대 칸과 같은 `right` · `gap` 을 준다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="relative bg-card" style={{ width: 320, height: 120 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ChartCategoryAxis>;

/** 기본 — 단계 이름 넷. */
export const Default: Story = { args: { labels: ["Total", "Allocated", "Active", "Effective"] } };

/** 긴 이름 — 칸 폭에서 말줄임, 전체 이름은 title. */
export const LongNames: Story = {
  args: { labels: ["DMX-reporting-01", "dmx-reporting-02", "DMX-orders-primary", "DMX-replica-03", "dmx-reader"] },
};

/** 값축 · 격자와 한 플롯에 — 같은 `padBottom`(18)이라 이름이 바닥선 바로 아래에 선다. */
export const WithValueAxis: Story = {
  args: { labels: ["Total", "Allocated", "Active", "Effective"] },
  render: (args) => (
    <>
      <ChartGrid max={8} ticks={[0, 2, 5, 6, 8]} padTop={6} padBottom={18} />
      <ChartValueAxis max={8} ticks={[0, 2, 5, 6, 8]} padTop={6} padBottom={18} />
      <ChartCategoryAxis {...args} padBottom={18} />
    </>
  ),
};

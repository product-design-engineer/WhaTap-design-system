import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartGrid, ChartValueAxis } from "@whatap/design-system";

/**
 * Stories for [[ChartValueAxis]] — 플롯 축선과 Y축 눈금 글자.
 */
const meta: Meta<typeof ChartValueAxis> = {
  title: "Primitives/Chart · ChartValueAxis",
  component: ChartValueAxis,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**축선(X 바닥 · Y 세로) + 눈금 글자 셋.** 단위는 눈금 접미사(`unit`)가 맡고 축 제목은 그리지 않는다" +
          "(patterns §26 결정). 글자는 `text-chart` · 숫자 서체 · tertiary. 마크 **다음(위)** 에 그려 바닥선이 " +
          "막대에 묻히지 않게 하고, [[ChartGrid]] 와 같은 `max` · 여백을 준다.",
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
type Story = StoryObj<typeof ChartValueAxis>;

/** 기본 — 0 · 50% · 100%. */
export const Default: Story = { args: { max: 100, unit: "%" } };

/** 단위 없는 건수. */
export const WithoutUnit: Story = { args: { max: 40 } };

/** 1000 이상은 K 로 줄인다 — 2K · 1K · 0. */
export const Thousands: Story = { args: { max: 2000, unit: "ms" } };

/** 최대가 0 — 「0」 하나만. */
export const ZeroMax: Story = { args: { max: 0, unit: "%" } };

/** [[ChartGrid]] 와 짝 — 격자는 마크 아래, 축은 마크 위. */
export const WithGrid: Story = {
  args: { max: 100, unit: "%" },
  render: (args) => (
    <>
      <ChartGrid max={args.max} padTop={args.padTop} padBottom={args.padBottom} right={args.right} />
      <ChartValueAxis {...args} />
    </>
  ),
};

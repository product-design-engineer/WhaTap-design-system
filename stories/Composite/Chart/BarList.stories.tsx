import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarList, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[BarList]] — 값 · 이름 · 가로 막대 한 줄을 여러 줄.
 */
const meta: Meta<typeof BarList> = {
  title: "Composite/Chart/BarList",
  component: BarList,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "surface-muted" } },
  decorators: [(Story) => (<div style={{ width: 320, height: 200 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof BarList>;

/** 엔티티 고정 슬롯(patterns §21): method 1 · sql 3 · httpc 7 · dbc 2 · socket 5. 순서대로 1~5 를 칠하지 않는다. */
const ROWS = [
  { label: "Method", value: 210, ratio: 0.88, color: "var(--color-chart-series-1)" },
  { label: "SQL", value: 86, ratio: 0.67, color: "var(--color-chart-series-3)" },
  { label: "HTTPS", value: 205, ratio: 0.4, color: "var(--color-chart-series-7)" },
  { label: "DBC", value: 12, ratio: 0.37, color: "var(--color-chart-series-2)" },
  { label: "SOCKET", value: 1, ratio: 0.02, color: "var(--color-chart-series-5)" },
];

/** 기본 — 액티브 스테이터스 다섯 줄. */
export const Default: Story = { args: { rows: ROWS } };

/** 대시보드 칸 — `frame={false}` 로 [[WidgetFrame]] 에 담는다. 줄마다 색이 이름표라 범례를 따로 두지 않는다. */
export const InWidgetFrame: Story = {
  decorators: [(Story) => (<div style={{ width: 320, height: 232 }}><Story /></div>)],
  render: () => (
    <WidgetFrame title="액티브 스테이터스" onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
      <BarList frame={false} rows={ROWS} />
    </WidgetFrame>
  ),
};

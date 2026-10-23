import type { Meta, StoryObj } from "@storybook/react-vite";
import { GeoMap, WidgetFrame } from "@whatap/design-system";
import type { GeoMapDatum } from "@whatap/design-system";

/**
 * Stories for [[GeoMap]] — 국가별 값을 세계 지도 위에. 단계 구분(비율 · 평균) · 버블(개수 · 합계).
 */
const meta: Meta<typeof GeoMap> = {
  title: "Composite/Chart/GeoMap",
  component: GeoMap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**지도.** Natural Earth 110m 국가 경계(Equal Earth 투영) 내장. 값 없는 국가는 바탕 회색, 값은 순차 4단계 — 데이터가 하나도 없으면 «데이터 없음». " +
          "개수 · 합계는 `bubble`(원 넓이 = 값). 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] · 줌 [[TopologyZoomControl]] 을 조합한다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GeoMap>;

const ERROR_RATE: GeoMapDatum[] = [
  { code: "KR", value: 0.4 },
  { code: "JP", value: 0.9 },
  { code: "US", value: 1.6 },
  { code: "CN", value: 2.8 },
  { code: "DE", value: 0.7 },
  { code: "GB", value: 0.5 },
  { code: "FR", value: 1.1 },
  { code: "IN", value: 3.6 },
  { code: "BR", value: 2.2 },
  { code: "AU", value: 0.6 },
  { code: "VN", value: 1.9 },
  { code: "ID", value: 2.4 },
  { code: "CA", value: 0.8 },
  { code: "MX", value: 1.4 },
  { code: "SG", value: 0.3 },
];

const REQUESTS: GeoMapDatum[] = [
  { code: "KR", value: 182_400 },
  { code: "JP", value: 64_200 },
  { code: "US", value: 48_900 },
  { code: "VN", value: 21_300 },
  { code: "ID", value: 12_800 },
  { code: "DE", value: 6_400 },
  { code: "GB", value: 5_100 },
  { code: "BR", value: 3_900 },
  { code: "AU", value: 3_200 },
  { code: "IN", value: 9_700 },
  { code: "SG", value: 15_600 },
  { code: "HK", value: 8_300 },
];

/** 단계 구분 — 국가별 오류율(%). 국가 크기와 무관한 비율. 싱가포르는 110m 도형에 없어 «지도 밖» 줄로. */
export const Choropleth: Story = {
  args: { data: ERROR_RATE, label: "오류율", unit: "%" },
  render: (args) => (
    <div style={{ width: 720, height: 380 }}>
      <GeoMap {...args} />
    </div>
  ),
};

/** 버블 — 국가별 요청 수. 개수는 넓은 나라가 많아 보이지 않게 원 넓이로. */
export const Bubble: Story = {
  args: { data: REQUESTS, mode: "bubble", label: "요청 수", unit: "건" },
  render: (args) => (
    <div style={{ width: 720, height: 380 }}>
      <GeoMap {...args} />
    </div>
  ),
};

/** 빈 상태 — 데이터가 하나도 없으면 회색 지도만 남기지 않고 «데이터 없음». */
export const Empty: Story = {
  args: { data: [], label: "오류율", unit: "%" },
  render: (args) => (
    <div style={{ width: 720, height: 380 }}>
      <GeoMap {...args} />
    </div>
  ),
};

/** 대시보드 칸. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 560, height: 340 }}>
      <WidgetFrame title="국가별 오류율" summary="최근 1시간">
        <GeoMap data={ERROR_RATE} label="오류율" unit="%" />
      </WidgetFrame>
    </div>
  ),
};

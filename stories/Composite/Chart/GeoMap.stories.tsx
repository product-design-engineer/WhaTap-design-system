import { useState } from "react";
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
          "개수 · 합계는 `bubble`(원 넓이 = 값). 한국 · 일본은 눌러서 시·도로 들어간다(값은 같은 `data` 에 ISO 3166-2 코드로). 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] · 줌 [[TopologyZoomControl]] 을 조합한다.",
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

/* 시·도 값 — ISO 3166-2. 국가 값과 같은 배열에 둔다 */
const KR_LATENCY: GeoMapDatum[] = [
  { code: "KR-11", value: 182 },
  { code: "KR-26", value: 236 },
  { code: "KR-27", value: 214 },
  { code: "KR-28", value: 191 },
  { code: "KR-29", value: 248 },
  { code: "KR-30", value: 205 },
  { code: "KR-31", value: 229 },
  { code: "KR-41", value: 188 },
  { code: "KR-42", value: 312 },
  { code: "KR-43", value: 241 },
  { code: "KR-44", value: 226 },
  { code: "KR-45", value: 263 },
  { code: "KR-46", value: 287 },
  { code: "KR-47", value: 274 },
  { code: "KR-48", value: 251 },
  { code: "KR-49", value: 341 },
  { code: "KR-50", value: 199 },
];
/* 요청 수 — 시·도 합 = 국가 값 182,400 */
const KR_REQUESTS: GeoMapDatum[] = [
  { code: "KR-11", value: 61_200 },
  { code: "KR-41", value: 44_800 },
  { code: "KR-26", value: 13_900 },
  { code: "KR-28", value: 11_300 },
  { code: "KR-27", value: 9_100 },
  { code: "KR-48", value: 7_400 },
  { code: "KR-30", value: 5_800 },
  { code: "KR-47", value: 5_200 },
  { code: "KR-44", value: 4_700 },
  { code: "KR-29", value: 4_100 },
  { code: "KR-31", value: 3_600 },
  { code: "KR-43", value: 3_000 },
  { code: "KR-46", value: 2_600 },
  { code: "KR-45", value: 2_400 },
  { code: "KR-42", value: 1_500 },
  { code: "KR-50", value: 1_100 },
  { code: "KR-49", value: 700 },
];
const JP_LATENCY: GeoMapDatum[] = [
  { code: "JP-13", value: 96 },
  { code: "JP-27", value: 118 },
  { code: "JP-14", value: 104 },
  { code: "JP-23", value: 127 },
  { code: "JP-40", value: 142 },
  { code: "JP-01", value: 188 },
  { code: "JP-47", value: 231 },
  { code: "JP-26", value: 121 },
  { code: "JP-28", value: 119 },
  { code: "JP-11", value: 101 },
];
const COUNTRY_LATENCY: GeoMapDatum[] = [
  { code: "KR", value: 214 },
  { code: "JP", value: 118 },
  { code: "US", value: 342 },
  { code: "VN", value: 288 },
  { code: "DE", value: 401 },
  { code: "ID", value: 356 },
  { code: "AU", value: 379 },
  { code: "IN", value: 455 },
];

/**
 * 시·도로 들어가기 — 한국 · 일본을 누르면 그 나라 시·도. 왼쪽 위 «세계» 로 돌아온다.
 * 단계는 그 나라 시·도 값으로 다시 잡는다(세계 단계와 섞지 않는다). 일본은 10곳만 값이 있어 나머지는 «값 없음».
 */
export const Drill: Story = {
  args: { data: [...COUNTRY_LATENCY, ...KR_LATENCY, ...JP_LATENCY], label: "평균 응답시간", unit: "ms" },
  render: (args) => (
    <div style={{ width: 720, height: 420 }}>
      <GeoMap {...args} />
    </div>
  ),
};

/** 들어가 있는 모습 — `defaultDrill="KR"`. 경기도 버블 자리는 서울(구멍) 밖. */
export const DrilledKorea: Story = {
  args: { data: [...COUNTRY_LATENCY, ...KR_LATENCY], label: "평균 응답시간", unit: "ms", defaultDrill: "KR" },
  render: (args) => (
    <div style={{ width: 480, height: 520 }}>
      <GeoMap {...args} />
    </div>
  ),
};

/** 버블 시·도 — 개수는 들어가서도 원 넓이. */
export const DrilledKoreaBubble: Story = {
  args: {
    data: [{ code: "KR", value: 182_400 }, ...KR_REQUESTS],
    mode: "bubble",
    label: "요청 수",
    unit: "건",
    defaultDrill: "KR",
  },
  render: (args) => (
    <div style={{ width: 480, height: 520 }}>
      <GeoMap {...args} />
    </div>
  ),
};

/** 필요할 때 받기 — `onDrillChange` 에서 그 나라 시·도 값을 불러 `data` 에 더한다. 받기 전에는 «데이터 없음». */
export const DrillOnDemand: Story = {
  render: () => {
    const [regions, setRegions] = useState<GeoMapDatum[]>([]);
    return (
      <div style={{ width: 720, height: 420 }}>
        <GeoMap
          data={[...COUNTRY_LATENCY, ...regions]}
          label="평균 응답시간"
          unit="ms"
          onDrillChange={(code) => {
            setRegions([]);
            if (code) setTimeout(() => setRegions(code === "KR" ? KR_LATENCY : JP_LATENCY), 600);
          }}
        />
      </div>
    );
  },
};

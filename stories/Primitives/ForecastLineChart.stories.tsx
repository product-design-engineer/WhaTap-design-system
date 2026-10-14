import type { Meta, StoryObj } from "@storybook/react-vite";
import { ForecastLineChart, WidgetFrame } from "@whatap/design-system";
import type { ForecastLineChartSeries } from "@whatap/design-system";

/**
 * Stories for [[ForecastLineChart]]: 관측은 실선, 예측은 점선. 「지금」 세로선 · 임계 띠 · 도달 마커.
 */
const meta: Meta<typeof ForecastLineChart> = {
  title: "Primitives/ForecastLineChart",
  component: ForecastLineChart,
  tags: ["autodocs"],
  parameters: { layout: "padded", backgrounds: { default: "surface-muted" } },
  decorators: [(Story) => (<div className="bg-card" style={{ width: 480, height: 200 }}><Story /></div>)],
};
export default meta;
type Story = StoryObj<typeof ForecastLineChart>;

const WINDOW = 6;
const HORIZON = 24;
const X_DOMAIN: [number, number] = [-WINDOW, HORIZON];
const X_LABELS = [
  { x: -WINDOW, label: `-${WINDOW}h` },
  { x: 12, label: "+12h" },
  { x: HORIZON, label: `+${HORIZON}h` },
];

/**
 * 지금 값과 시간당 기울기로 한 계열을 만든다: 관측은 추세 구간 전부, 예측은 천장(100)이나 지평 끝까지.
 * 기울기가 0 이하면 예측선은 평탄하게 지평 끝까지 긋고 도달 마커는 없다.
 */
function mount(id: string, label: string, color: string, now: number, slope: number): ForecastLineChartSeries {
  const observed = [-WINDOW, -4, -2, 0].map((x) => ({ x, y: Math.max(0, now + slope * x + (x === 0 || x === -WINDOW ? 0 : (x % 4 ? 0.8 : -0.6))) }));
  const hours = slope > 0 ? (100 - now) / slope : null;
  const end = hours === null ? HORIZON : Math.min(hours, HORIZON);
  const forecast = [
    { x: 0, y: now },
    { x: end, y: hours === null ? now : Math.min(100, now + slope * end) },
  ];
  const reach = hours !== null && hours <= HORIZON ? { x: hours, y: 100, label: `약 ${Math.round(hours)}시간 후` } : undefined;
  return { id, label, color, observed, forecast, reach };
}

/** 계열색: 상태를 말하지 않는 소비 예측(쿼터 두 개). */
const QUOTA = [
  mount("logs", "로그 쿼터", "var(--color-chart-series-1)", 52, 1.6),
  mount("metrics", "지표 쿼터", "var(--color-chart-series-2)", 38, 0.9),
];

/** 상태색: 판정 대상만 색, 판정 밖(평탄)은 회색. */
const DISK = [
  mount("a", "ip-10-21-13-171 /data", "var(--color-status-error)", 78, 4.4),
  mount("b", "dev-dfs-yard-01 /var/log", "var(--color-status-warning)", 70, 1.5),
  mount("c", "dev-yard /backup", "var(--color-chart-neutral)", 85, 0),
];

/** 계열색 두 줄: 임계 없이 관측 · 예측 · 「지금」 만. */
export const Default: Story = {
  args: { series: QUOTA, xDomain: X_DOMAIN, xLabels: X_LABELS, unit: "%", ariaLabel: "쿼터 사용률 추세와 예측" },
};

/** 임계 90%: 점선 + 그 위 옅은 띠. 예측이 천장에 닿는 자리에 마커와 도달 시각. */
export const WithThreshold: Story = {
  args: { series: DISK, xDomain: X_DOMAIN, xLabels: X_LABELS, unit: "%", threshold: { value: 90, label: "임계 90%" }, ariaLabel: "마운트별 디스크 사용률 추세와 임계 도달 예상 시점" },
};

/** 배너 칩이 가리키는 계열만 진하게: 나머지는 흐리게. */
export const Highlighted: Story = {
  args: { ...WithThreshold.args, highlightId: "a" },
};

/**
 * 대조군: 사용률이 더 높아도(85%) 기울기가 0 이면 회색 `--color-chart-neutral`.
 * 같은 그림에 있어야 «사용률이 더 높은데 사건이 아닌» 판정이 납득된다.
 */
export const ControlGroup: Story = {
  args: {
    series: [
      mount("a", "ip-10-21-13-171 /data", "var(--color-status-error)", 78, 4.4),
      mount("c", "dev-yard /backup", "var(--color-chart-neutral)", 85, 0),
      mount("d", "dev-front /", "var(--color-chart-neutral)", 39, 0),
    ],
    xDomain: X_DOMAIN,
    xLabels: X_LABELS,
    unit: "%",
    threshold: { value: 90, label: "임계 90%" },
    ariaLabel: "마운트별 디스크 사용률 추세 — 기울기 0 대조군 포함",
  },
};

/** 대시보드 칸: `frame={false}` 로 [[WidgetFrame]] 에 담는다. 범례는 `legend`, 추세 구간 · 지평은 `summary`. */
export const InWidgetFrame: Story = {
  decorators: [(Story) => (<div style={{ width: 640, height: 240 }}><Story /></div>)],
  render: () => (
    <WidgetFrame
      title="디스크 고갈 추세"
      summary={`추세 ${WINDOW}시간 · 지평 ${HORIZON}시간`}
      legend={DISK.map((s) => ({ label: s.label, color: s.color }))}
      onFullscreen={() => {}}
      menu={[{ key: "detail", label: "상세로 이동" }]}
    >
      <ForecastLineChart
        frame={false}
        series={DISK}
        xDomain={X_DOMAIN}
        xLabels={X_LABELS}
        unit="%"
        threshold={{ value: 90, label: "임계 90%" }}
        ariaLabel="마운트별 디스크 사용률 추세와 고갈 예상 시점"
      />
    </WidgetFrame>
  ),
};

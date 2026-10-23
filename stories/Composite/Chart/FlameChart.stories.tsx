import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameChart, WidgetFrame } from "@whatap/design-system";
import type { FlameSpan } from "@whatap/design-system";

/**
 * Stories for [[FlameChart]] — 호출 · 요청 구간을 시간 위에 깊이별 계단으로. 색 = 상태. 시간축을 끌어 확대.
 */
const meta: Meta<typeof FlameChart> = {
  title: "Composite/Chart/FlameChart",
  component: FlameChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**Flame.** 레인(Visit · AJAX)마다 깊이 줄 · 색 = 상태(정상 · 느림 · 에러 · 정보 없음, BlockGrid 와 같은 색). " +
          "아래 시간축 줄을 끌면 그 구간만 펼친다 — 확대 중에는 «전체 보기». 폭 40px 미만 막대는 이름 없이 색만, 이름은 툴팁. " +
          "[[ChartSpanBar]] · [[ChartBrush]] · [[ChartTimeAxis]] · [[ChartLegendItem]] · [[ChartTooltip]] 조합.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FlameChart>;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const r = rng(11);
const PAGES = ["/", "/products", "/products/42", "/cart", "/checkout", "/orders"];
const API = ["GET /api/session", "GET /api/products", "GET /api/stock", "POST /api/cart", "GET /api/recommend", "POST /api/pay", "GET /api/orders"];

/* 세션 30초 — 방문 6개, 방문마다 AJAX 몇 개(깊이 0~2). 앞 2초에 몰린 짧은 호출들 */
const SESSION: FlameSpan[] = [];
let t = 0;
PAGES.forEach((p, i) => {
  const len = i === 0 ? 2000 : 2500 + r() * 6000;
  SESSION.push({ lane: "Visit", depth: 0, label: p, start: Math.round(t), end: Math.round(t + len), status: i === 4 ? "slow" : "normal" });
  let a = t + 40;
  const n = i === 0 ? 8 : 3 + Math.floor(r() * 3);
  for (let k = 0; k < n; k++) {
    const d = i === 0 ? 60 + r() * 180 : 200 + r() * 1400;
    const depth = k % 3;
    const label = API[(i + k) % API.length];
    const status = label === "POST /api/pay" ? "error" : d > 1200 ? "slow" : k === n - 1 && i === 2 ? "none" : "normal";
    SESSION.push({ lane: "AJAX", depth, label, start: Math.round(a), end: Math.round(a + d), status, detail: `${p} 에서 호출` });
    a += d * (depth === 2 ? 1.1 : 0.45);
  }
  t += len + 120;
});

/** 세션 타임라인 — 방문 › AJAX. 앞 2초의 짧은 호출은 축을 끌어 확대해 본다. */
export const Session: Story = {
  args: { spans: SESSION },
  render: (args) => (
    <div style={{ width: 760, height: 300 }}>
      <FlameChart {...args} />
    </div>
  ),
};

/** 한 레인 — 트랜잭션 › 메서드 · SQL · 외부 호출(깊이 4). */
export const Transaction: Story = {
  args: {
    spans: [
      { depth: 0, label: "POST /order/submit", start: 0, end: 1840 },
      { depth: 1, label: "OrderService.submit", start: 12, end: 1790 },
      { depth: 2, label: "StockRepository.reserve", start: 40, end: 420 },
      { depth: 3, label: "SELECT stock FOR UPDATE", start: 60, end: 390, status: "slow", detail: "jdbc:mysql://stock-db" },
      { depth: 2, label: "PaymentClient.charge", start: 440, end: 1620 },
      { depth: 3, label: "POST https://pg.example/charge", start: 460, end: 1600, status: "error", detail: "HTTP 502" },
      { depth: 2, label: "OrderRepository.save", start: 1630, end: 1760 },
      { depth: 3, label: "INSERT INTO orders", start: 1640, end: 1700 },
    ],
  },
  render: (args) => (
    <div style={{ width: 640, height: 180 }}>
      <FlameChart {...args} />
    </div>
  ),
};

/** 대시보드 칸. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 640, height: 320 }}>
      <WidgetFrame title="화면 전환 분석" summary="방문 6 · 30초">
        <FlameChart spans={SESSION} />
      </WidgetFrame>
    </div>
  ),
};

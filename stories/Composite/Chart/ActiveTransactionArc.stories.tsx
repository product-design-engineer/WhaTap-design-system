import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActiveTransactionArc, SPEED_LEGEND, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE, names, wave } from "../../_extremes";

/**
 * Stories for [[ActiveTransactionArc]] — APM 액티브 트랜잭션 Arc Equalizer.
 *
 * 동심 arc 세그먼트(normal/slow/very slow) + 회전 오버레이.
 * 3-column: Max TX / Arc / Agent.
 */
const meta: Meta<typeof ActiveTransactionArc> = {
  title: "Composite/Chart/ActiveTransactionArc",
  component: ActiveTransactionArc,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**APM 액티브 트랜잭션 Arc Equalizer.** " +
          "동심 arc 세그먼트(3-tone: normal/slow/very slow)와 12s 회전 오버레이. " +
          "좌측 Max TX + Elapsed 범례 / 중앙 Arc / 우측 Agent 통계 3-column 레이아웃.",
      },
    },
  },
  argTypes: {
    maxTx: { description: "Max Transaction 정보 (이름 + 값)." },
    agent: { description: "Agent 통계 (Active + Inactive 수)." },
  },
};

export default meta;
type Story = StoryObj<typeof ActiveTransactionArc>;

/** 기본 — APM 대시보드 기본값. */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 400, height: 240, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ActiveTransactionArc {...args} />
    </div>
  ),
};

/** 에이전트 n 개의 부하 — 데모용. 앞 `active` 개는 양이 있고 뒤 `inactive` 개는 빈 칸. */
const load = (active: number, inactive: number, base: number, slowRate: number, verySlowRate: number) => [
  ...Array.from({ length: active }, (_, i) => {
    const n = Math.round(base * (0.6 + ((i * 37) % 9) / 10));
    return { name: `agent-${String(i + 1).padStart(2, "0")}`, normal: n, slow: Math.round(n * slowRate), verySlow: Math.round(n * verySlowRate) };
  }),
  ...Array.from({ length: inactive }, (_, i) => ({ name: `agent-${String(active + i + 1).padStart(2, "0")}`, normal: 0, slow: 0, verySlow: 0 })),
];

/** 커스텀 값 — 에이전트 15개(활성 12 · 비활성 3), 고리가 데이터대로 그려진다. */
export const CustomValues: Story = {
  render: () => (
    <div style={{ width: 400, height: 240, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ActiveTransactionArc
        maxTx={{ name: "api-gateway-prod-01", value: 42 }}
        agent={{ active: 12, inactive: 3 }}
        agents={load(12, 3, 20, 0.15, 0.08)}
      />
    </div>
  ),
};

/** Flex 보드 그리드 (3열) — 같은 카드라도 데이터가 다르면 고리가 다르다(종전 정적 이미지는 셋이 같았다). */
export const InGrid: Story = {
  render: () => (
    <div className="grid gap-[8px]" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: 240 }}>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ActiveTransactionArc />
      </div>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ActiveTransactionArc maxTx={{ name: "order-svc", value: 18 }} agent={{ active: 5, inactive: 0 }} agents={load(5, 0, 12, 0.4, 0.3)} />
      </div>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ActiveTransactionArc maxTx={{ name: "batch-worker-03", value: 7 }} agent={{ active: 3, inactive: 2 }} agents={load(3, 2, 6, 0.05, 0)} />
      </div>
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` 로 자기 여백(8px)과 Elapsed 범례를 빼고 [[WidgetFrame]] 에 담는다. 범례는 `SPEED_LEGEND` 로 본문 오른쪽 위에. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 400, height: 240 }}>
      <WidgetFrame title="액티브 트랜잭션" legend={SPEED_LEGEND} onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <ActiveTransactionArc maxTx={{ name: "/api/order/checkout", value: 14 }} agent={{ active: 12, inactive: 0 }} agents={load(12, 0, 30, 0.12, 0.05)} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────────── */

/** 극단 · 100개 — 에이전트 100개. 고리 색은 속도 구간 3색이라 colorOf 를 쓰지 않는다. */
export const Extreme100: Story = {
  name: "극단 · 100개",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.many} 이 차트의 색은 속도 구간(normal · slow · very slow)이라 개체 색이 없다 — 에이전트 100칸이 3.6° 씩 얇아진다.` } } },
  args: {
    agent: { active: 100, inactive: 0 },
    agents: names().map((name, i) => {
      const n = Math.round(wave(i, 1, 20, 8)[0]);
      return { name, normal: n, slow: Math.round(n * 0.2), verySlow: Math.round(n * 0.05) };
    }),
  },
  render: (args) => (
    <div style={{ width: 400, height: 240, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ActiveTransactionArc {...args} />
    </div>
  ),
};

/** 극단 · 데이터 없음 — 에이전트 0개. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty} 고리 바탕과 Total 0 만 남는다. maxTx 를 주지 않으면 데모 값(30초 · TC-1-57-8094)이 그대로 남는다 — 빈 상태를 말할 방법이 없다(결함 후보).` } } },
  args: { agent: { active: 0, inactive: 0 }, agents: [], total: 0 },
  render: (args) => (
    <div style={{ width: 400, height: 240, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ActiveTransactionArc {...args} />
    </div>
  ),
};

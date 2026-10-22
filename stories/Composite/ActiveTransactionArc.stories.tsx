import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActiveTransactionArc, SPEED_LEGEND, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[ActiveTransactionArc]] — APM 액티브 트랜잭션 Arc Equalizer.
 *
 * 동심 arc 세그먼트(normal/slow/very slow) + 회전 오버레이.
 * 3-column: Max TX / Arc / Agent.
 */
const meta: Meta<typeof ActiveTransactionArc> = {
  title: "Composite/Chart · ActiveTransactionArc",
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

/** 커스텀 값. */
export const CustomValues: Story = {
  render: () => (
    <div style={{ width: 400, height: 240, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ActiveTransactionArc
        maxTx={{ name: "api-gateway-prod-01", value: 42 }}
        agent={{ active: 12, inactive: 3 }}
      />
    </div>
  ),
};

/** Flex 보드 그리드 (3열). */
export const InGrid: Story = {
  render: () => (
    <div className="grid gap-[8px]" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: 240 }}>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ActiveTransactionArc />
      </div>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ActiveTransactionArc maxTx={{ name: "order-svc", value: 18 }} agent={{ active: 5, inactive: 0 }} />
      </div>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ActiveTransactionArc maxTx={{ name: "batch-worker-03", value: 7 }} agent={{ active: 3, inactive: 2 }} />
      </div>
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` 로 자기 여백(8px)과 Elapsed 범례를 빼고 [[WidgetFrame]] 에 담는다. 범례는 `SPEED_LEGEND` 로 본문 오른쪽 위에. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 400, height: 240 }}>
      <WidgetFrame title="액티브 트랜잭션" legend={SPEED_LEGEND} onFullscreen={() => {}} menu={[{ key: "detail", label: "상세로 이동" }]}>
        <ActiveTransactionArc maxTx={{ name: "/api/order/checkout", value: 14 }} agent={{ active: 24, inactive: 0 }} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

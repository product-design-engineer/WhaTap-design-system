import type { Meta, StoryObj } from "@storybook/react-vite";
import { BlockGrid, HexGrid, WidgetFrame, blockGridLegend } from "@whatap/design-system";
import type { BlockGridItem } from "@whatap/design-system";

/**
 * Stories for [[BlockGrid]] — 이름 있는 상태 칸 격자. 이름으로 대상을 찾는 맵.
 */
const meta: Meta<typeof BlockGrid> = {
  title: "Composite/Chart/BlockGrid",
  component: BlockGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**블록 상태 맵.** [[BlockCell]] 격자 + 단독 범례 [[ChartLegendItem]]. 허니컴([[HexGrid]])과 용도로 나눈다 — 분포는 HexGrid, 이름으로 찾기는 BlockGrid. " +
          "상태 색 · 범례(개수 · 0 도 남김)는 둘이 같다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BlockGrid>;

const TONES = ["active", "active", "critical", "active", "warning", "active", "idle", "active", "active", "critical", "active", "active"] as const;
const SERVERS: BlockGridItem[] = TONES.map((tone, i) => ({ id: `s${i}`, label: i === 2 ? "EC2AMAZ-7Q1K2B9-prod" : `web-${String(i + 1).padStart(2, "0")}`, tone }));

/** 기본 — 4열 · 단독 범례(개수, 0 도 남김). */
export const Default: Story = {
  args: { items: SERVERS },
  render: (args) => (
    <div style={{ width: 480 }}>
      <BlockGrid {...args} />
    </div>
  ),
};

/** 고르기 — 칸을 눌러 상세로. 상태 이름은 화면 어휘로. */
export const SelectableKorean: Story = {
  args: { items: SERVERS, onSelect: () => {}, toneLabels: { active: "정상", idle: "비활성", warning: "경고", critical: "위험" } },
  render: (args) => (
    <div style={{ width: 480 }}>
      <BlockGrid {...args} />
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` + `blockGridLegend(items)` 를 [[WidgetFrame]] `legend` 로. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <WidgetFrame title="서버 인벤토리" legend={blockGridLegend(SERVERS)}>
        <BlockGrid items={SERVERS} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

/** 허니컴과 나란히 — 같은 상태 어휘 · 색 · 범례. 분포는 HexGrid, 이름으로 찾기는 BlockGrid. */
export const WithHexGrid: Story = {
  render: () => (
    <div className="grid gap-8px" style={{ gridTemplateColumns: "1fr 1fr", width: 800 }}>
      <WidgetFrame title="WAS Status (분포)" legend={blockGridLegend(SERVERS)}>
        <HexGrid items={SERVERS.map((s) => ({ id: s.id, tone: s.tone }))} frame={false} />
      </WidgetFrame>
      <WidgetFrame title="서버 인벤토리 (이름)" legend={blockGridLegend(SERVERS)}>
        <BlockGrid items={SERVERS} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

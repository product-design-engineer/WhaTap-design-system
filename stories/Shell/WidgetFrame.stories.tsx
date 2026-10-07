import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ActiveTransactionArc,
  Chip,
  DataTable,
  SCATTER_HEATMAP_DEMO_DOTS,
  ScatterHeatmap,
  WidgetFrame,
} from "@whatap/design-system";

/**
 * Stories for [[WidgetFrame]] — 대시보드 위젯 한 칸의 껍데기.
 */
const meta: Meta<typeof WidgetFrame> = {
  title: "Shell/WidgetFrame",
  component: WidgetFrame,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**대시보드 격자의 한 칸을 같은 모양으로.** 표면 · 테두리 · 반경 · 안쪽 여백 · 제목 줄을 이 껍데기가 정하고, " +
          "차트 · 표는 본문만 그린다. 높이는 부모(격자 행)가 정한다.\n\n" +
          "빈 상태 둘(`no-data` · `collect-gap`)도 이 껍데기가 맡는다. 둘 다 선을 0 으로 그리지 않는다. " +
          "0 으로 그린 선은 «조용하다» 로 읽혀 끊긴 수집을 정상으로 감춘다.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof WidgetFrame>;

const Cell = ({ children, width = 360 }: { children: React.ReactNode; width?: number }) => (
  <div style={{ width, height: 232 }}>{children}</div>
);

const EVENTS = [
  { at: "03:22", project: "코어", name: "DB 커넥션 풀 임계 초과", level: "critical" as const },
  { at: "03:41", project: "코어", name: "슬로우 쿼리 급증", level: "warning" as const },
  { at: "04:05", project: "알림", name: "발송 지연", level: "warning" as const },
];

/** 본문만 그리는 컴포넌트를 담는다 — 액티브 트랜잭션 아크. 아크가 가장자리를 가지므로 `bleed`. */
export const Default: Story = {
  render: () => (
    <Cell>
      <WidgetFrame title="액티브 트랜잭션" meta="APM 24" bleed>
        <ActiveTransactionArc maxTx={{ name: "/api/order/checkout", value: 14 }} agent={{ active: 24, inactive: 0 }} />
      </WidgetFrame>
    </Cell>
  ),
};

/** 같은 줄 — 높이는 격자 행이 정하고, 칸마다 여백 · 제목 굵기가 같다. */
export const Row: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 360px)", gap: 12, height: 232 }}>
      <WidgetFrame title="액티브 트랜잭션" meta="APM 24" bleed>
        <ActiveTransactionArc />
      </WidgetFrame>
      <WidgetFrame title="히트맵" meta="수행 시간(초)">
        <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} yLabels={[10, 8, 6, 4, 2, 0]} />
      </WidgetFrame>
    </div>
  ),
};

const MENU = [
  { key: "settings", label: "위젯 설정" },
  { key: "copy", label: "위젯 복사" },
  { key: "detail", label: "상세로 이동" },
];

/** 헤더 메뉴 — ⛶ 전체 화면 + ⋮ 더보기 둘로 고정. 범례는 본문 오른쪽 위 한 줄. 메뉴가 없는 칸과 본문 시작선이 같다. */
export const WithMenu: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 360px)", gap: 12, height: 232 }}>
      <WidgetFrame
        title="TPS"
        meta="최근 30분"
        onFullscreen={() => {}}
        menu={MENU}
        legend={[
          { label: "전체 APM", color: "var(--color-chart-series-1)" },
          { label: "결제", color: "var(--color-chart-series-2)" },
        ]}
      >
        <div
          className="flex flex-1 items-center justify-center text-base text-tertiary"
          style={{ border: "1px dashed var(--color-border-default)" }}
        >
          차트 본문
        </div>
      </WidgetFrame>
      <WidgetFrame title="히트맵" meta="수행 시간(초)">
        <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} yLabels={[10, 8, 6, 4, 2, 0]} />
      </WidgetFrame>
    </div>
  ),
};

/** 표 — 행 구분선이 카드 테두리에 닿도록 `bleed`. */
export const Table: Story = {
  render: () => (
    <Cell width={560}>
      <WidgetFrame title="미해소 이벤트" meta={`${EVENTS.length}건`} bleed>
        <DataTable
          density="default"
          rows={EVENTS}
          columns={[
            { key: "at", header: "발생", width: 72 },
            { key: "project", header: "프로젝트", width: 96 },
            { key: "name", header: "이벤트", flex: 1 },
            {
              key: "level",
              header: "수준",
              width: 72,
              render: (r) => (
                <Chip size="md" tone={r.level}>
                  {r.level === "critical" ? "위험" : "경고"}
                </Chip>
              ),
            },
          ]}
        />
      </WidgetFrame>
    </Cell>
  ),
};

/** 데이터 없음 — 대상은 살아 있고, 이 구간에 값이 없다. */
export const NoData: Story = {
  render: () => (
    <Cell>
      <WidgetFrame title="DB 액티브 세션" meta="최근 30분" state="no-data" />
    </Cell>
  ),
};

/** 수집 끊김 — «0» 이 아니라 «모름». 끊긴 범위를 둘째 줄에 적는다. */
export const CollectGap: Story = {
  render: () => (
    <Cell>
      <WidgetFrame title="서버 CPU" meta="최근 30분" state="collect-gap" stateDescription="서버 12대 · 32분째 끊김" />
    </Cell>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, MiniMultiLineChart, SparklineCell, WidgetFrame } from "@whatap/design-system";
import { EXTREME_NOTE } from "../../_extremes";

/**
 * Stories for [[SparklineCell]] — 표 셀 하나에 행 색 인덱스 · 지금 값 · 최근 추이.
 */
const meta: Meta<typeof SparklineCell> = {
  title: "Composite/Chart/SparklineCell",
  component: SparklineCell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**표 안 미니 차트.** [[Sparkline]] 을 조합하고 인덱스 바 · 값 글자 · 자리 맞춤만 그린다. " +
          "인덱스 색은 같은 칸 짝 차트의 계열 토큰일 때만 — 표와 차트를 잇는 장치다(§21). 값이 없는 행도 자리를 비워 열 정렬을 지킨다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SparklineCell>;

const wave = (seed: number, base: number, amp: number, n = 30) =>
  Array.from({ length: n }, (_, i) => Math.max(0, Math.round(base + amp * Math.sin((i + seed) / 3) + ((i * seed) % 7) - 3)));

/** 기본 — 값 + 단위 + 추이. */
export const Default: Story = { args: { value: 91, unit: "%", values: wave(2, 80, 10), max: 100 } };

/** 값 없음 — `-` 와 같은 폭의 빈 자리. */
export const Empty: Story = { args: { value: null, unit: "%" } };

type Row = { name: string; color?: string; cpu: number[] };
const SERVERS: Row[] = [
  { name: "api-gw-01", color: "var(--color-chart-series-1)", cpu: wave(1, 85, 8) },
  { name: "order-02", color: "var(--color-chart-series-2)", cpu: wave(4, 62, 12) },
  { name: "billing-01", color: "var(--color-chart-series-3)", cpu: wave(7, 40, 15) },
];
const LABELS = ["14:20", "14:30", "14:40", "14:50"];

/** 짝 차트와 잇기 — 위 선 차트의 계열 색이 표 행 인덱스 색이다. `max` 100 공유로 행끼리 높이가 같은 기준. 수집 없는 행은 `-` 와 빈 자리로 열 정렬을 지킨다. */
export const LinkedToChart: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <WidgetFrame title="CPU">
        <div className="flex flex-col gap-8px">
          <div style={{ height: 120 }}>
            <MiniMultiLineChart
              title="CPU"
              frame={false}
              xLabels={LABELS}
              unit="%"
              series={SERVERS.map((s) => ({ label: s.name, values: s.cpu, color: s.color! }))}
            />
          </div>
          <DataTable
            columns={[
              { key: "name", header: "name", flex: 1 },
              {
                key: "now",
                header: "now · 30분",
                width: 150,
                align: "right",
                render: (r: Row) => (
                  <SparklineCell
                    value={r.cpu.length ? r.cpu[r.cpu.length - 1] : null}
                    unit="%"
                    values={r.cpu}
                    max={100}
                    color={r.color}
                    indexColor={r.color}
                  />
                ),
              },
            ]}
            rows={[...SERVERS, { name: "search-01 (수집 없음)", cpu: [] }]}
          />
        </div>
      </WidgetFrame>
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 상한 초과. */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0</ExtremeLabel>
      <SparklineCell value={0} unit="%" values={Array.from({ length: 30 }, () => 0)} max={100} />
      <ExtremeLabel>상한 초과 — 180 / 100</ExtremeLabel>
      <SparklineCell value={180} unit="%" values={[...wave(2, 80, 10).slice(0, -1), 180]} max={100} />
    </div>
  ),
};

/** 데이터 없음 — null · 빈 추이. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}` } } },
  args: { value: null, unit: "%", values: [], max: 100 },
};

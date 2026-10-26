import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendTile } from "@whatap/design-system";
import { EXTREME_NOTE } from "../../_extremes";

/**
 * Stories for [[TrendTile]] — 지금 값 · 비교 시점 대비 변화 · 최근 추이. 변화 색은 지표의 좋은 방향이 정한다.
 */
const meta: Meta<typeof TrendTile> = {
  title: "Composite/Chart/TrendTile",
  component: TrendTile,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**추세 타일.** [[MetricStat]](지표명 · 값) + [[Sparkline]](추이) + 변화 줄. 변화 색 = `better`(좋은 방향) 대비 개선 · 악화 — " +
          "TPS 상승은 개선, 에러율 상승은 악화. ▲▼ · 부호 · 비교 기준 글자를 함께 쓴다(§23). `better=\"none\"` 이면 색을 끈다.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 220 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof TrendTile>;

const series = (seed: number, base: number, amp: number, trend: number) =>
  Array.from({ length: 24 }, (_, i) => Math.max(0, Math.round(base + amp * Math.sin((i + seed) / 3) + i * trend)));

/** 오르면 좋은 지표(TPS) — 상승 = 개선(초록). */
export const UpIsGood: Story = {
  args: { label: "TPS", value: "1,284", delta: 12.4, deltaUnit: "%", better: "up", compareLabel: "어제 같은 시각 대비", values: series(1, 1000, 80, 10) },
};

/** 내리면 좋은 지표(에러율) — 상승 = 악화(빨강). 같은 ▲ 라도 색이 다르다. */
export const DownIsGood: Story = {
  args: { label: "에러율", value: "0.42", unit: "%", delta: 0.08, deltaUnit: "%p", better: "down", compareLabel: "어제 같은 시각 대비", values: series(3, 30, 6, 0.6) },
};

/** 판정 없는 지표(파드 수) — 변화는 보이되 색을 끈다. */
export const NoVerdict: Story = {
  args: { label: "Pod", value: "48", delta: 6, better: "none", compareLabel: "1시간 전 대비", values: series(5, 40, 3, 0.3) },
};

/** 변화 없음. */
export const Flat: Story = { args: { label: "응답시간", value: "182", unit: "ms", delta: 0, deltaUnit: "ms", better: "down", values: series(2, 180, 4, 0) } };

/** 요약 줄 — 지표 넷을 나란히(대시보드 위쪽). */
export const Row: Story = {
  decorators: [(Story) => <div style={{ width: 920 }}><Story /></div>],
  render: () => (
    <div className="grid gap-8px" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      <TrendTile label="TPS" value="1,284" delta={12.4} deltaUnit="%" compareLabel="어제 같은 시각 대비" values={series(1, 1000, 80, 10)} />
      <TrendTile label="응답시간" value="182" unit="ms" delta={-24} deltaUnit="ms" better="down" compareLabel="어제 같은 시각 대비" values={series(2, 220, 10, -2)} />
      <TrendTile label="에러율" value="0.42" unit="%" delta={0.08} deltaUnit="%p" better="down" compareLabel="어제 같은 시각 대비" values={series(3, 30, 6, 0.6)} />
      <TrendTile label="활성 사용자" value="3,920" delta={-2.1} deltaUnit="%" compareLabel="지난주 같은 요일 대비" values={series(4, 4000, 120, -4)} />
    </div>
  ),
};

/* ─── 극단 사례 ─────────────────────────────────────── */
const ExtremeLabel = ({ children }: { children: string }) => <span className="text-sm text-tertiary">{children}</span>;

/** 0 과 큰 변화(+1000%). */
export const ExtremeBounds: Story = {
  name: "극단 · 0 과 상한 초과",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.bounds}\n\n관찰: TrendTile 은 상한이 없어 «상한 초과» 대신 폭증(+1,000%) 을 넣었다.` } } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExtremeLabel>값 0</ExtremeLabel>
      <TrendTile label="TPS" value={0} delta={0} deltaUnit="%" better="up" values={Array.from({ length: 24 }, () => 0)} />
      <ExtremeLabel>폭증 — +1,000%</ExtremeLabel>
      <TrendTile label="TPS" value="12,840" delta={1000} deltaUnit="%" better="up" values={Array.from({ length: 24 }, (_, i) => (i < 23 ? 1000 : 12840))} />
    </div>
  ),
};

/** 데이터 없음 — 추이 빈 배열 · delta NaN. */
export const ExtremeEmpty: Story = {
  name: "극단 · 데이터 없음",
  parameters: { docs: { description: { story: `${EXTREME_NOTE.empty}\n\n⚠️ 결함: \`delta\` 가 NaN 이면 «▼ NaN» 이 나오고 악화로 판정된다.` } } },
  args: { label: "TPS", value: "—", delta: Number.NaN, deltaUnit: "%", better: "up", values: [] },
};

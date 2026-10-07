import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScatterHeatmap, SCATTER_HEATMAP_DEMO_DOTS, WidgetFrame } from "@whatap/design-system";

/**
 * Stories for [[ScatterHeatmap]] — APM 트랜잭션 히트맵 (산점도).
 *
 * 시간(X) × 응답시간(Y) 평면에 dot 을 찍어 분포를 보여준다.
 * 3-tone: normal(blue) / warning(orange) / critical(red).
 */
const meta: Meta<typeof ScatterHeatmap> = {
  title: "Primitives/ScatterHeatmap",
  component: ScatterHeatmap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**APM 트랜잭션 히트맵 (산점도).** " +
          "시간(X축) × 응답시간(Y축) 평면에 609개 dot. " +
          "3-tone: normal / slow / very slow — `--color-chart-speed-*` 토큰(speed-bullet 아이콘과 같은 값). " +
          "Y축 라벨(0~100) · X축 시각 라벨 · 수평/수직 격자선 내장.",
      },
    },
  },
  argTypes: {
    dots: { description: "dot 배열 — [left%, top%, tone]." },
    xLabels: { description: "X축 시각 라벨 (기본 7개)." },
    yLabels: { description: "Y축 라벨 (기본 [100,80,60,40,20,0])." },
  },
};

export default meta;
type Story = StoryObj<typeof ScatterHeatmap>;

/** 기본 — APM 스냅샷 609 dots. */
export const Default: Story = {
  render: () => (
    <div style={{ width: 500, height: 280, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} />
    </div>
  ),
};

/** 커스텀 X축 라벨. */
export const CustomLabels: Story = {
  render: () => (
    <div style={{ width: 500, height: 280, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ScatterHeatmap
        dots={SCATTER_HEATMAP_DEMO_DOTS}
        xLabels={["21:44", "21:48", "21:52", "21:56", "22:00", "22:04", "22:08"]}
      />
    </div>
  ),
};

/** 빈 상태 (dots 없음). */
export const Empty: Story = {
  render: () => (
    <div style={{ width: 500, height: 280, border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
      <ScatterHeatmap dots={[]} />
    </div>
  ),
};

/** Flex 보드 그리드 (3열). */
export const InGrid: Story = {
  render: () => (
    <div className="grid gap-[8px]" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: 240 }}>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} />
      </div>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} xLabels={["09:00", "09:10", "09:20", "09:30", "09:40", "09:50", "10:00"]} />
      </div>
      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 4 }}>
        <ScatterHeatmap dots={[]} />
      </div>
    </div>
  ),
};

/** 대시보드 칸 — `frame={false}` 로 자기 좌우 여백을 빼고 [[WidgetFrame]] 에 담는다. 축 글자 `text-chart` · Y축 눈금 칸 `--wds-widget-axis-gutter` 라 선 그래프와 Y축 선이 같은 x 에 선다. */
export const InWidgetFrame: Story = {
  render: () => (
    <div style={{ width: 400, height: 240 }}>
      <WidgetFrame
        title="히트맵"
        meta="수행 시간(초)"
        legend={[
          { label: "Normal", color: "var(--color-chart-speed-normal)" },
          { label: "Slow", color: "var(--color-chart-speed-slow)" },
          { label: "Very Slow", color: "var(--color-chart-speed-very-slow)" },
        ]}
        onFullscreen={() => {}}
        menu={[{ key: "detail", label: "상세로 이동" }]}
      >
        <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} yLabels={[10, 8, 6, 4, 2, 0]} frame={false} />
      </WidgetFrame>
    </div>
  ),
};

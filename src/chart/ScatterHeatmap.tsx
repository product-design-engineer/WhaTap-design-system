/**
 * ScatterHeatmap — APM 히트맵 (트랜잭션 응답시간 산점도) 본문.
 *
 * ## Purpose
 * APM · Flex 보드 등에서 쓰는 트랜잭션 히트맵 시각화.
 * 시간(X축) × 응답시간(Y축) 평면에 dot 을 찍어 분포를 보여준다.
 * 3-tone: normal(blue) / warning(orange) / critical(red).
 *
 * ## When to use
 * - APM 대시보드 "히트맵" 위젯 본문.
 * - Flex 보드 위젯, 히어로 iframe 에셋 등 동일 시각화가 필요한 곳.
 *
 * ## When NOT to use
 * - 캘린더형 히트맵 (월/일 격자) → [[Heatmap]] + [[HeatmapCell]].
 * - 단순 바 차트 → inline 구현.
 *
 * ## Metrics
 * - ✅ 개별 트랜잭션의 응답시간 분포(시간 × 응답시간) — APM 히트맵, 판정 색 normal · slow · very slow
 * - ❌ 집계값(평균 응답시간 추이) → [[MiniLineChart]]
 * - ❌ 응답시간이 아닌 두 수치의 관계 → [[ScatterChart]]
 *
 * ## Colors
 * - 판정 등급 — 점 · 응답 속도 등급 셋 · `--color-chart-speed-normal` · `--color-chart-speed-slow` · `--color-chart-speed-very-slow`
 *
 * ## Composition rules
 * - 위젯 chrome 은 소비자가 감싼다.
 * - `dots` prop 으로 데이터를 외부에서 주입한다.
 * - 요소를 조합한다 — 격자 [[ChartGrid]](가로 10 간격 + 세로 22칸 `vertical`) · 값축 [[ChartValueAxis]](`ticks` = Y 글자) ·
 *   시간축 [[ChartTimeAxis]]. 차트는 점(마크)만 그린다(patterns §26). 그래서 Composite 계층이다.
 * - `h-full` 부모 안에서 채워진다.
 * - 축 · 격자가 다른 그래프와 같은 부품이라 한 줄에 놓인 선 · 막대 그래프와 Y축 선 · X축 선 · 글자가 같은 자리에 선다.
 * - `frame={false}` 면 바깥 좌우 여백(8px)을 뺀다. [[WidgetFrame]] 안에 넣을 때 쓴다 — 여백은 WidgetFrame 이 갖는다(patterns §15).
 *
 * @example
 * ```tsx
 * import { ScatterHeatmap, SCATTER_HEATMAP_DEMO_DOTS } from "@whatap/design-system";
 * <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} xLabels={["13:38","13:40","13:42","13:44","13:46","13:48","13:50"]} />
 * ```
 */
import ChartGrid from "./ChartGrid";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER } from "./_axisScale";

/** 각 dot: [left%, top%, tone]. tone 0=normal(blue), 1=warning(orange), 2=critical(red). */
export type ScatterDot = readonly [number, number, 0 | 1 | 2];

export type ScatterHeatmapProps = {
  /** dot 배열 — [left%, top%, tone]. */
  dots: ReadonlyArray<ScatterDot>;
  /** X축 시각 라벨 (기본 7개). */
  xLabels?: string[];
  /** Y축 라벨 (기본 [100,80,60,40,20,0]). */
  yLabels?: number[];
  /**
   * 자기 바깥 여백(좌우 8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

const DEFAULT_Y = [100, 80, 60, 40, 20, 0];
const PAD_TOP = 4;
const PAD_BOTTOM = 14;
const PAD_RIGHT = 8;
const DEFAULT_X = ["13:38", "13:40", "13:42", "13:44", "13:46", "13:48", "13:50"];
const TONE_COLOR = [
  "var(--color-chart-speed-normal)",
  "var(--color-chart-speed-slow)",
  "var(--color-chart-speed-very-slow)",
] as const;

export default function ScatterHeatmap({
  dots,
  xLabels = DEFAULT_X,
  yLabels = DEFAULT_Y,
  frame = true,
}: ScatterHeatmapProps) {
  const max = Math.max(0, ...yLabels);
  /* 가로 격자는 Y 글자 간격의 절반(10)마다 — 분포를 읽는 눈금이 글자보다 촘촘해야 한다. */
  const step = yLabels.length > 1 ? Math.abs(yLabels[0] - yLabels[1]) / 2 : max / 10;
  const gridTicks = step > 0 ? Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step) : [0];
  const plot = { left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM };
  return (
    <div className="flex h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0 }}>
      <div className="relative flex-1 min-w-0 min-h-0">
        <ChartGrid max={max} ticks={gridTicks} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} vertical={22} />
        {/* 점 — 이 차트의 마크. 좌표는 플롯 상자 안 % */}
        <div className="absolute pointer-events-none" style={plot}>
          {dots.map(([left, top, tone], i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%`, width: 5, height: 5, backgroundColor: TONE_COLOR[tone] }}
            />
          ))}
        </div>
        <ChartValueAxis max={max} ticks={yLabels} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartTimeAxis labels={xLabels} right={PAD_RIGHT} />
      </div>
    </div>
  );
}

/**
 * 데모용 609 dots — APM 라이브 스냅샷 verbatim.
 * Storybook · 프로토타입에서 바로 쓸 수 있다.
 * 런타임에서 import 부담을 줄이려면 lazy import 를 권장.
 */
export { SCATTER_HEATMAP_DEMO_DOTS } from "./scatterHeatmapDemoDots";

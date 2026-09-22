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
 * ## Composition rules
 * - 위젯 chrome 은 소비자가 감싼다.
 * - `dots` prop 으로 데이터를 외부에서 주입한다.
 * - Y축 라벨(0~100) · X축 시각 라벨 · 격자선을 내장한다.
 * - `h-full` 부모 안에서 채워진다.
 *
 * @example
 * ```tsx
 * import { ScatterHeatmap, SCATTER_HEATMAP_DEMO_DOTS } from "@whatap/design-system";
 * <ScatterHeatmap dots={SCATTER_HEATMAP_DEMO_DOTS} xLabels={["13:38","13:40","13:42","13:44","13:46","13:48","13:50"]} />
 * ```
 */

/** 각 dot: [left%, top%, tone]. tone 0=normal(blue), 1=warning(orange), 2=critical(red). */
export type ScatterDot = readonly [number, number, 0 | 1 | 2];

export type ScatterHeatmapProps = {
  /** dot 배열 — [left%, top%, tone]. */
  dots: ReadonlyArray<ScatterDot>;
  /** X축 시각 라벨 (기본 7개). */
  xLabels?: string[];
  /** Y축 라벨 (기본 [100,80,60,40,20,0]). */
  yLabels?: number[];
};

const DEFAULT_Y = [100, 80, 60, 40, 20, 0];
const DEFAULT_X = ["13:38", "13:40", "13:42", "13:44", "13:46", "13:48", "13:50"];
const TONE_COLOR = ["#3DA9FF", "#FFA012", "#F34747"] as const;

export default function ScatterHeatmap({
  dots,
  xLabels = DEFAULT_X,
  yLabels = DEFAULT_Y,
}: ScatterHeatmapProps) {
  return (
    <div className="flex h-full min-h-0 w-full" style={{ padding: "0 8px", gap: 4 }}>
      <div className="flex flex-col justify-between shrink-0" style={{ width: 21, paddingBottom: 15 }}>
        {yLabels.map((v) => (
          <span key={v} className="text-base text-primary leading-none text-right block" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}>{v}</span>
        ))}
      </div>
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        <div className="flex-1 min-h-0 relative w-full">
          {/* horizontal gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className={`h-px w-full ${i === 10 ? "bg-[#757575]" : ""}`} style={i < 10 ? { borderBottom: "1px dashed #f0f0f0" } : undefined} />
            ))}
          </div>
          {/* vertical gridlines */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            <div className="w-px h-full bg-[#757575]" />
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} className="w-px h-full" style={{ borderRight: "1px dashed #f0f0f0" }} />
            ))}
          </div>
          {/* dots */}
          {dots.map(([left, top, tone], i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: 5,
                height: 5,
                backgroundColor: TONE_COLOR[tone],
              }}
            />
          ))}
        </div>
        <div className="flex items-start justify-between shrink-0 w-full" style={{ height: 15, padding: "0 16px" }}>
          {xLabels.map((label, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-px bg-[#757575]" style={{ height: 3 }} />
              <span className="text-base text-primary text-center leading-none whitespace-nowrap" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-regular)" }}>{label}</span>
            </div>
          ))}
        </div>
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

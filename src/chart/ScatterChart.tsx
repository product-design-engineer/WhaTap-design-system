/**
 * ScatterChart — 두 값(X · Y)의 관계를 점으로 찍는 산점도. `size` 를 주면 버블. Composite layer.
 *
 * ## Purpose
 * «이 값이 크면 저 값도 큰가» 와 «무리에서 벗어난 점이 어디인가» 를 보인다 — 호출 수 × 응답시간(SQL Elapse Map) ·
 * CPU × 메모리 · 요청 크기 × 처리 시간. 계열은 엔티티(서버 · 서비스)이고 색은 계열의 것이다(patterns §17).
 * 셋째 값(건수 · 비용)이 있으면 점 면적으로 말한다(버블) — 같은 차트의 `size` 이지 따로 두지 않는다.
 *
 * ## When to use
 * - X 와 Y 가 둘 다 수치인 관계 · 분포 — 상관 · 군집 · 이상점 찾기.
 * - 셋째 수치를 면적으로 함께 보일 때(버블) — 점마다 `size`.
 * - 계열 1~3개. 맞닿는 마크라 모든 색 쌍이 구별돼야 한다(§18).
 *
 * ## When NOT to use
 * - X 가 시간이고 응답시간 판정 색을 칠하는 분포 → [[ScatterHeatmap]]. 색이 계열이 아니라 판정이다 — 근사하지 않는다(§21).
 * - X 가 시간이고 값의 흐름을 볼 때 → [[MiniLineChart]] · [[MiniMultiLineChart]].
 * - 계열 4개 이상 → 계열마다 이 차트 하나씩 작은 칸으로 나눈다(facet, §18). 색을 더하지 않는다.
 * - 구역(사분면 · 판정 칸) 배경 위에 점을 찍을 때 → ZoneScatterChart(§21 공백, 아직 없음).
 *
 * ## Metrics
 * - ✅ 두 수치의 관계 · 이상점 — SQL 호출 수 × 수행 시간 · CPU × 메모리 · 요청 크기 × 처리 시간
 * - ✅ 셋째 수치를 면적으로(버블) — 건수 · 비용 · 데이터량
 * - ❌ X 가 시간인 지표 → [[MiniLineChart]] · 응답시간 분포는 [[ScatterHeatmap]]
 * - ❌ 범주 값(상태 · 이름)을 축에 — 위치가 없는 거리를 말한다
 *
 * ## Composition rules
 * - 요소를 조합한다 — 격자 [[ChartGrid]](가로 눈금 + 세로 절반 `vertical`) · Y 값축 [[ChartValueAxis]] · X 글자 [[ChartTimeAxis]]
 *   (`positions` 로 0 · 절반 · 최대 눈금 자리에). 차트는 점(마크)만 그린다(patterns §26). 그래서 Composite 계층이다.
 * - **색은 계열 순서 슬롯** `--color-chart-series-1..3`. 필터로 계열이 빠져도 색이 옮겨 가지 않게 하려면 `slot` 을 고정한다(§17).
 *   계열이 셋을 넘으면 넷째부터 그리지 않는다(타입도 셋까지만 받는다) — facet 으로 나눈다.
 * - **겹침은 반투명(0.6)으로 보인다(§21 결정, 2026-10-23).** 겹친 곳이 짙어져 밀도가 읽힌다. 칸 집계 · 흩뿌림은 쓰지 않는다 —
 *   집계는 판정 분포([[ScatterHeatmap]])와 섞이고, 흩뿌림은 값을 바꾼다.
 * - 점은 원 6px. 버블은 면적이 `size` 에 비례하고 반지름 3~12px — 큰 점을 먼저(아래) 그려 작은 점을 덮지 않는다.
 * - 범례 견본은 원(`dot`, §26). [[WidgetFrame]] 에 넣을 때는 `frame={false}` 와 `scatterLegend(series)` 를 `legend` 로.
 *   단독(`frame`)이면 계열이 둘 이상일 때 플롯 위 오른쪽에 [[ChartLegendItem]] 줄을 세운다.
 * - 축 제목은 쓰지 않는다. 단위는 눈금 접미사(`xUnit` · `yUnit`, §26).
 * - 점을 가리키면 [[ChartTooltip]] 이 이름 · X · Y · 크기를 보인다(브라우저 `title` 을 쓰지 않는다 — 늦게 뜨고 다크를 따르지 않는다).
 * - `h-full` 부모 안에서 채워진다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 점 | 원 지름 6px · 계열 색 · 불투명도 0.6 · 테두리 없음 |
 * | 버블 | 반지름 √(3² + (12² − 3²) × size ÷ 최대 size) px — 면적 비례, 3~12px |
 * | 색 | `--color-chart-series-{slot}`, slot ∈ 1 · 2 · 3 (기본 = 계열 순서) |
 * | 축 최대 | X · Y 각각 데이터 최대를 1 · 2 · 4 · 5 · 10 × 10ⁿ 로 올림(`xMax` · `yMax` 로 고정 가능) |
 * | 눈금 | Y 최대 · 절반 · 0 / X 0 · 절반 · 최대 — 격자 가로 3 · 세로 절반 1 + 오른쪽 끝 |
 * | 플롯 여백 | 위 4 · 아래 14 · 오른쪽 8px · 왼쪽 `--wds-widget-axis-gutter`(28px) |
 * | 단독 범례 | 계열 2개 이상 · 플롯 위 오른쪽 · 항목 간격 12px · 아래 4px |
 * | hover | 점마다 최소 14px 칸이 받는다 · 가리킨 점은 불투명 + 카드색 2px 고리 · [[ChartTooltip]](이름 · 계열 · X · Y · 크기) |
 * | 접근성 | 플롯 `role="img"` + 계열 이름 · 점 수 |
 *
 * @example
 * ```tsx
 * <WidgetFrame title="SQL 수행 분포" legend={scatterLegend(series)}>
 *   <ScatterChart series={series} xUnit="회" yUnit="ms" frame={false} />
 * </WidgetFrame>
 * ```
 */
import { useState } from "react";
import ChartGrid from "./ChartGrid";
import ChartLegendItem from "./ChartLegendItem";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartTooltip from "./ChartTooltip";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, formatAxisValue, niceMax } from "./_axisScale";

export type ScatterChartPoint = {
  x: number;
  y: number;
  /** 셋째 값 — 주면 면적이 이 값에 비례하는 버블. */
  size?: number;
  /** 점 이름(툴팁). 없으면 계열 이름. */
  label?: string;
};

export type ScatterChartSeries = {
  /** 계열 이름 — 범례 · 툴팁. */
  label: string;
  points: ReadonlyArray<ScatterChartPoint>;
  /** 색 슬롯 `--color-chart-series-{slot}`. 기본 = 계열 순서. 필터로 계열이 빠져도 색을 지키려면 고정한다(§17). */
  slot?: 1 | 2 | 3;
};

/** 맞닿는 마크는 3계열까지(§18) — 넘으면 facet. */
export type ScatterChartSeriesList =
  | readonly [ScatterChartSeries]
  | readonly [ScatterChartSeries, ScatterChartSeries]
  | readonly [ScatterChartSeries, ScatterChartSeries, ScatterChartSeries];

export type ScatterChartProps = {
  /** 계열 1~3개. */
  series: ScatterChartSeriesList;
  /** X 최대. 없으면 데이터 최대를 보기 좋은 값으로 올린다. */
  xMax?: number;
  /** Y 최대. 없으면 데이터 최대를 보기 좋은 값으로 올린다. */
  yMax?: number;
  /** X 눈금 글자 뒤 단위(「회」 「MB」). */
  xUnit?: string;
  /** Y 눈금 글자 뒤 단위(「ms」 「%」). */
  yUnit?: string;
  /**
   * 자기 바깥 여백(좌우 8px)과 범례 줄을 둘지. 기본 `true`.
   * `false` 면 플롯만 — [[WidgetFrame]] 안에 넣고 범례는 `scatterLegend(series)` 를 `legend` 로 넘긴다(patterns §15).
   */
  frame?: boolean;
};

const PAD_TOP = 4;
const PAD_BOTTOM = 14;
const PAD_RIGHT = 8;
const DOT = 6;
const R_MIN = 3;
const R_MAX = 12;
const DOT_OPACITY = 0.6;
const MAX_SERIES = 3;

/* 슬롯 1~3 — 토큰 이름을 문자 그대로 둔다(토큰 게이트가 참조를 읽는다). */
const SERIES_COLOR = ["var(--color-chart-series-1)", "var(--color-chart-series-2)", "var(--color-chart-series-3)"] as const;
const seriesColor = (s: ScatterChartSeries, i: number) => SERIES_COLOR[(s.slot ?? i + 1) - 1];

/** [[WidgetFrame]] `legend` 용 — 원 견본(`dot`) · 계열 색. */
export function scatterLegend(series: ReadonlyArray<ScatterChartSeries>) {
  return series.slice(0, MAX_SERIES).map((s, i) => ({ label: s.label, color: seriesColor(s, i), shape: "dot" as const }));
}

export default function ScatterChart({ series: allSeries, xMax, yMax, xUnit = "", yUnit = "", frame = true }: ScatterChartProps) {
  const series = allSeries.slice(0, MAX_SERIES);
  const points = series.flatMap((s) => s.points);
  const xTop = xMax ?? niceMax(Math.max(0, ...points.map((p) => p.x)));
  const yTop = yMax ?? niceMax(Math.max(0, ...points.map((p) => p.y)));
  const sizeTop = Math.max(0, ...points.map((p) => p.size ?? 0));
  const diameter = (size?: number) =>
    size == null || sizeTop <= 0 ? DOT : 2 * Math.sqrt(R_MIN ** 2 + ((R_MAX ** 2 - R_MIN ** 2) * Math.max(0, size)) / sizeTop);

  const xStops = xTop > 0 ? [0, 0.5, 1] : [0];
  const plot = { left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM };
  const summary = `산점도 — ${series.map((s) => `${s.label} ${s.points.length}점`).join(", ")}`;
  /* 가리킨 점 — [[ChartTooltip]] 으로 값을 보인다 */
  const [hover, setHover] = useState<{ si: number; p: ScatterChartPoint } | null>(null);
  const xr = (v: number) => (xTop > 0 ? v / xTop : 0);
  const yr = (v: number) => (yTop > 0 ? 1 - v / yTop : 1);

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4px" style={{ padding: frame ? "0 8px" : 0 }}>
      {frame && series.length > 1 && (
        <div className="flex justify-end gap-12px">
          {scatterLegend(series).map((l) => (
            <ChartLegendItem key={l.label} color={l.color} shape="dot" label={l.label} />
          ))}
        </div>
      )}
      <div className="relative flex-1 min-w-0 min-h-0" role="img" aria-label={summary}>
        <ChartGrid max={yTop} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} vertical={xTop > 0 ? 2 : undefined} />
        {/* 점 — 이 차트의 마크. 좌표는 플롯 상자 안 %. 큰 버블을 먼저 그려 작은 점을 덮지 않는다 */}
        <div className="absolute" style={plot}>
          {series.map((s, si) =>
            [...s.points]
              .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
              .map((p, pi) => {
                const d = diameter(p.size);
                const on = hover?.p === p;
                /* 맞히기 쉽게 — 보이는 점보다 넓은(최소 14px) 투명 칸이 hover 를 받는다 */
                const hit = Math.max(14, d);
                return (
                  <span
                    key={`${si}-${pi}`}
                    className="absolute flex items-center justify-center"
                    onMouseEnter={() => setHover({ si, p })}
                    onMouseLeave={() => setHover(null)}
                    style={{ left: `${xr(p.x) * 100}%`, top: `${yr(p.y) * 100}%`, width: hit, height: hit, transform: "translate(-50%, -50%)" }}
                  >
                    <span
                      className="block rounded-full"
                      style={{
                        width: d,
                        height: d,
                        background: seriesColor(s, si),
                        opacity: on ? 1 : DOT_OPACITY,
                        boxShadow: on ? "0 0 0 2px var(--color-card)" : undefined,
                      }}
                    />
                  </span>
                );
              }),
          )}
          {hover && (
            <ChartTooltip
              left={`${xr(hover.p.x) * 100}%`}
              top={`${yr(hover.p.y) * 100}%`}
              flipX={xr(hover.p.x) > 0.5}
              flipY={yr(hover.p.y) > 0.5}
              title={hover.p.label ?? series[hover.si].label}
              rows={[
                ...(hover.p.label ? [{ label: "계열", value: series[hover.si].label, color: seriesColor(series[hover.si], hover.si), shape: "dot" as const }] : []),
                { label: "X", value: `${hover.p.x.toLocaleString("en-US")}${xUnit}` },
                { label: "Y", value: `${hover.p.y.toLocaleString("en-US")}${yUnit}` },
                ...(hover.p.size != null ? [{ label: "크기", value: hover.p.size.toLocaleString("en-US") }] : []),
              ]}
            />
          )}
        </div>
        <ChartValueAxis max={yTop} unit={yUnit} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartTimeAxis labels={xStops.map((r) => formatAxisValue(xTop * r) + xUnit)} positions={xStops} right={PAD_RIGHT} />
      </div>
    </div>
  );
}

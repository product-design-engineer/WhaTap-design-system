/**
 * StackedAreaChart — 계열을 아래에서 위로 쌓은 면. 맨 위 경계가 합계의 추이, 층의 두께가 각 계열의 몫. Composite layer.
 *
 * ## Purpose
 * «전체가 어떻게 움직였고 그 안에서 누가 얼마를 차지했나» 를 한 판에 보인다 — GPU 장치별 전력 합계 · 상태 코드별 트래픽.
 * 라이브 GPU Power 위젯은 8계열 누적면에 범례가 플롯 밖 별도 패널이었고, 얇은 하위 층은 따라갈 수 없었다(patterns §21).
 * 여기서는 범례가 다른 차트와 같은 자리(플롯 위 오른쪽 · [[WidgetFrame]] `legend`)에 서고, 합계 최고점을 ▼ 로 짚는다.
 *
 * ## When to use
 * - 합이 의미 있는 구성의 시간 추이 — 장치별 전력(W) 합계 · 상태 코드별 요청 수 · 메모리 구성(used · cache · buffer).
 * - 합계의 크기와 구성의 변화를 함께 볼 때. 계열 2~8개.
 *
 * ## When NOT to use
 * - 계열끼리의 크기 비교가 주인 자리 → [[MiniMultiLineChart]]. 위층은 아래층 위에 얹혀 기준선이 흔들려 견줄 수 없다.
 * - 합이 의미 없는 값(백분위 p50 · p95, 각자 100% 상한인 사용률들) — 쌓은 높이가 거짓 합을 말한다.
 * - 구간마다 독립인 양의 누적 → [[MiniBarChart]](막대 누적). 한 시점의 구성 → [[MiniDonutChart]].
 * - 계열 9개 이상 → 색을 늘리지 않고 §22(강조 + 나머지 묶기 · 행렬 · 칸).
 *
 * ## Metrics
 * - ✅ 합이 의미 있는 구성의 추이 — GPU 장치별 전력(W) · 상태 코드(2xx · 4xx · 5xx)별 요청 수 · 메모리 구성(used · cache · buffer) · 서비스별 트래픽(bps)
 * - ❌ 합이 의미 없는 지표(p50 + p95 · 평균끼리 · 각자 100% 인 사용률) — 위 경계가 존재하지 않는 합계를 말한다
 * - ❌ 계열끼리 크기를 견줘야 하는 지표 → [[MiniMultiLineChart]]
 *
 * ## Colors
 * - 정체성 — 층마다 불투명 면 · `--color-chart-series-1..8`(`slot`) · 층 경계 `--color-card`
 *
 * ## Composition rules
 * - 요소를 조합한다 — 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · 시간축 [[ChartTimeAxis]] · 합계 최고점 [[ChartPeakMarker]] · 단독 범례 [[ChartLegendItem]].
 *   차트는 면만 그린다(patterns §26). 그래서 Composite 계층이다.
 * - **쌓는 순서 = `series` 순서**(`series[0]` 이 바닥). 가장 크고 안정적인 계열을 바닥에 둔다 — 바닥이 평평해야 위 층이 읽힌다.
 *   얇아 따라가기 힘든 계열은 위쪽에 둔다.
 * - **면은 불투명하게 칠하고 층 사이를 카드색 1px 로 가른다(2026-10-23 결정).** 누적면은 서로 겹치지 않으므로 투명도가 밀도를 말하지 않는다 —
 *   투명하게 칠하면 범례 견본과 색이 달라 보인다.
 * - 색은 계열 슬롯 `--color-chart-series-1..8`(기본 순서, `slot` 으로 고정 · §17). 8개를 넘는 계열은 그리지 않는다(§22).
 * - Y 최대 = 합계 최대를 보기 좋은 값으로 올림. 단위는 눈금 접미사(`unit`). `peak` 면 합계 최고점에 ▼ + 값.
 * - 범례는 `stackedAreaLegend(series)` 를 [[WidgetFrame]] `legend` 로(`frame={false}`). 단독(`frame`)이면 플롯 위 오른쪽에 스스로 — 별도 패널로 빼지 않는다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 면 | 불투명 · `--color-chart-series-{slot}` · 층 사이 경계 1px `--color-card`(면을 모두 칠한 뒤 긋는다 · 맨 위 경계는 긋지 않는다) |
 * | 쌓기 | `series[0]` 바닥 → 마지막이 맨 위. 값은 0 미만을 0 으로 |
 * | Y | 0 ~ 합계 최대 올림(`max` 로 고정) · 눈금 최대 · 절반 · 0 · 단위 `unit` |
 * | 최고점 | `peak` 면 합계 최대 시점에 [[ChartPeakMarker]](값 + 단위, ▼ 색 = 맨 위 계열) |
 * | 플롯 여백 | 위 14(▼ 자리) · 아래 14 · 오른쪽 8 · 왼쪽 `--wds-widget-axis-gutter` |
 * | 단독 범례 | 사각 견본, 플롯 위 오른쪽 · 간격 12 · 위층부터(쌓인 순서와 같은 위아래) |
 * | hover | 플롯 위 포인터 x → 가장 가까운 시점 · 세로 안내선 1px `--color-border-strong` + 층마다 위 경계 점(6px · 카드색 고리) · [[ChartTooltip]](시점 `pointLabels` · 계열 값 위층부터 · 합계) · 범례 항목을 가리키면 그 층만 남기고 나머지 0.32 |
 * | 접근성 | 플롯 `role="img"` + 계열 이름 · 합계 최대 |
 *
 * @example
 * ```tsx
 * <WidgetFrame title="Power Usage" legend={stackedAreaLegend(gpus)}>
 *   <StackedAreaChart series={gpus} xLabels={labels} unit="W" peak frame={false} />
 * </WidgetFrame>
 * ```
 */
import { useState } from "react";
import ChartGrid from "./ChartGrid";
import ChartLegendItem from "./ChartLegendItem";
import ChartPeakMarker from "./ChartPeakMarker";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartTooltip from "./ChartTooltip";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, formatPeakValue, niceMax } from "./_axisScale";
import { DIM_OPACITY, EMPHASIS_RING, MARK_CLASS } from "./_emphasis";

export type StackedAreaSeries = {
  /** 계열 이름 — 범례 · 접근성. */
  label: string;
  /** 시간순 값. 계열마다 길이를 같게. */
  values: ReadonlyArray<number>;
  /** 색 슬롯 `--color-chart-series-{slot}`. 기본 = 계열 순서. 필터로 계열이 빠져도 색을 지키려면 고정한다(§17). */
  slot?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type StackedAreaChartProps = {
  /** 계열 2~8개 — `series[0]` 이 바닥. 9번째부터는 그리지 않는다(§22). */
  series: ReadonlyArray<StackedAreaSeries>;
  /** X 시간 글자(같은 간격). */
  xLabels: string[];
  /** 눈금 · 최고점 값 뒤 단위. */
  unit?: string;
  /** Y 최대. 없으면 합계 최대를 보기 좋은 값으로 올린다. */
  max?: number;
  /** 합계 최고점에 ▼ + 값. */
  peak?: boolean;
  /**
   * 자기 바깥 여백(좌우 8px)과 범례 줄을 둘지. 기본 `true`.
   * `false` 면 플롯만 — [[WidgetFrame]] 안에 넣고 범례는 `stackedAreaLegend(series)` 를 `legend` 로(patterns §15).
   */
  frame?: boolean;
  /** 시점마다 이름(「14:32」) — 툴팁 제목. 길이는 값 개수와 같게. 없으면 제목 없이. */
  pointLabels?: ReadonlyArray<string>;
};

const PAD_TOP = 14;
const PAD_BOTTOM = 14;
const PAD_RIGHT = 8;
const MAX_SERIES = 8;
const VB = 1000;

/* 슬롯 1~8 — 토큰 이름을 문자 그대로 둔다(토큰 게이트가 참조를 읽는다). */
const SERIES_COLOR = [
  "var(--color-chart-series-1)",
  "var(--color-chart-series-2)",
  "var(--color-chart-series-3)",
  "var(--color-chart-series-4)",
  "var(--color-chart-series-5)",
  "var(--color-chart-series-6)",
  "var(--color-chart-series-7)",
  "var(--color-chart-series-8)",
] as const;
const colorOf = (s: StackedAreaSeries, i: number) => SERIES_COLOR[(s.slot ?? i + 1) - 1];

/** [[WidgetFrame]] `legend` 용 — 사각 견본 · 위층부터(쌓인 위아래와 같은 순서). */
export function stackedAreaLegend(series: ReadonlyArray<StackedAreaSeries>) {
  return series
    .slice(0, MAX_SERIES)
    .map((s, i) => ({ label: s.label, color: colorOf(s, i) }))
    .reverse();
}

export default function StackedAreaChart({ series: all, xLabels, unit = "", max, peak = false, frame = true, pointLabels }: StackedAreaChartProps) {
  const series = all.slice(0, MAX_SERIES);
  const n = Math.max(0, ...series.map((s) => s.values.length));
  /* 누적 — tops[k][i] = 바닥부터 k 번째 계열까지의 합 */
  const tops: number[][] = [];
  series.forEach((s, k) => tops.push(Array.from({ length: n }, (_, i) => (k ? tops[k - 1][i] : 0) + Math.max(0, s.values[i] ?? 0))));
  const totals = tops[tops.length - 1] ?? [];
  const top = max ?? niceMax(Math.max(0, ...totals));
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * VB : 0);
  const y = (v: number) => (top > 0 ? VB * (1 - Math.min(1, v / top)) : VB);
  const peakIdx = totals.length ? totals.indexOf(Math.max(...totals)) : -1;
  const plotLeft = `calc(${AXIS_GUTTER} + (100% - ${AXIS_GUTTER} - ${PAD_RIGHT}px) * `;
  /* 가리킨 시점 */
  const [hover, setHover] = useState<number | null>(null);
  /* 범례를 가리킨 계열 — 그 층만 남기고 나머지 면을 흐린다 */
  const [focus, setFocus] = useState<string | null>(null);
  const exact = (v: number) => `${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit}`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4px" style={{ padding: frame ? "0 8px" : 0 }}>
      {frame && series.length > 1 && (
        <div className="flex justify-end flex-wrap gap-12px">
          {stackedAreaLegend(series).map((l) => (
            <ChartLegendItem
              key={l.label}
              color={l.color}
              label={l.label}
              onHover={(on) => setFocus(on ? l.label : null)}
              dimmed={focus != null && focus !== l.label}
            />
          ))}
        </div>
      )}
      <div
        className="relative flex-1 min-w-0 min-h-0"
        role="img"
        aria-label={`누적면 — ${series.map((s) => s.label).join(", ")} · 합계 최대 ${totals.length ? formatPeakValue(Math.max(...totals)) : 0}${unit}`}
      >
        <ChartGrid max={top} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        {/* 면 — 이 차트의 마크. 플롯 상자 안에만, viewBox 를 늘려 채운다(선 굵기는 non-scaling) */}
        {n > 1 && (
          <svg
            aria-hidden
            className="absolute"
            viewBox={`0 0 ${VB} ${VB}`}
            preserveAspectRatio="none"
            style={{ left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM, width: `calc(100% - ${AXIS_GUTTER} - ${PAD_RIGHT}px)`, height: `calc(100% - ${PAD_TOP + PAD_BOTTOM}px)` }}
          >
            {series.map((s, k) => {
              const upper = tops[k].map((v, i) => `${x(i)},${y(v)}`);
              const lower = (k ? tops[k - 1] : tops[k].map(() => 0)).map((v, i) => `${x(i)},${y(v)}`).reverse();
              return (
                <polygon
                  key={k}
                  className={MARK_CLASS}
                  points={[...upper, ...lower].join(" ")}
                  fill={colorOf(s, k)}
                  opacity={focus != null && focus !== s.label ? DIM_OPACITY : 1}
                />
              );
            })}
            {/* 층 사이 경계는 면을 모두 칠한 뒤에 — 먼저 그으면 위층 면이 덮는다 */}
            {series.slice(0, -1).map((_, k) => (
              <polyline
                key={`edge-${k}`}
                points={tops[k].map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                fill="none"
                stroke="var(--color-card)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}
        <ChartValueAxis max={top} unit={unit} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        {/* 시점 고르기 — 플롯 위 포인터 x 에서 가장 가까운 시점. 세로 안내선 + [[ChartTooltip]](계열 값 위층부터 · 합계) */}
        {n > 1 && (
          <div
            className="absolute"
            style={{ left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM }}
            onMouseMove={(ev) => {
              const r = ev.currentTarget.getBoundingClientRect();
              setHover(Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)) * (n - 1)));
            }}
            onMouseLeave={() => setHover(null)}
          >
            {hover != null && (
              <>
                <span aria-hidden className="absolute" style={{ left: `${(hover / (n - 1)) * 100}%`, top: 0, bottom: 0, width: 0, borderLeft: "1px solid var(--color-border-strong)" }} />
                {/* 그 시점 각 층 위 경계의 점 — 어느 값이 어느 층인지 이어 준다 */}
                {series.map((sr, k) => (
                  <span
                    key={k}
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      left: `${(hover / (n - 1)) * 100}%`,
                      top: `${top > 0 ? (1 - Math.min(1, tops[k][hover] / top)) * 100 : 100}%`,
                      width: 6,
                      height: 6,
                      transform: "translate(-50%, -50%)",
                      background: colorOf(sr, k),
                      boxShadow: EMPHASIS_RING,
                    }}
                  />
                ))}
                <ChartTooltip
                  left={`${(hover / (n - 1)) * 100}%`}
                  top={`${top > 0 ? (1 - Math.min(1, totals[hover] / top)) * 100 : 100}%`}
                  flipX={hover / (n - 1) > 0.5}
                  title={pointLabels?.[hover]}
                  rows={series
                    .map((sr, k) => ({ label: sr.label, value: exact(Math.max(0, sr.values[hover] ?? 0)), color: colorOf(sr, k) }))
                    .reverse()}
                  footer={`합계 ${exact(totals[hover])}`}
                />
              </>
            )}
          </div>
        )}
        {peak && peakIdx >= 0 && n > 1 && (
          <ChartPeakMarker
            label={`${formatPeakValue(totals[peakIdx])}${unit}`}
            color={colorOf(series[series.length - 1], series.length - 1)}
            left={`${plotLeft}${peakIdx / (n - 1)})`}
            top={`calc(${PAD_TOP}px + (100% - ${PAD_TOP + PAD_BOTTOM}px) * ${top > 0 ? 1 - totals[peakIdx] / top : 1})`}
          />
        )}
        <ChartTimeAxis labels={xLabels} right={PAD_RIGHT} />
      </div>
    </div>
  );
}

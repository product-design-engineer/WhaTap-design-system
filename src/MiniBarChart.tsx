import type { CSSProperties } from "react";

/**
 * MiniBarChart — 시간 구간마다 막대 하나. 계열이 둘 이상이면 누적 막대. Primitives layer.
 *
 * ## Purpose
 * 짧은 구간(5초 · 1분)마다 «얼마나 처리했나 · 얼마나 걸렸나» 를 막대로 세운다. 선은 흐름을 말하고 막대는
 * 구간 하나하나의 양을 말한다. TPS · 평균 응답시간처럼 구간 값이 독립인 지표는 막대가 읽기 쉽다. 계열을 둘 이상
 * 주면 같은 구간 안에서 쌓는다(시스템 CPU 의 sys + usr 처럼 합이 의미 있는 구성).
 *
 * 축은 다른 그래프와 같은 규칙을 쓴다. Y축 눈금 칸 `--wds-widget-axis-gutter` · 아래 여백 14 · 축 글자 `text-chart`.
 * 그래서 [[MiniMultiLineChart]] · [[ScatterHeatmap]] 과 한 줄에 놓여도 Y축 선과 X축 선이 같은 자리에 선다.
 *
 * ## When to use
 * - 구간마다 독립인 양: TPS · 평균 응답시간 · 처리 건수.
 * - 합이 의미 있는 구성: 시스템 CPU(sys + usr) · 상태별 건수 누적.
 *
 * ## When NOT to use
 * - 흐름 · 추세가 핵심인 지표 → [[MiniMultiLineChart]].
 * - 행마다 다른 대상의 크기 비교(가로 막대) → [[BarList]].
 * - 한계 대비 소비량 하나 → [[UsageGauge]].
 * - AI 응답 안의 사용률 막대 → [[UsageChart]](AI 카테고리).
 *
 * ## Composition rules
 * - 껍데기(카드 · 제목 · 메뉴 · 범례)는 그리지 않는다. 대시보드 칸에서는 [[WidgetFrame]] 이 맡는다(patterns §15).
 *   범례는 같은 색 토큰을 WidgetFrame `legend` 로 넘긴다.
 * - `frame={false}` 면 바깥 좌우 여백(8px)을 뺀다. WidgetFrame 안에서는 늘 `frame={false}` — 다른 칸 차트와 같은 규칙.
 * - 막대 색은 `--color-chart-series-N`(또는 APM 고정색 `--color-chart-apm-*`). 상태색을 섞지 않는다.
 * - Y 눈금은 0 · 절반 · 최대 셋(최대는 보기 좋은 값으로 올림). 숫자는 1,000 이상이면 K.
 * - `peak` 를 주면 최댓값 막대 위에 값을 적는다. 막대와 같은 좌표에 서므로 어긋나지 않는다(patterns §5).
 *
 * @example
 * ```tsx
 * <WidgetFrame title="TPS" legend={[{ label: "TPS", color: "var(--color-chart-series-1)" }]}>
 *   <MiniBarChart frame={false} xLabels={X} series={[{ label: "TPS", values: tps, color: "var(--color-chart-series-1)" }]} />
 * </WidgetFrame>
 *
 * // 누적 — 시스템 CPU
 * <MiniBarChart frame={false} unit="%" yMax={100} series={[
 *   { label: "usr", values: usr, color: "var(--color-chart-series-1)" },
 *   { label: "sys", values: sys, color: "var(--color-chart-series-2)" },
 * ]} />
 * ```
 */

/** Y축 눈금 칸 폭 — 모든 그래프가 같은 토큰을 쓴다. */
const GUTTER = "var(--wds-widget-axis-gutter)";
const PAD_RIGHT = 8;
const PAD_BOTTOM = 14;
const PAD_TOP = 4;

export type MiniBarChartSeries = {
  /** 계열 이름. 범례는 WidgetFrame `legend` 가 그린다. */
  label: string;
  /** 구간마다 값. 계열끼리 길이가 같아야 한다. */
  values: number[];
  /** 막대 색 토큰. */
  color: string;
};

export type MiniBarChartProps = {
  /** 하나면 단일 막대, 둘 이상이면 같은 구간에 쌓는다. */
  series: MiniBarChartSeries[];
  /** X축 글자. 막대 수와 같을 필요는 없다 — 양 끝과 사이를 같은 간격으로 놓는다. */
  xLabels?: string[];
  /** Y축 글자 뒤 단위(「%」 「ms」). */
  unit?: string;
  /** Y축 최대. 없으면 (누적) 최댓값을 보기 좋은 값으로 올린다. */
  yMax?: number;
  /** 최댓값 막대 위에 값을 적는다. */
  peak?: boolean;
  /**
   * 자기 바깥 좌우 여백(8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

function niceMax(v: number): number {
  if (v <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 4 ? 4 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function formatY(v: number): string {
  if (v >= 1000) return Math.round(v / 100) / 10 + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(0);
}

export default function MiniBarChart({ series, xLabels = [], unit = "", yMax, peak = false, frame = true }: MiniBarChartProps) {
  const n = Math.max(0, ...series.map((s) => s.values.length));
  const totals = Array.from({ length: n }, (_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const top = yMax ?? niceMax(Math.max(0, ...totals));
  const yTicks = top > 0 ? [1, 0.5, 0] : [0];
  const peakIdx = peak && n > 0 ? totals.indexOf(Math.max(...totals)) : -1;
  const plotH = `(100% - ${PAD_TOP + PAD_BOTTOM}px)`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0 }}>
      <div className="flex-1 min-h-0 relative">
        {/* 격자 — 눈금마다 점선 */}
        {yTicks.map((ratio) => (
          <div
            key={`grid-${ratio}`}
            className="absolute"
            style={{
              left: GUTTER,
              right: PAD_RIGHT,
              top: `calc(${PAD_TOP}px + ${plotH} * ${1 - ratio})`,
              height: 0,
              borderTop: "1px dashed var(--color-border-default)",
              opacity: 0.5,
            }}
          />
        ))}

        {/* 막대 — 그래프 영역에만. 구간마다 한 칸, 칸 사이 1px */}
        <div
          className="absolute flex items-end"
          style={{ left: GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM, gap: 1, padding: "0 2px" }}
        >
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="relative flex flex-1 min-w-0 h-full" style={{ flexDirection: "column-reverse" }}>
              {series.map((s) => {
                const v = s.values[i] ?? 0;
                return (
                  <div
                    key={s.label}
                    className="w-full shrink-0"
                    style={{ height: top > 0 ? `${(v / top) * 100}%` : 0, background: s.color }}
                  />
                );
              })}
              {i === peakIdx && (
                <span
                  className="absolute text-chart font-bold text-primary leading-none whitespace-nowrap bg-card rounded-2px"
                  style={{
                    fontFamily: "var(--font-family-numeric)",
                    left: "50%",
                    bottom: top > 0 ? `calc(${(totals[i] / top) * 100}% + 2px)` : 0,
                    transform: "translateX(-50%)",
                    padding: "1px 2px",
                  }}
                >
                  {formatY(totals[i]) + unit}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 축 — 막대 위에 그려 바닥선이 막대에 묻히지 않게 */}
        <div className="absolute bg-color-var-color-border-divider" style={{ left: GUTTER, right: PAD_RIGHT, bottom: PAD_BOTTOM, height: 1 }} />
        <div className="absolute bg-color-var-color-border-divider" style={{ left: GUTTER, top: PAD_TOP, bottom: PAD_BOTTOM, width: 1 }} />

        {/* 글자 — px 고정 */}
        <div className="absolute inset-0 pointer-events-none">
          {yTicks.map((ratio) => (
            <span
              key={ratio}
              className="absolute text-chart text-tertiary leading-none"
              style={
                {
                  fontFamily: "var(--font-family-numeric)",
                  top: `calc(${PAD_TOP}px + ${plotH} * ${1 - ratio})`,
                  transform: "translateY(-50%)",
                  left: 0,
                  textAlign: "right",
                  paddingRight: 4,
                  width: GUTTER,
                } as CSSProperties
              }
            >
              {formatY(top * ratio) + unit}
            </span>
          ))}
          {xLabels.map((label, i) => {
            const ratio = xLabels.length > 1 ? i / (xLabels.length - 1) : 0;
            return (
              <span
                key={i}
                className="absolute text-chart text-tertiary leading-none whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-family-numeric)",
                  left: `calc(${GUTTER} + (100% - ${GUTTER} - ${PAD_RIGHT}px) * ${ratio})`,
                  bottom: 2,
                  transform: i === 0 ? "translateX(0)" : i === xLabels.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { AXIS_GUTTER as GUTTER, PlotAxisLines, ValueAxisLabels, ValueGrid, axisTicks, formatAxisValue, niceMax } from "./_valueAxis";

/**
 * MiniBarChart — 시간 구간마다 막대 하나. 계열이 둘 이상이면 누적 막대. 범주(서버 TOP-N)마다 막대 하나도 된다. Primitives layer.
 *
 * ## Purpose
 * 짧은 구간(5초 · 1분)마다 «얼마나 처리했나 · 얼마나 걸렸나» 를 막대로 세운다. 선은 흐름을 말하고 막대는
 * 구간 하나하나의 양을 말한다. TPS · 평균 응답시간처럼 구간 값이 독립인 지표는 막대가 읽기 쉽다. 계열을 둘 이상
 * 주면 같은 구간 안에서 쌓는다(시스템 CPU 의 sys + usr 처럼 합이 의미 있는 구성).
 *
 * X축은 둘 중 하나다. 시간축이면 `xLabels`(양 끝과 사이를 같은 간격), 범주축이면 `categories`(막대마다 이름 하나를
 * 그 막대 바로 아래 가운데). 둘을 함께 주면 `categories` 만 그린다. 범주축에서는 `valueLabels` 로 막대마다 위에 값을 적는다.
 *
 * 축은 다른 그래프와 같은 규칙을 쓴다. Y축 눈금 칸 `--wds-widget-axis-gutter` · 아래 여백 14 · 축 글자 `text-chart`.
 * 그래서 [[MiniMultiLineChart]] · [[ScatterHeatmap]] 과 한 줄에 놓여도 Y축 선과 X축 선이 같은 자리에 선다.
 *
 * ## When to use
 * - 구간마다 독립인 양: TPS · 평균 응답시간 · 처리 건수.
 * - 합이 의미 있는 구성: 시스템 CPU(sys + usr) · 상태별 건수 누적.
 * - TOP-N 범주 막대 → `categories` + `valueLabels`: Disk IOPS · Disk Inode · 메모리 상위 5대처럼 대상이 다섯 안팎이고
 *   대상끼리 크기를 세로 막대로 견줄 때. 계열은 하나(같은 지표)로 둔다.
 *
 * ## When NOT to use
 * - 흐름 · 추세가 핵심인 지표 → [[MiniMultiLineChart]].
 * - 행마다 다른 대상의 크기 비교(가로 막대) → [[BarList]]. 대상이 여섯 이상이거나, 이름이 길어 막대 칸 폭에서
 *   잘리면 안 되거나, 값과 이름을 한 줄에 읽어야 하면 범주 막대보다 BarList 가 맞다.
 * - 한계 대비 소비량 하나 → [[UsageGauge]].
 * - AI 응답 안의 사용률 막대 → [[UsageChart]](AI 카테고리).
 *
 * ## Composition rules
 * - 껍데기(카드 · 제목 · 메뉴 · 범례)는 그리지 않는다. 대시보드 칸에서는 [[WidgetFrame]] 이 맡는다(patterns §15).
 *   범례는 같은 색 토큰을 WidgetFrame `legend` 로 넘긴다.
 * - `frame={false}` 면 바깥 좌우 여백(8px)을 뺀다. WidgetFrame 안에서는 늘 `frame={false}` — 다른 칸 차트와 같은 규칙.
 * - 막대 색은 `--color-chart-series-N`(또는 APM 고정색 `--color-chart-apm-*`). 상태색을 섞지 않는다.
 * - Y 눈금은 0 · 절반 · 최대 셋(최대는 보기 좋은 값으로 올림). 숫자는 1,000 이상이면 K.
 * - `peak` 를 주면 최댓값 막대 위에 값을 적는다. 막대와 같은 좌표에 서므로 어긋나지 않는다(patterns §5). 시계열용이다.
 * - `xLabels` 와 `categories` 는 함께 쓰지 않는다(시간축 · 범주축 중 하나). 범주 이름은 `text-chart` · tertiary 로 막대 칸
 *   폭에서 말줄임하고, 전체 이름은 `title` 로 보인다. 범주축이면 아래 여백이 늘어 이름이 바닥선에 붙지 않는다.
 * - `valueLabels` 는 모든 막대 위에 값 + 단위를 적는다. 가장 큰 막대만 굵게 · primary, 나머지는 tertiary.
 *   `valueLabels` 를 켜면 `peak` 는 겹치므로 따로 켜지 않는다. 값 글자 자리만큼 위 여백이 늘어난다.
 * - 범주 막대는 칸 폭의 60% 로 가운데 선다(시계열 막대는 칸을 거의 다 쓴다).
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
 *
 * // TOP-N 범주 · Disk IOPS 상위 5대
 * <WidgetFrame title="Disk IOPS TOP5" legend={[{ label: "Disk IOPS", color: "var(--color-chart-series-1)" }]}>
 *   <MiniBarChart frame={false} unit="B" valueLabels
 *     categories={["dev-yard", "dev-dfs-yard-01", "dev-agency-01", "dev-front", "Dev-Modules"]}
 *     series={[{ label: "Disk IOPS", values: [502, 177, 148, 96, 64], color: "var(--color-chart-series-1)" }]} />
 * </WidgetFrame>
 * ```
 */

const PAD_RIGHT = 8;
const PAD_BOTTOM = 14;
const PAD_TOP = 4;
/** 범주축 아래 여백. 범주 이름(9px) + 바닥선과의 틈. */
const PAD_BOTTOM_CATEGORIES = 18;
/** 값 글자를 켰을 때 위 여백. 최댓값 막대가 눈금 끝까지 차도 값 글자가 잘리지 않게. */
const PAD_TOP_VALUES = 14;

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
  /**
   * 시간축 X 글자. 막대 수와 같을 필요는 없다. 양 끝과 사이를 같은 간격으로 놓는다.
   * `categories` 와 함께 쓰지 않는다(둘 다 주면 `categories` 만 그린다).
   */
  xLabels?: string[];
  /**
   * 범주축 이름. 막대마다 하나, 그 막대 바로 아래 가운데. `text-chart` · tertiary · 막대 칸 폭에서 말줄임(전체 이름은 `title`).
   * 주면 `xLabels` 대신 그린다. TOP-N 서버 막대처럼 X 가 시간이 아닐 때.
   */
  categories?: string[];
  /**
   * 모든 막대 위에 값 + 단위를 적는다. 가장 큰 막대만 굵게 · primary, 나머지는 tertiary.
   * TOP-N 범주 막대용. 시계열에서 최댓값 하나만 적으려면 `peak`.
   */
  valueLabels?: boolean;
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

export default function MiniBarChart({
  series,
  xLabels = [],
  categories,
  unit = "",
  yMax,
  peak = false,
  valueLabels = false,
  frame = true,
}: MiniBarChartProps) {
  const isCategory = categories !== undefined && categories.length > 0;
  const n = Math.max(0, ...series.map((s) => s.values.length));
  const totals = Array.from({ length: n }, (_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const top = yMax ?? niceMax(Math.max(0, ...totals));
  const yTicks = axisTicks(top);
  const maxIdx = n > 0 ? totals.indexOf(Math.max(...totals)) : -1;
  const peakIdx = peak ? maxIdx : -1;
  const padTop = valueLabels ? PAD_TOP_VALUES : PAD_TOP;
  const padBottom = isCategory ? PAD_BOTTOM_CATEGORIES : PAD_BOTTOM;
  const plotH = `(100% - ${padTop + padBottom}px)`;
  const yAt = (r: number) => `calc(${padTop}px + ${plotH} * ${r})`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0 }}>
      <div className="flex-1 min-h-0 relative">
        <ValueGrid ticks={yTicks} yAt={yAt} right={PAD_RIGHT} />

        {/* 막대 — 그래프 영역에만. 구간마다 한 칸, 칸 사이 1px */}
        <div
          className="absolute flex items-end"
          style={{ left: GUTTER, right: PAD_RIGHT, top: padTop, bottom: padBottom, gap: 1, padding: "0 2px" }}
        >
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="relative flex flex-1 min-w-0 h-full" style={{ flexDirection: "column-reverse" }}>
              {series.map((s) => {
                const v = s.values[i] ?? 0;
                return (
                  <div
                    key={s.label}
                    className="shrink-0"
                    style={{
                      height: top > 0 ? `${(v / top) * 100}%` : 0,
                      background: s.color,
                      width: isCategory ? "60%" : "100%",
                      marginInline: isCategory ? "auto" : undefined,
                    }}
                  />
                );
              })}
              {(i === peakIdx || valueLabels) && (
                <span
                  className={`absolute text-chart leading-none whitespace-nowrap bg-card rounded-2px ${
                    i === maxIdx ? "font-bold text-primary" : "text-tertiary"
                  }`}
                  style={{
                    fontFamily: "var(--font-family-numeric)",
                    left: "50%",
                    bottom: top > 0 ? `calc(${(totals[i] / top) * 100}% + 2px)` : 0,
                    transform: "translateX(-50%)",
                    padding: "1px 2px",
                  }}
                >
                  {formatAxisValue(totals[i]) + unit}
                </span>
              )}
              {isCategory && categories[i] !== undefined && (
                <span
                  className="absolute text-chart text-tertiary leading-none truncate text-center"
                  title={categories[i]}
                  style={{ fontFamily: "var(--font-family-numeric)", left: 0, right: 0, top: "100%", marginTop: 4 }}
                >
                  {categories[i]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 축 — 막대 위에 그려 바닥선이 막대에 묻히지 않게 */}
        <PlotAxisLines top={padTop} bottom={padBottom} right={PAD_RIGHT} />

        {/* 글자 — px 고정 */}
        <div className="absolute inset-0 pointer-events-none">
          <ValueAxisLabels ticks={yTicks} yAt={yAt} max={top} unit={unit} />
          {!isCategory && xLabels.map((label, i) => {
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

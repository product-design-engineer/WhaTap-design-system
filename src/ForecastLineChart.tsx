import type { CSSProperties } from "react";

/**
 * ForecastLineChart: 관측은 실선, 예측은 점선. 「지금」 세로선 · 임계 띠 · 도달 마커를 한 판에. Primitives layer.
 *
 * ## Purpose
 * «이대로 가면 언제 닿는가» 를 화면에서 확인하게 한다. 디스크 고갈 · 용량 소진처럼 판정이 **기울기의 연장**에서 나오는
 * 지표는 지금 값 하나(78%)만 보여 주면 «왜 이게 주의인가» 가 남는다. 그래서 세 가지를 같은 좌표에 그린다.
 * ① 과거 관측은 실선(기울기가 곧 판정 입력) ② 미래 외삽은 점선(가정은 가정처럼 보여야 한다. 같은 선으로 그리면 예측을
 * 관측으로 오해한다) ③ 임계선과 그 위 옅은 띠 · 천장(`yMax`) · 예측이 닿는 자리의 마커. 「지금」(x = 0) 세로선이
 * 관측과 예측을 가른다. 이 선이 없으면 둘이 섞인다.
 *
 * x 는 도메인 단위(시간 등)로 받는다. 음수가 과거, 0 이 지금, 양수가 미래다. 축은 다른 그래프와 같은 규칙을 쓴다.
 * Y축 눈금 칸 `--wds-widget-axis-gutter` · 아래 여백 14 · 축 글자 `text-chart`. 그래서 [[MiniBarChart]] ·
 * [[MiniMultiLineChart]] 와 한 줄에 놓여도 Y축 선과 X축 선이 같은 자리에 선다.
 *
 * ## When to use
 * - 추세를 연장해 도달 시점을 말하는 지표: 디스크 · inode 고갈, 쿼터 · 용량 소진, 인증서 · 라이선스 만료까지의 소비.
 * - 배너나 요약 문장이 «약 5시간 후» 를 말할 때 그 근거를 x축에서 읽히게 하는 자리.
 *
 * ## When NOT to use
 * - 예측 없는 일반 시계열 → [[MiniMultiLineChart]] · [[MiniLineChart]].
 * - 구간마다 독립인 양 → [[MiniBarChart]].
 * - 경계가 표준으로 정해진 점수(Apdex) → [[ApdexChart]].
 * - 한계 대비 지금 소비량 하나 → [[UsageGauge]].
 *
 * ## Composition rules
 * - 껍데기(카드 · 제목 · 메뉴 · 범례)는 그리지 않는다. 대시보드 칸에서는 [[WidgetFrame]] 이 맡는다(patterns §15).
 *   범례는 같은 색 토큰을 WidgetFrame `legend` 로 넘기고, 칸에 꼭 필요한 값(추세 구간 · 지평)은 `summary` 에 둔다.
 * - `frame={false}` 면 바깥 좌우 여백(8px)을 뺀다. WidgetFrame 안에서는 늘 `frame={false}`.
 * - 선 색은 호출부가 토큰으로 준다. 기본은 `--color-chart-series-N`. **위젯이 상태를 말할 때만** 상태색
 *   (`--color-status-error` · `--color-status-warning`)을 쓰고, 그때 판정 밖 계열(평탄 · 지평 밖 · 대조군)은
 *   회색 `--color-chart-neutral` 로 낮춘다. 대조군이 같은 그림에 있어야 «사용률이 더 높은데 사건이 아닌» 판정이 납득된다.
 *   한 차트 안에서 계열색과 상태색을 섞지 않는다.
 * - 임계 띠 색은 `threshold.tone`(critical · warning)이 정한다. 선은 `--color-status-*`, 띠는 `--color-status-*-soft`.
 *   임계 이름 · 도달 시각 같은 글자는 text 토큰이다(색은 마크가 담당한다).
 * - `highlightId` 를 주면 나머지 계열을 흐리게 낮춘다. 배너 칩이 가리키는 계열을 차트에서도 짚을 때 쓴다.
 * - 마커 · 글자는 HTML 로 얹고 선과 같은 plot 좌표(left · top 비율)를 쓴다(patterns §5). 그래서 마커가 선 끝에서 어긋나지 않는다.
 * - 값은 0 ~ `yMax` 로 자른다. 도메인 밖 x 는 plot 밖으로 잘린다.
 *
 * @example
 * ```tsx
 * <WidgetFrame
 *   title="디스크 고갈 추세"
 *   summary="추세 6시간 · 지평 24시간"
 *   legend={[
 *     { label: "ip-10-21-13-171 /data", color: "var(--color-status-error)" },
 *     { label: "dev-yard /backup", color: "var(--color-chart-neutral)" },
 *   ]}
 * >
 *   <ForecastLineChart
 *     frame={false}
 *     unit="%"
 *     xDomain={[-6, 24]}
 *     xLabels={[{ x: -6, label: "-6h" }, { x: 24, label: "+24h" }]}
 *     threshold={{ value: 90, label: "임계 90%" }}
 *     series={series}
 *     ariaLabel="마운트별 디스크 사용률 추세와 고갈 예상 시점"
 *   />
 * </WidgetFrame>
 * ```
 */

/** Y축 눈금 칸 폭: 모든 그래프가 같은 토큰을 쓴다. */
const GUTTER = "var(--wds-widget-axis-gutter)";
const PAD_RIGHT = 8;
const PAD_BOTTOM = 14;
/** 천장 위 도달 글자가 잘리지 않을 만큼. */
const PAD_TOP = 14;
/** highlightId 가 있을 때 나머지 계열의 불투명도. */
const DIM_OPACITY = 0.22;
/** SVG 내부 좌표: preserveAspectRatio="none" 으로 plot 에 맞춰 늘인다. 선 굵기는 non-scaling-stroke. */
const VB = 1000;

export type ForecastPoint = { x: number; y: number };

export type ForecastLineChartSeries = {
  /** 계열 식별자. `highlightId` 와 맞춘다. */
  id: string;
  /** 계열 이름. 범례는 WidgetFrame `legend` 가 그린다. */
  label: string;
  /** 선 · 마커 색 토큰(`var(--color-chart-series-1)` · `var(--color-status-error)` · `var(--color-chart-neutral)`). */
  color: string;
  /** 관측: 실선. x 오름차순. 마지막 점에 지금 값 점을 찍는다. */
  observed: ForecastPoint[];
  /** 예측: 점선. 보통 관측의 마지막 점(x = 0)에서 시작한다. */
  forecast?: ForecastPoint[];
  /** 예측이 천장 · 임계에 닿는 자리. 빈 원 마커와 `label`(「약 5시간 후」)을 적는다. */
  reach?: ForecastPoint & { label?: string };
};

export type ForecastLineChartProps = {
  series: ForecastLineChartSeries[];
  /** x 범위(도메인 단위). 음수 = 과거, 0 = 지금, 양수 = 미래. */
  xDomain: [number, number];
  /** X축 글자. 도메인 좌표에 놓는다. x = 0 자리는 `nowLabel` 이 쓴다. */
  xLabels?: { x: number; label: string }[];
  /** x = 0 세로선 아래 글자. 0 이 도메인 안일 때만 그린다. 기본 「지금」. */
  nowLabel?: string;
  /** Y축 최대(천장). 기본 100. */
  yMax?: number;
  /** Y축 글자 뒤 단위(「%」). */
  unit?: string;
  /** 임계선(점선) + 그 위 옅은 띠. `tone` 기본 critical. `label` 기본은 값 + 단위. */
  threshold?: { value: number; label?: string; tone?: "critical" | "warning" };
  /** 이 계열만 진하게, 나머지는 흐리게. */
  highlightId?: string | null;
  /**
   * 자기 바깥 좌우 여백(8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0: [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
  /** 스크린리더용 설명 — 필수. `role="img"` 는 이름이 없으면 보조기술에 빈 그림으로 남는다. */
  ariaLabel: string;
};

const THRESHOLD_TONE = {
  critical: { line: "var(--color-status-error)", band: "var(--color-status-error-soft)" },
  warning: { line: "var(--color-status-warning)", band: "var(--color-status-warning-soft)" },
} as const;

function formatY(v: number): string {
  if (v >= 1000) return Math.round(v / 100) / 10 + "K";
  return Number.isInteger(v) ? String(v) : v.toFixed(0);
}

export default function ForecastLineChart({
  series,
  xDomain,
  xLabels = [],
  nowLabel = "지금",
  yMax = 100,
  unit = "",
  threshold,
  highlightId = null,
  frame = true,
  ariaLabel,
}: ForecastLineChartProps) {
  const [x0, x1] = xDomain;
  const span = x1 - x0 || 1;
  /** 도메인 x → plot 가로 비율(0~1). */
  const rx = (x: number) => (x - x0) / span;
  /** 값 → plot 세로 비율(0 = 천장, 1 = 바닥). */
  const ry = (y: number) => 1 - Math.min(yMax, Math.max(0, y)) / (yMax || 1);
  const pts = (list: ForecastPoint[]) => list.map((p) => `${rx(p.x) * VB},${ry(p.y) * VB}`).join(" ");

  const plotW = `(100% - ${GUTTER} - ${PAD_RIGHT}px)`;
  const plotH = `(100% - ${PAD_TOP + PAD_BOTTOM}px)`;
  /** HTML overlay 좌표: SVG 와 같은 plot 비율을 쓴다(patterns §5). */
  const left = (ratio: number) => `calc(${GUTTER} + ${plotW} * ${ratio})`;
  const top = (ratio: number) => `calc(${PAD_TOP}px + ${plotH} * ${ratio})`;

  const showNow = x0 <= 0 && 0 <= x1;
  const tone = THRESHOLD_TONE[threshold?.tone ?? "critical"];
  const yTicks = [1, 0.5, 0];
  /* 강조 계열을 맨 뒤에 그려 위로 올린다. */
  const ordered = highlightId ? [...series.filter((s) => s.id !== highlightId), ...series.filter((s) => s.id === highlightId)] : series;
  const opacityOf = (s: ForecastLineChartSeries) => (highlightId && s.id !== highlightId ? DIM_OPACITY : 1);
  const axisLabels = xLabels.filter((l) => !(showNow && l.x === 0) && l.x >= x0 && l.x <= x1);

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full"
      style={{ padding: frame ? "0 8px" : 0 }}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex-1 min-h-0 relative">
        {/* 임계 띠: 임계부터 천장까지. 판정 경계가 화면에 있어야 대조가 된다 */}
        {threshold && threshold.value < yMax && (
          <div
            className="absolute"
            style={{ left: GUTTER, right: PAD_RIGHT, top: PAD_TOP, height: `calc(${plotH} * ${ry(threshold.value)})`, background: tone.band }}
          />
        )}

        {/* 격자: 눈금마다 점선 (천장 포함) */}
        {yTicks.map((ratio) => (
          <div
            key={`grid-${ratio}`}
            className="absolute"
            style={{ left: GUTTER, right: PAD_RIGHT, top: top(1 - ratio), height: 0, borderTop: "1px dashed var(--color-border-default)" }}
          />
        ))}

        {/* 임계선 */}
        {threshold && (
          <div
            className="absolute"
            style={{ left: GUTTER, right: PAD_RIGHT, top: top(ry(threshold.value)), height: 0, borderTop: `1px dashed ${tone.line}` }}
          />
        )}

        {/* 지금: 왼쪽은 관측, 오른쪽은 예측 */}
        {showNow && (
          <div
            className="absolute bg-color-var-color-border-divider"
            style={{ left: left(rx(0)), top: PAD_TOP, bottom: PAD_BOTTOM, width: 1 }}
          />
        )}

        {/* 선: 관측 실선 · 예측 점선 */}
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          preserveAspectRatio="none"
          className="absolute overflow-hidden"
          style={{ left: GUTTER, top: PAD_TOP, width: `calc(${plotW})`, height: `calc(${plotH})` }}
          aria-hidden
        >
          {ordered.map((s) => (
            <g key={s.id} opacity={opacityOf(s)}>
              {s.observed.length > 1 && (
                <polyline
                  points={pts(s.observed)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {s.forecast && s.forecast.length > 1 && (
                <polyline
                  points={pts(s.forecast)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </g>
          ))}
        </svg>

        {/* 축: 선 위에 그려 바닥선이 묻히지 않게 */}
        <div className="absolute bg-color-var-color-border-divider" style={{ left: GUTTER, right: PAD_RIGHT, bottom: PAD_BOTTOM, height: 1 }} />
        <div className="absolute bg-color-var-color-border-divider" style={{ left: GUTTER, top: PAD_TOP, bottom: PAD_BOTTOM, width: 1 }} />

        {/* 마커: 지금 값 점 · 도달 원. 선과 같은 plot 좌표 */}
        {ordered.map((s) => {
          const last = s.observed[s.observed.length - 1];
          return (
            <div key={`m-${s.id}`} className="absolute inset-0 pointer-events-none" style={{ opacity: opacityOf(s) }}>
              {last && (
                <span
                  className="absolute rounded-full"
                  style={{ left: left(rx(last.x)), top: top(ry(last.y)), width: 6, height: 6, background: s.color, transform: "translate(-50%, -50%)" }}
                />
              )}
              {s.reach && s.reach.x >= x0 && s.reach.x <= x1 && (
                <>
                  <span
                    className="absolute rounded-full bg-card"
                    style={{
                      left: left(rx(s.reach.x)),
                      top: top(ry(s.reach.y)),
                      width: 9,
                      height: 9,
                      border: `2px solid ${s.color}`,
                      boxSizing: "border-box",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  {s.reach.label && (
                    <span
                      className="absolute text-chart font-medium text-primary leading-none whitespace-nowrap bg-card rounded-2px"
                      style={{
                        fontFamily: "var(--font-family-korean)",
                        left: left(rx(s.reach.x)),
                        top: `calc(${top(ry(s.reach.y))} - 7px)`,
                        transform: "translate(-50%, -100%)",
                        padding: "1px 2px",
                      }}
                    >
                      {s.reach.label}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* 글자: px 고정 */}
        <div className="absolute inset-0 pointer-events-none">
          {threshold && (
            <span
              className="absolute text-chart text-secondary leading-none whitespace-nowrap"
              style={{
                fontFamily: "var(--font-family-numeric)",
                right: PAD_RIGHT + 2,
                top: `calc(${top(ry(threshold.value))} - 2px)`,
                transform: "translateY(-100%)",
              }}
            >
              {threshold.label ?? formatY(threshold.value) + unit}
            </span>
          )}
          {yTicks.map((ratio) => (
            <span
              key={ratio}
              className="absolute text-chart text-tertiary leading-none"
              style={
                {
                  fontFamily: "var(--font-family-numeric)",
                  top: top(1 - ratio),
                  transform: "translateY(-50%)",
                  left: 0,
                  textAlign: "right",
                  paddingRight: 4,
                  width: GUTTER,
                } as CSSProperties
              }
            >
              {formatY(yMax * ratio) + unit}
            </span>
          ))}
          {axisLabels.map((l) => {
            const ratio = rx(l.x);
            return (
              <span
                key={`x-${l.x}`}
                className="absolute text-chart text-tertiary leading-none whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-family-numeric)",
                  left: left(ratio),
                  bottom: 2,
                  transform: ratio <= 0 ? "translateX(0)" : ratio >= 1 ? "translateX(-100%)" : "translateX(-50%)",
                }}
              >
                {l.label}
              </span>
            );
          })}
          {showNow && nowLabel && (
            <span
              className="absolute text-chart text-tertiary leading-none whitespace-nowrap"
              style={{
                fontFamily: "var(--font-family-numeric)",
                left: left(rx(0)),
                bottom: 2,
                transform: rx(0) <= 0 ? "translateX(0)" : rx(0) >= 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {nowLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties } from "react";
import ChartTimeAxis from "./ChartTimeAxis";

/**
 * ApdexChart — Apdex(× 100) 를 만족 구간 띠 위에 선과 값으로. Composite layer.
 *
 * ## Purpose
 * Apdex 는 숫자 하나로는 «좋은가» 가 읽히지 않는다. 71.2 가 괜찮은지는 구간 경계(94 · 85 · 70)를 알아야 판단된다.
 * 그래서 Excellent · Good · Poor · Unacceptable 네 띠를 깔고, 그 위에 추이 선과 지금 값을 얹는다. 띠의 높이는 경계값에서
 * 계산한다(50 ~ 100 축) — 띠를 임의 비율로 그리면 선이 어느 구간에 있는지 거짓말을 한다.
 *
 * 축은 다른 그래프와 같은 규칙을 쓴다. Y축 눈금 칸 `--wds-widget-axis-gutter`(경계 숫자를 적는다) · 아래 여백 14 · 축 글자
 * `text-chart`. 그래서 한 줄의 [[MiniBarChart]] · [[MiniMultiLineChart]] 와 Y축 선 · X축 선이 같은 자리에 선다.
 *
 * ## When to use
 * - 애플리케이션 대시보드의 Apdex 칸.
 *
 * ## When NOT to use
 * - 경계 없는 일반 비율 · 사용률 → [[MiniMultiLineChart]] · [[UsageGauge]].
 * - 경계가 다른 점수(SLO 달성률 등) → 이 컴포넌트의 경계는 Apdex 표준으로 고정이다. 다른 점수를 Apdex 띠에 얹지 않는다.
 *
 * ## Composition rules
 * - X축 시간 글자는 [[ChartTimeAxis]] 가 놓는다(양 끝 안쪽 정렬, patterns §26).
 * - 껍데기(카드 · 제목 · 메뉴)는 그리지 않는다. 대시보드 칸에서는 [[WidgetFrame]] 이 맡는다(patterns §15). 제목은 「Apdex」.
 * - `frame={false}` 면 바깥 좌우 여백(8px)을 뺀다. WidgetFrame 안에서는 늘 `frame={false}`.
 * - 띠 · 구간 이름 색은 Apdex 토큰(`--color-chart-apdex-*-bg` · `--color-chart-apdex-*`), 선은 `--color-chart-series-1`.
 *   구간 이름이 띠 안에 있으므로 따로 범례를 두지 않는다.
 * - 값은 0 ~ 100(Apdex × 100). 50 아래는 바닥에 붙는다.
 *
 * @example
 * ```tsx
 * <WidgetFrame title="Apdex" summary="× 100">
 *   <ApdexChart frame={false} value={71.2} values={trend} xLabels={X} />
 * </WidgetFrame>
 * ```
 */

const GUTTER = "var(--wds-widget-axis-gutter)";
const PAD_RIGHT = 8;
const PAD_BOTTOM = 14;
const PAD_TOP = 4;
const MIN = 50;
const MAX = 100;

/** Apdex × 100 표준 경계. 위에서 아래로. */
const ZONES = [
  { name: "Excellent", from: 94, to: 100, bg: "var(--color-chart-apdex-excellent-bg)", fg: "var(--color-chart-apdex-excellent)" },
  { name: "Good", from: 85, to: 94, bg: "var(--color-chart-apdex-good-bg)", fg: "var(--color-chart-apdex-good)" },
  { name: "Poor", from: 70, to: 85, bg: "var(--color-chart-apdex-poor-bg)", fg: "var(--color-chart-apdex-poor)" },
  { name: "Unacceptable", from: MIN, to: 70, bg: "var(--color-chart-apdex-unacceptable-bg)", fg: "var(--color-chart-apdex-unacceptable)" },
] as const;
const TICKS = [100, 94, 85, 70, 50];

export type ApdexChartProps = {
  /** 지금 값(Apdex × 100). 가운데 크게 적는다. */
  value: number;
  /** 추이(Apdex × 100). 비면 선을 그리지 않는다. */
  values?: number[];
  /** X축 글자. */
  xLabels?: string[];
  /**
   * 자기 바깥 좌우 여백(8px)을 둘지. 기본 `true`.
   * `false` 면 여백 0 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

const ratioOf = (v: number) => (Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN);

export default function ApdexChart({ value, values = [], xLabels = [], frame = true }: ApdexChartProps) {
  const plotH = `(100% - ${PAD_TOP + PAD_BOTTOM}px)`;
  const VBW = 1000;
  const VBH = 1000;
  const pts = values.map((v, i) => `${values.length > 1 ? (i / (values.length - 1)) * VBW : 0},${(1 - ratioOf(v)) * VBH}`).join(" ");

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0 }}>
      <div className="flex-1 min-h-0 relative">
        {/* 구간 띠 — 경계값으로 높이를 계산한다 */}
        <div className="absolute flex flex-col" style={{ left: GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM }}>
          {ZONES.map((z) => (
            <div
              key={z.name}
              className="flex items-end w-full min-h-0"
              style={{ background: z.bg, flex: `${z.to - z.from} 0 0`, padding: "0 4px" }}
            >
              <span className="text-xs leading-normal whitespace-nowrap" style={{ fontFamily: "var(--font-family-numeric)", color: z.fg }}>
                {z.name}
              </span>
            </div>
          ))}
        </div>

        {/* 추이 선 */}
        {values.length > 1 && (
          <svg
            viewBox={`0 0 ${VBW} ${VBH}`}
            preserveAspectRatio="none"
            className="absolute"
            style={{ left: GUTTER, top: PAD_TOP, width: `calc(100% - ${GUTTER} - ${PAD_RIGHT}px)`, height: `calc(${plotH})` }}
          >
            <polyline points={pts} fill="none" stroke="var(--color-chart-series-1)" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        )}

        {/* 축 */}
        <div className="absolute bg-color-var-color-border-divider" style={{ left: GUTTER, right: PAD_RIGHT, bottom: PAD_BOTTOM, height: 1 }} />
        <div className="absolute bg-color-var-color-border-divider" style={{ left: GUTTER, top: PAD_TOP, bottom: PAD_BOTTOM, width: 1 }} />

        {/* 지금 값 */}
        <span
          className="absolute text-3xl text-primary leading-none whitespace-nowrap"
          style={{
            fontFamily: "var(--font-family-numeric)",
            fontWeight: "var(--font-weight-regular)",
            left: `calc(${GUTTER} + (100% - ${GUTTER} - ${PAD_RIGHT}px) / 2)`,
            top: `calc(${PAD_TOP}px + ${plotH} / 2)`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {value}
        </span>

        {/* 글자 — 경계 숫자 · X축 */}
        <div className="absolute inset-0 pointer-events-none">
          {TICKS.map((t) => (
            <span
              key={t}
              className="absolute text-chart text-tertiary leading-none"
              style={
                {
                  fontFamily: "var(--font-family-numeric)",
                  top: `calc(${PAD_TOP}px + ${plotH} * ${1 - ratioOf(t)})`,
                  transform: "translateY(-50%)",
                  left: 0,
                  textAlign: "right",
                  paddingRight: 4,
                  width: GUTTER,
                } as CSSProperties
              }
            >
              {t}
            </span>
          ))}
          <ChartTimeAxis labels={xLabels} right={PAD_RIGHT} />
        </div>
      </div>
    </div>
  );
}

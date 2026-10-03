/**
 * MiniMultiLineChart — 카드형 다중 시리즈 line/area chart.
 *
 * ## Purpose
 * 백분위(p50/p95/p99), 입출력 토큰, 상태 코드 등 2–3 계열을 한 카드에 겹쳐
 * 보여야 하는 모니터링 지표 카드. 단일 시리즈 + 통계값 레이아웃도 지원한다.
 *
 * ## When to use
 * - 지표 2–3 개의 시계열을 겹쳐 비교 (백분위, 입출력, 상태 코드)
 * - 단일 시리즈 + legend + 통계값 조합 (MiniLineChart 와 다른 레이아웃)
 *
 * ## When NOT to use
 * - 단일 시리즈 + peak ▼ 마커가 필요한 요약 뷰 → [[MiniLineChart]]
 * - 격자형 빈도 → [[EventWeekTimeMatrix]]
 *
 * ## Composition rules
 * MiniLineChart 와 동일한 SVG 좌표계·텍스트 정책:
 * - viewBox 는 plot 영역과 비례 (1000 × 1000), preserveAspectRatio="none"
 * - 글자는 SVG 밖 HTML overlay (px 고정)
 * - stroke 는 vectorEffect="non-scaling-stroke"
 * - 색은 var(--color-chart-series-N) 토큰 — hex 금지
 *
 * MiniLineChart 와 다른 점:
 * - 외부 grid cell 높이를 채움 (h-full)
 * - chart 영역이 flex-1 (높이 가변)
 * - legend 행 + 통계값 행 + footer 슬롯
 *
 * @example
 * ```tsx
 * <MiniMultiLineChart
 *   title="백분위 TTFT"
 *   series={[
 *     { label: "p50", values: p50Data, color: "var(--color-chart-series-6)" },
 *     { label: "p95", values: p95Data, color: "var(--color-chart-series-2)" },
 *     { label: "p99", values: [],      color: "var(--color-chart-series-8)" },
 *   ]}
 * />
 * ```
 */
import type { CSSProperties, ReactNode } from "react";
import AiTriggerButton from "./widget/TriggerButton";

const PAD_LEFT = 28;
const PAD_RIGHT = 8;
const PAD_BOTTOM = 14;
const PAD_TOP = 4;

export type MiniMultiLineChartSeries = {
  /** legend 라벨. 빈 문자열이면 legend 에서 숨김. */
  label: string;
  /** Y-axis 데이터. 빈 배열이면 legend 에만 표시하고 선은 그리지 않음. */
  values: number[];
  /** 선/면 색. var(--color-chart-series-N) 토큰 권장. */
  color: string;
  /** true 이면 선 아래를 12% 투명도 면으로 채움. 기본 false. */
  showArea?: boolean;
};

export type MiniMultiLineChartProps = {
  title: string;
  series: MiniMultiLineChartSeries[];
  xLabels?: string[];
  /** Y축 라벨에 붙는 단위 (예: "ms", "%"). */
  unit?: string;
  /** 차트 위 통계값 (예: "45.87ms"). */
  stat?: string;
  /** stat 옆 단위 (예: "tok/s"). */
  statUnit?: string;
  /** stat 옆 보조 정보. */
  statSub?: ReactNode;
  /** 차트 아래 footer. */
  footer?: ReactNode;
  /** stagger 진입 애니메이션 delay(ms). */
  delay?: number;
  onAiTrigger?: (ctx: {
    metric: string;
    series: { label: string; values: number[] }[];
  }) => void;
  aiTriggerReveal?: "always" | "hover";
  aiTriggerTooltip?: string;
};

export default function MiniMultiLineChart({
  title,
  series,
  xLabels = ["13:27", "13:28", "13:30", "13:32", "13:34", "13:36", "13"],
  unit = "",
  stat,
  statUnit,
  statSub,
  footer,
  delay,
  onAiTrigger,
  aiTriggerReveal = "always",
  aiTriggerTooltip = "이 차트를 WhaTap AI로 분석",
}: MiniMultiLineChartProps) {
  const VBW = 1000;
  const VBH = 1000;

  /* ── 통합 스케일 ──────────────────────────────────────────────────── */
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(0, ...allValues);
  const yMaxNice = niceMax(max);

  /* ── 시리즈별 polyline 데이터 ─────────────────────────────────────── */
  const plotSeries = series
    .filter((s) => s.values.length > 0)
    .map((s) => {
      const stepX = s.values.length > 1 ? VBW / (s.values.length - 1) : 0;
      const pts = s.values.map((v, i) => {
        const x = i * stepX;
        const y = yMaxNice > 0 ? VBH * (1 - v / yMaxNice) : VBH;
        return [x, y] as const;
      });
      const polyStr = pts
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      const areaStr =
        pts.length > 0
          ? `0,${VBH} ${polyStr} ${((pts.length - 1) * stepX).toFixed(1)},${VBH}`
          : "";
      return { ...s, polyStr, areaStr };
    });

  const yTicks = yMaxNice > 0 ? [1, 0.5, 0] : [0];
  const hasLegend = series.some((s) => s.label);

  return (
    <div
      className={`group flex flex-col h-full bg-card border border-color-var-color-border-default rounded-4px overflow-hidden p-12px gap-4px${delay !== undefined ? " ai-anim-in" : ""}`}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* ── Header + Legend (한 줄) ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-6px shrink-0">
        <div className="flex items-center gap-3px min-w-0">
          <span
            className="text-base font-bold text-primary tracking-default leading-none truncate"
            style={{ fontFamily: "var(--font-family-korean)" }}
            title={title}
          >
            {title}
          </span>
          {onAiTrigger ? (
            <AiTriggerButton
              reveal={aiTriggerReveal}
              tooltip={aiTriggerTooltip}
              onClick={() =>
                onAiTrigger({
                  metric: title,
                  series: series.map((s) => ({
                    label: s.label,
                    values: s.values,
                  })),
                })
              }
            />
          ) : (
            <span className="flex items-center cursor-pointer opacity-0 group-hover-opacity-100 transition-opacity">
              <InfoIcon />
            </span>
          )}
        </div>
        <div className="flex items-center gap-8px shrink-0">
          {/* Legend — 헤더 우측에 배치 */}
          {hasLegend &&
            series
              .filter((s) => s.label)
              .map((s, i) => (
                <span key={i} className="flex items-center gap-3px">
                  <span
                    className="inline-block rounded-1px shrink-0"
                    style={{ width: 8, height: 2, background: s.color }}
                  />
                  <span className="text-chart text-tertiary whitespace-nowrap">
                    {s.label}
                  </span>
                </span>
              ))}
          <MenuDots />
        </div>
      </div>

      {/* ── Stat ──────────────────────────────────────────────────────── */}
      {stat && (
        <div className="flex items-baseline gap-4px shrink-0">
          <span
            className="text-base font-bold text-primary leading-none"
            style={{ fontFamily: "var(--font-family-numeric)" }}
          >
            {stat}
          </span>
          {statUnit && (
            <span className="text-chart text-tertiary leading-none">
              {statUnit}
            </span>
          )}
          {statSub}
        </div>
      )}

      {/* ── Chart area (flex-1) ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        {/* X-axis line */}
        <div
          className="absolute bg-color-var-color-border-divider"
          style={{
            left: PAD_LEFT,
            right: PAD_RIGHT,
            bottom: PAD_BOTTOM,
            height: 1,
          }}
        />
        {/* Y-axis line */}
        <div
          className="absolute bg-color-var-color-border-divider"
          style={{
            left: PAD_LEFT,
            top: PAD_TOP,
            bottom: PAD_BOTTOM,
            width: 1,
          }}
        />
        {/* Y축 수평 그리드 라인 — 모든 tick 위치에 점선 */}
        {yTicks.map((ratio) => (
          <div
            key={`grid-${ratio}`}
            className="absolute"
            style={{
              left: PAD_LEFT,
              right: PAD_RIGHT,
              top: `calc(${PAD_TOP}px + (100% - ${PAD_TOP + PAD_BOTTOM}px) * ${1 - ratio})`,
              height: 0,
              borderTop: "1px dashed var(--color-border-default)",
              opacity: 0.5,
            }}
          />
        ))}

        {/* SVG — plot 영역에만 absolute 배치 */}
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          className="absolute"
          style={{
            left: PAD_LEFT,
            top: PAD_TOP,
            width: `calc(100% - ${PAD_LEFT + PAD_RIGHT}px)`,
            height: `calc(100% - ${PAD_TOP + PAD_BOTTOM}px)`,
          }}
        >
          {plotSeries.map((s, i) => (
            <g key={i}>
              {s.showArea && s.areaStr && (
                <polyline
                  points={s.areaStr}
                  fill={s.color}
                  fillOpacity={0.12}
                  stroke="none"
                />
              )}
              <polyline
                points={s.polyStr}
                fill="none"
                stroke={s.color}
                strokeWidth="1.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        {/* HTML overlay — px 고정 텍스트 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Y축 라벨 */}
          {yTicks.map((ratio) => (
            <span
              key={ratio}
              className="absolute text-chart text-tertiary leading-none"
              style={
                {
                  fontFamily: "var(--font-family-numeric)",
                  top: `calc(${PAD_TOP}px + (100% - ${PAD_TOP + PAD_BOTTOM}px) * ${1 - ratio})`,
                  transform: "translateY(-50%)",
                  left: 0,
                  textAlign: "right",
                  paddingRight: 4,
                  width: PAD_LEFT,
                } as CSSProperties
              }
            >
              {formatY(yMaxNice * ratio) + unit}
            </span>
          ))}

          {/* X축 시간 라벨 */}
          {xLabels.map((label, i) => {
            const ratio = i / (xLabels.length - 1);
            return (
              <span
                key={i}
                className="absolute text-chart text-tertiary leading-none whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-family-numeric)",
                  left: `calc(${PAD_LEFT}px + (100% - ${PAD_LEFT + PAD_RIGHT}px) * ${ratio})`,
                  bottom: 2,
                  transform:
                    i === 0
                      ? "translateX(0)"
                      : i === xLabels.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}

/* ── Helpers (MiniLineChart 와 동일) ───────────────────────────────── */

function niceMax(v: number): number {
  if (v <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 4) nice = 4;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

function formatY(v: number): string {
  if (v >= 1000) return Math.round(v / 100) / 10 + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(0);
}

function InfoIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="6"
        cy="6"
        r="5.2"
        stroke="var(--color-border-divider)"
        strokeWidth="1"
        fill="none"
      />
      <line
        x1="6"
        y1="5.4"
        x2="6"
        y2="8.4"
        stroke="var(--color-border-divider)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="3.6" r="0.6" fill="var(--color-border-divider)" />
    </svg>
  );
}

function MenuDots() {
  return (
    <button
      type="button"
      aria-label="더보기"
      className="flex items-center justify-center size-16px rounded-2px cursor-pointer hover-bg-surface-100 shrink-0"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="7" cy="3" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="7" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="11" r="1" fill="var(--color-text-tertiary)" />
      </svg>
    </button>
  );
}

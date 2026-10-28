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
 * ## Metrics
 * - ✅ 단위 · 범위가 같은 2~3 계열 — 응답시간 p50 · p95 · p99 · 입력 · 출력 토큰 · 송신 · 수신(bps) · 2xx · 4xx · 5xx 건수
 * - ✅ 같은 지표의 대상 비교(서버 2~3대 CPU)
 * - ✅ 표준 경계가 있는 지표의 대상별 추이(`threshold`) — LCP(2.5s) · INP(200ms) · CLS(0.25) 의 페이지 · 브라우저별 p75
 * - ❌ 단위나 범위가 다른 두 지표(TPS 와 응답시간) — 이중 축 금지(§19), 칸을 나눈다
 * - ❌ 대상이 많아 선이 엉키는 비교(서버 10대) → [[BarList]] TOP-N 또는 칸 나누기
 *
 * ## Composition rules
 * - 플롯을 가리키면 [[ChartCrosshair]] 가 시점 안내선 · 계열마다 점 · 값 툴팁을 보인다(제목 = `pointLabels`). 헤더 범례 항목을 가리키면 그 선만 굵게(2px) 남기고 나머지를 흐린다(patterns §26 «강조»).
 * - X축 시간 글자는 [[ChartTimeAxis]] 가 놓는다(양 끝 안쪽 정렬, patterns §26).
 * - 값축 · 격자는 [[ChartGrid]](마크 아래) · [[ChartValueAxis]](마크 위)를 조합한다 — 차트 안에서 다시 그리지 않는다(patterns §26). 그래서 Composite 계층이다.
 * - `frame={false}` 면 **본문만** 그린다(카드 표면 · 테두리 · 안쪽 여백 · 제목 줄 · ⋮ · 헤더 범례 · AI 트리거를 뺀다).
 *   [[WidgetFrame]] 안에 넣을 때 쓴다. 제목은 WidgetFrame `title`, 범위는 `meta`, 범례는 `legend`(시리즈 색 그대로),
 *   메뉴는 `onFullscreen` · `menu` 가 맡는다(patterns §15). 통계값(`stat`) · `footer` 는 본문이라 남는다.
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
 * 선 끝 값 배지 (`series[].endLabel`, patterns §25):
 * - 계열마다 지금 값을 선이 끝나는 자리 오른쪽에 배지로 단다. 회색 다발 위 강조 계열(§22)처럼 범례 한 줄에
 *   값을 다 싣지 못할 때 쓴다. 계열이 넷 이하면 배지 대신 [[WidgetFrame]] `legend[].value`.
 * - 이름이 빈 계열(회색 다발)에는 달지 않는다. 한 차트에 다섯까지. 넘는 배지는 그리지 않는다.
 * - 배지가 있으면 플롯 오른쪽에 배지 칸(`--wds-widget-end-gutter`)을 비운다. 배지는 플롯 밖에 서서 선을 가리지 않는다.
 * - 글자는 카드 바탕 위 `text-primary`, 계열 색은 테두리와 선 끝 점만 맡는다(§17: 글자에 계열 색을 쓰지 않는다).
 * - 배지끼리 겹치면 위아래로 밀어 띄운다. 선 끝 점은 제자리에 남는다.
 *
 * 임계 띠 (`threshold`):
 * - 판정 경계가 표준으로 정해진 지표(Core Web Vitals LCP 2.5s · INP 200ms · CLS 0.25)에서 경계를 그림 위에 긋는다.
 *   배너 · 판정 칩의 숫자를 사용자가 그림에서 바로 대조하게 한다. 모양은 [[ForecastLineChart]] `threshold` 와 같다.
 * - 임계선은 점선, 그 위(임계 ~ 천장)는 옅은 띠, 이름은 선 위 오른쪽 끝. 색은 `tone`(critical · warning)이 정한다.
 *   선은 `--color-status-*`, 띠는 `--color-status-*-soft`, 이름 글자는 text 토큰.
 * - 값축 상한은 임계 값까지 포함해 잡는다. 계열이 모두 임계 아래여도 경계가 그림 밖으로 나가지 않는다.
 * - 임계는 하나. 경계가 둘인 점수(Good · Needs improvement · Poor 를 모두 긋기)는 [[ApdexChart]] 처럼 전용 차트로.
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
import { useEffect, useRef, useState, type ReactNode } from "react";
import ChartGrid from "./ChartGrid";
import ChartLegendItem from "./ChartLegendItem";
import ChartCrosshair from "./ChartCrosshair";
import ChartTimeAxis from "./ChartTimeAxis";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER as GUTTER, formatAxisValue, niceMax } from "./_axisScale";
import AiTriggerButton from "../widget/TriggerButton";

const PAD_RIGHT = 8;
/** 선 끝 값 배지 칸 폭. 배지가 있을 때만 플롯 오른쪽을 이만큼 비운다. */
const END_GUTTER = "var(--wds-widget-end-gutter)";
/** 배지 한 개 높이(9px 글자 + 위아래 1px 여백 + 테두리) + 사이 1px. 겹침을 밀어낼 때의 최소 간격. */
const BADGE_STEP = 14;
/** 한 차트에 다는 배지 상한. §22 강조 권장 상한과 같다. */
const MAX_BADGES = 5;
const PAD_BOTTOM = 14;
const PAD_TOP = 4;
/** 임계 띠 색 — [[ForecastLineChart]] 와 같은 짝. 선은 상태색, 띠는 그 soft. */
const THRESHOLD_TONE = {
  critical: { line: "var(--color-status-error)", band: "var(--color-status-error-soft)" },
  warning: { line: "var(--color-status-warning)", band: "var(--color-status-warning-soft)" },
} as const;

export type MiniMultiLineChartSeries = {
  /** legend 라벨. 빈 문자열이면 legend 에서 숨김. */
  label: string;
  /** Y-axis 데이터. 빈 배열이면 legend 에만 표시하고 선은 그리지 않음. */
  values: number[];
  /** 선/면 색. var(--color-chart-series-N) 토큰 권장. */
  color: string;
  /** true 이면 선 아래를 12% 투명도 면으로 채움. 기본 false. */
  showArea?: boolean;
  /**
   * 선 끝 값 배지 글자(단위 포함, 예: "86%"). 주면 선이 끝나는 자리 오른쪽에 배지가 선다(patterns §25).
   * 이름(`label`)이 빈 계열에는 달지 않는다. 한 차트에 다섯까지.
   */
  endLabel?: string;
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
  /**
   * 껍데기(카드 표면 · 테두리 · 여백 · 제목 줄 · ⋮ · 헤더 범례)를 그릴지. 기본 `true`.
   * `false` 면 본문만 그린다. [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
  /** 시점마다 이름(「13:27:05」) — hover 툴팁 제목. 없으면 제목 없이. */
  pointLabels?: string[];
  /**
   * 임계선 · 그 위 옅은 띠. `value` 는 계열과 같은 단위. `label` 이 없으면 값 + `unit`.
   * `tone` 기본 critical. 값축 상한은 이 값까지 포함해 잡는다.
   */
  threshold?: { value: number; label?: string; tone?: "critical" | "warning" };
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
  frame = true,
  pointLabels,
  threshold,
}: MiniMultiLineChartProps) {
  /* 범례를 가리킨 계열 — 그 선만 남기고 나머지를 흐린다(patterns §26 «강조») */
  const [focus, setFocus] = useState<string | null>(null);
  const VBW = 1000;
  const VBH = 1000;

  /* ── 통합 스케일 ──────────────────────────────────────────────────── */
  const allValues = series.flatMap((s) => s.values);
  /* 임계가 있으면 상한에 넣는다 — 계열이 모두 아래여도 경계가 그림 안에 선다 */
  const max = Math.max(0, ...allValues, threshold?.value ?? 0);
  const yMaxNice = niceMax(max);
  const tone = THRESHOLD_TONE[threshold?.tone ?? "critical"];
  /** 임계의 plot 세로 비율(0 = 천장, 1 = 바닥). */
  const thresholdRatio = threshold && yMaxNice > 0 ? 1 - Math.min(threshold.value, yMaxNice) / yMaxNice : null;
  const plotH = `(100% - ${PAD_TOP + PAD_BOTTOM}px)`;

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

  /* ── 선 끝 값 배지: 이름 있는 계열만, 다섯까지 ──────────────────── */
  const badgeCandidates = series.filter((s) => s.values.length > 0 && s.label && s.endLabel);
  const badges = badgeCandidates.slice(0, MAX_BADGES).map((s) => {
    const last = s.values[s.values.length - 1];
    return { label: s.label, text: s.endLabel as string, color: s.color, ratio: yMaxNice > 0 ? 1 - last / yMaxNice : 1 };
  });
  const right = badges.length ? END_GUTTER : `${PAD_RIGHT}px`;

  /* 배지끼리 겹침을 밀어내려면 플롯 높이(px)가 필요하다. 재기 전에는 제자리(비율)에 둔다. */
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaH, setAreaH] = useState(0);
  useEffect(() => {
    const el = areaRef.current;
    if (!el || !badges.length || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => setAreaH(entries[0].contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [badges.length]);
  const badgeTops = spreadBadges(badges.map((b) => b.ratio), areaH - PAD_TOP - PAD_BOTTOM);

  const hasLegend = series.some((s) => s.label);

  return (
    <div
      className={`group flex flex-col h-full gap-4px ${frame ? "bg-card border border-color-var-color-border-default rounded-4px overflow-hidden p-12px" : "min-w-0"}${delay !== undefined ? " ai-anim-in" : ""}`}
      style={{
        ...(delay !== undefined ? { animationDelay: `${delay}ms` } : {}),
        /* 칸 안(frame=false)에서는 줄 간격을 위젯 토큰 하나로 — 범례 줄 · 통계값 · 그래프 사이가 칸마다 같다. */
        ...(frame ? {} : { gap: "var(--wds-widget-row-gap)" }),
      }}
    >
      {/* ── Header + Legend (한 줄) — frame 일 때만. WidgetFrame 안에서는 그쪽 머리 · 범례가 맡는다. ── */}
      {frame && (
      <div className="flex items-center justify-between gap-6px shrink-0">
        <div className="flex items-center gap-3px min-w-0">
          <span
            className="text-base font-bold text-primary tracking-default truncate"
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
                <ChartLegendItem
                  key={i}
                  color={s.color}
                  shape="line"
                  label={s.label!}
                  onHover={(on) => setFocus(on ? s.label! : null)}
                  dimmed={focus != null && focus !== s.label}
                />
              ))}
          <MenuDots />
        </div>
      </div>
      )}

      {/* ── Stat ──────────────────────────────────────────────────────── */}
      {stat && (
        <div className="flex items-baseline gap-4px shrink-0">
          <span
            className="text-base font-bold text-primary"
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
      <div ref={areaRef} className="flex-1 min-h-0 relative">
        {/* 임계 띠: 임계부터 천장까지. 판정 경계가 화면에 있어야 대조가 된다 */}
        {thresholdRatio != null && thresholdRatio > 0 && (
          <div
            className="absolute"
            style={{ left: GUTTER, right, top: PAD_TOP, height: `calc(${plotH} * ${thresholdRatio})`, background: tone.band }}
          />
        )}

        <ChartGrid max={yMaxNice} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={right} />

        {/* 임계선 */}
        {thresholdRatio != null && (
          <div
            className="absolute"
            style={{ left: GUTTER, right, top: `calc(${PAD_TOP}px + ${plotH} * ${thresholdRatio})`, height: 0, borderTop: `1px dashed ${tone.line}` }}
          />
        )}

        {/* SVG — plot 영역에만 absolute 배치 */}
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          className="absolute"
          style={{
            left: GUTTER,
            top: PAD_TOP,
            width: `calc(100% - ${GUTTER} - ${right})`,
            height: `calc(100% - ${PAD_TOP + PAD_BOTTOM}px)`,
          }}
        >
          {plotSeries.map((s, i) => (
            <g key={i} className={MARK_CLASS} opacity={focus != null && focus !== s.label ? DIM_OPACITY : 1}>
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
                strokeWidth={focus != null && focus === s.label ? 2 : 1.2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        {/* HTML overlay — px 고정 텍스트 */}
        <div className="absolute inset-0 pointer-events-none">
          <ChartValueAxis max={yMaxNice} unit={unit} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={right} />

          {/* 임계 이름: 선 위 오른쪽 끝 */}
          {threshold && thresholdRatio != null && (
            <span
              className="absolute text-chart text-secondary leading-none whitespace-nowrap"
              style={{
                fontFamily: "var(--font-family-numeric)",
                right: `calc(${right} + 2px)`,
                top: `calc(${PAD_TOP}px + ${plotH} * ${thresholdRatio} - 2px)`,
                transform: "translateY(-100%)",
              }}
            >
              {threshold.label ?? formatAxisValue(threshold.value) + unit}
            </span>
          )}

          {/* X축 시간 라벨 */}
          <ChartTimeAxis labels={xLabels} right={right} />

          {/* 선 끝 값 배지: 점은 선 끝 제자리, 배지는 플롯 밖 배지 칸에서 겹치지 않게 */}
          {badges.map((b, i) => (
            <span key={`end-${b.label}`}>
              <span
                aria-hidden
                className="absolute rounded-full"
                style={{
                  left: `calc(100% - ${right})`,
                  top: `calc(${PAD_TOP}px + (100% - ${PAD_TOP + PAD_BOTTOM}px) * ${b.ratio})`,
                  width: 5,
                  height: 5,
                  background: b.color,
                  transform: "translate(-50%, -50%)",
                }}
              />
              <span
                role="img"
                aria-label={`${b.label} ${b.text}`}
                className="absolute bg-card text-chart text-primary font-semibold leading-none whitespace-nowrap rounded-2px"
                style={{
                  fontFamily: "var(--font-family-numeric)",
                  left: `calc(100% - ${right} + 5px)`,
                  top: badgeTops ? badgeTops[i] : `calc(${PAD_TOP}px + (100% - ${PAD_TOP + PAD_BOTTOM}px) * ${b.ratio})`,
                  transform: "translateY(-50%)",
                  padding: "1px 3px",
                  border: `1px solid ${b.color}`,
                }}
              >
                {b.text}
              </span>
            </span>
          ))}
        </div>
        {/* 시점 고르기 — 안내선 · 계열마다 점 · 값 툴팁(patterns §26 «강조») */}
        <ChartCrosshair
          count={Math.max(0, ...series.map((s) => s.values.length))}
          max={yMaxNice}
          series={series.filter((s) => s.values.length > 0).map((s) => ({ label: s.label ?? "", color: s.color, values: s.values }))}
          labels={pointLabels}
          unit={unit}
          right={right}
          padTop={PAD_TOP}
          padBottom={PAD_BOTTOM}
        />
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}

/* ── Helpers (MiniLineChart 와 동일) ───────────────────────────────── */

/**
 * 배지 세로 위치(px) — 선 끝 높이에 두되, 이웃과 BADGE_STEP 보다 가까우면 아래로 밀고,
 * 바닥을 넘으면 위로 되민다. 플롯 높이를 아직 못 쟀으면 null(비율 위치를 쓴다).
 */
function spreadBadges(ratios: number[], plotH: number): number[] | null {
  if (plotH <= 0 || !ratios.length) return null;
  const order = ratios.map((r, i) => ({ i, y: PAD_TOP + plotH * r })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + BADGE_STEP);
  const bottom = PAD_TOP + plotH;
  if (order[order.length - 1].y > bottom) order[order.length - 1].y = bottom;
  for (let k = order.length - 2; k >= 0; k--) order[k].y = Math.min(order[k].y, order[k + 1].y - BADGE_STEP);
  const out: number[] = [];
  for (const o of order) out[o.i] = o.y;
  return out;
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

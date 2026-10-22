/**
 * MiniLineChart — 카드형 미니 line chart (모니터링 지표 요약).
 *
 * ## Purpose
 * DB/APM/GPU 등 모든 모니터링 페이지에서 재활용하는 작은 line chart 카드.
 * 헤더(타이틀 + ⓘ + 옵션 Top Stat + ⋮) + plot 영역 + peak ▼ 라벨로 구성.
 * 카드 폭에 맞춰 line/area 는 수평 확장하되 stroke 1px·글자 크기는 고정.
 *
 * ## When to use
 * - 지표 한 개의 시계열 추이를 작은 카드로 나열 (대시보드 grid, 사이드 패널)
 * - peak 값과 시간대만 빠르게 확인하면 되는 요약 view
 *
 * ## When NOT to use
 * - 요일×시간 같은 격자형 빈도 표현 → [[EventWeekTimeMatrix]]
 * - 진행 단계 표시 → [[DashboardBuildingProgress]]
 * - 정밀한 인터랙션(zoom·tooltip·다중 시리즈)이 필요한 본격 차트 → 전용 차트 라이브러리
 *
 * ## Composition rules
 * - X축 시간 글자는 [[ChartTimeAxis]] 가 놓는다(양 끝 안쪽 정렬, patterns §26).
 * - 값축 · 격자는 [[ChartGrid]](마크 아래) · [[ChartValueAxis]](마크 위)를 조합한다 — 차트 안에서 다시 그리지 않는다(patterns §26). 그래서 Composite 계층이다.
 * - 최고점은 [[ChartPeakMarker]] 가 그린다. 차트는 SVG 와 같은 식으로 최고점 좌표만 계산해 넘긴다(§5).
 * - `frame={false}` 면 **본문만** 그린다(카드 표면 · 테두리 · 안쪽 여백 · 제목 줄 · Top Stat · ⋮ · AI 트리거를 뺀다).
 *   [[WidgetFrame]] 안에 넣을 때 쓴다. 제목 · 범위 · 메뉴는 WidgetFrame 이 맡는다(patterns §15).
 * - **SVG font-size 단위 정책 (feedback-svg-text-units)**: SVG 내부에는 텍스트를
 *   두지 않음. Y축/X축/peak 값은 모두 SVG 밖 HTML overlay 로 px 고정 — `preserveAspectRatio="none"`
 *   로 가로 stretch 되는 SVG 안에 글자를 넣으면 폭에 따라 늘어나기 때문.
 * - **좌표 정합 (feedback-chart-peak-alignment)**: viewBox 는 plot 사각형과 동일 비율
 *   (`1000 × PLOT_H_PX`), SVG 는 plot 영역(`GUTTER`(--wds-widget-axis-gutter)/`PAD_RIGHT`/패딩)에만 absolute 배치.
 *   peak ▼/라벨은 동일 좌표계(`peakXRatio`/`peakYRatio`)로 찍어 폭과 무관하게 1:1 일치.
 * - stroke 는 `vectorEffect="non-scaling-stroke"` 로 1px 유지, area fill 은 color + alpha.
 * - 색은 토큰 (`color` 기본 `--color-brand-blue-soft`), 축선은 `--color-border-divider`.
 * - `delay` 지정 시에만 stagger 진입 애니메이션 적용.
 *
 * @example
 * ```tsx
 * <MiniLineChart
 *   title="CPU 사용률"
 *   values={[12, 30, 22, 80, 45, 60, 38]}
 *   unit="%"
 *   showTopStat
 *   delay={120}
 * />
 * ```
 */
import AiTriggerButton from "../widget/TriggerButton";
import ChartGrid from "./ChartGrid";
import ChartPeakMarker from "./ChartPeakMarker";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER as GUTTER, formatPeakValue, niceMax } from "./_axisScale";

const CHART_HEIGHT = 96;
const PAD_RIGHT = 8;
const PAD_TOP_PX = 14;
const PAD_BOTTOM_PX = 16;
const PLOT_H_PX = CHART_HEIGHT - PAD_TOP_PX - PAD_BOTTOM_PX;

export default function MiniLineChart({
  title,
  values,
  xLabels = ["13:27", "13:28", "13:30", "13:32", "13:34", "13:36", "13"],
  markerAt = 0.08,
  showTopStat = false,
  /** line/area 색상 (기본 라이브 토큰 blue) */
  color = "var(--color-chart-series-1)",
  areaColor,
  /** Y축 및 peak 라벨에 붙는 단위 (예: "%", "K") */
  unit = "",
  /** stagger 진입 애니메이션 delay(ms). undefined면 애니메이션 없음 */
  delay,
  /** WhaTap AI 트리거 — 지정 시 ⓘ 대신 AI 버튼 노출. 차트 컨텍스트를 콜백으로 전달. */
  onAiTrigger,
  /** AI 트리거 노출 방식: "always"(상시 표시, 숨쉬기로 시선 유도) | "hover"(카드 hover 시에만). 기본 always. */
  aiTriggerReveal = "always",
  /** AI 트리거 버튼 호버 설명(Tooltip). 페이지별 override 가능. 기본 "이 차트를 WhaTap AI로 분석". */
  aiTriggerTooltip = "이 차트를 WhaTap AI로 분석",
  frame = true,
}: {
  title: string;
  values: number[];
  xLabels?: string[];
  markerAt?: number;
  showTopStat?: boolean;
  color?: string;
  /**
   * 선 아래 면의 색. 미지정이면 `color` 를 12% 투명도로 깐다(기본 동작).
   *
   * 지정하면 **그 색을 그대로** 쓴다 — 선과 면을 다른 계열로 두어야 할 때(면은 중립,
   * 선만 강조 등)를 위한 것이다. hex 를 이어 붙여 알파를 만들지 않는다
   * (`color + "1f"` 같은 방식은 토큰 var() 에는 통하지 않고 다크에서 깨진다).
   */
  areaColor?: string;
  unit?: string;
  delay?: number;
  onAiTrigger?: (ctx: { metric: string; values: number[]; unit?: string; timeRange?: string }) => void;
  aiTriggerReveal?: "always" | "hover";
  aiTriggerTooltip?: string;
  /**
   * 껍데기(카드 표면 · 테두리 · 여백 · 제목 줄 · Top Stat · ⋮)를 그릴지. 기본 `true`.
   * `false` 면 본문만 그린다. [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
}) {
  // ★ 정책 (feedback-chart-peak-alignment):
  //   SVG viewBox는 plot 영역 자체와 정확히 동일한 비율을 가짐 → 라인의 peak
  //   좌표가 카드 폭과 무관하게 HTML overlay의 peak ▼/라벨 위치와 1:1 일치.
  //   SVG는 absolute로 plot 영역 (left=GUTTER, right=PAD_RIGHT, top/bottom 패딩)
  //   에만 그리고, 좌표계는 viewBox 1000 x PLOT_H_PX 로 plot 내부 비율.
  const VBW = 1000; // viewBox width — 임의 큰 값 (정밀도)
  const VBH = PLOT_H_PX;
  const max = Math.max(0, ...values);
  const yMaxNice = niceMax(max);
  const stepX = values.length > 1 ? VBW / (values.length - 1) : 0;

  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = yMaxNice > 0 ? VBH * (1 - v / yMaxNice) : VBH;
    return [x, y] as const;
  });
  const polyStr = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const areaStr =
    pts.length > 0
      ? `0,${VBH} ${polyStr} ${((pts.length - 1) * stepX).toFixed(2)},${VBH}`
      : "";

  // peak는 max에 도달하는 첫 번째 인덱스 사용 (일관성)
  let peakIdx = -1;
  for (let i = 0; i < values.length; i++) {
    if (max > 0 && values[i] === max && peakIdx === -1) peakIdx = i;
  }
  const peakXRatio = peakIdx >= 0 && values.length > 1 ? peakIdx / (values.length - 1) : 0;
  const peakYRatio = peakIdx >= 0 && yMaxNice > 0 ? 1 - values[peakIdx] / yMaxNice : 0;


  return (
    <div
      className={`group flex flex-col gap-2px min-w-0${frame ? " bg-card border border-color-var-color-border-default rounded-4px px-8px py-6px" : ""}${delay !== undefined ? " ai-anim-in" : ""}`}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* 헤더 — frame 일 때만. WidgetFrame 안에서는 그쪽 머리가 맡는다. */}
      {frame && (
      <div className="flex items-center justify-between gap-6px">
        <div className="flex items-center gap-3px min-w-0">
          <span
            className="text-base font-bold text-primary tracking-default leading-none truncate"
            style={{ fontFamily: "var(--font-family-korean)" }}
            title={title}
          >
            {title}
          </span>
          {/* ⓘ 는 카드 hover 시에만 노출. whatap-ds.css 의 unlayered hover-reveal 클래스
              (.group:hover .group-hover-opacity-100) 사용 — Tailwind 의 group-hover:opacity-100
              (layered) 은 unlayered .opacity-0 에 cascade 에서 져서 동작하지 않는다.
              onAiTrigger 지정 시 ⓘ 대신 WhaTap AI 버튼을 같은 hover-reveal 로 노출. */}
          {onAiTrigger ? (
            <AiTriggerButton
              reveal={aiTriggerReveal}
              tooltip={aiTriggerTooltip}
              onClick={() =>
                onAiTrigger({
                  metric: title,
                  values,
                  unit,
                  timeRange: xLabels && xLabels.length ? `${xLabels[0]}–${xLabels[xLabels.length - 1]}` : undefined,
                })
              }
            />
          ) : (
            <span className="flex items-center cursor-pointer opacity-0 group-hover-opacity-100 transition-opacity">
              <InfoIcon />
            </span>
          )}
        </div>
        <div className="flex items-center gap-4px shrink-0">
          {showTopStat && (
            <button
              className="flex items-center h-18px px-6px rounded-3px bg-card border border-color-var-color-border-default text-xs text-secondary cursor-pointer hover-bg-surface-100 whitespace-nowrap"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              Top Stat
            </button>
          )}
          <MenuDots />
        </div>
      </div>
      )}

      {/* 차트 영역 (SVG는 정확히 plot 사각형에만 absolute 배치) */}
      <div className="relative w-full" style={{ height: CHART_HEIGHT }}>
        <ChartGrid max={yMaxNice} padTop={PAD_TOP_PX} padBottom={PAD_BOTTOM_PX} right={PAD_RIGHT} />
        {/* 좌측 검정 점선 reference */}
        <div
          className="absolute"
          style={{
            left: `calc(${GUTTER} + (100% - ${GUTTER} - ${PAD_RIGHT}px) * ${markerAt})`,
            top: PAD_TOP_PX,
            height: PLOT_H_PX,
            width: 0,
            borderLeft: "0.8px dashed var(--color-text-primary)",
            opacity: 0.5,
          }}
        />

        {/* SVG는 plot 영역에만 그림 — viewBox는 plot 비율과 정확히 일치 */}
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          width="100%"
          height={PLOT_H_PX}
          className="absolute"
          style={{ left: GUTTER, right: PAD_RIGHT, top: PAD_TOP_PX, width: `calc(100% - ${GUTTER} - ${PAD_RIGHT}px)` }}
        >
          {/* area fill: color 는 var(--token) 일 수 있어 hex 알파(+"1f") 를 붙이면 무효가 된다
              (var(...)1f → 잘못된 색 → 회색 fallback). fillOpacity 로 ~12% 투명도를 준다. */}
          {areaStr && (
            <polyline
              points={areaStr}
              fill={areaColor ?? color}
              /* areaColor 를 명시했으면 그 색 그대로 — 투명도까지 호출측이 정한 것으로 본다. */
              fillOpacity={areaColor ? 1 : 0.12}
              stroke="none"
            />
          )}
          <polyline
            points={polyStr}
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* HTML overlay — px 고정 텍스트 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Y축 라벨 */}
          <ChartValueAxis max={yMaxNice} unit={unit} padTop={PAD_TOP_PX} padBottom={PAD_BOTTOM_PX} right={PAD_RIGHT} />

          {/* peak ▼ + 값 라벨 — SVG polyline의 peak 점과 동일 좌표계 사용
              (GUTTER + plotWidth × peakXRatio, PAD_TOP_PX + PLOT_H_PX × peakYRatio).
              ▼ tip(svg path 끝점)이 peak 점에 정확히 닿도록 transform 보정. */}
          {peakIdx >= 0 && (
            <ChartPeakMarker
              label={formatPeakValue(max) + unit}
              color={color}
              left={`calc(${GUTTER} + (100% - ${GUTTER} - ${PAD_RIGHT}px) * ${peakXRatio})`}
              top={PAD_TOP_PX + PLOT_H_PX * peakYRatio}
            />
          )}

          {/* X축 시간 라벨 */}
          <ChartTimeAxis labels={xLabels} right={PAD_RIGHT} />
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5.2" stroke="var(--color-border-divider)" strokeWidth="1" fill="none" />
      <line x1="6" y1="5.4" x2="6" y2="8.4" stroke="var(--color-border-divider)" strokeWidth="1.2" strokeLinecap="round" />
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
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="3" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="7" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="11" r="1" fill="var(--color-text-tertiary)" />
      </svg>
    </button>
  );
}

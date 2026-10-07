/**
 * MiniDonutChart — 카드형 미니 도넛 차트 (분포·비율 요약).
 *
 * ## Purpose
 * GPU 인벤토리 모델별 분포, 리소스 할당 비율 등 범주형 데이터를
 * 작은 카드 안에서 시각화. 중앙에 합계나 핵심 수치를 표시.
 *
 * ## When to use
 * - 3~6개 범주의 비율 분포를 한눈에 보여줄 때 (대시보드 grid)
 * - 중앙 라벨로 전체 합계나 핵심 KPI를 함께 표시할 때
 *
 * ## When NOT to use
 * - 시계열 추이 표현 → [[MiniLineChart]]
 * - 정밀한 비교가 필요한 다중 시리즈 → [[MiniMultiLineChart]]
 * - 2개 이하 범주의 단순 진행률 → [[UsageGauge]]
 *
 * ## Composition rules
 * - `frame={false}` 면 **본문만** 그린다(카드 표면 · 테두리 · 안쪽 여백 · 제목 줄을 뺀다). [[WidgetFrame]] 안에 넣을 때 쓴다.
 *   제목은 WidgetFrame `title`, 범위는 `meta`, 범례는 도넛 옆 열 그대로(항목 글이 길어 한 줄 범례로 올리지 않는다), 메뉴는 `onFullscreen` · `menu` 가 맡는다(patterns §15).
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0)
 * - 색은 차트 시리즈 토큰 (`--color-chart-series-1..8`)만 사용
 * - SVG 내부에 텍스트 없음 — 중앙 라벨은 HTML overlay
 * - `delay` 지정 시 stagger 진입 애니메이션 적용
 *
 * @example
 * ```tsx
 * <MiniDonutChart
 *   title="GPU 인벤토리"
 *   segments={[
 *     { label: "A100", value: 8, color: "var(--color-chart-series-1)" },
 *     { label: "H100", value: 4, color: "var(--color-chart-series-3)" },
 *   ]}
 *   centerLabel="12"
 *   centerSub="Total"
 * />
 * ```
 */

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export type MiniDonutChartProps = {
  title: string;
  segments: DonutSegment[];
  /** 도넛 중앙 큰 숫자 */
  centerLabel?: string;
  /** 도넛 중앙 보조 텍스트 */
  centerSub?: string;
  /** stagger 진입 애니메이션 delay(ms) */
  delay?: number;
  /**
   * 껍데기(카드 표면 · 테두리 · 여백 · 제목 줄)를 그릴지. 기본 `true`.
   * `false` 면 본문만 그린다. [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
};

const SIZE = 120;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export default function MiniDonutChart({
  title,
  segments,
  centerLabel,
  centerSub,
  delay,
  frame = true,
}: MiniDonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const active = segments.filter((s) => s.value > 0).length;

  // 세그먼트 간 gap (stroke-dasharray 단위) — 2개 이상일 때만 구분선
  const SEG_GAP = active > 1 ? 3 : 0;
  const usable = CIRCUMFERENCE - SEG_GAP * active;

  // 각 segment의 stroke-dasharray/dashoffset 계산 (누적 offset)
  let cursor = 0;
  const arcs = segments.map((seg) => {
    const ratio = total > 0 ? seg.value / total : 0;
    const length = Math.max(0, ratio * usable);
    const dashGap = CIRCUMFERENCE - length;
    const offset = -cursor;
    cursor += length + (seg.value > 0 ? SEG_GAP : 0);
    return { ...seg, length, dashGap, offset, ratio };
  });

  const style = delay !== undefined
    ? { animationDelay: `${delay}ms` } as React.CSSProperties
    : undefined;

  return (
    <div
      className={frame ? "group flex flex-col h-full bg-card border border-color-var-color-border-default rounded-4px px-8px py-6px" : "group flex flex-col h-full min-w-0"}
      style={style}
    >
      {/* 헤더 — frame 일 때만. WidgetFrame 안에서는 그쪽 머리가 제목을 갖는다. */}
      {frame && (
        <div className="flex items-center justify-between mb-4px">
          <span className="text-md font-medium text-secondary truncate">{title}</span>
        </div>
      )}

      {/* 도넛 + 범례 */}
      <div className="flex items-center gap-12px flex-1 min-h-0">
        {/* SVG 도넛 */}
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* 배경 링 */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="var(--color-surface-100)"
              strokeWidth={STROKE}
            />
            {/* 데이터 arc */}
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={`${arc.length} ${arc.dashGap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          {/* 중앙 라벨 (HTML overlay) */}
          {(centerLabel || centerSub) && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              {centerLabel && (
                <span
                  className="text-xl font-bold text-primary leading-none"
                  style={{ fontFamily: "var(--font-family-numeric)" }}
                >
                  {centerLabel}
                </span>
              )}
              {centerSub && (
                <span className="text-xs text-tertiary leading-tight mt-2px">
                  {centerSub}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 범례 */}
        <div className="flex flex-col gap-4px min-w-0 flex-1">
          {arcs.map((arc) => (
            <div key={arc.label} className="flex items-center gap-6px min-w-0">
              <div
                className="shrink-0 rounded-full"
                style={{ width: 8, height: 8, background: arc.color }}
              />
              <span className="text-sm text-secondary truncate">{arc.label}</span>
              <span
                className="text-sm font-medium text-primary ml-auto shrink-0"
                style={{ fontFamily: "var(--font-family-numeric)" }}
              >
                {arc.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * GpuStatusBar — GPU 상태별 활용 현황 스택 바 차트.
 *
 * ## Purpose
 * GPU 리소스 보드에서 Total → Allocated → Active → Effective 단계별
 * 할당·활용 현황을 시각화. 각 카테고리는 양(positive)·음(negative) 세그먼트로 구성.
 *
 * ## When to use
 * - GPU 대시보드 상단에서 전체 자원 흐름을 한눈에 보여줄 때
 * - Total 8 → Allocated 6(+2 Not) → Active 5(+1 Not) → Effective 2(+3 Not) 같은 깔때기형 데이터
 *
 * ## When NOT to use
 * - 시계열 추이 → [[MiniLineChart]] / [[MiniMultiLineChart]]
 * - 단일 비율 → [[UsageGauge]]
 *
 * ## Composition rules
 * - Primitives 레이어 (자체 렌더링, DS 컴포넌트 import 0)
 * - 색은 차트 토큰만 사용
 * - SVG 내부 텍스트 없음 — 라벨은 HTML overlay
 *
 * @example
 * ```tsx
 * <GpuStatusBar
 *   categories={[
 *     { label: "Total", positive: { value: 8, label: "8 Total", color: "var(--color-chart-series-1)" } },
 *     { label: "Allocated", positive: { value: 6, label: "6 Allocated" }, negative: { value: 2, label: "2 Not Allocated" } },
 *   ]}
 *   max={8}
 * />
 * ```
 */

export type GpuStatusSegment = {
  value: number;
  label: string;
  color?: string;
};

export type GpuStatusCategory = {
  label: string;
  positive: GpuStatusSegment;
  negative?: GpuStatusSegment;
};

export type GpuStatusBarProps = {
  /** 열(상태 범주) 목록 — 왼쪽부터 이 순서. `positive` 는 아래 막대, `negative` 는 그 위에 쌓는 오류 띠. `positive.color` 를 비우면 열 순서대로 `--color-chart-series-1 · 3 · 6` 을 쓴다. */
  categories: GpuStatusCategory[];
  /** Y축 최대값 (기본: positive+negative 중 최대) */
  max?: number;
};

const POS_COLORS = [
  "var(--color-chart-series-1)",  // blue
  "var(--color-chart-series-3)",  // teal
  "var(--color-chart-series-6)",  // green
  "var(--color-chart-series-6)",  // green
];
const NEG_COLOR = "var(--color-status-error-bg, #ffe8e8)";

export default function GpuStatusBar({ categories, max: maxProp }: GpuStatusBarProps) {
  const maxVal = maxProp ?? Math.max(...categories.map((c) => c.positive.value + (c.negative?.value ?? 0)));

  /* Y축 눈금 — 유의미한 값(positive, negative 경계)에서 자동 생성 */
  const yTicks = Array.from(
    new Set([0, ...categories.flatMap((c) => [c.positive.value, c.positive.value + (c.negative?.value ?? 0)])]),
  ).sort((a, b) => a - b);

  /* 배경 area chart — 각 카테고리의 전체(positive+negative) 높이를 부드러운 곡선으로 잇는다 */
  const colCount = categories.length;
  const colW = 100 / colCount;
  const barW = colW * 0.55;
  const barHalf = barW / 2;

  const edgePoints: { x: number; y: number }[] = [];
  categories.forEach((c, i) => {
    const cx = (i + 0.5) * colW;
    const y = maxVal > 0 ? (1 - c.positive.value / maxVal) * 100 : 100;
    edgePoints.push({ x: cx - barHalf, y });
    edgePoints.push({ x: cx + barHalf, y });
  });

  function buildCurvePath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return "";
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const isFlat = i % 2 === 1;
      if (isFlat) {
        d += ` L${curr.x},${curr.y}`;
      } else {
        const dx = curr.x - prev.x;
        const cp1x = prev.x + dx * 0.45;
        const cp2x = curr.x - dx * 0.45;
        d += ` C${cp1x},${prev.y} ${cp2x},${curr.y} ${curr.x},${curr.y}`;
      }
    }
    return d;
  }

  const linePath = buildCurvePath(edgePoints);
  const last = edgePoints[edgePoints.length - 1];
  const first = edgePoints[0];
  const areaPath = edgePoints.length > 1
    ? `${linePath} L${last.x},100 L${first.x},100 Z`
    : "";

  return (
    <div className="flex flex-col bg-card border border-color-var-color-border-default rounded-4px px-12px py-8px h-full">
      <span className="text-md font-medium text-secondary mb-8px shrink-0">GPU 상태별 활용 현황</span>

      <div className="flex flex-1 min-h-0">
        {/* Y축 스케일 */}
        <div className="shrink-0 flex flex-col justify-between pr-8px" style={{ marginBottom: 20 }}>
          {[...yTicks].reverse().map((v) => (
            <span
              key={v}
              className="text-sm text-tertiary leading-none"
              style={{ fontFamily: "var(--font-family-numeric)" }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* 차트 영역 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 바 + 곡선 영역 — flex-1로 남은 세로 공간을 전부 채운다 */}
          <div className="relative flex items-end gap-4px flex-1 min-h-0">
            {/* 배경 area chart (SVG overlay) */}
            {areaPath && (
              <svg
                className="absolute inset-0 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", overflow: "visible" }}
              >
                {/* Y축 수평 그리드 라인 */}
                {yTicks.map((v) => {
                  const ly = maxVal > 0 ? (1 - v / maxVal) * 100 : 100;
                  return (
                    <line
                      key={v}
                      x1="0" x2="100"
                      y1={ly} y2={ly}
                      stroke="var(--color-border-default)"
                      strokeWidth="0.3"
                      strokeDasharray="2,2"
                    />
                  );
                })}
                <path d={areaPath} fill="var(--color-chart-series-1)" opacity="0.07" />
                <path d={linePath} fill="none" stroke="var(--color-chart-series-1)" strokeWidth="0.5" opacity="0.25" />
              </svg>
            )}
            {/* 수평 기준선 */}
            <div
              className="absolute left-0 right-0 border-b border-color-var-color-border-default"
              style={{ bottom: 0 }}
            />

            {categories.map((cat, ci) => {
              const posPct = maxVal > 0 ? `${(cat.positive.value / maxVal) * 100}%` : "0%";
              const negPct = cat.negative && maxVal > 0 ? `${(cat.negative.value / maxVal) * 100}%` : "0%";
              const posColor = cat.positive.color ?? POS_COLORS[ci % POS_COLORS.length];

              return (
                <div key={cat.label} className="flex-1 min-w-0 flex flex-col items-center h-full">
                  {/* 바 영역 — 부모 높이 100% */}
                  <div className="relative w-full flex flex-col items-center justify-end h-full">
                    {/* Negative 세그먼트 (위) */}
                    {cat.negative && cat.negative.value > 0 && (
                      <div className="relative w-55pct flex items-center justify-end" style={{ height: negPct }}>
                        <div
                          className="w-full h-full rounded-2px"
                          style={{ background: NEG_COLOR }}
                        />
                        <span
                          className="absolute text-sm text-secondary whitespace-nowrap"
                          style={{
                            right: -4,
                            transform: "translateX(100%)",
                            fontFamily: "var(--font-family-numeric)",
                          }}
                        >
                          {cat.negative.label}
                        </span>
                      </div>
                    )}
                    {/* Positive 세그먼트 (아래) */}
                    <div className="relative w-55pct flex items-center justify-end" style={{ height: posPct }}>
                      <div
                        className="w-full h-full rounded-2px"
                        style={{ background: posColor }}
                      />
                      <span
                        data-ds-policy-ok="차트 계열 색 막대 안 라벨 — 컬러 위 고정 흰색"
                        // raw-color-ok: 차트 계열 색으로 채운 막대 안 라벨 — 컬러 위 고정 흰색 전경.
                        className="absolute text-sm text-white whitespace-nowrap"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          fontFamily: "var(--font-family-numeric)",
                        }}
                      >
                        {cat.positive.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X축 라벨 */}
          <div className="flex gap-4px mt-4px shrink-0">
            {categories.map((cat) => (
              <span key={cat.label} className="flex-1 min-w-0 text-center text-sm text-tertiary truncate">
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

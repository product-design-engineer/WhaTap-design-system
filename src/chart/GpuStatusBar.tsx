/**
 * GpuStatusBar — GPU 단계별(Total → Allocated → Active → Effective) 몫과 나머지를 세로 막대로 쌓는 단계 막대 차트. Composite layer.
 *
 * ## Purpose
 * GPU 리소스 보드에서 «전체 중 얼마가 할당되고, 그중 얼마가 쓰이고, 그중 얼마가 효과적인가» 를 단계마다 한 막대로 보인다.
 * 막대 아래 구간이 그 단계의 몫(6 Allocated), 위 구간이 앞 단계 대비 나머지(2 Not Allocated)다. 단계의 몫을 잇는 옅은 면이
 * 줄어드는 흐름을 함께 그린다.
 *
 * ## When to use
 * - GPU 대시보드 상단에서 전체 자원 흐름을 한눈에 보여줄 때
 * - Total 8 → Allocated 6(+2 Not) → Active 5(+1 Not) → Effective 2(+3 Not) 같은 깔때기형 데이터
 *
 * ## When NOT to use
 * - 시계열 추이 → [[MiniLineChart]] / [[MiniMultiLineChart]]
 * - 단일 비율 → [[UsageGauge]]
 * - 단계가 아니라 대상끼리 비교 → [[BarList]]
 *
 * ## Metrics
 * - ✅ 단계마다 앞 단계의 일부가 되는 깔때기 몫 — GPU Total → Allocated → Active → Effective · 할당 → 사용 → 유효 사용
 * - ❌ 포함 관계가 아닌 지표 나열(서로 다른 자원 사용률) → [[BarList]]
 * - ❌ 시간에 따른 변화 — 한 시점의 단면이다
 *
 * ## Colors
 * - 정체성 — 몫 구간 · `--color-chart-series-1`(`positive.color`) · 단계마다 색을 돌려 칠하지 않는다
 * - 바탕 — 남은 몫 · `--color-surface-200` · 오류가 아니라 상태색을 쓰지 않는다
 *
 * ## Composition rules
 * - 단계 막대를 가리키면 나머지를 흐리고(0.32) [[ChartTooltip]] 이 몫 · 나머지 · 단계 안 몫의 비율을 보인다(patterns §26 «강조»).
 * - 요소를 조합한다 — 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]](눈금은 단계 값, `ticks`) · 막대 [[ChartStackedColumn]] ·
 *   단계 이름 [[ChartCategoryAxis]]. 차트 안에서 축 · 막대 · 이름을 다시 그리지 않는다(patterns §26). 그래서 Composite 계층이다.
 * - 색: 몫 = 한 계열 색(`positive.color`, 기본 `--color-chart-series-1`). 단계는 같은 지표(GPU 수)의 단계라 색을 돌려 칠하지 않는다
 *   (§17 순환 금지). 나머지 = `--color-surface-200` — 오류가 아니라 «남은 몫» 이라 상태색을 쓰지 않는다(§17 · §23).
 * - `frame={false}` 면 카드 · 제목을 뺀다. 대시보드 칸에서는 [[WidgetFrame]] 이 껍데기와 제목을 맡는다(patterns §15).
 * - 흐름 면(몫을 잇는 곡선)은 이 차트의 마크라 차트가 그린다 — 계열 색 7% · 선 25%.
 *
 * @example
 * ```tsx
 * <WidgetFrame title="GPU 상태별 활용 현황">
 *   <GpuStatusBar frame={false} max={8} categories={[
 *     { label: "Total", positive: { value: 8, label: "8 Total" } },
 *     { label: "Allocated", positive: { value: 6, label: "6 Allocated" }, negative: { value: 2, label: "2 Not Allocated" } },
 *   ]} />
 * </WidgetFrame>
 * ```
 */
import ChartCategoryAxis from "./ChartCategoryAxis";
import { useState } from "react";
import ChartGrid from "./ChartGrid";
import ChartTooltip from "./ChartTooltip";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";
import ChartStackedColumn from "./ChartStackedColumn";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER } from "./_axisScale";

export type GpuStatusSegment = {
  value: number;
  label: string;
  /** 구간 색 토큰. 몫의 기본은 `--color-chart-series-1`, 나머지는 `--color-surface-200`. hex 금지. */
  color?: string;
};

export type GpuStatusCategory = {
  label: string;
  positive: GpuStatusSegment;
  negative?: GpuStatusSegment;
};

export type GpuStatusBarProps = {
  categories: GpuStatusCategory[];
  /** Y축 최대값 (기본: positive+negative 중 최대) */
  max?: number;
  /**
   * 카드 표면 · 테두리 · 제목을 그릴지. 기본 `true`.
   * `false` 면 본문만 — [[WidgetFrame]] 안에 넣을 때 쓴다(patterns §15).
   */
  frame?: boolean;
  /** `frame` 일 때 제목. 기본 「GPU 상태별 활용 현황」. */
  title?: string;
};

const POS_COLOR = "var(--color-chart-series-1)";
const NEG_COLOR = "var(--color-surface-200)";
const PAD_TOP = 6;
const PAD_BOTTOM = 18;
const PAD_RIGHT = 8;
const GAP = 4;

export default function GpuStatusBar({ categories, max: maxProp, frame = true, title = "GPU 상태별 활용 현황" }: GpuStatusBarProps) {
  const maxVal = maxProp ?? Math.max(0, ...categories.map((c) => c.positive.value + (c.negative?.value ?? 0)));

  /* 눈금은 단계 값(몫 · 몫+나머지) — 깔때기의 경계가 곧 읽을 값이다. */
  const ticks = Array.from(
    new Set([0, ...categories.flatMap((c) => [c.positive.value, c.positive.value + (c.negative?.value ?? 0)])]),
  ).sort((a, b) => a - b);

  /* 흐름 면 — 단계의 몫 높이를 막대 폭 구간은 평평하게, 사이는 곡선으로 잇는다(플롯 0~100 좌표). */
  const colW = categories.length ? 100 / categories.length : 100;
  const barHalf = (colW * 0.55) / 2;
  const pts = categories.flatMap((c, i) => {
    const cx = (i + 0.5) * colW;
    const y = maxVal > 0 ? (1 - c.positive.value / maxVal) * 100 : 100;
    return [{ x: cx - barHalf, y }, { x: cx + barHalf, y }];
  });
  let line = pts.length ? `M${pts[0].x},${pts[0].y}` : "";
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (i % 2 === 1) line += ` L${b.x},${b.y}`;
    else {
      const dx = b.x - a.x;
      line += ` C${a.x + dx * 0.45},${a.y} ${b.x - dx * 0.45},${b.y} ${b.x},${b.y}`;
    }
  }
  const area = pts.length > 1 ? `${line} L${pts[pts.length - 1].x},100 L${pts[0].x},100 Z` : "";
  const plot = { left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM };
  /* 가리킨 단계 — 나머지 막대를 흐리고 [[ChartTooltip]] 으로 몫 · 나머지 · 비율(patterns §26 «강조») */
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div
      className={frame ? "flex flex-col bg-card border border-color-var-color-border-default rounded-4px px-12px py-8px h-full" : "flex flex-col h-full min-w-0"}
    >
      {frame && <span className="text-md font-medium text-secondary mb-8px shrink-0">{title}</span>}

      <div className="relative flex-1 min-h-0">
        <ChartGrid max={maxVal} ticks={ticks} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />

        {area && (
          <svg className="absolute pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ ...plot, width: `calc(100% - ${AXIS_GUTTER} - ${PAD_RIGHT}px)`, height: `calc(100% - ${PAD_TOP + PAD_BOTTOM}px)`, overflow: "visible" }} aria-hidden>
            <path d={area} fill={POS_COLOR} opacity="0.07" />
            <path d={line} fill="none" stroke={POS_COLOR} strokeWidth="0.5" opacity="0.25" vectorEffect="non-scaling-stroke" />
          </svg>
        )}

        <div className="absolute flex" style={{ ...plot, gap: GAP }}>
          {categories.map((c, i) => (
            <div
              key={c.label}
              className={`${MARK_CLASS} relative flex-1 min-w-0 h-full`}
              style={{ opacity: hover != null && hover !== i ? DIM_OPACITY : 1 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <ChartStackedColumn
                max={maxVal}
                segments={[
                  { value: c.positive.value, label: c.positive.label, color: c.positive.color ?? POS_COLOR, labelPlacement: "inside" },
                  ...(c.negative
                    ? [{ value: c.negative.value, label: c.negative.label, color: c.negative.color ?? NEG_COLOR, labelPlacement: "side" as const }]
                    : []),
                ]}
              />
              {hover === i && (
                <ChartTooltip
                  left="50%"
                  top={`${maxVal > 0 ? (1 - Math.min(1, (c.positive.value + (c.negative?.value ?? 0)) / maxVal)) * 100 : 50}%`}
                  flipX={i >= categories.length / 2}
                  offset={16}
                  title={c.label}
                  rows={[
                    { label: c.positive.label, value: c.positive.value.toLocaleString("en-US"), color: c.positive.color ?? POS_COLOR },
                    ...(c.negative ? [{ label: c.negative.label, value: c.negative.value.toLocaleString("en-US"), color: c.negative.color ?? NEG_COLOR }] : []),
                  ]}
                  footer={
                    c.negative && c.positive.value + c.negative.value > 0
                      ? `${c.positive.label} ${((c.positive.value / (c.positive.value + c.negative.value)) * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`
                      : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>

        <ChartValueAxis max={maxVal} ticks={ticks} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartCategoryAxis labels={categories.map((c) => c.label)} padBottom={PAD_BOTTOM} right={PAD_RIGHT} gap={GAP} />
      </div>
    </div>
  );
}

/**
 * BoxPlotChart — 대상(범주)마다 값 분포를 상자 · 중앙값 · 수염 · 이상치로 그리는 박스플롯. Composite layer.
 *
 * ## Purpose
 * 평균 하나로는 «대부분은 빠른데 일부가 아주 느린» 분포와 «고르게 느린» 분포가 같아 보인다. 상자(1~3사분위)는 가운데 절반이 어디에
 * 모였는지, 중앙값 선은 한가운데를, 수염은 정상 범위를, 점은 벗어난 값을 보인다 — 서비스 · 시간대 · 에이전트별 응답시간 분포 비교.
 * 라이브에 캡처가 없던 유형이라(patterns §21) 문서의 요소(박스 · 중앙값 · 수염 · 이상치 · 범주축)로 만든다.
 *
 * ## When to use
 * - 대상 3~12개의 값 분포 비교 — 서비스별 응답시간 · 시간대별 수행 시간 · 에이전트별 GC 시간.
 * - 평균 · 백분위 한두 개로는 꼬리(느린 소수)가 가려질 때.
 *
 * ## When NOT to use
 * - 대상마다 값 하나 → [[MiniBarChart]] `categories` · [[BarList]].
 * - 시간에 따른 분포의 흐름 → [[ScatterHeatmap]](개별 점) · 백분위 선 [[MiniMultiLineChart]].
 * - 표본이 적은 대상(5개 미만) — 사분위가 뜻을 갖지 못한다. 점을 그대로 → [[ScatterChart]].
 *
 * ## Metrics
 * - ✅ 표본이 많은 지연 · 크기 지표의 대상별 분포 — 서비스 · URL별 응답시간(ms) · 시간대별 SQL 수행 시간 · 에이전트별 GC 시간 · 요청 크기
 * - ❌ 대상마다 값 하나뿐인 지표(지금 CPU %) — 상자가 납작해 막대보다 못하다 → [[BarList]]
 * - ❌ 표본 5개 미만 · 이산 값(상태 코드 · 건수 몇 개) — 사분위가 뜻을 갖지 못한다
 *
 * ## Composition rules
 * - 요소를 조합한다 — 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · 대상 이름 [[ChartCategoryAxis]]. 차트는 상자 · 수염 · 점만 그린다. 그래서 Composite 계층이다.
 * - **수염 = Tukey 1.5 × IQR(2026-10-23 결정)** — 1사분위 − 1.5 × IQR 이상 · 3사분위 + 1.5 × IQR 이하의 가장 먼 값까지, 그 밖은 이상치 점.
 *   통계는 받거나(`boxes[].stats`) 원값을 주면 `boxPlotStats(values)` 가 같은 규칙으로 계산한다. 다른 규칙(최소 ~ 최대 수염)을 섞지 않는다.
 * - 색은 하나(`color`, 기본 series-1) — 범주는 계열이 아니다. 상자 테두리 1.5px + 옅은 채움 대신 **카드색 채움**(겹침이 없어 투명도가 뜻이 없다) ·
 *   중앙값 선 2px · 이상치는 속 빈 원 4px.
 * - Y 는 0 부터(`min` 으로 바꿀 수 있음) — 상자 높이가 크기를 말한다. 단위는 눈금 접미사.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 상자 | 칸 폭 50%(최대 32px) · 1~3사분위 · 테두리 1.5px `color` · 채움 `--color-card` |
 * | 중앙값 | 2px `color` · 상자 폭 |
 * | 수염 | 1px `color` · 끝 가로선 상자 폭 50% · Tukey 1.5 × IQR |
 * | 이상치 | 속 빈 원 지름 4 · 1px `color` |
 * | 축 | Y 0 ~ 최대 올림(`max`) · 눈금 최대 · 절반 · 0 · 단위 `unit` / X [[ChartCategoryAxis]] |
 * | 플롯 여백 | 위 8 · 아래 18 · 오른쪽 8 · 왼쪽 `--wds-widget-axis-gutter` |
 * | 접근성 | 플롯 `role="img"` · 칸마다 `title`(이름 · 중앙값 · 사분위 · 수염 · 이상치 수) |
 *
 * @example
 * ```tsx
 * <BoxPlotChart unit="ms" boxes={services.map((s) => ({ label: s.name, values: s.elapsed }))} />
 * ```
 */
import ChartCategoryAxis from "./ChartCategoryAxis";
import ChartGrid from "./ChartGrid";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, formatAxisValue, niceMax } from "./_axisScale";

export type BoxPlotStats = {
  /** 1사분위. */
  q1: number;
  /** 중앙값. */
  median: number;
  /** 3사분위. */
  q3: number;
  /** 아래 수염 끝(Tukey). */
  low: number;
  /** 위 수염 끝(Tukey). */
  high: number;
  /** 수염 밖 값. */
  outliers: number[];
};

export type BoxPlotBox = {
  /** 대상 이름 — X 글자. */
  label: string;
  /** 원값 — 주면 `boxPlotStats` 로 계산한다. */
  values?: ReadonlyArray<number>;
  /** 이미 계산한 통계 — `values` 보다 우선. */
  stats?: BoxPlotStats;
};

export type BoxPlotChartProps = {
  /** 대상들(왼쪽부터). */
  boxes: ReadonlyArray<BoxPlotBox>;
  /** Y 최대. 없으면 수염 · 이상치 최대를 보기 좋은 값으로 올린다. */
  max?: number;
  /** 눈금 단위. */
  unit?: string;
  /** 마크 색 — 계열 토큰 하나. 기본 series-1. */
  color?: string;
  /** 자기 바깥 좌우 여백(8px)을 둘지. 기본 true. [[WidgetFrame]] 안에서는 false. */
  frame?: boolean;
};

/** 선형 보간 사분위(엑셀 · numpy 기본과 같다). */
function quantile(sorted: number[], p: number) {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/** 원값 → 박스플롯 통계(Tukey 1.5 × IQR 수염). 값이 없으면 null. */
export function boxPlotStats(values: ReadonlyArray<number>): BoxPlotStats | null {
  const s = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const q1 = quantile(s, 0.25);
  const median = quantile(s, 0.5);
  const q3 = quantile(s, 0.75);
  const fence = 1.5 * (q3 - q1);
  const inside = s.filter((v) => v >= q1 - fence && v <= q3 + fence);
  return {
    q1,
    median,
    q3,
    low: inside[0] ?? q1,
    high: inside[inside.length - 1] ?? q3,
    outliers: s.filter((v) => v < q1 - fence || v > q3 + fence),
  };
}

const PAD_TOP = 8;
const PAD_BOTTOM = 18;
const PAD_RIGHT = 8;
const GAP = 4;

export default function BoxPlotChart({ boxes, max, unit = "", color = "var(--color-chart-series-1)", frame = true }: BoxPlotChartProps) {
  const stats = boxes.map((b) => b.stats ?? (b.values ? boxPlotStats(b.values) : null));
  const top = max ?? niceMax(Math.max(0, ...stats.flatMap((s) => (s ? [s.high, ...s.outliers] : []))));
  const pct = (v: number) => `${top > 0 ? (1 - Math.min(1, Math.max(0, v / top))) * 100 : 100}%`;
  return (
    <div className="flex h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0 }}>
      <div className="relative flex-1 min-w-0 min-h-0" role="img" aria-label={`박스플롯 — 대상 ${boxes.length}개`}>
        <ChartGrid max={top} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <div className="absolute flex" style={{ left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM, gap: GAP }}>
          {boxes.map((b, i) => {
            const s = stats[i];
            return (
              <div
                key={i}
                className="relative flex-1 min-w-0"
                title={
                  s
                    ? `${b.label} · 중앙값 ${formatAxisValue(s.median)}${unit} · 사분위 ${formatAxisValue(s.q1)}~${formatAxisValue(s.q3)} · 수염 ${formatAxisValue(s.low)}~${formatAxisValue(s.high)} · 이상치 ${s.outliers.length}`
                    : `${b.label} · 값 없음`
                }
              >
                {s && (
                  <svg aria-hidden className="absolute inset-0 overflow-visible" width="100%" height="100%">
                    {/* 수염 — 상자 가운데 세로선 + 끝 가로선(상자 폭 50%) */}
                    <line x1="50%" x2="50%" y1={pct(s.high)} y2={pct(s.q3)} stroke={color} strokeWidth="1" />
                    <line x1="50%" x2="50%" y1={pct(s.q1)} y2={pct(s.low)} stroke={color} strokeWidth="1" />
                    <line x1="37.5%" x2="62.5%" y1={pct(s.high)} y2={pct(s.high)} stroke={color} strokeWidth="1" />
                    <line x1="37.5%" x2="62.5%" y1={pct(s.low)} y2={pct(s.low)} stroke={color} strokeWidth="1" />
                  </svg>
                )}
                {s && (
                  <span
                    aria-hidden
                    className="absolute block"
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "50%",
                      maxWidth: 32,
                      top: pct(s.q3),
                      bottom: `calc(100% - ${pct(s.q1)})`,
                      background: "var(--color-card)",
                      border: `1.5px solid ${color}`,
                      borderRadius: 1,
                    }}
                  >
                    <span
                      className="absolute block"
                      style={{ left: 0, right: 0, height: 2, background: color, top: `calc(${s.q3 - s.q1 > 0 ? ((s.q3 - s.median) / (s.q3 - s.q1)) * 100 : 50}% - 1px)` }}
                    />
                  </span>
                )}
                {s?.outliers.map((v, k) => (
                  <span
                    key={k}
                    aria-hidden
                    className="absolute block rounded-full"
                    style={{ left: "50%", top: pct(v), width: 4, height: 4, transform: "translate(-50%, -50%)", border: `1px solid ${color}` }}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <ChartValueAxis max={top} unit={unit} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartCategoryAxis labels={boxes.map((b) => b.label)} padBottom={PAD_BOTTOM} right={PAD_RIGHT} gap={GAP} />
      </div>
    </div>
  );
}

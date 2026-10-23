/**
 * BoxPlotChart — 대상(범주)마다 값 분포를 **백분위**로 그리는 상자 그림. 선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99. Composite layer.
 *
 * ## Purpose
 * 평균 하나로는 «대부분은 빠른데 일부가 아주 느린» 분포와 «고르게 느린» 분포가 같아 보인다. 이 차트는 분포를 운영자가 이미 쓰는 말 —
 * 백분위 — 로 그린다: 한가운데(p50) · 가운데 절반(p25–p75) · 거의 전부(p5–p95) · 꼬리(p99). 경보 · SLO 가 «p95 ≤ 500ms» 처럼
 * 백분위로 정해지므로, 차트에서 읽은 숫자가 판정 기준과 같은 말을 한다. 통계 표준 박스플롯(사분위 · Tukey 수염)은 처음 썼다가 걷어냈다 —
 * 읽는 법이 운영자의 언어가 아니고, 개별 이상치가 축을 늘려 상자가 바닥에 눌렸다(2026-10-23 사용자 결정 «B안»).
 * 라이브에 캡처가 없던 유형이라(patterns §21) 문서의 요소(상자 · 가운데 선 · 수염 · 점 · 범주축)로 만든다.
 *
 * ## When to use
 * - 대상 3~12개의 지연 · 크기 분포 비교 — 서비스 · URL별 응답시간 · 시간대별 SQL 수행 시간 · 에이전트별 GC 시간.
 * - p50 · p95 · p99 를 이미 보고 있는 지표를 대상끼리 한 판에 견줄 때.
 *
 * ## When NOT to use
 * - 대상마다 값 하나 → [[MiniBarChart]] `categories` · [[BarList]].
 * - 시간에 따른 백분위 흐름 → [[MiniMultiLineChart]](p50 · p95 · p99 선) · 개별 점 분포 → [[ScatterHeatmap]].
 * - 표본이 적은 대상(20개 미만) — p5 · p95 · p99 가 맨 끝 값 몇 개로 정해진다. 점 그대로 → [[ScatterChart]].
 *
 * ## Metrics
 * - ✅ 백분위로 판정하는 지연 · 크기 지표의 대상별 분포 — 서비스 · URL별 응답시간(ms) p50 · p95 · p99 · 시간대별 SQL 수행 시간 · 에이전트별 GC 시간 · 요청 크기
 * - ❌ 대상마다 값 하나뿐인 지표(지금 CPU %) — 상자가 납작해 막대보다 못하다 → [[BarList]]
 * - ❌ 표본 20개 미만 · 이산 값(상태 코드 · 건수 몇 개) — 백분위가 맨 끝 값 몇 개로 정해져 뜻을 갖지 못한다
 *
 * ## Composition rules
 * - 요소를 조합한다 — 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · 대상 이름 [[ChartCategoryAxis]]. 차트는 상자 · 수염 · 점 · p50 숫자만 그린다. 그래서 Composite 계층이다.
 * - **마크는 모두 백분위(2026-10-23 결정)** — 선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99. 사분위 · Tukey 수염 · 개별 이상치를 섞지 않는다.
 *   통계는 받거나(`boxes[].stats`, 서버 백분위) 원값을 주면 `boxPlotStats(values)` 가 같은 규칙(선형 보간)으로 계산한다.
 * - **Y 최대 = p95 최대 × 1.1 을 보기 좋은 값으로 올림** — p99 꼬리 하나가 축을 늘려 상자를 누르지 않게 한다. 축을 넘는 p99 는 위 끝에 ▲ + 값.
 * - p50 값을 가운데 선 오른쪽 옆에 숫자로(`text-chart` · 굵게) — 어느 마크의 숫자인지 붙어서 읽히고, 상자 높이를 눈으로 재지 않아도 된다.
 * - 범례(마크의 뜻)는 늘 보인다 — 단독(`frame`)이면 플롯 위 한 줄, [[WidgetFrame]] 안이면 `BOX_PLOT_LEGEND` 를 `summary` 로.
 * - 색은 하나(`color`, 기본 series-1) — 범주는 계열이 아니다. 상자는 카드색 채움 + 1.5px 테두리(겹침이 없어 투명도가 뜻이 없다).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 상자 | p25–p75 · 칸 폭 50%(최대 32px) · 테두리 1.5px `color` · 채움 `--color-card` |
 * | 선 | p50 · 2px `color` · 상자 폭 |
 * | 수염 | p5–p95 · 1px `color` · 끝 가로선 상자 폭 50% |
 * | 점 | p99 · 지름 5 · `color` 채움 · 축을 넘으면 위 끝 ▲ + 값(tertiary) |
 * | p50 숫자 | 가운데 선 오른쪽(상자 끝 + 3px) · 세로 가운데 = p50 · `text-chart` · 숫자 서체 · bold · primary |
 * | 범례 | `선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99` · `text-sm` tertiary |
 * | 축 | Y 0 ~ p95 최대 × 1.1 올림(`max`) · 눈금 최대 · 절반 · 0 · 단위 `unit` / X [[ChartCategoryAxis]] |
 * | 플롯 여백 | 위 14(p50 숫자) · 아래 18 · 오른쪽 8 · 왼쪽 `--wds-widget-axis-gutter` |
 * | 접근성 | 플롯 `role="img"` · 칸마다 `title`(이름 · p50 · p25–p75 · p5–p95 · p99) |
 *
 * @example
 * ```tsx
 * <WidgetFrame title="서비스별 응답시간" summary={BOX_PLOT_LEGEND}>
 *   <BoxPlotChart unit="ms" boxes={services.map((s) => ({ label: s.name, values: s.elapsed }))} frame={false} />
 * </WidgetFrame>
 * ```
 */
import ChartCategoryAxis from "./ChartCategoryAxis";
import ChartGrid from "./ChartGrid";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, formatAxisValue, niceMax } from "./_axisScale";

export type BoxPlotStats = {
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  p99: number;
};

export type BoxPlotBox = {
  /** 대상 이름 — X 글자. */
  label: string;
  /** 원값 — 주면 `boxPlotStats` 로 백분위를 계산한다. */
  values?: ReadonlyArray<number>;
  /** 이미 계산한 백분위(서버) — `values` 보다 우선. */
  stats?: BoxPlotStats;
};

export type BoxPlotChartProps = {
  /** 대상들(왼쪽부터). */
  boxes: ReadonlyArray<BoxPlotBox>;
  /** Y 최대. 없으면 p95 최대 × 1.1 을 보기 좋은 값으로 올린다(넘는 p99 는 ▲). */
  max?: number;
  /** 눈금 · p50 숫자 단위. */
  unit?: string;
  /** 마크 색 — 계열 토큰 하나. 기본 series-1. */
  color?: string;
  /**
   * 자기 바깥 좌우 여백(8px)과 범례 줄을 둘지. 기본 true.
   * `false` 면 플롯만 — [[WidgetFrame]] 안에 넣고 `BOX_PLOT_LEGEND` 를 `summary` 로(patterns §15).
   */
  frame?: boolean;
};

/** 마크의 뜻 — 단독이면 차트가 스스로 세우고, [[WidgetFrame]] 안이면 `summary` 로 넘긴다. */
export const BOX_PLOT_LEGEND = "선 p50 · 상자 p25–p75 · 수염 p5–p95 · 점 p99";

/** 선형 보간 백분위(엑셀 · numpy 기본과 같다). */
function percentile(sorted: number[], p: number) {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/** 원값 → p5 · p25 · p50 · p75 · p95 · p99. 값이 없으면 null. */
export function boxPlotStats(values: ReadonlyArray<number>): BoxPlotStats | null {
  const s = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const q = (p: number) => percentile(s, p);
  return { p5: q(0.05), p25: q(0.25), p50: q(0.5), p75: q(0.75), p95: q(0.95), p99: q(0.99) };
}

const PAD_TOP = 14;
const PAD_BOTTOM = 18;
const PAD_RIGHT = 8;
const GAP = 4;

export default function BoxPlotChart({ boxes, max, unit = "", color = "var(--color-chart-series-1)", frame = true }: BoxPlotChartProps) {
  const stats = boxes.map((b) => b.stats ?? (b.values ? boxPlotStats(b.values) : null));
  /* Y 최대 = p95 최대 × 1.1 올림 — p99 꼬리 하나가 축을 늘려 상자를 누르지 않게. 넘는 p99 는 위 끝 ▲ + 값 */
  const top = max ?? niceMax(Math.max(0, ...stats.flatMap((s) => (s ? [s.p95 * 1.1] : []))));
  const pct = (v: number) => `${top > 0 ? (1 - Math.min(1, Math.max(0, v / top))) * 100 : 100}%`;
  const f = (v: number) => formatAxisValue(v);
  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4px" style={{ padding: frame ? "0 8px" : 0 }}>
      {frame && <div className="text-sm text-tertiary" style={{ marginLeft: AXIS_GUTTER }}>{BOX_PLOT_LEGEND}</div>}
      <div className="relative flex-1 min-w-0 min-h-0" role="img" aria-label={`백분위 상자 그림 — 대상 ${boxes.length}개 · ${BOX_PLOT_LEGEND}`}>
        <ChartGrid max={top} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <div className="absolute flex" style={{ left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM, gap: GAP }}>
          {boxes.map((b, i) => {
            const s = stats[i];
            return (
              <div
                key={i}
                className="relative flex-1 min-w-0"
                title={s ? `${b.label} · p50 ${f(s.p50)}${unit} · p25–p75 ${f(s.p25)}–${f(s.p75)} · p5–p95 ${f(s.p5)}–${f(s.p95)} · p99 ${f(s.p99)}${unit}` : `${b.label} · 값 없음`}
              >
                {s && (
                  <svg aria-hidden className="absolute inset-0 overflow-visible" width="100%" height="100%">
                    {/* 수염 p5–p95 — 가운데 세로선 + 끝 가로선(상자 폭 50%) */}
                    <line x1="50%" x2="50%" y1={pct(s.p95)} y2={pct(s.p75)} stroke={color} strokeWidth="1" />
                    <line x1="50%" x2="50%" y1={pct(s.p25)} y2={pct(s.p5)} stroke={color} strokeWidth="1" />
                    <line x1="37.5%" x2="62.5%" y1={pct(s.p95)} y2={pct(s.p95)} stroke={color} strokeWidth="1" />
                    <line x1="37.5%" x2="62.5%" y1={pct(s.p5)} y2={pct(s.p5)} stroke={color} strokeWidth="1" />
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
                      top: pct(s.p75),
                      bottom: `calc(100% - ${pct(s.p25)})`,
                      background: "var(--color-card)",
                      border: `1.5px solid ${color}`,
                      borderRadius: 1,
                    }}
                  >
                    <span
                      className="absolute block"
                      style={{ left: 0, right: 0, height: 2, background: color, top: `calc(${s.p75 - s.p25 > 0 ? ((s.p75 - s.p50) / (s.p75 - s.p25)) * 100 : 50}% - 1px)` }}
                    />
                  </span>
                )}
                {s && s.p99 <= top && (
                  <span
                    aria-hidden
                    className="absolute block rounded-full"
                    style={{ left: "50%", top: pct(s.p99), width: 5, height: 5, transform: "translate(-50%, -50%)", background: color }}
                  />
                )}
                {s && s.p99 > top && (
                  /* 축 밖 p99 — 위 끝에 ▲ 와 값. 점을 축 끝에 붙이면 «p99 = 최대» 로 읽힌다 */
                  <span
                    aria-hidden
                    className="absolute flex items-center text-chart leading-none whitespace-nowrap"
                    style={{ left: "50%", top: -12, transform: "translateX(-4px)", gap: 2, color, fontFamily: "var(--font-family-numeric)" }}
                  >
                    ▲<span className="text-tertiary">{f(s.p99)}</span>
                  </span>
                )}
                {s && (
                  <span
                    className="absolute text-chart text-primary leading-none whitespace-nowrap"
                    style={{
                      /* p50 숫자는 가운데 선 오른쪽 옆 — 어느 마크의 숫자인지 붙어서 읽힌다 */
                      left: "calc(50% + min(25%, 16px) + 3px)",
                      top: pct(s.p50),
                      transform: "translateY(-50%)",
                      fontFamily: "var(--font-family-numeric)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    {f(s.p50)}
                  </span>
                )}
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

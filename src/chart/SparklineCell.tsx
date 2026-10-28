/**
 * SparklineCell — 표 셀 하나에 행 색 인덱스 · 지금 값 · 최근 추이(스파크라인)를 함께 놓는 표 안 미니 차트. Composite layer.
 *
 * ## Purpose
 * 표의 숫자 하나는 «지금» 만 말한다. 옆에 최근 추이의 모양을 붙이면 «오르는 중인 91%» 와 «내려오는 중인 91%» 가 갈린다.
 * 행 왼쪽 색 인덱스 바는 같은 칸 차트의 계열 색과 표 행을 잇는다 — 라이브 CPU 표에서 표와 차트를 잇는 유일한 장치였지만 짝 차트가
 * 안 보여 연결이 끊겨 있었다(patterns §21). 그래서 인덱스 색은 짝 차트와 같은 계열 토큰일 때만 켠다.
 *
 * ## When to use
 * - 표 행마다 같은 지표의 지금 값 + 최근 추이 — 서버별 CPU 최근 30분 · 쿼리별 응답시간 · 프로세스별 GPU 사용률.
 * - 같은 칸 위 차트(선 · 막대)의 계열과 표 행을 이을 때 → `indexColor` 에 그 계열 색 토큰.
 *
 * ## When NOT to use
 * - 지금 값의 크기 비교만(추이 없이) → [[MetricBarCell]].
 * - 값 · 시점을 읽어야 하는 추이 → [[MiniLineChart]]. 스파크라인은 모양만 말한다.
 * - 짝 차트가 없는 표에 색 인덱스 — 연결할 대상이 없으면 색이 뜻을 갖지 못한다.
 *
 * ## Metrics
 * - ✅ 행마다 같은 지표 · 같은 단위의 최근 추이 — 서버별 CPU · 메모리 사용률(%) · 쿼리별 응답시간(ms) · 프로세스별 GPU 사용률
 * - ✅ 상한이 같은 비율 지표를 행끼리 견줄 때 — `max` 를 공유(100)해 높이가 같은 기준이 된다
 * - ❌ 행마다 단위 · 범위가 다른 지표를 한 열에(CPU % 와 Mbps) — 줄마다 높이 기준이 달라 견줄 수 없다
 * - ❌ 부호가 있는 지표(증감률 ±) — 0 아래를 자른다
 *
 * ## Composition rules
 * - 요소를 조합한다 — 추이 [[Sparkline]]. 셀은 인덱스 바 · 값 글자 · 자리 맞춤만 그린다. 그래서 Composite 계층이다.
 * - 값은 `numeric.compact` — `text-base` · 숫자 서체 · tabular-nums · 오른쪽 정렬, 단위는 작게(`text-sm` tertiary).
 * - **값이 없는 행도 자리를 비워 둔다**(`-` + 빈 스파크라인 자리) — 행마다 그림이 빠지면 열 정렬이 깨진다(§21 서버 인벤토리).
 * - 인덱스 바 3 × 16px · 반경 1. 색은 짝 차트 계열 토큰(`--color-chart-series-N`). 없으면 그리지 않고 자리도 두지 않는다.
 * - 셀 높이는 스파크라인 20px 기준 — DataTable default 행(33~36px) 안에 들어간다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 배치 | [인덱스 바 3px] 8 [값 `valueWidth` 오른쪽 정렬] 8 [스파크라인 `sparkWidth` × 20] |
 * | 값 | `text-base` · `--font-family-numeric` · tabular-nums · `text-primary` / 단위 `text-sm` · `text-tertiary` |
 * | 스파크라인 | [[Sparkline]] 높이 20 · 폭 `sparkWidth`(기본 64) · 선 = `color` |
 * | 빈 값 | `-`(tertiary) + 같은 폭의 빈 자리 |
 * | 접근성 | 값 글자가 말한다. 스파크라인 · 인덱스 바는 장식 |
 *
 * @example
 * ```tsx
 * <SparklineCell value={91} unit="%" values={cpu30m} max={100} indexColor="var(--color-chart-series-1)" color="var(--color-chart-series-1)" />
 * ```
 */
import Sparkline from "./Sparkline";

export type SparklineCellProps = {
  /** 지금 값. `null` 이면 `-` 와 빈 자리. */
  value: number | string | null;
  /** 값 뒤 단위(작게). */
  unit?: string;
  /** 최근 추이(시간순). 비면 빈 자리. */
  values?: ReadonlyArray<number>;
  /** 스파크라인 세로 최대 — 같은 열 행끼리 공유하면 높이가 같은 기준이 된다. */
  max?: number;
  /** 스파크라인 색 — 계열 색 토큰. 기본 series-1. */
  color?: string;
  /** 행 색 인덱스 — 같은 칸 짝 차트의 계열 색 토큰. 없으면 바를 그리지 않는다. */
  indexColor?: string;
  /** 값 칸 폭(px). 열 안 자릿수를 맞춘다. 기본 48. */
  valueWidth?: number;
  /** 스파크라인 폭(px). 기본 64. */
  sparkWidth?: number;
};

export default function SparklineCell({
  value,
  unit,
  values = [],
  max,
  color = "var(--color-chart-series-1)",
  indexColor,
  valueWidth = 48,
  sparkWidth = 64,
}: SparklineCellProps) {
  const empty = value == null;
  return (
    <span className="inline-flex items-center gap-8px">
      {indexColor && <span aria-hidden className="shrink-0 rounded-1px" style={{ width: 3, height: 16, background: indexColor }} />}
      <span
        className={`shrink-0 text-right text-base tabular-nums ${empty ? "text-tertiary" : "text-primary"}`}
        style={{ width: valueWidth, fontFamily: "var(--font-family-numeric)" }}
      >
        {empty ? "-" : value}
        {!empty && unit && <span className="text-sm text-tertiary">{unit}</span>}
      </span>
      <span className="shrink-0 inline-flex" style={{ width: sparkWidth, height: 20 }}>
        {!empty && values.length > 1 && <Sparkline values={values} max={max} color={color} width={sparkWidth} />}
      </span>
    </span>
  );
}

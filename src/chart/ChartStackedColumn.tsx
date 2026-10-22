/**
 * ChartStackedColumn — 값축 위에 서는 세로 막대 하나. 구간을 아래에서 위로 쌓고 구간마다 값 글자를 붙인다. Primitives layer.
 *
 * ## Purpose
 * 한 단계 · 한 대상의 «얼마 중 얼마» 를 세로 막대 하나로 말한다. 아래 구간이 해당 몫(Allocated 6), 위 구간이 나머지(Not
 * Allocated 2)다. 구간 높이는 값축의 같은 `max` 를 분모로 하므로 [[ChartValueAxis]] 눈금과 높이가 맞는다.
 *
 * ## When to use
 * - 단계별 누적 막대(깔때기형) — [[GpuStatusBar]] 의 단계 하나.
 * - 범주 막대 차트에서 막대마다 «몫 + 나머지» 를 쌓아 보일 때.
 *
 * ## When NOT to use
 * - 시간 구간마다 막대(TPS · 응답시간) → [[MiniBarChart]] — 구간 수가 많고 막대가 칸을 꽉 채운다.
 * - 가로 막대 줄 → [[BarListItem]].
 * - 계열이 셋 이상인 누적 — 칸이 좁아 구간 글자가 겹친다. [[MiniBarChart]] 누적 + 범례.
 *
 * ## Composition rules
 * - 플롯 칸(높이가 정해진 세로 flex 칸) 안에 둔다. 막대 폭은 칸의 55%, 구간 높이는 `value / max`.
 * - 구간은 **아래에서 위로** 쌓는다(`segments[0]` 이 바닥). 구간 사이 간격 없음, 모서리 2px.
 * - 글자 자리: `inside` 는 구간 가운데에 고정 흰색(계열 색 위 전경 — 색 리터럴 정책의 허용 예외), `side` 는 막대 오른쪽 바깥에
 *   `text-secondary`. 칠이 연한 나머지 구간은 `side` 로 — 연한 면 위 흰 글자는 읽히지 않는다.
 * - 색은 마크 토큰. 몫 = 계열 색(`--color-chart-series-N`), 나머지 = `--color-surface-200`. 상태색을 «나머지» 로 쓰지 않는다(§17 · §23).
 * - 글자는 `text-chart`(9px) · 숫자 서체(§15 막대 값 글자).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 막대 폭 | 칸의 55% · 가운데 |
 * | 구간 높이 | `value / max` × 플롯 높이 · 모서리 2px |
 * | `inside` 글자 | 구간 가운데 · 고정 흰색 · `text-chart` · 숫자 서체 · 줄바꿈 없음 |
 * | `side` 글자 | 막대 오른쪽 바깥 4px · `text-secondary` · `text-chart` · 숫자 서체 |
 *
 * @example
 * ```tsx
 * <ChartStackedColumn max={8} segments={[
 *   { value: 6, label: "6 Allocated", color: "var(--color-chart-series-1)", labelPlacement: "inside" },
 *   { value: 2, label: "2 Not Allocated", color: "var(--color-surface-200)", labelPlacement: "side" },
 * ]} />
 * ```
 */
export type ChartStackedSegment = {
  /** 구간 값. 0 이면 그리지 않는다. */
  value: number;
  /** 구간 글자(「6 Allocated」). 없으면 글자 없음. */
  label?: string;
  /** 구간 칠 토큰. hex 금지. */
  color: string;
  /** 글자 자리. 진한 계열 색 위 `inside`(흰 글자), 연한 나머지 `side`(막대 오른쪽 바깥). 기본 `inside`. */
  labelPlacement?: "inside" | "side";
};

export type ChartStackedColumnProps = {
  /** 아래에서 위로 쌓을 구간. `segments[0]` 이 바닥. */
  segments: ChartStackedSegment[];
  /** 값축 최대 — [[ChartValueAxis]] 와 같은 값. */
  max: number;
};

export default function ChartStackedColumn({ segments, max }: ChartStackedColumnProps) {
  return (
    <div className="relative flex items-center h-full w-full" style={{ flexDirection: "column-reverse" }}>
      {segments.map((s, i) =>
        s.value > 0 ? (
          <div
            key={i}
            className="relative flex items-center justify-center rounded-2px"
            style={{ width: "55%", height: max > 0 ? `${(s.value / max) * 100}%` : 0, background: s.color }}
          >
            {s.label &&
              ((s.labelPlacement ?? "inside") === "inside" ? (
                <span
                  data-ds-policy-ok="차트 계열 색 막대 안 라벨 — 컬러 위 고정 흰색"
                  // raw-color-ok: 차트 계열 색으로 채운 막대 안 라벨 — 컬러 위 고정 흰색 전경.
                  className="absolute text-chart text-white leading-none whitespace-nowrap"
                  style={{ fontFamily: "var(--font-family-numeric)" }}
                >
                  {s.label}
                </span>
              ) : (
                <span
                  className="absolute text-chart text-secondary leading-none whitespace-nowrap"
                  style={{ left: "100%", marginLeft: 4, fontFamily: "var(--font-family-numeric)" }}
                >
                  {s.label}
                </span>
              ))}
          </div>
        ) : null,
      )}
    </div>
  );
}

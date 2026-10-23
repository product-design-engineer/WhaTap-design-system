/**
 * MetricBarCell — 수치 + 비율 막대를 한 셀에 겹쳐 놓는 표 셀. Primitives layer.
 *
 * ## Purpose
 * 표에서 수치 하나만 두면 행 사이 크기 비교를 사람이 암산해야 한다. 오른쪽에 같은 값의
 * 막대를 붙여, 읽지 않고도 어느 행이 큰지 보이게 한다. 막대는 구간을 나눠 담을 수 있어
 * 대기 시간처럼 "합은 같은데 구성이 다른" 수치도 한 칸에서 갈라 보인다.
 *
 * ## When to use
 * - Top-N 표의 수치 컬럼(경과 시간·CPU 시간·실행 횟수).
 * - 구성비를 함께 보여야 하는 누적 수치(대기 이벤트별 비중).
 *
 * ## When NOT to use
 * - 시간축 추이 → [[MiniLineChart]].
 * - 단독 진행률 표시 → [[DashboardBuildingProgress]].
 *
 * ## Composition rules
 * - 값은 `numeric.compact` 역할 — `text-base font-numeric tabular-nums`, 우측 정렬.
 * - 막대 트랙은 `--color-status-info-soft`, 채움은 `segments[].color`(차트 팔레트 토큰 허용).
 * - `segments` 의 ratio 합이 1 을 넘으면 넘는 만큼 잘린다 — 정규화는 호출측 책임.
 * - 값이 없으면 `"-"` 만 두고 막대를 그리지 않는다. 빈 막대는 0 으로 읽히기 때문이다.
 * - 0 보다 큰 구간은 최소 2px — 0.01% 대 값도 0 과 갈린다(patterns §21, 2026-10-23).
 *
 * @example
 * ```tsx
 * <MetricBarCell value="27.81" segments={[{ ratio: 1, color: "var(--color-status-warning)" }]} />
 * <MetricBarCell value="25.46" segments={[{ ratio: .6, color: "var(--color-palette-c44cd8)" }, { ratio: .3, color: "var(--color-gray-soft)" }]} />
 * <MetricBarCell value={null} />
 * ```
 */

export type MetricBarSegment = {
  /** 막대 전체 폭 대비 비율 0~1. */
  ratio: number;
  /** 채움 색 — 토큰 참조. */
  color: string;
};

export type MetricBarCellProps = {
  /** 표시 수치. `null` 이면 "-" 만 그리고 막대는 생략. */
  value: string | number | null;
  /** 막대 구간. 비면 막대를 그리지 않는다. */
  segments?: MetricBarSegment[];
  /** 막대 폭(px). 기본 56. */
  barWidth?: number;
};

export default function MetricBarCell({
  value,
  segments = [],
  barWidth = 56,
}: MetricBarCellProps) {
  if (value === null || value === undefined) {
    return <span className="text-base text-tertiary tabular-nums">-</span>;
  }

  return (
    <span className="flex items-center justify-between" style={{ gap: 8, width: "100%" }}>
      <span className="text-base font-numeric tabular-nums text-primary" style={{ flex: "1 1 auto", textAlign: "right" }}>
        {value}
      </span>
      {segments.length > 0 && (
        <span
          className="flex rounded-full overflow-hidden"
          style={{
            width: barWidth,
            height: 10,
            flex: "0 0 auto",
            background: "var(--color-status-info-soft)",
          }}
        >
          {segments.map((s, i) => (
            <span
              key={i}
              style={{
                /* 0 이 아닌 값은 최소 2px — 0.01% 대 값이 1px 아래로 사라져 0 으로 읽히던 결함(§21, 2026-10-23). */
                width: s.ratio > 0 ? `max(2px, ${Math.min(1, s.ratio) * 100}%)` : 0,
                background: s.color,
              }}
            />
          ))}
        </span>
      )}
    </span>
  );
}

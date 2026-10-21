/**
 * HeatmapLegend — 히트맵 색이 무슨 값이었는지 되읽는 범례. Primitives layer.
 *
 * ## Purpose
 * [[HeatmapCell]] 이 쓰는 순차 스케일을 가로 그라디언트 막대 하나로 펴고, 무엇의 값인지(`label`)
 * 와 눈금을 붙인다. 색만 있고 범례가 없으면 격자는 "어디가 진하다" 까지만 말하고 멈추며,
 * 눈금만 있고 라벨이 없으면 "0~100% 인데 무엇의 0~100%인가" 가 화면 밖에 남는다.
 *
 * ## When to use
 * - [[Heatmap]] 바로 아래. 격자와 같은 폭으로 둔다.
 * - 색 칸만으로는 «무엇의 몇 %» 인지 읽히지 않을 때 — 값의 이름(`label`)과 눈금을 붙인다.
 *
 * ## When NOT to use
 * - 범주형 색 구분(정상/경고/위험) → 색 dot + 라벨 목록. 그라디언트는 순서가 있는 값 전용.
 *
 * ## Composition rules
 * - `label` 에는 **색이 무엇인지**를 쓴다(지표명 + 집계). 시간 구간은 쓰지 않는다 — 그건 격자의 축이지
 *   색의 뜻이 아니고, 화면 다른 곳이 이미 말하고 있다.
 * - `marker` 는 [[Heatmap]] `onHoverChange` 에 잇는다. 커서가 놓인 칸의 색이 스케일 어디에
 *   앉는지 짚어 주고 수치를 함께 말한다 — 색만 있고 수치가 없는 격자에서 값을 읽는 길이다.
 *   표식은 hover 중에만 뜬다. 늘 떠 있으면 어느 값이 지금 것인지 흐려진다.
 * - 막대 배경은 `--gradient-heatmap-scale` 토큰 하나. 컴포넌트가 stop 을 다시 나열하지 않는다.
 * - 눈금은 기본 0/25/50/75/100%. 양 끝은 안쪽으로 붙여 잘리지 않게 정렬한다.
 * - 높이는 24px 고정 — 값을 읽는 대상이 아니라 색 대조용 띠다.
 *
 * @example
 * ```tsx
 * <HeatmapLegend label="[XOS] CPU · 평균" marker={hovered} />
 * <HeatmapLegend label="응답 시간 · 최대" ticks={[0, 50, 100]} unit="ms" />
 * ```
 */

export type HeatmapLegendProps = {
  /** 색이 무엇인지 — 지표명 + 집계. 예: `"[XOS] CPU · 평균"`. */
  label?: string;
  /**
   * 지금 짚고 있는 값(정규화 0~1). 막대 위 그 자리에 수치 말풍선과 화살표가 뜬다.
   * `null`/미지정이면 표식 없음.
   */
  marker?: number | null;
  /** 표식 수치의 소수 자릿수. 기본 2. */
  markerFractionDigits?: number;
  /** 눈금 값 목록 (0~100). 기본 0/25/50/75/100. */
  ticks?: number[];
  /** 눈금 뒤 단위. 기본 "%". */
  unit?: string;
  /** 막대 높이(px). 기본 24. */
  height?: number;
};

export default function HeatmapLegend({
  label,
  marker = null,
  markerFractionDigits = 2,
  ticks = [0, 25, 50, 75, 100],
  unit = "%",
  height = 24,
}: HeatmapLegendProps) {
  const markerPct = marker === null ? null : Math.min(100, Math.max(0, marker * 100));

  return (
    <div className="flex flex-col" style={{ gap: 2 }}>
      {label && (
        <span className="text-sm font-medium text-secondary" style={{ marginBottom: 2 }}>
          {label}
        </span>
      )}

      {/* 표식 자리 — hover 여부와 무관하게 높이를 잡아 둔다. 뜰 때마다 막대가 밀리면
          눈이 값이 아니라 움직임을 좇는다. */}
      <div className="relative" style={{ height: 20 }}>
        {markerPct !== null && (
          <span
            className="absolute flex flex-col items-center"
            style={{
              left: `${markerPct}%`,
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            <span
              className="text-base font-bold text-primary tabular-nums whitespace-nowrap bg-card rounded-2px"
              style={{
                padding: "1px 6px",
                border: "1px solid var(--color-border-default)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {markerPct.toFixed(markerFractionDigits)}
              {unit}
            </span>
            <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden className="block">
              <path d="M0 0h8L4 5z" fill="var(--color-text-primary)" />
            </svg>
          </span>
        )}
      </div>

      <div
        className="w-full rounded-2px"
        style={{ height, background: "var(--gradient-heatmap-scale)" }}
        aria-hidden
      />
      <div className="relative" style={{ height: 14 }}>
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute text-xs text-tertiary leading-none tabular-nums"
            style={{
              left: `${t}%`,
              transform:
                t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {t}
            {unit}
          </span>
        ))}
      </div>
    </div>
  );
}

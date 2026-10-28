/**
 * TrendTile — 지표 하나의 지금 값 · 비교 시점 대비 변화 · 최근 추이를 한 칸에 담는 추세 타일. Composite layer.
 *
 * ## Purpose
 * «지금 얼마이고, 나아지는 중인가 나빠지는 중인가» 를 한 칸에서 읽게 한다. 변화의 색은 **지표의 좋은 방향**이 정한다 —
 * TPS 가 오르면 좋고, 에러율이 오르면 나쁘다. [[StatCard]] `trend` 는 방향만 받아 오름을 늘 같은 색으로 칠했다(지표 방향 무시).
 * 여기서는 `better` 로 좋은 방향을 받아 개선 · 악화를 가리고, 비교 기준(«어제 같은 시각 대비»)을 글자로 함께 둔다.
 *
 * ## When to use
 * - 대시보드 위쪽 요약 줄에서 지표 3~6개를 «값 + 변화 + 추이» 로 나란히 — TPS · 응답시간 · 에러율 · 사용자 수.
 * - 비교 시점(전일 · 전주 · 직전 구간) 대비 변화가 판단의 핵심일 때.
 *
 * ## When NOT to use
 * - 값 하나만(변화 · 추이 없음) → [[KpiCard]] · [[StatCard]] · [[MetricStat]].
 * - 시점 · 최고점을 읽어야 하는 추이 → [[MiniLineChart]]. 타일의 추이는 모양만 말한다.
 * - 범위 안 위치 → [[RangeGauge]].
 *
 * ## Metrics
 * - ✅ 좋은 방향이 정해진 지표의 지금 값 + 비교 시점 대비 변화 — TPS · 응답시간(ms) · 에러율(%) · 활성 사용자 수 · 비용
 * - ✅ 전일 · 전주 같은 시각처럼 비교 기준이 분명한 지표
 * - ❌ 좋은 방향이 없는 지표(온도 · 파드 수처럼 오르내림이 판정이 아닌 값) — 개선 · 악화 색이 거짓 판정을 말한다. `better="none"` 으로 색을 끈다
 * - ❌ 누적 카운터 원값(총 요청 수) — 늘 오르므로 변화가 늘 «개선» 으로 보인다. 구간 값(rate)으로
 *
 * ## Composition rules
 * - 요소를 조합한다 — 지표명 · 값 · 단위 [[MetricStat]] · 최근 추이 [[Sparkline]]. 타일은 변화 줄과 껍데기만 그린다. 그래서 Composite 계층이다.
 * - **변화 색 = 좋은 방향(`better`) 대비 개선 · 악화(2026-10-23 결정).** 개선 `--color-status-success` · 악화 `--color-status-error` ·
 *   변화 없음(0) 또는 `better="none"` 이면 `text-tertiary`. 색만으로 말하지 않는다 — ▲ ▼ 기호와 부호 있는 값을 함께 쓰고,
 *   `aria-label` 에 «개선 · 악화» 를 넣는다(§23).
 * - 비교 기준은 글자로(`compareLabel`, 기본 「직전 대비」). 기준 없는 변화 값을 두지 않는다.
 * - 스파크라인은 데이터 최소 ~ 최대로 그린다(`min` · `max`) — 0 에서 먼 지표(TPS 1,000 대)도 모양이 보이게. 바닥선은 없다.
 * - 스파크라인 색은 계열 1(`color` 로 바꿈) — 변화 색과 같게 칠하지 않는다(추이는 판정이 아니다).
 * - `frame`(기본 true)이면 카드 표면 · 테두리 · 안쪽 12px. [[WidgetFrame]] 안에서는 `frame={false}`.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 배치 | 위: [[MetricStat]](폭 auto) · 오른쪽 [[Sparkline]] 80 × 32 / 아래: 변화 줄 |
 * | 변화 줄 | `▲ +12.4%` · `text-sm` · 숫자 서체 · 색 = 개선 success / 악화 error / 없음 tertiary + 비교 기준 `text-sm` tertiary |
 * | 껍데기(`frame`) | `bg-card` · 1px `--color-border-default` · 반경 4 · 안쪽 12 |
 * | 접근성 | 변화 줄 `aria-label` = 「직전 대비 12.4% 증가, 개선」 |
 *
 * @example
 * ```tsx
 * <TrendTile label="에러율" value="0.42" unit="%" delta={-0.08} deltaUnit="%p" better="down" compareLabel="어제 같은 시각 대비" values={err24h} />
 * ```
 */
import MetricStat from "../MetricStat";
import Sparkline from "./Sparkline";

export type TrendTileProps = {
  /** 지표 이름. */
  label: string;
  /** 지금 값(표기 그대로). */
  value: string | number;
  /** 값 뒤 단위. */
  unit?: string;
  /** 비교 시점 대비 변화(부호 있음). 없으면 변화 줄을 그리지 않는다. */
  delta?: number;
  /** 변화 단위(「%」 「%p」 「ms」). */
  deltaUnit?: string;
  /** 좋은 방향 — 오르면 좋다 `up`(기본) · 내리면 좋다 `down` · 판정 없음 `none`. */
  better?: "up" | "down" | "none";
  /** 비교 기준 글자. 기본 「직전 대비」. */
  compareLabel?: string;
  /** 최근 추이(시간순). 없으면 스파크라인을 그리지 않는다. */
  values?: ReadonlyArray<number>;
  /** 스파크라인 색 — 계열 토큰. 기본 series-1. */
  color?: string;
  /** 카드 껍데기를 그릴지. 기본 true. [[WidgetFrame]] 안에서는 false. */
  frame?: boolean;
};

const fmtDelta = (d: number) => `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default function TrendTile({
  label,
  value,
  unit,
  delta,
  deltaUnit = "",
  better = "up",
  compareLabel = "직전 대비",
  values,
  color = "var(--color-chart-series-1)",
  frame = true,
}: TrendTileProps) {
  const dir = delta == null || delta === 0 ? 0 : delta > 0 ? 1 : -1;
  const verdict = better === "none" || dir === 0 ? null : (better === "up") === dir > 0 ? "개선" : "악화";
  const tone = verdict === "개선" ? "var(--color-status-success)" : verdict === "악화" ? "var(--color-status-error)" : "var(--color-text-tertiary)";
  const arrow = dir > 0 ? "▲" : dir < 0 ? "▼" : "–";
  return (
    <div
      className={`flex flex-col gap-8px min-w-0 ${frame ? "bg-card border border-color-var-color-border-default rounded-4px" : ""}`}
      style={{ padding: frame ? 12 : 0 }}
    >
      <div className="flex items-end justify-between gap-8px min-w-0">
        <MetricStat label={label} value={value} unit={unit} width="auto" />
        {values && values.length > 1 && (
          <Sparkline values={values} min={Math.min(...values)} max={Math.max(...values)} color={color} width={80} height={32} />
        )}
      </div>
      {delta != null && (
        <div
          role="group"
          className="flex items-baseline gap-4px text-sm min-w-0"
          aria-label={`${compareLabel} ${Math.abs(delta)}${deltaUnit} ${dir > 0 ? "증가" : dir < 0 ? "감소" : "변화 없음"}${verdict ? `, ${verdict}` : ""}`}
        >
          <span className="shrink-0" style={{ color: tone, fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-medium)" }}>
            {arrow} {fmtDelta(delta)}
            {deltaUnit}
          </span>
          <span className="text-tertiary truncate">{compareLabel}</span>
        </div>
      )}
    </div>
  );
}

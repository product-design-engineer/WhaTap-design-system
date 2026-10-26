/**
 * ArcGauge — 범위 안 지금 값 하나를 호 길이 · 가운데 큰 숫자로 말하는 호 게이지. Composite layer.
 *
 * ## Purpose
 * 대시보드 칸 하나를 지표 하나에 줄 때, 큰 숫자와 «얼마나 찼나» 를 함께 보인다. [[RangeGauge]](막대)와 같은 계약 — 채움 색은 값이 든
 * 임계 구간, 임계는 바깥 띠, 양 끝은 이름 + 값 — 을 둥근 칸에 옮겼다. 라이브에는 속도계([[ActiveTransactionArc]])만 있고 범용 호 게이지
 * 캡처가 없었다(patterns §21) — 그래서 막대 게이지와 같은 규칙으로 만든다.
 *
 * ## When to use
 * - 칸 하나에 지표 하나의 지금 값 — CPU · 메모리 사용률 · SLO 달성률 · 쿼터 소진.
 * - 정사각에 가까운 칸(대시보드 1×1)에서 큰 숫자가 주인일 때.
 *
 * ## When NOT to use
 * - 좁고 긴 칸 · 숫자 칸 아래 막대 → [[RangeGauge]]. 같은 계약의 직선판이다.
 * - 대상 여럿 비교 → [[EqualizerChart]] · [[BarList]]. 호 여러 개를 나란히 두지 않는다 — 각도는 길이보다 비교가 어렵다.
 * - 에이전트별 액티브 트랜잭션(등급 누적 고리) → [[ActiveTransactionArc]].
 * - 시간 흐름 → [[MiniLineChart]].
 *
 * ## Metrics
 * - ✅ 상한이 정해진 지금 값 하나 — CPU · 메모리 · 디스크 사용률(%) · SLO 달성률 · 쿼터 · 라이선스 소진
 * - ❌ 상한이 없는 지표(TPS · 응답시간) — 호의 끝이 아무 값이 되어 채움이 거짓 비율을 말한다
 * - ❌ 여러 대상의 값 비교 — 호 각도는 막대 길이보다 비교가 어렵다 → [[EqualizerChart]] · [[BarList]]
 *
 * ## Color
 * - 역할: 상태 — 채움 = 지금 값이 든 임계 구간. 보통 `--color-brand-blue` · 경고 `--color-status-warning` · 위험 `--color-status-error`
 * - 상한: 3톤(보통 · 경고 · 위험)
 * - 고정: 트랙 `--color-surface-100` · 임계 띠는 같은 상태 토큰
 * - 금지: 계열 슬롯으로 채우지 않는다 · 임계 판정 없이 경고 · 위험 색을 쓰지 않는다(§23)
 *
 * ## Composition rules
 * - 요소를 조합한다 — 호 [[ChartArc]](트랙 · 채움 · 바깥 임계 띠). 게이지는 가운데 값 · 양 끝 글자만 그린다. 그래서 Composite 계층이다.
 * - **[[RangeGauge]] 와 같은 계약** — 채움 색 = 값이 든 임계 구간(neutral `--color-brand-blue` · warning · critical), 임계 기준값은 호출부,
 *   숫자는 천 단위 쉼표(K 로 줄이지 않음), 양 끝은 이름 + 값.
 * - 각도 240°(−120° ~ +120°) — 아래가 열려 양 끝 글자가 호 끝 아래에 선다.
 * - 가운데: 값 `text-2xl` medium 숫자 서체 + 단위 `text-sm` tertiary, 그 아래 `label` `text-sm` secondary.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 호 | [[ChartArc]] `size` 140 · 굵기 10 · −120° ~ 120° · 트랙 `--color-surface-100` |
 * | 채움 색 | 값이 든 구간 — neutral `--color-brand-blue` · warning `--color-status-warning` · critical `--color-status-error` |
 * | 임계 띠 | 호 바깥 3px · 굵기 3 · 구간 색 |
 * | 가운데 | 값 `text-2xl` · `--font-family-numeric` · medium · primary + 단위 `text-sm` tertiary / `label` `text-sm` secondary |
 * | 양 끝 | `{minLabel} {min}{unit}` · `{maxLabel} {max}{unit}` · `text-chart` · tertiary · 호 끝 아래 |
 * | 접근성 | `role="meter"` · `aria-valuenow/min/max` · `aria-label` = label |
 *
 * @example
 * ```tsx
 * <ArcGauge label="CPU" value={72.5} max={100} unit="%" thresholds={[{ from: 80, tone: "warning" }, { from: 90, tone: "critical" }]} />
 * ```
 */
import ChartArc from "./ChartArc";

export type ArcGaugeThreshold = {
  /** 이 값부터 다음 임계(또는 Max)까지가 이 구간이다. */
  from: number;
  tone: "warning" | "critical";
};

export type ArcGaugeProps = {
  /** 지금 값. */
  value: number;
  /** 범위 아래 끝. 기본 0. */
  min?: number;
  /** 범위 위 끝. */
  max: number;
  /** 값 뒤 단위. */
  unit?: string;
  /** 지표 이름 — 가운데 값 아래 · 접근성 이름. */
  label: string;
  /** 왼쪽 끝 이름. 기본 「Min」. */
  minLabel?: string;
  /** 오른쪽 끝 이름. 기본 「Max」. */
  maxLabel?: string;
  /** 임계 구간 — 오름차순. 지금 값이 든 구간이 채움 색을 정한다. */
  thresholds?: ReadonlyArray<ArcGaugeThreshold>;
  /** 호 크기(px). 기본 140. */
  size?: number;
};

const TONE = {
  neutral: "var(--color-brand-blue)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
} as const;

/** 정확한 값 — 천 단위 쉼표 · 소수 첫째 자리까지([[RangeGauge]] 와 같다). */
const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 1 });

export default function ArcGauge({ value, min = 0, max, unit = "", label, minLabel = "Min", maxLabel = "Max", thresholds = [], size = 140 }: ArcGaugeProps) {
  const span = max - min;
  const ratio = (v: number) => (span > 0 ? Math.min(1, Math.max(0, (v - min) / span)) : 0);
  const sorted = [...thresholds].sort((a, b) => a.from - b.from);
  const tone = sorted.filter((t) => value >= t.from).pop()?.tone ?? "neutral";
  const bands = sorted.map((t, i) => ({ from: ratio(t.from), to: ratio(sorted[i + 1]?.from ?? max), color: TONE[t.tone] }));
  const NUM = { fontFamily: "var(--font-family-numeric)" } as const;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      className="inline-flex flex-col items-center"
      style={{ width: size }}
    >
      <ChartArc ratio={ratio(value)} color={TONE[tone]} size={size} bands={bands}>
        <span className="flex items-baseline" style={{ gap: 2 }}>
          <span className="text-2xl text-primary" style={{ ...NUM, fontWeight: "var(--font-weight-medium)", lineHeight: "var(--leading-none)" }}>
            {fmt(value)}
          </span>
          {unit && (
            <span className="text-sm text-tertiary" style={NUM}>
              {unit}
            </span>
          )}
        </span>
        <span className="text-sm text-secondary mt-4px">{label}</span>
      </ChartArc>
      {/* 양 끝 — 240° 호는 아래가 열려 끝이 높이의 약 75% 에 선다 */}
      <div className="flex justify-between w-full text-chart text-tertiary leading-none" style={{ ...NUM, marginTop: -size * 0.2, padding: `0 ${size * 0.08}px` }}>
        <span>
          {minLabel} {fmt(min)}
          {unit}
        </span>
        <span>
          {maxLabel} {fmt(max)}
          {unit}
        </span>
      </div>
    </div>
  );
}

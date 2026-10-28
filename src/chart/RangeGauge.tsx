/**
 * RangeGauge — 범위(min ~ Max) 안의 지금 값을 막대 · ▼ · 양 끝 라벨로 말하는 막대 게이지. Composite layer.
 *
 * ## Purpose
 * «범위 안 어디쯤인가 · 임계에 얼마나 가까운가» 를 한 줄로 읽게 한다. 라이브 K8S Request CPU 카드는 채움 없는 회색 트랙에
 * 라벨 없는 숫자 셋(1100 · 2200 · 0)과 잘린 캡션(`R.. A..`)이 붙어 있어 어느 숫자가 무엇인지 읽히지 않았다(patterns §21).
 * 여기서는 채움이 지금 값, ▼ 말풍선이 그 값, 양 끝이 이름 붙은 범위(Min · Max), 트랙 아래 띠가 임계 구간이다.
 *
 * ## When to use
 * - 범위가 정해진 지금 값 하나 — 할당(Request) 대비 사용 · 한계(Limit) 대비 사용 · 쿼터 · 정원.
 * - 임계 구간(경고 · 위험)이 있어 «얼마나 가까운가» 가 판정의 일부일 때 — `thresholds`.
 * - [[KpiCard]] · 숫자 칸 아래에 붙는 막대.
 *
 * ## When NOT to use
 * - 범위 표시 · ▼ 없이 소비량 막대만 → [[UsageGauge]](이 차트가 조합하는 요소). 표 행 안의 비율 막대 → [[MetricBarCell]].
 * - 시간에 따른 변화 → [[MiniLineChart]] · 도달 시점 예측 → [[ForecastLineChart]]. 게이지는 지금 한 시점이다.
 * - 범위가 없는 값(TPS · 건수) — 채움 비율이 뜻을 갖지 못한다. 숫자로만 쓴다.
 *
 * ## Metrics
 * - ✅ 범위가 정해진 지금 값 — CPU · 메모리 Request · Limit 대비 사용(mi · MiB) · 쿼터 · 스토리지 한계 대비 사용 · 좌석 · 라이선스 정원
 * - ✅ 상한 100 인 비율의 지금 값 — CPU · 디스크 사용률(%) 에 경고 · 위험 구간을 함께
 * - ❌ 상한이 없는 지표(TPS · 응답시간 · 건수) — Max 를 아무 값으로 정하면 채움이 거짓 비율을 말한다
 * - ❌ 시간 흐름 · 추세 → [[MiniLineChart]] · [[ForecastLineChart]]
 *
 * ## Colors
 * - 상태 — 채움 · ▼ · 임계 띠를 지금 값이 든 구간으로 · 임계 밖 `--color-brand-blue` · `--color-status-warning` · `--color-status-error`
 * - 바탕 — 트랙 · `--color-surface-100`
 *
 * ## Composition rules
 * - 요소를 조합한다 — 채움 [[UsageGauge]](트랙 · 채움 · 톤) · 지금 값 [[ChartPeakMarker]](▼ 말풍선). 차트는 임계 띠와 범위 글자만 그린다.
 *   그래서 Composite 계층이다.
 * - **채움 색은 지금 값이 든 구간이 정한다** — 경고 구간이면 warning, 위험 구간이면 critical, 그 밖은 neutral. 임계 띠는 트랙 아래 2px 에
 *   같은 상태 토큰으로 깔아 «어디서부터 위험인가» 를 값과 따로 보인다. 임계 기준값은 제품 규칙이라 호출부가 준다.
 * - **양 끝은 이름과 값을 함께**(`Min 0mi` · `Allocatable 2,200mi`) — 라벨 없는 숫자를 두지 않는다. 이름은 `minLabel` · `maxLabel` 로 바꾼다
 *   (`Request` · `Limit`). 캡션(`caption`)은 말줄임하지 않고 줄바꿈한다 — 잘린 캡션이 라이브의 결함이었다.
 * - ▼ 말풍선 글자는 값 + 단위, ▼ 색은 채움과 같은 톤. 값이 범위 밖이면 막대 · ▼ 는 끝에 멈추고 글자만 실제 값을 말한다.
 * - 축 · 범위 글자는 `text-chart`(9px) · 숫자 서체 · tertiary(§15).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 높이 | ▼ 말풍선 18 + 간격 2 + 막대 6 + 임계 띠 간격 2 · 띠 2 + 간격 4 + 범위 글자 9 (+ 캡션) |
 * | 막대 | [[UsageGauge]] 6px · 트랙 `--color-surface-100` |
 * | 채움 색 | neutral `--color-brand-blue` · warning `--color-status-warning` · critical `--color-status-error`(UsageGauge 톤) |
 * | 임계 띠 | 2px · warning 구간 `--color-status-warning` · critical 구간 `--color-status-error` · 그 밖 투명 |
 * | ▼ | [[ChartPeakMarker]] — 끝이 막대 위 끝, x = (값 − min) ÷ (max − min) |
 * | 범위 글자 | 왼쪽 `{minLabel} {min}{unit}` · 오른쪽 `{maxLabel} {max}{unit}` · `text-chart` · 숫자 서체 · tertiary |
 * | 숫자 | 천 단위 쉼표 · 소수 첫째 자리까지 — 축처럼 K 로 줄이지 않는다 |
 * | 캡션 | `text-sm` · secondary · 줄바꿈(말줄임 없음) |
 * | 접근성 | progressbar(`label`) — 값 · 범위는 UsageGauge 가 말한다 |
 *
 * @example
 * ```tsx
 * <RangeGauge label="CPU Request" value={1100} max={2200} unit="mi" maxLabel="Allocatable"
 *   thresholds={[{ from: 1760, tone: "warning" }, { from: 2090, tone: "critical" }]} />
 * ```
 */
import ChartPeakMarker from "./ChartPeakMarker";
import UsageGauge, { type UsageGaugeTone } from "./UsageGauge";

export type RangeGaugeThreshold = {
  /** 이 값부터 다음 임계(또는 Max)까지가 이 구간이다. */
  from: number;
  tone: "warning" | "critical";
};

export type RangeGaugeProps = {
  /** 지금 값. */
  value: number;
  /** 범위 아래 끝. 기본 0. */
  min?: number;
  /** 범위 위 끝 — 할당량 · 한계 · 정원. */
  max: number;
  /** 값 뒤 단위(「mi」 「%」 「GiB」). */
  unit?: string;
  /** 무엇을 잰 게이지인지 — 스크린리더 이름(UsageGauge `label`). */
  label: string;
  /** 왼쪽 끝 이름. 기본 「Min」. */
  minLabel?: string;
  /** 오른쪽 끝 이름. 기본 「Max」 — `Limit` · `Allocatable` 처럼 범위의 뜻으로 바꾼다. */
  maxLabel?: string;
  /** 임계 구간 — 오름차순 `from`. 지금 값이 든 구간이 채움 색을 정한다. */
  thresholds?: ReadonlyArray<RangeGaugeThreshold>;
  /** 막대 아래 설명 한 줄(말줄임 없이 줄바꿈). */
  caption?: string;
};

const TONE_COLOR: Record<UsageGaugeTone, string> = {
  neutral: "var(--color-brand-blue)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
};
const MARKER_H = 18;

/** 게이지 글자는 정확한 값 — 축처럼 `1.1K` 로 줄이지 않는다(옆 큰 숫자 `1,100` 과 같은 말을 해야 한다). 천 단위 쉼표 · 소수 첫째 자리까지. */
const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 1 });

export default function RangeGauge({
  value,
  min = 0,
  max,
  unit = "",
  label,
  minLabel = "Min",
  maxLabel = "Max",
  thresholds = [],
  caption,
}: RangeGaugeProps) {
  const span = max - min;
  const ratio = (v: number) => (span > 0 ? Math.min(1, Math.max(0, (v - min) / span)) : 0);
  const sorted = [...thresholds].sort((a, b) => a.from - b.from);
  const tone: UsageGaugeTone = sorted.filter((t) => value >= t.from).pop()?.tone ?? "neutral";
  const bands = sorted.map((t, i) => ({ tone: t.tone, from: ratio(t.from), to: ratio(sorted[i + 1]?.from ?? max) }));

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* ▼ 자리 — 말풍선 끝이 막대 위 끝에 닿는다 */}
      <div className="relative w-full" style={{ height: MARKER_H + 2 }}>
        <ChartPeakMarker label={`${fmt(value)}${unit}`} color={TONE_COLOR[tone]} left={`${ratio(value) * 100}%`} top={MARKER_H + 2} />
      </div>
      <UsageGauge label={label} percent={ratio(value) * 100} tone={tone} />
      {/* 임계 띠 — 어디서부터 경고 · 위험인가 */}
      <div aria-hidden className="relative w-full" style={{ height: 2, marginTop: 2 }}>
        {bands.map((b, i) => (
          <span
            key={i}
            className="absolute"
            style={{ left: `${b.from * 100}%`, width: `${(b.to - b.from) * 100}%`, top: 0, bottom: 0, background: TONE_COLOR[b.tone] }}
          />
        ))}
      </div>
      <div className="flex justify-between text-chart text-tertiary leading-none" style={{ marginTop: 4, fontFamily: "var(--font-family-numeric)" }}>
        <span>
          {minLabel} {fmt(min)}
          {unit}
        </span>
        <span>
          {maxLabel} {fmt(max)}
          {unit}
        </span>
      </div>
      {caption && <p className="text-sm text-secondary" style={{ marginTop: 4 }}>{caption}</p>}
    </div>
  );
}

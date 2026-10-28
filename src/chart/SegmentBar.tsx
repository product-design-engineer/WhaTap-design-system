/**
 * SegmentBar — 전체 하나를 구간으로 나눈 단일 가로 누적 바. 바 아래 한 줄 범례(값 · 비율). Composite layer.
 *
 * ## Purpose
 * «전체가 무엇으로 이루어졌나» 를 막대 하나로 — 페이지 로드 구간 · 심각도별 서버 수 · GPU 활용 상태. 라이브에는 같은 유형이 세 모양이었다:
 * 범례에 없는 회색 빈 구간(대기 시간)이 바에 섞여 범례와 1:1 로 맞지 않았고, 범례가 카드마다 1행 · 2×2 로 갈렸으며, 견본이 점이었다
 * (patterns §21). 여기서는 남는 몫을 이름 붙은 «나머지» 구간으로 범례에 넣고, 범례는 한 줄(넘치면 줄바꿈), 견본은 막대 마크라 사각이다(§26).
 *
 * ## When to use
 * - 합이 정해진 전체의 지금 구성 — 페이지 로드 구간(ms) · 심각도별 서버 수 · GPU 활용 상태(Effective · Active · Idle · Unallocated).
 * - 구간 2~8개. 칸이 좁아 도넛을 둘 수 없는 자리(카드 한 줄 · 표 위).
 *
 * ## When NOT to use
 * - 시간에 따른 구성 변화 → [[StackedAreaChart]] · [[MiniBarChart]] 누적.
 * - 단계마다 줄어드는 깔때기 → [[GpuStatusBar]].
 * - 범위 안 지금 값 하나 → [[RangeGauge]] · 표 행 안 → [[MetricBarCell]].
 * - 구간 9개 이상 — 작은 조각이 사라진다 → [[BarList]].
 *
 * ## Metrics
 * - ✅ 합이 정해진 전체의 지금 구성 — 페이지 로드 구간(리다이렉트 · DNS · 연결 · 응답 · 렌더링, ms) · 심각도별 서버 · 이벤트 수 · GPU 활용 상태 비율
 * - ❌ 합이 의미 없는 값(사용률 여럿 · 백분위) — 막대 길이가 존재하지 않는 전체를 말한다
 * - ❌ 시간 흐름 → [[StackedAreaChart]]
 *
 * ## Composition rules
 * - 요소를 조합한다 — 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]]. 바(구간)만 그린다. 그래서 Composite 계층이다.
 * - **남는 몫은 이름 붙은 구간(2026-10-23 결정)** — `total` 이 구간 합보다 크면 `restLabel`(기본 「나머지」) 구간을 `--color-surface-200` 으로 끝에 붙이고
 *   범례에도 넣는다. 범례에 없는 빈 구간을 두지 않는다.
 * - **범례는 바 아래 한 줄, 넘치면 줄바꿈(2026-10-23 결정)** — 칸 폭에 따라 1행 · 2×2 로 모양을 바꾸지 않는다(§15). 견본은 사각(막대 마크, §26).
 *   범례 값은 `legendValue`: `value`(기본) · `percent` · `both`.
 * - 구간 색은 호출부가 준다 — 계열(`--color-chart-series-*`)이나 상태(심각도). 한 바에 두 의미를 섞지 않는다(§23).
 * - 구간 사이 2px 카드색 틈 · 양 끝 둥글게. 0 인 구간은 바에서 빠지고 범례에는 남는다.
 * - hover: 구간 · 범례 항목을 가리키면 그 구간만 남기고(나머지 0.32) [[ChartTooltip]] 이 이름 · 값 · 전체의 % 를 보인다(patterns §26 «강조»).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 바 | 높이 `height` 12 · 끝 반경 = 높이 ÷ 2 · 구간 사이 2px `--color-card` |
 * | 나머지 | `total` − 합 > 0 이면 `restLabel` 구간 `--color-surface-200` |
 * | 범례 | 바 아래 8px · [[ChartLegendItem]] 사각 · 가로 줄 간격 12 · 줄바꿈 · 값 `value` / `percent` / `both` |
 * | hover | 구간 · 범례 → 나머지 0.32 · [[ChartTooltip]](이름 · 값 + 단위 · 전체의 %) |
 * | 접근성 | 바 `role="img"` + 「이름 값 (비율)」 나열 |
 *
 * @example
 * ```tsx
 * <SegmentBar unit="ms" total={4700} restLabel="대기" segments={[{ label: "리다이렉트", value: 2, color: "var(--color-chart-series-1)" }, …]} />
 * ```
 */
import { useState } from "react";
import ChartLegendItem from "./ChartLegendItem";
import ChartTooltip from "./ChartTooltip";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type SegmentBarSegment = {
  /** 구간 이름. */
  label: string;
  /** 값. 0 이면 바에서 빠지고 범례에 남는다. */
  value: number;
  /** 구간 색 토큰 — 계열 또는 상태. hex 금지. */
  color: string;
};

export type SegmentBarProps = {
  /** 구간들 — 왼쪽부터. */
  segments: ReadonlyArray<SegmentBarSegment>;
  /** 전체. 구간 합보다 크면 남는 몫이 `restLabel` 구간이 된다. 없으면 구간 합. */
  total?: number;
  /** 남는 몫의 이름. 기본 「나머지」. */
  restLabel?: string;
  /** 값 뒤 단위. */
  unit?: string;
  /** 범례 값 — 값 · 비율 · 둘 다. 기본 value. */
  legendValue?: "value" | "percent" | "both";
  /** 바 높이(px). 기본 12. */
  height?: number;
  /** 범례를 그릴지. 기본 true. */
  legend?: boolean;
};

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 1 });
const pctOf = (v: number, t: number) => `${t > 0 ? fmt((v / t) * 100) : 0}%`;

export default function SegmentBar({ segments, total, restLabel = "나머지", unit = "", legendValue = "value", height = 12, legend = true }: SegmentBarProps) {
  const sum = segments.reduce((n, s) => n + Math.max(0, s.value), 0);
  const whole = Math.max(total ?? sum, sum);
  const rest = whole - sum;
  const parts: SegmentBarSegment[] = rest > 0 ? [...segments, { label: restLabel, value: rest, color: "var(--color-surface-200)" }] : [...segments];
  const [hover, setHover] = useState<number | null>(null);
  /* 구간 왼쪽 끝 비율 — 툴팁 x */
  const starts = parts.reduce<number[]>((a, p, i) => [...a, i ? a[i - 1] + Math.max(0, parts[i - 1].value) / (whole || 1) : 0], []);
  const legendText = (p: SegmentBarSegment) =>
    legendValue === "percent" ? pctOf(p.value, whole) : legendValue === "both" ? `${fmt(p.value)}${unit} · ${pctOf(p.value, whole)}` : `${fmt(p.value)}${unit}`;
  const summary = parts.map((p) => `${p.label} ${fmt(p.value)}${unit} (${pctOf(p.value, whole)})`).join(", ");

  return (
    <div className="flex flex-col w-full min-w-0" style={{ gap: 8 }}>
      <div className="relative w-full" role="img" aria-label={summary}>
        <div className="flex w-full overflow-hidden" style={{ height, gap: 2, borderRadius: height / 2, background: "var(--color-card)" }}>
          {parts.map((p, i) =>
            p.value > 0 ? (
              <span
                key={p.label}
                className={`${MARK_CLASS} block h-full`}
                style={{ flex: `${p.value} 0 0`, minWidth: 2, background: p.color, opacity: hover != null && hover !== i ? DIM_OPACITY : 1 }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ) : null,
          )}
        </div>
        {hover != null && parts[hover] && (
          <ChartTooltip
            left={`${(starts[hover] + Math.max(0, parts[hover].value) / (whole || 1) / 2) * 100}%`}
            top={height / 2}
            flipX={starts[hover] > 0.5}
            title={parts[hover].label}
            rows={[{ label: "값", value: `${fmt(parts[hover].value)}${unit}`, color: parts[hover].color }]}
            footer={`전체의 ${pctOf(parts[hover].value, whole)}`}
          />
        )}
      </div>
      {legend && (
        <div className="flex flex-wrap" style={{ columnGap: 12, rowGap: 4 }}>
          {parts.map((p, i) => (
            <ChartLegendItem
              key={p.label}
              color={p.color}
              label={p.label}
              value={legendText(p)}
              onHover={(on) => setHover(on ? i : null)}
              dimmed={hover != null && hover !== i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ChartCrosshair — 시간축 차트의 «시점 고르기». 포인터 x → 가장 가까운 시점 · 세로 안내선 · 계열마다 점 · 값 툴팁. Primitives layer.
 *
 * ## Purpose
 * 선 · 막대 · 면 차트에서 «이 시각에 얼마였나» 를 읽게 한다. 시간축 차트는 마크가 가늘고(선 1.2px) 시점이 수십 개라 점 하나를 맞히게 하면
 * 쓸 수 없다 — 플롯 어디를 가리켜도 가장 가까운 시점을 고른다. 차트마다 이것을 따로 만들면 안내선 색 · 점 모양 · 툴팁 줄이 칸마다 달라진다
 * (patterns §26 «강조»). 그래서 고르기 · 안내선 · 점 · 툴팁을 한 곳이 맡고, 차트는 계열 값만 넘긴다.
 *
 * ## When to use
 * - 시간이 X 인 값축 차트의 hover — [[MiniLineChart]] · [[MiniMultiLineChart]] · [[MiniBarChart]](`band`) · [[ForecastLineChart]] · [[ApdexChart]] · [[UsageChart]].
 * - 막대 차트가 고른 시점 밖 막대를 흐릴 때 → `onIndex` 로 고른 시점을 받는다.
 *
 * ## When NOT to use
 * - 점 하나 · 칸 하나를 맞히는 차트(산점도 · 박스 · 칸) → 그 마크에 [[ChartTooltip]] 을 직접.
 * - 시간축이 없는 차트(도넛 · 게이지) → [[ChartTooltip]].
 *
 * ## Composition rules
 * - 툴팁은 [[ChartTooltip]](리프 Primitive 1개 — 계층 «리프 1개 예외»). 안내선 · 점은 이것이 그린다.
 * - 플롯 상자 규칙은 [[ChartGrid]] 와 같다 — 왼쪽 `--wds-widget-axis-gutter`, `right` · `padTop` · `padBottom` 을 차트와 같게 준다.
 * - 시점 x: 기본은 양 끝이 플롯 끝(선 · 면). 막대처럼 칸 가운데면 `band`, 간격이 고르지 않으면(도메인 좌표 · 예측) `positions`.
 * - 그 시점에 값이 없는 계열(`null`)은 점도 툴팁 줄도 없다.
 * - 안내선 1px `--color-border-strong` · 점 6px 계열 색 + 카드색 2px 고리(강조 규칙 · 내부 `_emphasis`). 색은 계열 그대로.
 * - 툴팁 제목 = `labels[i]`(시점 이름), 값 줄 = 계열(견본 · 이름 · 값 + `unit`), 보조 줄 = `footer(i)`.
 * - 마크가 아닌 덧그림 겹이라 마크 **위**에, 축 글자와 같은 겹에 둔다. 포인터를 벗어나면 모두 사라진다.
 * - 시간축을 공유하는 칸 여럿([[PairedTimeChart]])은 `index` · `onIndex` 로 한 시점을 함께 고르고, 툴팁은 한 칸에서만(`noTooltip`).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 고르기 | 플롯 상자 위 포인터 x → 가장 가까운 시점(`band` 면 칸 · `positions` 면 가장 가까운 x) |
 * | 안내선 | 1px `--color-border-strong` · 플롯 위 ~ 아래 |
 * | 점 | 지름 6 · 계열 색 · `0 0 0 2px var(--color-card)` 고리 · `null` 값은 점 없음 |
 * | 툴팁 | [[ChartTooltip]] — x = 시점, y = 가장 높은 점, 오른쪽 절반이면 왼쪽으로 |
 * | 접근성 | 장식 겹(`aria-hidden` 안내선 · 점). 값은 차트 요약 `aria-label` 과 툴팁(`role="tooltip"`) |
 *
 * @example
 * ```tsx
 * <ChartCrosshair count={values.length} max={yMax} labels={times} unit="%" series={[{ label: "CPU", color, values }]} />
 * ```
 */
import { useState, type ReactNode } from "react";
import ChartTooltip from "./ChartTooltip";
import { AXIS_GUTTER } from "./_axisScale";
import { EMPHASIS_RING } from "./_emphasis";
import type { ChartSwatchShape } from "./_swatch";

export type ChartCrosshairSeries = {
  /** 계열 이름 — 툴팁 줄. */
  label: string;
  /** 계열 색 토큰 — 점 · 견본. */
  color: string;
  /** 시점별 값(길이 = `count`). `null` 은 그 시점 값 없음. */
  values: ReadonlyArray<number | null | undefined>;
  /** 견본 모양 — 선 `line`, 막대 · 면 `square`. 기본 line. */
  shape?: ChartSwatchShape;
  /** 점을 찍지 않는다(막대처럼 마크 자체가 강조될 때 · 다른 칸 계열을 툴팁에만 보일 때). */
  noDot?: boolean;
  /** 이 계열만의 단위 — 없으면 전체 `unit`. 칸 여럿의 값을 한 툴팁에 보일 때. */
  unit?: string;
};

export type ChartCrosshairProps = {
  /** 시점 수. */
  count: number;
  /** 값축 최대 — 차트와 같게. */
  max: number;
  /** 값축 최소. 기본 0(Apdex 처럼 50 부터인 축이면 그 값). */
  min?: number;
  /** 계열들. */
  series: ReadonlyArray<ChartCrosshairSeries>;
  /** 시점 이름(툴팁 제목). */
  labels?: ReadonlyArray<string>;
  /** 값 뒤 단위. */
  unit?: string;
  /** 보조 줄 — 합계 · 기준. */
  footer?: (i: number) => ReactNode;
  /** 칸 가운데가 시점(막대). 기본 false — 양 끝이 플롯 끝(선 · 면). */
  band?: boolean;
  /** 시점마다 x 비율(0~1, 오름차순) — 간격이 고르지 않을 때(도메인 좌표 · 예측). 주면 `band` 는 무시. */
  positions?: ReadonlyArray<number>;
  /** 고른 시점이 바뀔 때 — 막대 차트가 나머지를 흐린다. */
  onIndex?: (i: number | null) => void;
  /** 고른 시점을 밖에서 정한다(제어형) — 시간축을 공유하는 칸 여럿이 한 시점을 함께 보일 때. 주면 내부 상태 대신 이 값을 쓴다. */
  index?: number | null;
  /** 툴팁을 그리지 않는다(안내선 · 점만) — 칸 여럿 중 한 칸만 툴팁을 띄울 때. */
  noTooltip?: boolean;
  /** 플롯 오른쪽 끝(px 또는 CSS 길이). [[ChartGrid]] 와 같게. 기본 8. */
  right?: number | string;
  /** 플롯 위 여백(px). 기본 4. */
  padTop?: number;
  /** 플롯 아래 여백(px). 기본 14. */
  padBottom?: number;
};

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function ChartCrosshair({
  count,
  max,
  min = 0,
  series,
  labels,
  unit = "",
  footer,
  band = false,
  positions,
  onIndex,
  index,
  noTooltip = false,
  right = 8,
  padTop = 4,
  padBottom = 14,
}: ChartCrosshairProps) {
  const [own, setOwn] = useState<number | null>(null);
  const i = index !== undefined ? index : own;
  if (count < 1) return null;
  const xr = (k: number) => (positions ? positions[k] ?? 0 : band ? (k + 0.5) / count : count > 1 ? k / (count - 1) : 0);
  const yr = (v: number) => (max > min ? 1 - Math.min(1, Math.max(0, (v - min) / (max - min))) : 1);
  const pick = (ratio: number) => {
    if (positions) {
      let best = 0;
      positions.forEach((p, k) => { if (Math.abs(p - ratio) < Math.abs(positions[best] - ratio)) best = k; });
      return best;
    }
    return band ? Math.min(count - 1, Math.floor(ratio * count)) : Math.round(ratio * (count - 1));
  };
  const set = (k: number | null) => {
    setOwn(k);
    onIndex?.(k);
  };
  const vals = i == null ? [] : series.map((s) => s.values[i]).filter((v): v is number => v != null);
  const topY = vals.length ? Math.min(...vals.map(yr)) : 0.5;
  return (
    <div
      className="absolute"
      style={{ left: AXIS_GUTTER, right, top: padTop, bottom: padBottom }}
      onMouseMove={(ev) => {
        const r = ev.currentTarget.getBoundingClientRect();
        const k = pick(Math.min(0.9999, Math.max(0, (ev.clientX - r.left) / r.width)));
        if (k !== i) set(k);
      }}
      onMouseLeave={() => set(null)}
    >
      {i != null && (
        <>
          <span aria-hidden className="absolute" style={{ left: `${xr(i) * 100}%`, top: 0, bottom: 0, width: 0, borderLeft: "1px solid var(--color-border-strong)" }} />
          {series.map((s, k) => {
            const v = s.values[i];
            return v == null || s.noDot ? null : (
              <span
                key={k}
                aria-hidden
                className="absolute rounded-full"
                style={{ left: `${xr(i) * 100}%`, top: `${yr(v) * 100}%`, width: 6, height: 6, transform: "translate(-50%, -50%)", background: s.color, boxShadow: EMPHASIS_RING }}
              />
            );
          })}
          {!noTooltip && <ChartTooltip
            left={`${xr(i) * 100}%`}
            top={`${topY * 100}%`}
            flipX={xr(i) > 0.5}
            title={labels?.[i]}
            rows={series
              .filter((s) => s.values[i] != null)
              .map((s) => ({ label: s.label, value: `${fmt(s.values[i] as number)}${s.unit ?? unit}`, color: s.color, shape: s.shape ?? "line" }))}
            footer={footer?.(i)}
          />}
        </>
      )}
    </div>
  );
}

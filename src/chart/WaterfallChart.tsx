/**
 * WaterfallChart — 리소스 · 요청 하나에 한 줄, 시작부터 끝까지 단계(대기 · 연결 · 응답 · 다운로드)를 이어 붙인 가로 막대. Composite layer.
 *
 * ## Purpose
 * «페이지가 무엇을 언제 받아 왔고, 어느 단계에서 기다렸나». 라이브 세션 › 성능 탭은 리소스 타입 11종에 색을 하나씩 줘 fetch · xhr,
 * media · image 가 서로 구별되지 않았다(patterns §21 · §22). 여기서는 **색 = 단계**(8개까지 계열 슬롯), 리소스 타입은 이름 칸의 글자로 말한다.
 * 긴 페이지는 시간축을 끌어 구간을 확대한다([[ChartBrush]]).
 *
 * ## When to use
 * - 한 페이지 로드 · 한 요청 흐름의 리소스별 로딩 — 문서 · 스크립트 · 이미지 · fetch 의 대기 · DNS · 연결 · TTFB · 다운로드.
 * - 어느 리소스가 렌더를 늦추는지(늦게 시작 · 길게 대기) 찾을 때.
 *
 * ## When NOT to use
 * - 호출이 겹겹이 들어가는 실행(부모 › 자식) → [[FlameChart]].
 * - 단계 구성만(리소스 구분 없이 한 막대) → [[SegmentBar]].
 * - 여러 페이지 로드의 평균 → [[SegmentBar]] · 선 차트(시작 시각이 없다).
 *
 * ## Metrics
 * - ✅ 한 로드 안 리소스별 시작 시각 + 단계 시간(ms) — Resource Timing(대기 · DNS · 연결 · TLS · TTFB · 다운로드) · 요청 흐름의 단계
 * - ❌ 여러 로드를 합친 평균 단계 시간 — 시작 시각이 없어 폭포가 아니다 → [[SegmentBar]]
 * - ❌ 리소스 타입을 색으로(11종) — 색이 8개를 넘고 서로 구별되지 않는다. 타입은 이름 칸 글자로
 *
 * ## Colors
 * - 정체성 — 막대 색 = 단계 · `--color-chart-series-1..8`(`phases` 순서)
 * - 판정 밖 — 9번째 단계부터 「기타」 · `--color-chart-neutral`
 *
 * ## Composition rules
 * - 요소를 조합한다 — 단계 막대 [[ChartSpanBar]] · 확대 [[ChartBrush]] · 시간 [[ChartTimeAxis]] · 단계 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] · 전체 보기 [[Button]].
 *   이름 칸 · 세로 눈금선 · 표시선만 그린다. 그래서 Composite 계층이다.
 * - **색 = 단계(2026-10-23 추천안)** — `phases` 순서대로 `--color-chart-series-1..8`(§17), 8개를 넘으면 나머지는 «기타» `--color-chart-neutral`(§22).
 *   리소스 타입(`meta`)은 이름 아래 `text-xs` tertiary 글자. 상태 · 경고를 색으로 섞지 않는다(§23).
 * - 줄마다 이름 칸(기본 160px, 이름 말줄임 + 타입) + 막대. 줄 높이 22(타입 글자가 있으면 32) · 막대 10.
 * - **표시선**(`markers`, DOMContentLoaded · load)은 세로 점선 + 위 이름 — 플롯 전체 높이.
 * - 확대 · 전체 보기는 [[FlameChart]] 와 같다. 휠 확대는 쓰지 않는다.
 * - hover: 줄을 가리키면 나머지 줄 0.32 + 툴팁(단계별 시간 · 합계). 단계 범례를 가리키면 그 단계만 남긴다(patterns §26 «강조»).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 줄 | 높이 22(타입 있으면 32) · 이름 칸 `labelWidth` 160 · 이름 `text-sm` primary 말줄임 · 타입 `text-xs` tertiary · 넘치면 세로 스크롤 |
 * | 막대 | [[ChartSpanBar]] 높이 10 · 단계 이어 붙임 · 색 `--color-chart-series-{n}` · 9번째 단계부터 «기타» `--color-chart-neutral` |
 * | 표시선 | 1px 점선 `--color-text-tertiary` · 위 `text-xs` 이름 |
 * | 시간 | 아래 [[ChartTimeAxis]] · 눈금 1 · 2 · 5 × 10ⁿ ms · 세로 눈금선 1px `--color-border-soft` |
 * | 확대 | [[ChartBrush]] · 확대 중 «전체 보기» [[Button]] basic sm |
 * | 범례 | 위 왼쪽 단계 · 사각 견본 |
 * | 접근성 | 판 `role="img"` + 리소스 수 · 끝 시각 · 가장 늦게 끝난 리소스 |
 *
 * @example
 * ```tsx
 * <WaterfallChart phases={["대기", "DNS", "연결", "TTFB", "다운로드"]}
 *   rows={[{ label: "/index.html", meta: "document", start: 0, segments: [4, 12, 30, 180, 22] }]} markers={[{ at: 920, label: "DOMContentLoaded" }]} />
 * ```
 */
import { useEffect, useRef, useState } from "react";
import Button from "../Button";
import ChartBrush from "./ChartBrush";
import ChartLegendItem from "./ChartLegendItem";
import ChartSpanBar from "./ChartSpanBar";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartTooltip from "./ChartTooltip";
import { durationTicks, formatDuration } from "./_axisScale";
import { DIM_OPACITY } from "./_emphasis";

export type WaterfallRow = {
  /** 리소스 · 요청 이름. */
  label: string;
  /** 타입(document · script · fetch …) — 이름 아래 글자. */
  meta?: string;
  /** 시작(ms, 로드 시작 기준). */
  start: number;
  /** 단계별 걸린 시간(ms) — `phases` 순서. 0 인 단계는 건너뛴다. */
  segments: ReadonlyArray<number>;
};

export type WaterfallChartProps = {
  /** 단계 이름 — 색 순서. */
  phases: ReadonlyArray<string>;
  /** 줄들 — 위부터. */
  rows: ReadonlyArray<WaterfallRow>;
  /** 표시선(DOMContentLoaded · load). */
  markers?: ReadonlyArray<{ at: number; label: string }>;
  /** 전체 시간 범위(ms). 없으면 0 ~ 가장 늦은 끝(표시선 포함). */
  range?: readonly [number, number];
  /** 이름 칸 폭(px). 기본 160. */
  labelWidth?: number;
};

/* 슬롯 1~8 — 토큰 이름을 문자 그대로(토큰 게이트가 참조를 읽는다) */
const SERIES = [
  "var(--color-chart-series-1)",
  "var(--color-chart-series-2)",
  "var(--color-chart-series-3)",
  "var(--color-chart-series-4)",
  "var(--color-chart-series-5)",
  "var(--color-chart-series-6)",
  "var(--color-chart-series-7)",
  "var(--color-chart-series-8)",
] as const;
const OTHER = "var(--color-chart-neutral)";
const ROW = 22;
const ROW_META = 32;
const BAR = 10;
const AXIS = 14;
const MARK_HEAD = 14;
const RIGHT = 8;

export default function WaterfallChart({ phases, rows, markers = [], range, labelWidth = 160 }: WaterfallChartProps) {
  const endOf = (r: WaterfallRow) => r.start + r.segments.reduce((n, v) => n + Math.max(0, v), 0);
  const full: [number, number] = range ? [range[0], range[1]] : [0, Math.max(1, ...rows.map(endOf), ...markers.map((m) => m.at))];
  const [view, setView] = useState<[number, number]>(full);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fullKey = `${full[0]}:${full[1]}`;
  useEffect(() => setView([Number(fullKey.split(":")[0]), Number(fullKey.split(":")[1])]), [fullKey]);

  const [v0, v1] = view;
  const span = v1 - v0 || 1;
  const x = (t: number) => (t - v0) / span;
  const zoomed = v0 > full[0] || v1 < full[1];
  const ticks = durationTicks(v0, v1);
  const colorOf = (k: number) => SERIES[k] ?? OTHER;
  const legend = phases.length > SERIES.length ? [...phases.slice(0, SERIES.length), "기타"] : phases;
  const groupOf = (k: number) => Math.min(k, SERIES.length);
  const last = [...rows].sort((a, b) => endOf(b) - endOf(a))[0];
  const summary = `Waterfall — 리소스 ${rows.length}개 · 끝 ${formatDuration(Math.max(0, ...rows.map(endOf)))}${last ? ` · 가장 늦게 끝난 ${last.label}` : ""}`;
  const h = hover ? rows[hover.i] : null;
  const plotLeft = labelWidth + 8;
  const rowH = rows.some((r) => r.meta) ? ROW_META : ROW;

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ gap: 8 }}>
      <div className="flex items-center justify-between" style={{ gap: 12, minHeight: 24 }}>
        <div className="flex flex-wrap items-center" style={{ columnGap: 12, rowGap: 4 }}>
          {legend.map((p, k) => (
            <ChartLegendItem key={`${p}-${k}`} color={colorOf(k)} label={p} onHover={(on) => setFocus(on ? k : null)} dimmed={focus != null && focus !== k} />
          ))}
        </div>
        {zoomed && (
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-numeric)" }}>
              {formatDuration(v0)} – {formatDuration(v1)}
            </span>
            <Button variant="basic" tone="tertiary" size="sm" onClick={() => setView(full)}>
              전체 보기
            </Button>
          </div>
        )}
      </div>
      <div ref={plot} className="relative flex-1 min-h-0 w-full" role="img" aria-label={summary} style={{ minHeight: 80 }}>
        {/* 세로 눈금선 · 표시선 — 막대 뒤 */}
        <div aria-hidden className="absolute pointer-events-none" style={{ left: plotLeft, right: RIGHT, top: 0, bottom: AXIS }}>
          {ticks.map((t) => (
            <span key={t} className="absolute" style={{ left: `${x(t) * 100}%`, top: MARK_HEAD, bottom: 0, borderLeft: "1px solid var(--color-border-soft)" }} />
          ))}
          {markers.map((m) =>
            m.at < v0 || m.at > v1 ? null : (
              <span key={m.label} className="absolute" style={{ left: `${x(m.at) * 100}%`, top: 0, bottom: 0 }}>
                <span className="absolute" style={{ left: 0, top: MARK_HEAD, bottom: 0, borderLeft: "1px dashed var(--color-text-tertiary)" }} />
                <span className="absolute text-xs text-tertiary whitespace-nowrap" style={{ top: 0, left: 0, transform: x(m.at) > 0.7 ? "translateX(-100%)" : undefined, lineHeight: "var(--leading-none)" }}>
                  {m.label}
                </span>
              </span>
            ),
          )}
        </div>
        <div className="absolute overflow-y-auto overflow-x-hidden" style={{ left: 0, right: 0, top: MARK_HEAD, bottom: AXIS }}>
          {rows.map((r, i) => {
            const dim = hover != null && hover.i !== i;
            let t = r.start;
            return (
              <div
                key={`${r.label}-${i}`}
                className="relative flex items-center"
                style={{ height: rowH }}
                onMouseMove={(ev) => {
                  const b = plot.current?.getBoundingClientRect();
                  if (b) setHover({ i, x: ev.clientX - b.left, y: ev.clientY - b.top });
                }}
                onMouseLeave={() => setHover(null)}
              >
                <div className="flex flex-col min-w-0 shrink-0" style={{ width: labelWidth, opacity: dim ? DIM_OPACITY : 1 }} title={r.label}>
                  <span className="truncate text-sm text-primary" style={{ lineHeight: "var(--leading-none)" }}>
                    {r.label}
                  </span>
                  {r.meta && (
                    <span className="truncate text-xs text-tertiary" style={{ lineHeight: "var(--leading-none)", marginTop: 2 }}>
                      {r.meta}
                    </span>
                  )}
                </div>
                <div className="absolute" style={{ left: plotLeft, right: RIGHT, top: (rowH - BAR) / 2, height: BAR }}>
                  {r.segments.map((d, k) => {
                    const a = t;
                    t += Math.max(0, d);
                    if (d <= 0 || t < v0 || a > v1) return null;
                    return <ChartSpanBar key={k} start={x(a)} end={x(t)} color={colorOf(groupOf(k))} dimmed={dim || (focus != null && focus !== groupOf(k))} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <ChartTimeAxis labels={ticks.map(formatDuration)} positions={ticks.map(x)} left={plotLeft} right={RIGHT} />
        <ChartBrush left={plotLeft} right={RIGHT} top={0} bottom={AXIS} strip={AXIS} onSelect={(a, b) => setView([v0 + span * a, v0 + span * b])} />
        {h && hover && (
          <ChartTooltip
            left={hover.x}
            top={hover.y}
            flipX={hover.x > width / 2}
            flipY={hover.y > (plot.current?.clientHeight ?? 0) / 2}
            offset={12}
            title={h.label}
            rows={phases.flatMap((p, k) =>
              (h.segments[k] ?? 0) > 0 ? [{ label: p, value: formatDuration(h.segments[k]), color: colorOf(groupOf(k)), shape: "square" as const }] : [],
            )}
            footer={`시작 ${formatDuration(h.start)} · 합계 ${formatDuration(endOf(h) - h.start)}${h.meta ? ` · ${h.meta}` : ""}`}
          />
        )}
      </div>
    </div>
  );
}

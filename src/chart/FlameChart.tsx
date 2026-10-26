/**
 * FlameChart — 호출 · 요청 구간을 시간 위에 깊이별 계단으로. 색 = 상태. 시간축을 끌어 확대. Composite layer.
 *
 * ## Purpose
 * «이 화면 전환 · 트랜잭션 안에서 무엇이 언제 얼마나 걸렸고, 어디서 에러가 났나». 라이브 브라우저 세션 Flame 은 162초를 한 폭에 넣어
 * 앞 2초의 바가 폭의 3% 로 눌렸고 라벨은 거의 전부 말줄임(`p…s`)이었다 — 확대 없이는 색 띠로만 읽혔다(patterns §21).
 * 여기서는 **시간축을 끌어 구간을 확대**하고([[ChartBrush]]), **폭 40px 미만 막대는 이름 없이** 색만 둔다(이름은 툴팁).
 *
 * ## When to use
 * - 한 실행 안의 겹친 구간 — 브라우저 세션의 방문 › AJAX, 트랜잭션 › 메서드 · SQL · 외부 호출, 분산 추적 스팬.
 * - 느린 · 에러 구간이 어디 깊이 · 어느 시점에 있는지 찾을 때.
 *
 * ## When NOT to use
 * - 리소스 하나에 한 줄(로딩 단계) → [[WaterfallChart]].
 * - 시점 사건만(에러 발생 시각) → [[StatusTimeline]] — Flame 위에 같은 시간 범위로 붙인다(에러 세로선을 Flame 안에 촘촘히 긋지 않는다).
 * - 집계(평균 응답시간 추이) → 선 · 막대 차트.
 *
 * ## Metrics
 * - ✅ 한 실행의 구간 시작 · 끝(ms) + 상태 — 세션 방문 › AJAX 호출 · 트랜잭션 › 메서드 · SQL · HTTP 호출 · 추적 스팬
 * - ❌ 여러 실행을 합친 집계(평균 · 합) — 구간의 시작 · 끝이 없다 → 선 · 막대 차트
 * - ❌ 깊이 없는 리소스 목록의 로딩 단계 → [[WaterfallChart]]
 *
 * ## Color
 * - 역할: 상태 — 정상 `--color-chart-series-1` · 느림 `--color-status-warning` · 에러 `--color-status-error` · 정보 없음 `--color-surface-200`(내부 `_statusTone`, BlockGrid · HexGrid 와 같은 색)
 * - 상한: 상태 4개
 * - 고정: 막대 이름 `--color-text-inverse`(정보 없음은 `--color-text-tertiary`)
 * - 금지: 호출 종류별 계열 색을 섞지 않는다(§23)
 *
 * ## States
 * - 빈: `spans=[]` 면 범례(개수 0) · 시간축만 — 빈 상태 글은 그리지 않는다 — [[WidgetFrame]] `state`(no-data) 를 쓴다
 * - 빠짐: `status` 없으면 normal · `lane` 없으면 이름 없는 한 레인
 * - 0: 시작 = 끝 인 구간도 최소 1px 막대
 * - 넘침: 보기 밖 구간은 빼고 걸친 구간은 잘라 그린다 · 끝 < 시작 이면 그리지 않는다
 *
 * ## Limits
 * - 개수: 강제 없음 · 넘치면 세로 스크롤 · 상태 범례 4개
 * - 크기: 줄 18 · 사이 2 · 레인 이름 20 · 플롯 최소 높이 80
 * - 라벨: 막대 폭 40px 이상일 때만 이름(한 줄 말줄임) · 시간 눈금 6개 안팎 · 1% 미만 끌기는 무시
 *
 * ## Composition rules
 * - 요소를 조합한다 — 막대 [[ChartSpanBar]] · 확대 [[ChartBrush]] · 시간 [[ChartTimeAxis]] · 상태 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] · 전체 보기 [[Button]].
 *   레인 이름 · 세로 눈금선만 그린다. 그래서 Composite 계층이다.
 * - **색 = 상태(2026-10-23 추천안)** — 정상 · 느림 · 에러 · 정보 없음 = [[BlockGrid]] · [[HexGrid]] 와 같은 상태 색(내부 `_statusTone`). 계열 색을 섞지 않는다(§23).
 * - **레인**(`lane`, 예: Visit · AJAX)마다 이름 줄 + 깊이 줄. 깊이 0 이 위. 줄 높이 18 · 사이 2.
 * - **확대(2026-10-23 추천안)** — 시간축 줄을 끌어 구간을 고르면 그 구간만 펼친다. 확대 중에는 오른쪽 위 «전체 보기». 휠 확대는 쓰지 않는다.
 * - **이름은 막대 폭 40px 이상일 때만** — 좁은 막대에 말줄임을 남기지 않는다. 이름 · 시작 · 걸린 시간 · 상태는 [[ChartTooltip]].
 * - hover: 막대를 가리키면 나머지 0.32 + 툴팁. 상태 범례를 가리키면 그 상태만 남긴다(patterns §26 «강조»).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 줄 | 레인 이름 20(`text-sm` medium secondary) · 깊이 줄 18 · 사이 2 · 레인 사이 8 · 넘치면 세로 스크롤 |
 * | 막대 | [[ChartSpanBar]] · 색 정상 `--color-chart-series-1` · 느림 `--color-status-warning` · 에러 `--color-status-error` · 정보 없음 `--color-surface-200` |
 * | 이름 | 막대 폭 ≥ 40px 일 때 · `text-xs` · 말줄임 |
 * | 시간 | 아래 [[ChartTimeAxis]] · 눈금 1 · 2 · 5 × 10ⁿ ms · 세로 눈금선 1px `--color-border-soft` |
 * | 확대 | [[ChartBrush]] 시간축 줄 · 확대 중 «전체 보기» [[Button]] basic sm · 보기 구간 글자 |
 * | 범례 | 위 왼쪽 상태 4 · 개수 · 사각 견본 |
 * | 접근성 | 판 `role="img"` + 구간 수 · 에러 수 · 가장 긴 구간 |
 *
 * @example
 * ```tsx
 * <FlameChart spans={[{ lane: "Visit", depth: 0, label: "/orders", start: 0, end: 2400 }, { lane: "AJAX", depth: 0, label: "GET /api/orders", start: 120, end: 860, status: "slow" }]} />
 * ```
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Button from "../Button";
import ChartBrush from "./ChartBrush";
import ChartLegendItem from "./ChartLegendItem";
import ChartSpanBar from "./ChartSpanBar";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartTooltip from "./ChartTooltip";
import { durationTicks, formatDuration } from "./_axisScale";
import { STATUS_TONE_FILL, STATUS_TONE_TEXT, type StatusTone } from "./_statusTone";

export type FlameSpanStatus = "normal" | "slow" | "error" | "none";

export type FlameSpan = {
  /** 이름 — 막대 안(폭 40px 이상) · 툴팁 제목. */
  label: string;
  /** 시작 · 끝(ms, 실행 시작 기준). */
  start: number;
  end: number;
  /** 깊이 — 0 이 위. */
  depth: number;
  /** 상태. 기본 normal. */
  status?: FlameSpanStatus;
  /** 레인(Visit · AJAX). 없으면 한 레인. */
  lane?: string;
  /** 툴팁 보조 줄(URL · SQL 요약). */
  detail?: string;
};

export type FlameChartProps = {
  /** 구간들. */
  spans: ReadonlyArray<FlameSpan>;
  /** 전체 시간 범위(ms). 없으면 0 ~ 가장 늦은 끝. */
  range?: readonly [number, number];
  /** 상태 이름 바꾸기. */
  statusLabels?: Partial<Record<FlameSpanStatus, string>>;
};

const TONE: Record<FlameSpanStatus, StatusTone> = { normal: "active", slow: "warning", error: "critical", none: "idle" };
const ORDER: FlameSpanStatus[] = ["normal", "slow", "error", "none"];
const LABEL: Record<FlameSpanStatus, string> = { normal: "정상", slow: "느림", error: "에러", none: "정보 없음" };
const ROW = 18;
const GAP = 2;
const LANE_HEAD = 20;
const LANE_GAP = 8;
const AXIS = 14;
const RIGHT = 8;
const LABEL_MIN = 40;

export default function FlameChart({ spans, range, statusLabels }: FlameChartProps) {
  const full: [number, number] = range ? [range[0], range[1]] : [0, Math.max(1, ...spans.map((s) => s.end))];
  const [view, setView] = useState<[number, number]>(full);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const [focus, setFocus] = useState<FlameSpanStatus | null>(null);
  const plot = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width - RIGHT));
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
  const name = (s: FlameSpanStatus) => statusLabels?.[s] ?? LABEL[s];

  /* 레인 → 깊이 줄. 레인 순서 = 처음 나온 순서 */
  const lanes: { name: string; depth: number; top: number }[] = [];
  let y = 0;
  for (const lane of [...new Set(spans.map((s) => s.lane ?? ""))]) {
    const depth = Math.max(0, ...spans.filter((s) => (s.lane ?? "") === lane).map((s) => s.depth)) + 1;
    lanes.push({ name: lane, depth, top: y });
    y += (lane ? LANE_HEAD : 0) + depth * (ROW + GAP) + LANE_GAP;
  }
  const bodyH = Math.max(0, y - LANE_GAP);
  const rowTop = (s: FlameSpan) => {
    const l = lanes.find((l) => l.name === (s.lane ?? ""))!;
    return l.top + (l.name ? LANE_HEAD : 0) + s.depth * (ROW + GAP);
  };

  const counts = ORDER.map((st) => spans.filter((s) => (s.status ?? "normal") === st).length);
  const longest = [...spans].sort((a, b) => b.end - b.start - (a.end - a.start))[0];
  const summary = `Flame — 구간 ${spans.length}개 · 에러 ${counts[2]}개${longest ? ` · 가장 긴 구간 ${longest.label} ${formatDuration(longest.end - longest.start)}` : ""}`;
  const h = hover ? spans[hover.i] : null;
  const move = (i: number) => (ev: MouseEvent<HTMLDivElement>) => {
    const r = plot.current?.getBoundingClientRect();
    if (r) setHover({ i, x: ev.clientX - r.left, y: ev.clientY - r.top });
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ gap: 8 }}>
      <div className="flex items-center justify-between" style={{ gap: 12, minHeight: 24 }}>
        <div className="flex flex-wrap items-center" style={{ columnGap: 12, rowGap: 4 }}>
          {ORDER.map((st, k) => (
            <ChartLegendItem
              key={st}
              color={STATUS_TONE_FILL[TONE[st]]}
              label={name(st)}
              value={String(counts[k])}
              onHover={(on) => setFocus(on ? st : null)}
              dimmed={focus != null && focus !== st}
            />
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
        {/* 세로 눈금선 — 막대 뒤 */}
        <div aria-hidden className="absolute pointer-events-none" style={{ left: 0, right: RIGHT, top: 0, bottom: AXIS }}>
          {ticks.map((t) => (
            <span key={t} className="absolute" style={{ left: `${x(t) * 100}%`, top: 0, bottom: 0, borderLeft: "1px solid var(--color-border-soft)" }} />
          ))}
        </div>
        <div className="absolute overflow-y-auto overflow-x-hidden" style={{ left: 0, right: RIGHT, top: 0, bottom: AXIS }}>
          <div className="relative w-full" style={{ height: bodyH }}>
            {lanes.map((l) =>
              l.name ? (
                <span key={l.name} className="absolute text-sm font-medium text-secondary" style={{ left: 0, top: l.top, height: LANE_HEAD, lineHeight: `${LANE_HEAD - 4}px` }}>
                  {l.name}
                </span>
              ) : null,
            )}
            {spans.map((s, i) => {
              if (s.end < v0 || s.start > v1) return null;
              const st = s.status ?? "normal";
              const w = (x(Math.min(s.end, v1)) - x(Math.max(s.start, v0))) * width;
              return (
                <ChartSpanBar
                  key={i}
                  start={x(s.start)}
                  end={x(s.end)}
                  top={rowTop(s)}
                  height={ROW}
                  color={STATUS_TONE_FILL[TONE[st]]}
                  textColor={STATUS_TONE_TEXT[TONE[st]]}
                  label={w >= LABEL_MIN ? s.label : undefined}
                  dimmed={(hover != null && hover.i !== i) || (focus != null && focus !== st)}
                  active={hover?.i === i}
                  onMouseMove={move(i)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </div>
        </div>
        <ChartTimeAxis labels={ticks.map(formatDuration)} positions={ticks.map(x)} left={0} right={RIGHT} />
        <ChartBrush left={0} right={RIGHT} top={0} bottom={AXIS} strip={AXIS} onSelect={(a, b) => setView([v0 + span * a, v0 + span * b])} />
        {h && hover && (
          <ChartTooltip
            left={hover.x}
            top={hover.y}
            flipX={hover.x > width / 2}
            offset={12}
            title={h.label}
            rows={[
              { label: "상태", value: name(h.status ?? "normal"), color: STATUS_TONE_FILL[TONE[h.status ?? "normal"]], shape: "square" },
              { label: "시작", value: formatDuration(h.start) },
              { label: "걸린 시간", value: formatDuration(h.end - h.start) },
            ]}
            footer={[h.lane, h.detail].filter(Boolean).join(" · ") || undefined}
          />
        )}
      </div>
    </div>
  );
}

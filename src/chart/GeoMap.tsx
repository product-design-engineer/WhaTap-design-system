/**
 * GeoMap — 국가별 값을 세계 지도 위에. 단계 구분(국가 칸 색 4단계) 또는 버블(국가 자리 원 넓이). Composite layer.
 *
 * ## Purpose
 * «어느 나라에서 요청 · 오류가 오는가» 를 지리로. 라이브 APM 큐브 › 국가 지도는 값 레이어가 비어 모든 국가가 같은 회색이라
 * «데이터 없음» 과 «값이 고르다» 가 구별되지 않았다(patterns §21). 여기서는 **값 없는 국가 · 값 있는 국가 · 데이터가 하나도 없는 지도**를
 * 서로 다르게 그린다 — 값 없는 국가는 바탕 회색, 값은 순차 4단계, 지도 전체가 비면 판 가운데 «데이터 없음».
 * 국가 도형은 Natural Earth 1:110m(퍼블릭 도메인)을 Equal Earth(면적 보존)로 투영해 내장한다(내부 `_geoWorld`, 생성 `scripts/build-geo-world.mjs`).
 *
 * ## When to use
 * - 국가별 값 하나 — 국가별 오류율 · 평균 응답시간(단계 구분), 국가별 요청 수 · 사용자 수(버블).
 * - 사용자 · 트래픽의 지역 쏠림을 찾을 때. 대상 국가가 여럿(5개 이상)일 때.
 *
 * ## When NOT to use
 * - 국가 3~4개 · 정밀 비교 → [[BarList]](이름으로 정렬된 막대가 더 정확하다).
 * - 시간 흐름 → 선 · 막대 차트. 지도는 한 시점(또는 한 구간 집계)이다.
 * - 국가가 아닌 지역(도시 · 리전 · 데이터센터) — 내장 도형은 국가 경계뿐이다.
 *
 * ## Metrics
 * - ✅ 단계 구분(`fill`) — 국가별 비율 · 평균처럼 국가 크기와 무관한 값: 오류율(%) · 평균 응답시간(ms) · Apdex · 이탈률
 * - ✅ 버블(`bubble`) — 국가별 개수 · 합계: 요청 수 · 사용자 수 · 세션 수 · 트래픽(바이트)
 * - ❌ 개수 · 합계를 단계 구분으로 — 넓은 나라가 많아 보인다. 버블로
 * - ❌ 음수가 섞인 변화량(증감) — 순차 4단계는 0 에서 시작한다
 * - ❌ 국가 하나 · 둘 → 숫자 [[MetricGrid]] · [[BarList]]
 *
 * ## Color
 * - 역할: 순차(단계 구분) — `--color-chart-seq-1` · `--color-chart-seq-2` · `--color-chart-seq-3` · `--color-chart-seq-4`(낮음 → 높음) / 버블은 `--color-chart-series-1` 한 색
 * - 상한: 단계 4
 * - 고정: 값 없음 `--color-surface-200` · 국가 경계 `--color-card`
 * - 금지: 상태색으로 국가를 칠하지 않는다(§17 · §23) · 버블 색으로 값을 말하지 않는다(넓이가 값)
 *
 * ## Composition rules
 * - 요소를 조합한다 — 단계 범례 [[ChartLegendItem]] · 값 상자 [[ChartTooltip]] · 줌 [[TopologyZoomControl]](토폴로지와 같은 컨트롤 · `limits` 100%~600%).
 *   국가 도형 · 격자 · 버블만 그린다. 그래서 Composite 계층이다.
 * - **값 없는 국가 ≠ 낮은 값(2026-10-23)** — 값 없음은 바탕 `--color-surface-200`, 값은 `--color-chart-seq-1..4`(낮음 → 높음). 범례에 «값 없음» 칸을 함께 둔다.
 * - **데이터가 하나도 없으면 `empty`** — 지도 위 가운데 «데이터 없음»(§15). 회색 지도만 남기지 않는다.
 * - 단계는 4개 — 기본 0 ~ 최대(보기 좋은 값)를 4등분. 경계를 정하려면 `breaks`(3개). 상태색을 쓰지 않는다(§17 · §23).
 * - 버블: 국가 자리(가장 큰 땅덩이 무게중심)에 원, **넓이 = 값**(반지름 √). 색 `--color-chart-series-1` 하나 — 색은 값을 말하지 않는다.
 * - hover: 국가 · 버블을 가리키면 테두리 강조 + 툴팁(국가 · 값 · 단계). 범례 단계를 가리키면 그 단계 밖 국가를 0.32 로(patterns §26 «강조»).
 * - 줌: 오른쪽 아래 컨트롤, 확대하면 끌어서 옮긴다. 휠은 쓰지 않는다(대시보드 스크롤을 빼앗지 않는다).
 * - 내장 도형에 없는 국가(110m 에 없는 작은 나라 — 싱가포르 · 홍콩 등)의 값은 버리지 않고 지도 아래 «지도 밖» 줄로 말한다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 도형 | Natural Earth 110m 국가 176개(남극 제외) · Equal Earth · 1000 × 442 viewBox · 국가 경계 0.5px `--color-card` |
 * | 격자 | 경위도 30° · 1px `--color-border-soft` · 외곽 같은 선 |
 * | 단계 구분 | 값 없음 `--color-surface-200` · 4단계 `--color-chart-seq-1..4` · 경계 `breaks` 또는 최대 4등분 |
 * | 버블 | 반지름 √(값 ÷ 최대) × 18(지도 단위, 줌해도 화면 크기 유지) · `--color-chart-series-1` 채움 0.6 · 테두리 1px 같은 색 |
 * | 범례 | 지도 아래 한 줄 · 단계 4칸(범위, 최대가 마지막 경계 이하면 «경계 이상») + 값 없음 · 사각 견본 / 버블은 «원 넓이 = 값 · 최대» |
 * | 줌 | [[TopologyZoomControl]] 오른쪽 아래 · 100%~600% · 단계 50% · 확대 시 끌어서 이동 |
 * | 빈 상태 | `data` 가 비면 지도 위 가운데 `emptyLabel`(기본 «데이터 없음») `text-base` secondary |
 * | 접근성 | 판 `role="img"` + 값 큰 국가 다섯 요약 |
 *
 * @example
 * ```tsx
 * <GeoMap unit="%" label="오류율" data={[{ code: "KR", value: 0.4 }, { code: "US", value: 1.2 }, { code: "JP", value: 0.8 }]} />
 * <GeoMap mode="bubble" unit="건" label="요청 수" data={requestsByCountry} />
 * ```
 */
import { useId, useRef, useState, type MouseEvent } from "react";
import ChartLegendItem from "./ChartLegendItem";
import ChartTooltip from "./ChartTooltip";
import TopologyZoomControl from "../topology/TopologyZoomControl";
import { niceMax } from "./_axisScale";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";
import { GEO_GRATICULE, GEO_NAMES, GEO_OUTLINE, GEO_WORLD, GEO_WORLD_SIZE } from "./_geoWorld";

export type GeoMapDatum = {
  /** 국가 코드 ISO 3166-1 alpha-2(`KR` · `US`). */
  code: string;
  /** 값(0 이상). */
  value: number;
  /** 이름 — 없으면 내장 한국어 이름(ISO 3166-1 전체). */
  name?: string;
};

export type GeoMapProps = {
  /** 국가별 값. 비면 «데이터 없음». */
  data: ReadonlyArray<GeoMapDatum>;
  /** 값 표현 — 단계 구분(비율 · 평균) · 버블(개수 · 합계). 기본 fill. */
  mode?: "fill" | "bubble";
  /** 값이 무엇인지 — 범례 앞 · 툴팁 줄 이름. */
  label?: string;
  /** 값 뒤 단위. */
  unit?: string;
  /** 단계 경계 3개(오름차순). 없으면 0 ~ 최대(보기 좋은 값) 4등분. */
  breaks?: readonly [number, number, number];
  /** 빈 상태 글. 기본 «데이터 없음». */
  emptyLabel?: string;
  /** 줌 컨트롤. 기본 true. */
  zoom?: boolean;
};

/* 단계 1~4 — 토큰 이름을 문자 그대로(토큰 게이트가 참조를 읽는다) */
const SEQ = ["var(--color-chart-seq-1)", "var(--color-chart-seq-2)", "var(--color-chart-seq-3)", "var(--color-chart-seq-4)"] as const;
const NONE = "var(--color-surface-200)";
const BUBBLE = "var(--color-chart-series-1)";
const BUBBLE_R = 18;
const ZOOM = { min: 1, max: 6, step: 0.5 } as const;
const { w: W, h: H } = GEO_WORLD_SIZE;

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function GeoMap({ data, mode = "fill", label = "값", unit = "", breaks, emptyLabel = "데이터 없음", zoom = true }: GeoMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const clipId = `wds-geo-${useId().replace(/:/g, "")}`;
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const [hover, setHover] = useState<{ i: number; px: number; py: number } | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const drag = useRef<{ cx: number; cy: number; x: number; y: number } | null>(null);

  const byCode = new Map(data.map((d) => [d.code.toUpperCase(), d]));
  const shapeCodes = new Set(GEO_WORLD.map((c) => c.code));
  const offMap = data.filter((d) => !shapeCodes.has(d.code.toUpperCase())).sort((a, b) => b.value - a.value);
  const max = Math.max(0, ...data.map((d) => d.value));
  const top = niceMax(max) || 1;
  const cuts = breaks ?? ([top / 4, top / 2, (top * 3) / 4] as const);
  const classOf = (v: number) => (v < cuts[0] ? 0 : v < cuts[1] ? 1 : v < cuts[2] ? 2 : 3);
  const rangeOf = (k: number) =>
    k === 3 && max <= cuts[2] ? `${fmt(cuts[2])}${unit} 이상` : `${k === 0 ? 0 : fmt(cuts[k - 1])}–${k === 3 ? fmt(max) : fmt(cuts[k])}${unit}`;
  const empty = data.length === 0;
  const nameOf = (d: GeoMapDatum) => d.name ?? GEO_NAMES[d.code.toUpperCase()] ?? d.code;

  const clamp = (z: number, x: number, y: number) => ({ z, x: Math.min(W - W / z, Math.max(0, x)), y: Math.min(H - H / z, Math.max(0, y)) });
  const zoomTo = (z: number) => setView((v) => clamp(z, v.x + W / v.z / 2 - W / z / 2, v.y + H / v.z / 2 - H / z / 2));

  const point = (ev: MouseEvent) => {
    const r = box.current?.getBoundingClientRect();
    return r ? { px: ev.clientX - r.left, py: ev.clientY - r.top, w: r.width, h: r.height } : { px: 0, py: 0, w: 1, h: 1 };
  };
  const hovered = hover ? GEO_WORLD[hover.i] : null;
  const hv = hovered?.code ? byCode.get(hovered.code) : undefined;
  const size = box.current?.getBoundingClientRect();
  const summary = `세계 지도 ${label} — ${empty ? emptyLabel : [...data].sort((a, b) => b.value - a.value).slice(0, 5).map((d) => `${nameOf(d)} ${fmt(d.value)}${unit}`).join(", ")}`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ gap: 8 }}>
      <div
        ref={box}
        className="relative flex-1 min-h-0 w-full overflow-hidden"
        role="img"
        aria-label={summary}
        style={{ minHeight: 120, cursor: view.z > 1 ? (drag.current ? "grabbing" : "grab") : undefined }}
        onPointerDown={(ev) => {
          if (view.z <= 1 || (ev.target as HTMLElement).closest("button")) return;
          drag.current = { cx: ev.clientX, cy: ev.clientY, x: view.x, y: view.y };
          ev.currentTarget.setPointerCapture(ev.pointerId);
        }}
        onPointerMove={(ev) => {
          const d = drag.current;
          if (!d || !size) return;
          const k = W / view.z / size.width;
          setView((v) => clamp(v.z, d.x - (ev.clientX - d.cx) * k, d.y - (ev.clientY - d.cy) * k));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <svg aria-hidden viewBox={`${view.x} ${view.y} ${W / view.z} ${H / view.z}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
          <path d={GEO_GRATICULE} fill="none" stroke="var(--color-border-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={GEO_OUTLINE} fill="none" stroke="var(--color-border-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {/* 날짜변경선을 건너는 국가는 사본이 외곽 밖으로 나간다 — 외곽으로 자른다 */}
          <clipPath id={clipId}>
            <path d={GEO_OUTLINE} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
          {GEO_WORLD.map((c, i) => {
            const d = c.code ? byCode.get(c.code) : undefined;
            const k = d && mode === "fill" ? classOf(d.value) : null;
            const dim = focus != null && k !== focus;
            return (
              <path
                key={`${c.nameEn}-${i}`}
                d={c.d}
                className={MARK_CLASS}
                fill={k == null ? NONE : SEQ[k]}
                stroke="var(--color-card)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                opacity={dim ? DIM_OPACITY : 1}
                onMouseMove={(ev) => {
                  const p = point(ev);
                  setHover({ i, px: p.px, py: p.py });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
          </g>
          {hovered && <path d={hovered.d} clipPath={`url(#${clipId})`} fill="none" stroke="var(--color-text-primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
          {mode === "bubble" &&
            GEO_WORLD.map((c, i) => {
              const d = c.code ? byCode.get(c.code) : undefined;
              if (!d || d.value <= 0 || max <= 0) return null;
              return (
                <circle
                  key={`b-${i}`}
                  cx={c.cx}
                  cy={c.cy}
                  r={(Math.sqrt(d.value / max) * BUBBLE_R) / Math.sqrt(view.z)}
                  className={MARK_CLASS}
                  fill={BUBBLE}
                  fillOpacity={0.6}
                  stroke={BUBBLE}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  opacity={hv && hover?.i !== i ? DIM_OPACITY : 1}
                  onMouseMove={(ev) => {
                    const p = point(ev);
                    setHover({ i, px: p.px, py: p.py });
                  }}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
        </svg>
        {empty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-base text-secondary bg-card rounded-md" style={{ padding: "4px 12px" }}>
              {emptyLabel}
            </span>
          </div>
        )}
        {hovered && hover && size && (
          <ChartTooltip
            left={hover.px}
            top={hover.py}
            flipX={hover.px > size.width / 2}
            flipY={hover.py > size.height / 2}
            offset={12}
            title={hv?.name ?? hovered.name}
            rows={[{ label, value: hv ? `${fmt(hv.value)}${unit}` : "값 없음", color: hv ? (mode === "fill" ? SEQ[classOf(hv.value)] : BUBBLE) : NONE, shape: mode === "bubble" ? "dot" : "square" }]}
            footer={hv && mode === "fill" ? `${classOf(hv.value) + 1}단계 · ${rangeOf(classOf(hv.value))}` : undefined}
          />
        )}
        {zoom && (
          <div className="absolute" style={{ right: 8, bottom: 8 }}>
            <TopologyZoomControl scale={view.z} limits={ZOOM} onScaleChange={zoomTo} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center" style={{ columnGap: 12, rowGap: 4 }}>
        <span className="text-sm text-secondary">{label}</span>
        {mode === "fill" ? (
          <>
            {SEQ.map((c, k) => (
              <ChartLegendItem key={c} color={c} label={rangeOf(k)} onHover={(on) => setFocus(on ? k : null)} dimmed={focus != null && focus !== k} />
            ))}
            <ChartLegendItem color={NONE} label="값 없음" dimmed={focus != null} />
          </>
        ) : (
          <ChartLegendItem color={BUBBLE} shape="dot" label="원 넓이 = 값" value={`최대 ${fmt(max)}${unit}`} />
        )}
      </div>
      {offMap.length > 0 && (
        <span className="text-sm text-tertiary truncate" title={offMap.map((d) => `${nameOf(d)} ${fmt(d.value)}${unit}`).join(", ")}>
          지도 밖 {offMap.length}곳 — {offMap.slice(0, 3).map((d) => `${nameOf(d)} ${fmt(d.value)}${unit}`).join(" · ")}
          {offMap.length > 3 ? " …" : ""}
        </span>
      )}
    </div>
  );
}

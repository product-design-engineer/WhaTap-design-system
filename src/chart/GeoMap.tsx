/**
 * GeoMap — 국가별 값을 세계 지도 위에. 단계 구분(국가 칸 색 4단계) 또는 버블(국가 자리 원 넓이). 국가를 누르면 그 나라 시·도로 들어간다. Composite layer.
 *
 * ## Purpose
 * «어느 나라에서 요청 · 오류가 오는가» 를 지리로. 라이브 APM 큐브 › 국가 지도는 값 레이어가 비어 모든 국가가 같은 회색이라
 * «데이터 없음» 과 «값이 고르다» 가 구별되지 않았다(patterns §21). 여기서는 **값 없는 국가 · 값 있는 국가 · 데이터가 하나도 없는 지도**를
 * 서로 다르게 그린다 — 값 없는 국가는 바탕 회색, 값은 순차 4단계, 지도 전체가 비면 판 가운데 «데이터 없음».
 * 국가 도형은 Natural Earth 1:110m(퍼블릭 도메인)을 Equal Earth(면적 보존)로 투영해 내장한다(내부 `_geoWorld`, 생성 `scripts/build-geo-world.mjs`).
 * 시·도 도형은 Natural Earth 1:10m Admin 1 에서 한국(17) · 일본(47)만 내장한다(내부 `_geoRegions`, 생성 `scripts/build-geo-regions.mjs`).
 *
 * ## When to use
 * - 국가별 값 하나 — 국가별 오류율 · 평균 응답시간(단계 구분), 국가별 요청 수 · 사용자 수(버블).
 * - 사용자 · 트래픽의 지역 쏠림을 찾을 때. 대상 국가가 여럿(5개 이상)일 때.
 * - 한 나라 안 시·도별 값 — 한국 · 일본은 국가를 눌러 들어가 같은 지도에서 본다(대부분의 값이 한 나라에 몰린 서비스).
 *
 * ## When NOT to use
 * - 국가 3~4개 · 정밀 비교 → [[BarList]](이름으로 정렬된 막대가 더 정확하다).
 * - 시간 흐름 → 선 · 막대 차트. 지도는 한 시점(또는 한 구간 집계)이다.
 * - 도시 · 리전 · 데이터센터, 한국 · 일본이 아닌 나라의 시·도 — 내장 도형은 국가 경계와 두 나라 시·도뿐이다.
 *
 * ## Metrics
 * - ✅ 단계 구분(`fill`) — 국가별 비율 · 평균처럼 국가 크기와 무관한 값: 오류율(%) · 평균 응답시간(ms) · Apdex · 이탈률
 * - ✅ 버블(`bubble`) — 국가별 개수 · 합계: 요청 수 · 사용자 수 · 세션 수 · 트래픽(바이트)
 * - ❌ 개수 · 합계를 단계 구분으로 — 넓은 나라가 많아 보인다. 버블로
 * - ❌ 음수가 섞인 변화량(증감) — 순차 4단계는 0 에서 시작한다
 * - ❌ 국가 하나 · 둘 → 숫자 [[MetricGrid]] · [[BarList]]
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
 * - **시·도는 줌이 아니라 눌러서 들어간다(2026-10-26).** 줌 배율로 단위를 바꾸면 한 화면에 여러 나라가 걸릴 때 어느 나라를 나눌지 정해지지 않고,
 *   같은 배율에서 범례 단계가 몰래 바뀐다. 줌은 화면 확대만 한다. 시·도 도형이 있는 국가(한국 · 일본)만 누를 수 있고, 툴팁이 «눌러서 시·도 보기» 를 알린다.
 *   들어가면 왼쪽 위 경로 «세계 › 대한민국» 으로 돌아온다. 단계 · 버블 크기는 그 나라 시·도 값으로 다시 잡는다(세계 단계와 섞지 않는다).
 * - 시·도 값은 같은 `data` 에 ISO 3166-2 코드(`KR-11`)로 넣는다. 국가 값을 시·도 합으로 만들지 않는다 — 비율 · 평균은 더할 수 없다.
 *   필요할 때만 받으려면 `onDrillChange` 에서 그 나라 시·도 값을 불러 `data` 에 더한다. 받기 전 · 값이 없으면 시·도 지도도 «데이터 없음» 이다.
 * - 들어간 나라를 앱이 정하려면 `drill`(제어) — 키보드 · 목록에서 나라를 고르는 길은 앱이 이 prop 으로 만든다(지도 칸은 포커스를 받지 않는다).
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
 * | 시·도 | 한국 17 · 일본 47 · Natural Earth 10m Admin 1 · 국가별 좌표계 폭 1000 · 누를 수 있는 국가는 커서 pointer · 들어가면 줌 100% 로 |
 * | 경로 | 왼쪽 위 `h-32px px-8px bg-card rounded-lg shadow-xs`(줌 컨트롤과 같은 판) · «세계» 버튼 `text-sm text-secondary` › 나라 이름 `text-sm font-medium` · 나라 값 |
 * | 빈 상태 | `data` 가 비면 지도 위 가운데 `emptyLabel`(기본 «데이터 없음») `text-base` secondary |
 * | 접근성 | 판 `role="img"` + 값 큰 국가 다섯 요약 |
 *
 * @example
 * ```tsx
 * <GeoMap unit="%" label="오류율" data={[{ code: "KR", value: 0.4 }, { code: "US", value: 1.2 }, { code: "JP", value: 0.8 }]} />
 * <GeoMap mode="bubble" unit="건" label="요청 수" data={requestsByCountry} />
 * <GeoMap unit="ms" label="응답시간" data={[...byCountry, { code: "KR-11", value: 180 }, { code: "KR-26", value: 240 }]} />
 * ```
 */
import { useId, useRef, useState, type MouseEvent } from "react";
import ChartLegendItem from "./ChartLegendItem";
import ChartTooltip from "./ChartTooltip";
import TopologyZoomControl from "../topology/TopologyZoomControl";
import { niceMax } from "./_axisScale";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";
import { GEO_GRATICULE, GEO_NAMES, GEO_OUTLINE, GEO_WORLD, GEO_WORLD_SIZE } from "./_geoWorld";
import { GEO_REGIONS } from "./_geoRegions";

export type GeoMapDatum = {
  /** 국가 코드 ISO 3166-1 alpha-2(`KR` · `US`) · 시·도 코드 ISO 3166-2(`KR-11` · `JP-13`). */
  code: string;
  /** 값(0 이상). */
  value: number;
  /** 이름 — 없으면 내장 한국어 이름(국가 ISO 3166-1 전체 · 시·도는 내장 도형이 있는 나라). */
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
  /** 들어가 있는 나라(alpha-2) — 주면 제어. null = 세계. 시·도 도형이 없는 나라는 세계로 본다. */
  drill?: string | null;
  /** 처음 들어가 있을 나라(비제어). */
  defaultDrill?: string | null;
  /** 나라를 누르거나 «세계» 로 돌아올 때. 이때 그 나라 시·도 값을 불러 `data` 에 더하면 된다. */
  onDrillChange?: (code: string | null) => void;
};

/* 단계 1~4 — 토큰 이름을 문자 그대로(토큰 게이트가 참조를 읽는다) */
const SEQ = ["var(--color-chart-seq-1)", "var(--color-chart-seq-2)", "var(--color-chart-seq-3)", "var(--color-chart-seq-4)"] as const;
const NONE = "var(--color-surface-200)";
const BUBBLE = "var(--color-chart-series-1)";
const BUBBLE_R = 18;
const ZOOM = { min: 1, max: 6, step: 0.5 } as const;
const WORLD = { ...GEO_WORLD_SIZE, shapes: GEO_WORLD };
const DRAG_SLOP = 3;

const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function GeoMap({
  data,
  mode = "fill",
  label = "값",
  unit = "",
  breaks,
  emptyLabel = "데이터 없음",
  zoom = true,
  drill,
  defaultDrill = null,
  onDrillChange,
}: GeoMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const clipId = `wds-geo-${useId().replace(/:/g, "")}`;
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const [hover, setHover] = useState<{ i: number; px: number; py: number } | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const drag = useRef<{ cx: number; cy: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [innerDrill, setInnerDrill] = useState(defaultDrill);

  const want = (drill !== undefined ? drill : innerDrill)?.toUpperCase() ?? null;
  const country = want && GEO_REGIONS[want] ? want : null;
  const { w: W, h: H, shapes } = country ? GEO_REGIONS[country] : WORLD;
  const go = (code: string | null) => {
    setInnerDrill(code);
    onDrillChange?.(code);
  };
  /* 나라가 바뀌면(누름 · 제어 prop 모두) 좌표계가 바뀐다 — 줌 · hover · 범례 강조를 처음으로 */
  const [seen, setSeen] = useState(country);
  if (seen !== country) {
    setSeen(country);
    setView({ z: 1, x: 0, y: 0 });
    setHover(null);
    setFocus(null);
  }

  /* 세계 = 국가 코드만 · 시·도 = 그 나라 «KR-» 코드만. 두 단계의 값을 한 단계 범례에 섞지 않는다 */
  const all = new Map(data.map((d) => [d.code.toUpperCase(), d]));
  const shown = data.filter((d) => {
    const c = d.code.toUpperCase();
    return country ? c.startsWith(`${country}-`) : !c.includes("-");
  });
  const byCode = new Map(shown.map((d) => [d.code.toUpperCase(), d]));
  const shapeCodes = new Set(shapes.map((c) => c.code));
  const offMap = shown.filter((d) => !shapeCodes.has(d.code.toUpperCase())).sort((a, b) => b.value - a.value);
  const max = Math.max(0, ...shown.map((d) => d.value));
  const top = niceMax(max) || 1;
  const cuts = breaks ?? ([top / 4, top / 2, (top * 3) / 4] as const);
  const classOf = (v: number) => (v < cuts[0] ? 0 : v < cuts[1] ? 1 : v < cuts[2] ? 2 : 3);
  const rangeOf = (k: number) =>
    k === 3 && max <= cuts[2] ? `${fmt(cuts[2])}${unit} 이상` : `${k === 0 ? 0 : fmt(cuts[k - 1])}–${k === 3 ? fmt(max) : fmt(cuts[k])}${unit}`;
  const empty = shown.length === 0;
  const shapeName = new Map(shapes.map((c) => [c.code, c.name]));
  const nameOf = (d: GeoMapDatum) => d.name ?? shapeName.get(d.code.toUpperCase()) ?? GEO_NAMES[d.code.toUpperCase()] ?? d.code;
  const countryName = country ? (all.get(country)?.name ?? GEO_NAMES[country] ?? country) : null;
  const countryValue = country ? all.get(country) : undefined;

  const clamp = (z: number, x: number, y: number) => ({ z, x: Math.min(W - W / z, Math.max(0, x)), y: Math.min(H - H / z, Math.max(0, y)) });
  const zoomTo = (z: number) => setView((v) => clamp(z, v.x + W / v.z / 2 - W / z / 2, v.y + H / v.z / 2 - H / z / 2));

  const point = (ev: MouseEvent) => {
    const r = box.current?.getBoundingClientRect();
    return r ? { px: ev.clientX - r.left, py: ev.clientY - r.top, w: r.width, h: r.height } : { px: 0, py: 0, w: 1, h: 1 };
  };
  const hovered = hover ? shapes[hover.i] : null;
  const canDrill = !country && !!hovered?.code && !!GEO_REGIONS[hovered.code];
  const hv = hovered?.code ? byCode.get(hovered.code) : undefined;
  const size = box.current?.getBoundingClientRect();
  const summary = `${countryName ? `${countryName} 시·도` : "세계"} 지도 ${label} — ${empty ? emptyLabel : [...shown].sort((a, b) => b.value - a.value).slice(0, 5).map((d) => `${nameOf(d)} ${fmt(d.value)}${unit}`).join(", ")}`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ gap: 8 }}>
      <div
        ref={box}
        className="relative flex-1 min-h-0 w-full overflow-hidden"
        role="img"
        aria-label={summary}
        style={{ minHeight: 120, cursor: view.z > 1 ? (drag.current ? "grabbing" : "grab") : undefined }}
        onPointerDown={(ev) => {
          /* 끌기 뒤 click 이 안 오는 경우가 있다 — 지난 끌기의 표시가 이번 누름을 먹지 않게 새 누름마다 지운다 */
          suppressClick.current = false;
          if (view.z <= 1 || (ev.target as HTMLElement).closest("button")) return;
          drag.current = { cx: ev.clientX, cy: ev.clientY, x: view.x, y: view.y, moved: false };
          ev.currentTarget.setPointerCapture(ev.pointerId);
        }}
        onPointerMove={(ev) => {
          const d = drag.current;
          if (!d || !size) return;
          if (Math.hypot(ev.clientX - d.cx, ev.clientY - d.cy) > DRAG_SLOP) d.moved = true;
          const k = W / view.z / size.width;
          setView((v) => clamp(v.z, d.x - (ev.clientX - d.cx) * k, d.y - (ev.clientY - d.cy) * k));
        }}
        onPointerUp={() => {
          suppressClick.current = !!drag.current?.moved;
          drag.current = null;
        }}
        onClick={(ev) => {
          /* 들어가기는 판에서 받는다. 누른 칸은 이벤트 대상에서 읽는다 — 옮기자마자 누르거나(터치 탭) 하면 hover 가 아직 반영 전이다.
             확대 중엔 끌기용 포인터 캡처로 click 이 판에 오므로 그때만 hover 를 쓴다. 끌기를 마친 손이 나라 위에서 떨어진 것은 누름이 아니다 */
          if (suppressClick.current) return void (suppressClick.current = false);
          if (country) return;
          const at = (ev.target as Element).closest("[data-geo-i]")?.getAttribute("data-geo-i");
          const code = shapes[at != null ? Number(at) : (hover?.i ?? -1)]?.code;
          if (code && GEO_REGIONS[code]) go(code);
        }}
      >
        <svg aria-hidden viewBox={`${view.x} ${view.y} ${W / view.z} ${H / view.z}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
          {!country && <path d={GEO_GRATICULE} fill="none" stroke="var(--color-border-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
          {!country && <path d={GEO_OUTLINE} fill="none" stroke="var(--color-border-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
          {/* 날짜변경선을 건너는 국가는 사본이 외곽 밖으로 나간다 — 외곽으로 자른다 */}
          <clipPath id={clipId}>
            <path d={GEO_OUTLINE} />
          </clipPath>
          <g clipPath={country ? undefined : `url(#${clipId})`}>
          {shapes.map((c, i) => {
            const d = c.code ? byCode.get(c.code) : undefined;
            const k = d && mode === "fill" ? classOf(d.value) : null;
            const dim = focus != null && k !== focus;
            const drillable = !country && !!c.code && !!GEO_REGIONS[c.code];
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
                style={drillable && view.z <= 1 ? { cursor: "pointer" } : undefined}
                data-geo-i={i}
                onMouseMove={(ev) => {
                  const p = point(ev);
                  setHover({ i, px: p.px, py: p.py });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
          </g>
          {hovered && <path d={hovered.d} clipPath={country ? undefined : `url(#${clipId})`} fill="none" stroke="var(--color-text-primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
          {mode === "bubble" &&
            shapes.map((c, i) => {
              const d = c.code ? byCode.get(c.code) : undefined;
              if (!d || d.value <= 0 || max <= 0) return null;
              const drillable = !country && !!c.code && !!GEO_REGIONS[c.code];
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
                  style={drillable && view.z <= 1 ? { cursor: "pointer" } : undefined}
                  data-geo-i={i}
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
            footer={
              [hv && mode === "fill" ? `${classOf(hv.value) + 1}단계 · ${rangeOf(classOf(hv.value))}` : null, canDrill ? "눌러서 시·도 보기" : null]
                .filter(Boolean)
                .join(" · ") || undefined
            }
          />
        )}
        {country && (
          <div className="absolute flex items-center gap-8px h-32px px-8px bg-card rounded-lg shadow-xs" style={{ left: 8, top: 8 }}>
            <button type="button" className="text-sm text-secondary cursor-pointer border-none bg-transparent p-0" onClick={() => go(null)}>
              세계
            </button>
            <span aria-hidden className="text-sm text-tertiary">
              ›
            </span>
            <span className="text-sm font-medium text-primary">{countryName}</span>
            {countryValue && (
              <span className="text-sm text-secondary font-numeric tabular-nums">
                {fmt(countryValue.value)}
                {unit}
              </span>
            )}
          </div>
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

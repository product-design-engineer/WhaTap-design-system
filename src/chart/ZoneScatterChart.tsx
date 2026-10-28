/**
 * ZoneScatterChart — 판정 구역(행 × 열 칸) 위에 대상 점을 찍는 구역 분할 산점도. 점이 어느 구역에 몇 개인지가 판정이다. Composite layer.
 *
 * ## Purpose
 * 두 사용률의 조합을 «유휴 · 활성 · 효율» 같은 구역 이름으로 읽게 한다 — GPU 사용률 × 메모리(FB) 사용률로 GPU 를 분류하는 리소스 맵.
 * 라이브 GPU Resource Map 은 구역 배경과 점이 같은 색 계열이라 점이 묻혔고, 눈금이 0 · 1 · 50 · 100 으로 불균등해 점 위치가 비율을 말하지
 * 않았으며, 구역 이름과 개수가 칸의 대각선 양 끝에 떨어져 짝이 읽히지 않았다(patterns §21). 여기서는 구역 = 무채색 면, 점 = 계열색,
 * 축은 선형이고 구역 경계를 실제 값 자리에 긋고, 이름과 개수를 한 줄로 붙인다.
 *
 * ## When to use
 * - 두 수치의 조합으로 대상을 분류하는 맵 — GPU(사용률 × FB 사용률) · 서버(CPU × 메모리) · 서비스(호출 수 × 에러율) 사분면.
 * - 구역마다 이름 · 개수가 판단의 단위일 때(«Memory Squatting 3대»).
 *
 * ## When NOT to use
 * - 구역 없이 관계 · 이상점만 → [[ScatterChart]].
 * - 응답시간 판정 분포(시간 × 응답시간) → [[ScatterHeatmap]].
 * - 대상 하나의 상태만 → [[BlockGrid]] · [[HexGrid]].
 *
 * ## Metrics
 * - ✅ 상한 있는 두 사용률의 조합 분류 — GPU 사용률 × FB(메모리) 사용률 · CPU × 메모리 사용률(%)
 * - ✅ 경계값이 정해진 두 지표의 사분면 — 호출 수 × 에러율 · 처리량 × 지연
 * - ❌ 상한 · 경계가 없는 지표 — 구역 경계가 아무 값이 되어 분류가 거짓을 말한다 → [[ScatterChart]]
 * - ❌ 시간 흐름 · 한 지표의 추이 → [[MiniLineChart]]
 *
 * ## Composition rules
 * - 요소를 조합한다 — 값축 [[ChartValueAxis]](`ticks` = 0 · Y 경계 · 최대) · X 글자 [[ChartTimeAxis]](`positions` = 0 · X 경계 · 최대).
 *   격자 대신 구역이 플롯을 나눈다. 차트는 구역 · 점 · 임계 띠만 그린다. 그래서 Composite 계층이다.
 * - **축은 선형, 구역 경계는 실제 값 자리(2026-10-23 결정).** 0~1% 구역은 좁게 보인다 — 그것이 사실이다. 불균등 눈금으로 넓히지 않는다.
 * - **구역 = 무채색 면(`--color-surface-50`) + 카드색 1px 경계, 점 = 계열색(`color`, 기본 series-1 · 불투명도 0.8)** — 두 역할의 색을 섞지 않는다(§17).
 * - 구역 이름과 개수는 구역 왼쪽 위 한 줄(`Memory Squatting · 3`) — 이름 `text-chart` secondary · 개수 굵게 primary.
 * - 열 머리(`columnLabels`)는 플롯 위 한 줄 범례로, 열마다 개수를 붙인다(`Idle GPU 9`) — 열 위에 세우면 좁은 열에서 잘린다.
 * - **좁은 열(범위의 12% 미만)의 구역 이름 · 개수는 플롯 아래 한 줄로 옮긴다** — 축을 늘려 자리를 만들지 않는다(점 위치가 거짓이 된다).
 * - 임계 띠(`critical`)는 Y 값 이상을 `--color-status-error-soft` 띠로 깔고 오른쪽 위에 라벨 + 해당 개수. 액션(재배치 분석 등)은 차트 밖 [[WidgetFrame]] `menu` 몫이다 — 차트 안에 버튼을 두지 않는다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 구역 | `--color-surface-50` · 경계 1px `--color-card` · 이름 `text-chart` secondary + 개수 bold primary, 왼쪽 위 안쪽 4 |
 * | 점 | 원 6px · `color` · 불투명도 0.8 · 테두리 1px `--color-card`(구역 경계와 겹쳐도 보이게) |
 * | 축 | X · Y 선형 0 ~ `xMax` · `yMax`(기본 100) · 눈금 = 0 · 경계 · 최대 · 단위 접미사 · 앞 글자와 6% 안이면 X 글자 생략(경계선은 남는다) |
 * | 임계 띠 | `critical.from` 이상 `--color-status-error-soft` · 라벨 `text-chart` `--color-status-error` · 오른쪽 위 |
 * | 열 머리 | 플롯 위 한 줄 · `text-sm` secondary + 개수 bold · 간격 12 |
 * | 좁은 구역 | 열 폭 < 범위 12% → 이름 · 개수를 플롯 아래 한 줄(`text-chart`) |
 * | 플롯 여백 | 위 4 · 아래 14 · 오른쪽 8 · 왼쪽 `--wds-widget-axis-gutter` |
 * | hover | 점마다 14px 칸 · 가리킨 점은 불투명 + 카드색 2px 고리, 나머지 0.32 · [[ChartTooltip]](이름 · 구역 · X · Y) |
 * | 접근성 | 플롯 `role="img"` + 구역별 개수 요약 |
 *
 * @example
 * ```tsx
 * <ZoneScatterChart points={gpus} xBreaks={[1, 50]} yBreaks={[30, 70]} xUnit="%" yUnit="%"
 *   zones={[["Memory Squatting", "Memory Bound", "Saturated"], ["Reserved", "Balanced Active", "Busy"], ["Idle", "Light", "Compute Bound"]]}
 *   columnLabels={["Idle GPU", "Active GPU", "Effective GPU"]} critical={{ from: 95, label: "Memory Critical" }} />
 * ```
 */
import { useState } from "react";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartTooltip from "./ChartTooltip";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, formatAxisValue } from "./_axisScale";
import { DIM_OPACITY, EMPHASIS_RING, MARK_CLASS } from "./_emphasis";

export type ZoneScatterPoint = {
  x: number;
  y: number;
  /** 대상 이름(툴팁). */
  label?: string;
};

export type ZoneScatterChartProps = {
  /** 대상 점들. */
  points: ReadonlyArray<ZoneScatterPoint>;
  /** X 구역 경계(오름차순, 0 · 최대 제외). 열 수 = 길이 + 1. */
  xBreaks: ReadonlyArray<number>;
  /** Y 구역 경계(오름차순). 행 수 = 길이 + 1. */
  yBreaks: ReadonlyArray<number>;
  /** 구역 이름 — `zones[행][열]`, 행은 **위(큰 Y)부터**, 열은 왼쪽부터. */
  zones?: ReadonlyArray<ReadonlyArray<string>>;
  /** 열 머리(플롯 위) — 열마다 개수를 붙인다. */
  columnLabels?: ReadonlyArray<string>;
  /** Y 임계 띠 — 이 값 이상. */
  critical?: { from: number; label: string };
  /** X 최대. 기본 100. */
  xMax?: number;
  /** Y 최대. 기본 100. */
  yMax?: number;
  /** X 눈금 단위. */
  xUnit?: string;
  /** Y 눈금 단위. */
  yUnit?: string;
  /** 점 색 — 계열 토큰. 기본 series-1. */
  color?: string;
  /** 자기 바깥 좌우 여백(8px)을 둘지. 기본 true. */
  frame?: boolean;
};

const PAD_TOP = 4;
const PAD_BOTTOM = 14;
const PAD_RIGHT = 8;

const indexOf = (v: number, breaks: ReadonlyArray<number>) => breaks.filter((b) => v >= b).length;

export default function ZoneScatterChart({
  points,
  xBreaks,
  yBreaks,
  zones,
  columnLabels,
  critical,
  xMax = 100,
  yMax = 100,
  xUnit = "",
  yUnit = "",
  color = "var(--color-chart-series-1)",
  frame = true,
}: ZoneScatterChartProps) {
  const xs = [0, ...xBreaks, xMax];
  const ys = [0, ...yBreaks, yMax];
  const cols = xs.length - 1;
  const rows = ys.length - 1;
  /* 구역별 개수 — 행은 위(큰 Y)부터 */
  const counts = Array.from({ length: rows }, () => Array(cols).fill(0) as number[]);
  for (const p of points) counts[rows - 1 - Math.min(rows - 1, indexOf(p.y, yBreaks))][Math.min(cols - 1, indexOf(p.x, xBreaks))]++;
  const colCounts = Array.from({ length: cols }, (_, c) => counts.reduce((n, r) => n + r[c], 0));
  const critCount = critical ? points.filter((p) => p.y >= critical.from).length : 0;
  /* X 눈금 글자 — 앞 글자와 6% 안으로 붙으면 뺀다(0 · 1% 처럼 겹친다). 끝 글자는 늘 둔다. 구역 경계는 그대로 */
  const xTicks = xs.filter((v, i) => i === xs.length - 1 || i === 0 || (v - xs[i - 1]) / xMax >= 0.06);
  /* 좁은 열(범위의 12% 미만) — 구역 이름이 칸 안에 들어가지 않는다. 축은 선형 그대로 두고 이름 · 개수만 플롯 아래 한 줄로 옮긴다 */
  const narrowCol = (c: number) => (xs[c + 1] - xs[c]) / xMax < 0.12;
  const narrowZones = zones ? zones.flatMap((r, ri) => r.map((z, c) => ({ z, n: counts[ri][c], c })).filter((e) => e.z && narrowCol(e.c))) : [];
  const px = (v: number) => `${(v / xMax) * 100}%`;
  const py = (v: number) => `${(1 - v / yMax) * 100}%`;
  const plot = { left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM };
  /* 가리킨 점 — [[ChartTooltip]] 으로 값 · 구역을 보인다 */
  const [hover, setHover] = useState<ZoneScatterPoint | null>(null);
  const zoneOf = (p: ZoneScatterPoint) => zones?.[rows - 1 - Math.min(rows - 1, indexOf(p.y, yBreaks))]?.[Math.min(cols - 1, indexOf(p.x, xBreaks))];
  const clampX = (v: number) => Math.min(xMax, Math.max(0, v));
  const clampY = (v: number) => Math.min(yMax, Math.max(0, v));
  const summary = zones ? zones.flatMap((r, ri) => r.map((z, ci) => `${z} ${counts[ri][ci]}`)).join(", ") : `${points.length}개`;

  return (
    <div className="flex flex-col h-full min-h-0 w-full gap-4px" style={{ padding: frame ? "0 8px" : 0 }}>
      {columnLabels && (
        <div className="flex flex-wrap gap-12px text-sm text-secondary" style={{ marginLeft: AXIS_GUTTER }}>
          {columnLabels.map((l, c) => (
            <span key={c} className="whitespace-nowrap">
              {l} <b className="text-primary" style={{ fontFamily: "var(--font-family-numeric)" }}>{colCounts[c]}</b>
            </span>
          ))}
        </div>
      )}
      <div className="relative flex-1 min-w-0 min-h-0" role="img" aria-label={`구역 분할 산점도 — ${summary}`}>
        <div className="absolute" style={plot}>
          {/* 구역 — 무채색 면 + 카드색 1px 경계 */}
          {ys.slice(0, -1).map((_, rFromBottom) =>
            xs.slice(0, -1).map((x0, c) => {
              const y0 = ys[rFromBottom];
              const y1 = ys[rFromBottom + 1];
              const ri = rows - 1 - rFromBottom;
              return (
                <div
                  key={`${ri}-${c}`}
                  className="absolute"
                  style={{
                    left: px(x0),
                    width: `${((xs[c + 1] - x0) / xMax) * 100}%`,
                    top: py(y1),
                    height: `${((y1 - y0) / yMax) * 100}%`,
                    background: "var(--color-surface-50)",
                    boxShadow: "inset 0 0 0 0.5px var(--color-card)",
                  }}
                >
                  {zones?.[ri]?.[c] && !narrowCol(c) && (
                    <span className="absolute text-chart leading-none whitespace-nowrap" style={{ left: 4, top: 4, zIndex: 1 }}>
                      <span className="text-secondary">{zones[ri][c]}</span>
                      <span className="text-primary" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-bold)" }}>
                        {" · "}
                        {counts[ri][c]}
                      </span>
                    </span>
                  )}
                </div>
              );
            }),
          )}
          {critical && (
            <div className="absolute" style={{ left: 0, right: 0, top: 0, height: `${((yMax - critical.from) / yMax) * 100}%`, background: "var(--color-status-error-soft)" }}>
              <span className="absolute text-chart leading-none whitespace-nowrap" style={{ right: 4, bottom: 2, color: "var(--color-status-error)", zIndex: 1 }}>
                {critical.label} · {critCount}
              </span>
            </div>
          )}
          {points.map((p, i) => {
            const on = hover === p;
            return (
              /* 맞히기 쉽게 — 14px 투명 칸이 hover 를 받는다 */
              <span
                key={i}
                className="absolute flex items-center justify-center"
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                style={{ left: px(clampX(p.x)), top: py(clampY(p.y)), width: 14, height: 14, transform: "translate(-50%, -50%)", zIndex: 2 }}
              >
                <span
                  className={`${MARK_CLASS} block rounded-full`}
                  style={{ width: 6, height: 6, background: color, opacity: on ? 1 : hover ? DIM_OPACITY : 0.8, boxShadow: on ? EMPHASIS_RING : "0 0 0 1px var(--color-card)" }}
                />
              </span>
            );
          })}
          {hover && (
            <ChartTooltip
              left={px(clampX(hover.x))}
              top={py(clampY(hover.y))}
              flipX={clampX(hover.x) / xMax > 0.5}
              flipY={1 - clampY(hover.y) / yMax > 0.5}
              title={hover.label}
              rows={[
                ...(zoneOf(hover) ? [{ label: "구역", value: zoneOf(hover) }] : []),
                { label: "X", value: `${hover.x.toLocaleString("en-US")}${xUnit}`, color, shape: "dot" as const },
                { label: "Y", value: `${hover.y.toLocaleString("en-US")}${yUnit}` },
              ]}
            />
          )}
        </div>
        <ChartValueAxis max={yMax} ticks={ys} unit={yUnit} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartTimeAxis labels={xTicks.map((v) => formatAxisValue(v) + xUnit)} positions={xTicks.map((v) => v / xMax)} right={PAD_RIGHT} />
      </div>
      {narrowZones.length > 0 && (
        <div className="flex flex-wrap gap-12px text-chart leading-none" style={{ marginLeft: AXIS_GUTTER }}>
          {narrowZones.map((e) => (
            <span key={e.z} className="whitespace-nowrap">
              <span className="text-secondary">{e.z}</span>
              <span className="text-primary" style={{ fontFamily: "var(--font-family-numeric)", fontWeight: "var(--font-weight-bold)" }}>
                {" · "}
                {e.n}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

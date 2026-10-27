/**
 * EqualizerChart — 대상마다 세로 막대를 칸(셀)으로 끊어 쌓는 이퀄라이저. 칸 하나 = 축 최대 ÷ `levels`. Composite layer.
 *
 * ## Purpose
 * 대상(에이전트 · 서버 · 서비스)마다 «지금 얼마나 찼나» 를 칸 수로 센다. 라이브에는 같은 «이퀄라이저» 이름으로 두 가지가 섞여 있었다 —
 * 통합 대시보드 액티브 트랜잭션은 상태별 색 누적, 리소스 이퀄라이저는 임계 2색. 그리고 칸 한 칸이 무엇인지 정의돼 있지 않아 칸이 질감으로만
 * 작동했다(patterns §21). 여기서는 **칸 하나 = 축 최대의 1/`levels`**(기본 10칸 = 10%)로 정하고 — 호 형태 [[ChartRadialBars]] 와 같은
 * 규칙이다 — 색의 뜻은 두 방식 중 하나로 명시한다: 구간 누적(`segments`) 또는 임계 2색(`threshold`).
 *
 * ## When to use
 * - 대상 4~20개의 지금 값 비교 — 에이전트별 액티브 트랜잭션(속도 등급 누적) · 서버별 CPU · 메모리 사용률(임계 2색).
 * - 칸을 세어 «몇 할» 로 읽히면 되는 자리. 정확한 값은 막대 위 글자가 말한다.
 *
 * ## When NOT to use
 * - 정확한 크기 비교 · 긴 이름 → [[BarList]](가로 막대 줄). 대상 5개 안팎 TOP-N → [[MiniBarChart]] `categories`.
 * - 시간 흐름 → [[MiniLineChart]] · [[MiniBarChart]].
 * - 원형 배치(대시보드 중앙 고리) → [[ChartRadialBars]] · [[ActiveTransactionArc]] — 같은 규칙의 호 형태.
 * - 대상 20개 초과 → [[HexGrid]](상태 칸) · §22.
 *
 * ## Metrics
 * - ✅ 대상별 지금 값을 등급으로 나눈 구성 — 에이전트별 액티브 트랜잭션(normal · slow · very slow)
 * - ✅ 대상별 상한 있는 사용률(%) + 임계 — 서버별 CPU · 메모리 · 디스크 사용률(80% 이상 경고)
 * - ❌ 시간 흐름(TPS 추이) → [[MiniLineChart]]
 * - ❌ 칸 단위보다 정밀한 비교가 필요한 지표(응답시간 ms 차이) — 칸이 10% 단위로 뭉갠다 → [[BarList]]
 *
 * ## Colors
 * - 판정 등급 — `segments` 구간 누적(속도 등급이면 `--color-chart-speed-*`) · 구간 색은 호출부 토큰
 * - 상태 — `threshold` 임계 2색 · 미만 `--color-brand-blue` · 이상 `--color-status-warning` · 한 차트에 두 방식을 섞지 않는다
 * - 바탕 — 빈 칸 · `--color-surface-100`
 *
 * ## Composition rules
 * - 요소를 조합한다 — 격자 [[ChartGrid]] · 값축 [[ChartValueAxis]] · 대상 이름 [[ChartCategoryAxis]](칸 폭 말줄임 · 전체 이름은 title). 차트는 칸만 그린다.
 *   그래서 Composite 계층이다.
 * - **칸 수 = 합 ÷ 축 최대 × `levels`(반올림, 0 보다 큰 구간은 최소 1칸)** — [[ChartRadialBars]] 와 같은 계산(내부 `_stripes`).
 * - **색은 둘 중 하나(2026-10-23 결정).** `segments` 를 주면 구간 누적(바닥부터 `segments` 순서, 색 = 구간 토큰 — 속도 등급이면 `--color-chart-speed-*`).
 *   `value` + `threshold` 면 임계 2색 — 임계 미만 `--color-brand-blue`, 이상 `--color-status-warning`. 한 차트에 두 방식을 섞지 않는다.
 * - **임계 슬라이더는 차트가 갖지 않는다.** `threshold` 는 prop 이고, 값을 바꾸는 컨트롤은 화면이 조합한다 — 차트 계약에 입력을 넣지 않는다.
 * - 막대 위 값 글자: 가장 큰 값만 굵게 · primary, 나머지 tertiary(MiniBarChart `valueLabels` 와 같다). 단위는 축 눈금 접미사.
 * - 빈 칸 자리는 `--color-surface-100` 으로 깐다 — 칸 수가 «10 중 몇» 으로 읽힌다.
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 칸 | 높이 = (플롯 높이 − (levels − 1) × 2) ÷ levels · 칸 사이 2px · 반경 1 · 빈 칸 `--color-surface-100` |
 * | 막대 | 칸 폭의 60%(최대 24px) · 가운데 · 대상 사이 4px |
 * | 색 | `segments[].color` 또는 임계 2색(`--color-brand-blue` / `--color-status-warning`) |
 * | 축 | Y 0 ~ 합 최대 올림(`max`) · 눈금 최대 · 절반 · 0 · 단위 `unit` / X 이름 [[ChartCategoryAxis]] |
 * | 값 글자 | `text-chart` 9px · 숫자 서체 · 최대만 bold primary · 나머지 tertiary · 막대 칸 위 2px |
 * | 플롯 여백 | 위 14(값 글자) · 아래 18(이름) · 오른쪽 8 · 왼쪽 `--wds-widget-axis-gutter` |
 * | hover | 막대 칸 전체 · 나머지 막대 0.32 · [[ChartTooltip]](이름 · 구간별 값 · 합계 또는 임계) |
 * | 접근성 | 플롯 `role="img"` + 대상 수 · 최대 |
 *
 * @example
 * ```tsx
 * <EqualizerChart bars={agents.map((a) => ({ label: a.name, segments: [
 *   { value: a.normal, color: "var(--color-chart-speed-normal)" },
 *   { value: a.slow, color: "var(--color-chart-speed-slow)" },
 *   { value: a.verySlow, color: "var(--color-chart-speed-very-slow)" }] }))} />
 * <EqualizerChart bars={servers.map((s) => ({ label: s.name, value: s.cpu }))} max={100} unit="%" threshold={80} />
 * ```
 */
import { useState } from "react";
import ChartCategoryAxis from "./ChartCategoryAxis";
import ChartGrid from "./ChartGrid";
import ChartTooltip from "./ChartTooltip";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, formatAxisValue, niceMax } from "./_axisScale";
import { stripeCounts } from "./_stripes";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type EqualizerSegment = {
  /** 양. */
  value: number;
  /** 구간 색 토큰. hex 금지. */
  color: string;
  /** 구간 이름(툴팁). */
  label?: string;
};

export type EqualizerBar = {
  /** 대상 이름 — X 글자(칸 폭 말줄임). */
  label: string;
  /** 구간 누적 — 바닥부터 이 순서. 주면 `value` · `threshold` 는 쓰지 않는다. */
  segments?: ReadonlyArray<EqualizerSegment>;
  /** 값 하나 — `threshold` 와 함께 임계 2색으로 칠한다. */
  value?: number;
};

export type EqualizerChartProps = {
  /** 대상 막대들(왼쪽부터). */
  bars: ReadonlyArray<EqualizerBar>;
  /** 축 최대. 없으면 합 최대를 보기 좋은 값으로 올린다. 사용률이면 100. */
  max?: number;
  /** 칸 수. 기본 10 — 칸 하나 = max ÷ levels. */
  levels?: number;
  /** 임계 — `value` 막대가 이 값 이상이면 경고색. `segments` 막대에는 쓰지 않는다. */
  threshold?: number;
  /** 눈금 · 값 글자 단위. */
  unit?: string;
  /** 막대 위 값 글자. 기본 true. */
  valueLabels?: boolean;
  /** 자기 바깥 좌우 여백(8px)을 둘지. 기본 true. [[WidgetFrame]] 안에서는 false. */
  frame?: boolean;
};

const PAD_TOP = 14;
const PAD_BOTTOM = 18;
const PAD_RIGHT = 8;
const GAP = 4;
const CELL_GAP = 2;
const NEUTRAL = "var(--color-brand-blue)";
const OVER = "var(--color-status-warning)";

const totalOf = (b: EqualizerBar) => (b.segments ? b.segments.reduce((n, s) => n + Math.max(0, s.value), 0) : Math.max(0, b.value ?? 0));

export default function EqualizerChart({ bars, max, levels = 10, threshold, unit = "", valueLabels = true, frame = true }: EqualizerChartProps) {
  const totals = bars.map(totalOf);
  const top = max ?? niceMax(Math.max(0, ...totals));
  const best = Math.max(0, ...totals);
  const cellH = `calc((100% - ${(levels - 1) * CELL_GAP}px) / ${levels})`;
  /* 가리킨 막대 — [[ChartTooltip]] 으로 구간별 값 · 합계를 보인다 */
  const [hover, setHover] = useState<number | null>(null);
  const exact = (v: number) => `${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit}`;

  return (
    <div className="flex h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0 }}>
      <div className="relative flex-1 min-w-0 min-h-0" role="img" aria-label={`이퀄라이저 — 대상 ${bars.length}개 · 최대 ${formatAxisValue(best)}${unit}`}>
        <ChartGrid max={top} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        {/* 막대 — 칸을 바닥부터 채운다. 칸 하나 = top ÷ levels */}
        <div className="absolute flex" style={{ left: AXIS_GUTTER, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM, gap: GAP }}>
          {bars.map((b, i) => {
            const segs = b.segments ?? [{ value: b.value ?? 0, color: threshold != null && (b.value ?? 0) >= threshold ? OVER : NEUTRAL }];
            const counts = stripeCounts(segs.map((s) => s.value), top, levels);
            const filled = counts.reduce((n, c) => n + c, 0);
            const cells: (string | null)[] = [];
            counts.forEach((c, k) => { for (let j = 0; j < c; j++) cells.push(segs[k].color); });
            while (cells.length < levels) cells.push(null);
            const isBest = totals[i] === best && best > 0;
            return (
              <div
                key={i}
                className={`${MARK_CLASS} relative flex-1 min-w-0 flex justify-center`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ opacity: hover != null && hover !== i ? DIM_OPACITY : 1 }}
              >
                <div className="flex h-full" style={{ flexDirection: "column-reverse", width: "60%", maxWidth: 24, gap: CELL_GAP }}>
                  {cells.map((c, k) => (
                    <span key={k} className="block rounded-1px" style={{ height: cellH, background: c ?? "var(--color-surface-100)" }} />
                  ))}
                </div>
                {valueLabels && (
                  <span
                    className={`absolute text-chart leading-none whitespace-nowrap ${isBest ? "text-primary" : "text-tertiary"}`}
                    style={{
                      bottom: `calc(${(filled / levels) * 100}% + 2px)`,
                      fontFamily: "var(--font-family-numeric)",
                      fontWeight: isBest ? "var(--font-weight-bold)" : undefined,
                    }}
                  >
                    {formatAxisValue(totals[i])}
                  </span>
                )}
                {hover === i && (
                  <ChartTooltip
                    left="50%"
                    top={`${(1 - filled / levels) * 100}%`}
                    flipX={i >= bars.length / 2}
                    offset={16}
                    title={b.label}
                    rows={segs.map((sg, k) => ({ label: (b.segments?.[k]?.label ?? (threshold != null ? (sg.color === OVER ? "임계 이상" : "임계 미만") : "값")), value: exact(sg.value), color: sg.color }))}
                    footer={b.segments && b.segments.length > 1 ? `합계 ${exact(totals[i])}` : threshold != null ? `임계 ${exact(threshold)}` : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>
        <ChartValueAxis max={top} unit={unit} padTop={PAD_TOP} padBottom={PAD_BOTTOM} right={PAD_RIGHT} />
        <ChartCategoryAxis labels={bars.map((b) => b.label)} padBottom={PAD_BOTTOM} right={PAD_RIGHT} gap={GAP} />
      </div>
    </div>
  );
}

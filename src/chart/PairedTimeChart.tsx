/**
 * PairedTimeChart — 단위가 다른 두 지표를 **시간축을 공유하는 위아래 두 칸**으로. 한 칸을 가리키면 두 칸이 같은 시점을 함께 보인다. Composite layer.
 *
 * ## Purpose
 * «액티브 트랜잭션이 늘 때 TPS 는 어땠나» 처럼 단위 · 범위가 다른 두 지표를 같은 시각에 맞춰 본다. 라이브 APM 액티브 스택은 막대 + 선을
 * 이중 Y축 한 판에 겹쳤다 — 축 범위가 교차와 기울기를 만들어 데이터에 없는 관계를 그린다(patterns §19). 여기서는 칸을 나누되
 * 시간 범위 · 칸 x · 시점 고르기를 공유해 «같은 순간» 이 세로 한 줄로 읽히게 한다(§21 1.9 대체 표현, 2026-10-23 결정).
 *
 * ## When to use
 * - 단위가 다른 두 지표의 같은 시간 비교 — 액티브 트랜잭션(건) × TPS · 요청 수 × 에러율(%) · 처리량 × 응답시간(ms).
 * - 한 지표가 다른 지표의 원인 · 결과로 의심될 때 시점을 맞춰 보기.
 *
 * ## When NOT to use
 * - 단위 · 범위가 같은 지표 여럿 → [[MiniMultiLineChart]] 한 판(§17).
 * - 세 지표 이상 → 칸을 더 쌓지 말고 [[WidgetFrame]] 여러 칸 + 같은 시간 범위.
 * - 사건 기록을 지표 아래 붙일 때 → [[StatusTimeline]] 을 지표 차트 아래에.
 *
 * ## Metrics
 * - ✅ 단위가 다른 두 시계열 지표 — 액티브 트랜잭션(건) × TPS · 요청 수 × 에러율(%) · 처리량 × 응답시간(ms) · CPU(%) × 부하 평균
 * - ❌ 단위 · 범위가 같은 두 지표 — 한 판에 두 계열로(§17). 칸을 나누면 높이 비교가 사라진다
 * - ❌ 시간이 아닌 X(범주 · 대상) — 시점 공유가 이 차트의 뜻이다 → [[BarList]] 두 개
 *
 * ## Colors
 * - 정체성 — 위 칸 `--color-chart-series-1` · 아래 칸 `--color-chart-series-2`(`color` 로 바꿈)
 *
 * ## Composition rules
 * - 요소를 조합한다 — 칸마다 [[ChartGrid]] · [[ChartValueAxis]] · [[ChartCrosshair]], 막대 칸은 [[ChartBar]], 아래 칸에만 [[ChartTimeAxis]].
 *   선 칸의 선만 직접 그린다. 그래서 Composite 계층이다.
 * - **이중 축 대신 두 칸(§19)** — 칸마다 Y축 하나. 오른쪽 Y축을 두지 않는다.
 * - **축 제목 대신 칸 이름(2026-10-23 결정)** — 칸 왼쪽 위 `label`(`text-sm` secondary), 단위는 눈금 접미사(§26). 다른 차트와 같은 규칙.
 * - **미래 구간은 비워 둔다(2026-10-23 결정)** — `count` 로 전체 시점 수를 고정하면 값이 아직 없는 뒤쪽은 빈칸. 수집이 안 된 시점(`null`)은
 *   [[ChartBar]] «모름» 칸(막대) · 선 끊김(선)으로 따로 보인다. 두 칸의 시간 범위가 같아야 비교가 된다.
 * - 두 칸 모두 x = 칸 가운데(`band`) — 선 점이 막대와 세로로 맞는다. 시점 고르기는 공유(`index`), 툴팁은 위 칸에 두 지표를 함께(단위는 계열마다).
 *   «모름» 칸 · 선 끊김을 가리키면 그 지표 줄에 «데이터 없음»(`showMissing`) — 회색 면이 구분선 · 고른 시점으로 오해되지 않게. 미래 빈칸은 줄 없음.
 * - 색: 위 · 아래 계열 슬롯 1 · 2 기본(`color` 로 바꿈). 막대 칸 hover 는 고른 시점 밖 막대를 흐린다(patterns §26 «강조»).
 *
 * ## Spec
 * | 항목 | 값 |
 * |---|---|
 * | 칸 | 위 · 아래 같은 높이(flex 1:1) · 사이 8px · 칸 이름 `text-sm` secondary 왼쪽 위(축 칸 오른쪽) |
 * | 플롯 | 위 칸: 위 16(이름) · 아래 4 / 아래 칸: 위 16 · 아래 14(시간 글자) · 오른쪽 8 · 왼쪽 `--wds-widget-axis-gutter` |
 * | 막대 | [[ChartBar]] · 칸 사이 1px · `null` = 모름 칸 · 미래 = 빈칸 |
 * | 선 | 1.5px · 칸 가운데 점을 잇는다 · `null` 에서 끊는다 |
 * | 시점 고르기 | 두 칸 [[ChartCrosshair]] `band` · `index` 공유 · 툴팁은 위 칸(두 지표 · 계열별 단위) · `null` 시점은 그 지표 줄에 «데이터 없음» |
 * | 접근성 | 칸마다 `role="img"` + 이름 · 최대 |
 *
 * @example
 * ```tsx
 * <PairedTimeChart count={96} xLabels={["00:00","06:00","12:00","18:00","24:00"]}
 *   top={{ label: "Active Transaction", kind: "bar", values: active, unit: "건" }}
 *   bottom={{ label: "TPS", kind: "line", values: tps }} />
 * ```
 */
import { useState } from "react";
import ChartBar from "./ChartBar";
import ChartCrosshair from "./ChartCrosshair";
import ChartGrid from "./ChartGrid";
import ChartTimeAxis from "./ChartTimeAxis";
import ChartValueAxis from "./ChartValueAxis";
import { AXIS_GUTTER, niceMax } from "./_axisScale";
import { DIM_OPACITY, MARK_CLASS } from "./_emphasis";

export type PairedTimePanel = {
  /** 칸 이름 — 축 제목 대신 칸 왼쪽 위. */
  label: string;
  /** 마크 — 막대(구간 양) · 선(흐름). */
  kind: "bar" | "line";
  /** 시점별 값. `null` = 수집 없음. 길이가 `count` 보다 짧으면 뒤쪽은 미래(빈칸). */
  values: ReadonlyArray<number | null>;
  /** 눈금 · 툴팁 단위. */
  unit?: string;
  /** 계열 색 토큰. 기본 위 series-1 · 아래 series-2. */
  color?: string;
  /** Y 최대. 없으면 값 최대를 보기 좋은 값으로 올린다. */
  max?: number;
};

export type PairedTimeChartProps = {
  /** 위 칸. */
  top: PairedTimePanel;
  /** 아래 칸. */
  bottom: PairedTimePanel;
  /** 전체 시점 수 — 시간 범위. 없으면 두 칸 값 길이의 최대. 값보다 크면 뒤쪽이 빈 미래. */
  count?: number;
  /** X 시간 글자(아래 칸 · 같은 간격). */
  xLabels: string[];
  /** 시점마다 이름 — 툴팁 제목. */
  pointLabels?: string[];
  /** 자기 바깥 좌우 여백(8px). 기본 true. [[WidgetFrame]] 안에서는 false. */
  frame?: boolean;
};

const PAD_RIGHT = 8;
const PAD_LABEL = 16;
const PAD_TIME = 14;

export default function PairedTimeChart({ top, bottom, count, xLabels, pointLabels, frame = true }: PairedTimeChartProps) {
  const n = count ?? Math.max(top.values.length, bottom.values.length);
  const [hover, setHover] = useState<number | null>(null);
  const colorOf = (p: PairedTimePanel, k: number) => p.color ?? (k ? "var(--color-chart-series-2)" : "var(--color-chart-series-1)");
  const panels = [top, bottom];
  const tops = panels.map((p) => p.max ?? niceMax(Math.max(0, ...p.values.map((v) => v ?? 0))));

  return (
    <div className="flex flex-col h-full min-h-0 w-full" style={{ padding: frame ? "0 8px" : 0, gap: 8 }}>
      {panels.map((p, k) => {
        const max = tops[k];
        const padTop = PAD_LABEL;
        const padBottom = k === 1 ? PAD_TIME : 4;
        const color = colorOf(p, k);
        /* 선 — 칸 가운데 점을 잇고 null 에서 끊는다 */
        const runs: string[] = [];
        let cur: string[] = [];
        p.values.forEach((v, i) => {
          if (v == null) {
            if (cur.length > 1) runs.push(cur.join(" "));
            cur = [];
          } else cur.push(`${((i + 0.5) / n) * 1000},${max > 0 ? (1 - Math.min(1, v / max)) * 1000 : 1000}`);
        });
        if (cur.length > 1) runs.push(cur.join(" "));
        return (
          <div key={k} className="relative flex-1 min-h-0" role="img" aria-label={`${p.label} — 최대 ${Math.max(0, ...p.values.map((v) => v ?? 0))}${p.unit ?? ""}`}>
            <span className="absolute text-sm text-secondary" style={{ left: `calc(${AXIS_GUTTER} + 4px)`, top: 0, lineHeight: "var(--leading-none)" }}>
              {p.label}
            </span>
            <ChartGrid max={max} padTop={padTop} padBottom={padBottom} right={PAD_RIGHT} />
            {p.kind === "bar" ? (
              <div className="absolute flex items-end" style={{ left: AXIS_GUTTER, right: PAD_RIGHT, top: padTop, bottom: padBottom, gap: 1 }}>
                {Array.from({ length: n }, (_, i) => (
                  <div
                    key={i}
                    className={`${MARK_CLASS} flex flex-1 min-w-0 h-full items-end`}
                    style={{ opacity: hover != null && hover !== i ? DIM_OPACITY : 1 }}
                  >
                    {i < p.values.length ? <ChartBar ratio={p.values[i] == null ? null : max > 0 ? Math.min(1, (p.values[i] as number) / max) : 0} color={color} /> : null}
                  </div>
                ))}
              </div>
            ) : (
              <svg
                aria-hidden
                className="absolute"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                style={{ left: AXIS_GUTTER, top: padTop, width: `calc(100% - ${AXIS_GUTTER} - ${PAD_RIGHT}px)`, height: `calc(100% - ${padTop + padBottom}px)` }}
              >
                {runs.map((pts, r) => (
                  <polyline key={r} points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
            )}
            <ChartValueAxis max={max} unit={p.unit} padTop={padTop} padBottom={padBottom} right={PAD_RIGHT} />
            {k === 1 && <ChartTimeAxis labels={xLabels} right={PAD_RIGHT} />}
            <ChartCrosshair
              band
              count={n}
              max={max}
              index={hover}
              onIndex={setHover}
              noTooltip={k === 1}
              labels={pointLabels}
              series={
                k === 0
                  ? [
                      { label: top.label, color: colorOf(top, 0), values: top.values, unit: top.unit, shape: top.kind === "bar" ? "square" : "line", noDot: top.kind === "bar", showMissing: true },
                      { label: bottom.label, color: colorOf(bottom, 1), values: bottom.values, unit: bottom.unit, shape: bottom.kind === "bar" ? "square" : "line", noDot: true, showMissing: true },
                    ]
                  : [{ label: p.label, color, values: p.values, unit: p.unit, noDot: p.kind === "bar", showMissing: true }]
              }
              right={PAD_RIGHT}
              padTop={padTop}
              padBottom={padBottom}
            />
          </div>
        );
      })}
    </div>
  );
}
